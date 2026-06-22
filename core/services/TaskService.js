import { prisma } from "@/lib/prisma";
import { tagService } from "@/core/services/TagService";
import { moderationService } from "@/core/services/ModerationService";
import { addExperience, removeExperience } from "../engine/progression";
import { getXpReward, getDailyLimit } from "../config/gamification";
import {
    TaskNotFoundError,
    InvalidTaskTransitionError,
} from "../errors/domainErrors";

// Orchestrateur métier des quêtes : seule porte d'entrée autorisée pour les
// transitions de statut (l'XP et les quotas en dépendent), ET pour la
// création/mise à jour des métadonnées (titre, priorité, type, tags) — ces
// deux dernières orchestrent une transaction Prisma + synchronisation des
// tags, auparavant dupliquée dans les routes POST et PATCH.
//
// Machine à états : TODO → DONE (complétion, XP), DONE → TODO (réouverture,
// remboursement), TODO → WONT_DO (abandon, neutre), WONT_DO → TODO (neutre).
// Toute autre transition est rejetée.
//
// La classe reçoit son client de base de données ET son TagService par le
// constructeur (injection de dépendance) : testable avec des mocks pour les
// deux, sans dépendre d'un import figé en dur.
export class TaskService {
    #db;
    #tagService;

    constructor(db, tagSvc) {
        this.#db = db;
        this.#tagService = tagSvc;
    }

    // Crée une tâche pour l'utilisateur et synchronise ses tags en une seule
    // transaction. tagNames est toujours un tableau (default([]) du schéma) :
    // syncTagsForTask gère le cas [] sans créer de liaison.
    async createTask(userId, { tags: tagNames, ...taskData }) {
        return this.#db.$transaction(async (tx) => {
            const task = await tx.task.create({
                data: { ...taskData, userId },
            });

            await this.#tagService.syncTagsForTask(
                tx,
                userId,
                task.id,
                tagNames,
            );

            // Recharge avec les tags pour que l'appelant les ait dans la
            // réponse (cohérent avec la forme renvoyée par updateTask).
            return tx.task.findUnique({
                where: { id: task.id },
                include: { tags: true },
            });
        });
    }

    // Met à jour les métadonnées d'une tâche (jamais le statut : passe par
    // changeStatus). tags undefined = champ absent du PATCH = on ne touche
    // pas aux tags ; tags [] = l'utilisateur a tout retiré = on détache.
    async updateTask(taskId, userId, { tags: tagNames, ...taskData }) {
        await this.#getOwnedTask(this.#db, taskId, userId);

        return this.#db.$transaction(async (tx) => {
            await tx.task.update({
                where: { id: taskId },
                data: taskData,
            });

            if (tagNames !== undefined) {
                await this.#tagService.syncTagsForTask(
                    tx,
                    userId,
                    taskId,
                    tagNames,
                );
            }

            return tx.task.findUnique({
                where: { id: taskId },
                include: { tags: true },
            });
        });
    }

    // Point d'entrée unique pour la route PATCH /status : dispatch vers la
    // bonne transition selon le statut visé.
    async changeStatus(taskId, userId, targetStatus) {
        switch (targetStatus) {
            case "DONE":
                return this.completeTask(taskId, userId);
            case "TODO":
                return this.reopenTask(taskId, userId);
            case "WONT_DO":
                return this.abandonTask(taskId, userId);
            default:
                throw new InvalidTaskTransitionError("?", targetStatus);
        }
    }

    // TO DO → DONE : la transaction garantit que tâche, ledger et solde
    // utilisateur restent cohérents même en cas d'échec à mi-chemin.
    async completeTask(taskId, userId) {
        return this.#db.$transaction(async (tx) => {
            const task = await this.#getOwnedTask(tx, taskId, userId);

            if (task.status !== "TODO") {
                throw new InvalidTaskTransitionError(task.status, "DONE");
            }

            const user = await tx.user.findUnique({ where: { id: userId } });

            const isPaid = await this.#isWithinDailyLimit(
                tx,
                userId,
                task.priority,
            );
            const reward = isPaid ? getXpReward(task.priority) : 0;

            const progression = addExperience(user.xp, user.level, reward);

            await tx.task.update({
                where: { id: taskId },
                data: { status: "DONE", completedAt: new Date() },
            });

            // Pas d'événement à 0 XP : "avoir réclamé son XP" se définit par
            // l'existence d'un GAIN actif. Une complétion hors quota n'a donc
            // rien à rembourser au décochage (asymétrie de l'ancien système
            // corrigée par construction).
            if (reward > 0) {
                await tx.xpEvent.create({
                    data: {
                        type: "GAIN",
                        amount: reward,
                        priority: task.priority,
                        userId,
                        taskId,
                    },
                });

                // Détection anti-triche : compte les GAIN récents sur cette
                // tâche, journalise un ModerationFlag si le seuil est
                // dépassé. N'empêche jamais la complétion elle-même — c'est
                // de la visibilité pour l'admin, pas un blocage (le rate-
                // limit actif se trouve dans la route, en amont du service).
                await moderationService.checkRapidCycle(tx, userId, taskId);
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    xp: progression.newXp,
                    level: progression.newLevel,
                },
            });

            return {
                message: isPaid
                    ? "Quête accomplie !"
                    : "Quête accomplie ! (Quota journalier atteint pour cette priorité : 0 XP)",
                xpGained: progression.xpGained,
                hasLeveledUp: progression.hasLeveledUp,
                user: {
                    xp: progression.newXp,
                    level: progression.newLevel,
                },
            };
        });
    }

    // DONE → TODO (remboursement exact du gain actif) ou WONT_DO → TODO
    // (simple réactivation, aucun impact XP).
    async reopenTask(taskId, userId) {
        return this.#db.$transaction(async (tx) => {
            const task = await this.#getOwnedTask(tx, taskId, userId);

            if (task.status === "TODO") {
                throw new InvalidTaskTransitionError("TODO", "TODO");
            }

            if (task.status === "WONT_DO") {
                const reopened = await tx.task.update({
                    where: { id: taskId },
                    data: { status: "TODO" },
                });
                return {
                    message: "Quête réactivée.",
                    xpLost: 0,
                    task: reopened,
                };
            }

            // Statut DONE : on rembourse ce qui a réellement été gagné
            // (le montant figé dans le ledger), jamais un recalcul depuis
            // la priorité actuelle qui a pu changer entre-temps.
            const gain = await tx.xpEvent.findFirst({
                where: { taskId, type: "GAIN", revertedBy: null },
                orderBy: { createdAt: "desc" },
            });
            const refundAmount = gain?.amount ?? 0;

            const user = await tx.user.findUnique({ where: { id: userId } });
            const removal = removeExperience(user.xp, user.level, refundAmount);

            const reopened = await tx.task.update({
                where: { id: taskId },
                data: { status: "TODO", completedAt: null },
            });

            if (gain) {
                // revertsEventId est @unique en base : un même gain ne peut
                // physiquement pas être remboursé deux fois
                await tx.xpEvent.create({
                    data: {
                        type: "REFUND",
                        amount: -refundAmount,
                        priority: gain.priority,
                        userId,
                        taskId,
                        revertsEventId: gain.id,
                    },
                });
            }

            await tx.user.update({
                where: { id: userId },
                data: { xp: removal.newXp },
            });

            return {
                message: "Validation annulée.",
                xpLost: removal.xpLost,
                task: reopened,
            };
        });
    }

    // TO DO → WONT_DO : abandonner n'est pas accomplir, aucun XP en jeu.
    // Une quête DONE doit d'abord être rouverte (remboursement) avant
    // d'être abandonnée : une seule façon de sortir de DONE = règle simple.
    async abandonTask(taskId, userId) {
        const task = await this.#getOwnedTask(this.#db, taskId, userId);

        if (task.status !== "TODO") {
            throw new InvalidTaskTransitionError(task.status, "WONT_DO");
        }

        const abandoned = await this.#db.task.update({
            where: { id: taskId },
            data: { status: "WONT_DO" },
        });

        return { message: "Quête abandonnée.", task: abandoned };
    }

    // ─── Méthodes privées (encapsulation) ────────────────────────────────

    // Charge une tâche en vérifiant la propriété : toute méthode du service
    // passe par ici, l'ownership ne peut pas être oublié. 404 volontairement
    // identique que la tâche n'existe pas OU appartienne à un autre
    // utilisateur (TaskNotFoundError) : ne pas révéler l'existence des
    // ressources d'autrui.
    async #getOwnedTask(db, taskId, userId) {
        const task = await db.task.findUnique({ where: { id: taskId } });

        if (!task || task.userId !== userId) {
            throw new TaskNotFoundError();
        }

        return task;
    }

    // Le quota compte les complétions RÉMUNÉRÉES du jour (gains actifs du
    // ledger) : décocher rembourse le gain et libère donc le créneau.
    async #isWithinDailyLimit(db, userId, priority) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const paidCompletionsToday = await db.xpEvent.count({
            where: {
                userId,
                priority,
                type: "GAIN",
                createdAt: { gte: startOfDay },
                revertedBy: null,
            },
        });

        return paidCompletionsToday < getDailyLimit(priority);
    }
}

// Instance unique branchée sur le vrai client Prisma et le vrai TagService,
// importée par les routes.
export const taskService = new TaskService(prisma, tagService);
