import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { addExperience } from "../engine/progression";
import { toCalendarDay, applyCompletion } from "../engine/streak";
import { getXpReward, getStreakMultiplier } from "../config/gamification";
import {
    HabitNotFoundError,
    HabitAlreadyCompletedError,
} from "../errors/domainErrors";

// Orchestrateur métier des habitudes : CRUD + validation quotidienne avec
// calcul de streak (paresseux, cf. core/engine/streak.js) et attribution
// d'XP multipliée selon la série en cours. Symétrique à TaskService dans
// son fonctionnement (transaction, ownership systématique), mais NE
// SUPPORTE PAS la dévalidation — décision actée : une habitude validée
// pour le jour reste validée, contrairement aux tâches qui peuvent être
// rouvertes. Le gain en simplicité (pas de recalcul de streak à l'envers)
// l'emporte sur la symétrie totale avec TaskService
export class HabitService {
    #db;

    constructor(db) {
        this.#db = db;
    }

    // Liste les habitudes actives de l'utilisateur. currentStreak est
    // recalculé à la lecture (cf. getEffectiveStreak côté front ou ici si
    // besoin) — pour l'instant on renvoie le cache brut : la "vérité"
    // affichée est corrigée au prochain accès si besoin via le hook front.
    // Gardé volontairement simple ici : la correction réelle du cache a
    // lieu à la complétion (completeToday), pas à chaque lecture, pour ne
    // jamais faire d'écriture sur un GET.
    async list(userId) {
        return this.#db.habit.findMany({
            where: { userId, isArchived: false },
            orderBy: { createdAt: "desc" },
        });
    }

    async create(userId, data) {
        return this.#db.habit.create({
            data: { ...data, userId },
        });
    }

    async update(habitId, userId, data) {
        await this.#getOwnedHabit(this.#db, habitId, userId);

        return this.#db.habit.update({
            where: { id: habitId },
            data,
        });
    }

    // Archivage plutôt que suppression dure par défaut (cohérent avec le
    // choix ACTIVE/DISABLED des comptes) : on garde l'historique de streak
    // et le ledger XP intacts. Une vraie suppression reste possible via
    // remove() si Nathan en a besoin côté UI plus tard
    async archive(habitId, userId) {
        await this.#getOwnedHabit(this.#db, habitId, userId);

        return this.#db.habit.update({
            where: { id: habitId },
            data: { isArchived: true },
        });
    }

    async remove(habitId, userId) {
        await this.#getOwnedHabit(this.#db, habitId, userId);
        await this.#db.habit.delete({ where: { id: habitId } });
    }

    // Valide l'habitude pour AUJOURD'HUI. Transaction unique : lecture de
    // l'habitude, vérification de non-doublon (contrainte unique en base,
    // attrapée en P2002), calcul du nouveau streak, attribution d'XP
    // multipliée, écriture du HabitCompletion + XpEvent + cache Habit/User.
    async completeToday(habitId, userId) {
        const today = toCalendarDay(new Date());

        return this.#db
            .$transaction(async (tx) => {
                const habit = await this.#getOwnedHabit(tx, habitId, userId);

                // La contrainte @@unique([habitId, completedOn]) est le garde-fou
                // ultime, mais on vérifie ici en amont pour renvoyer une erreur
                // métier propre (409) plutôt qu'attendre le P2002 — plus lisible,
                // et ça évite une tentative d'écriture inutile.
                const alreadyDone = await tx.habitCompletion.findUnique({
                    where: {
                        habitId_completedOn: { habitId, completedOn: today },
                    },
                });
                if (alreadyDone) {
                    throw new HabitAlreadyCompletedError();
                }

                const { currentStreak, bestStreak, lastCompletedOn } =
                    applyCompletion(habit, today);

                const baseReward = getXpReward(habit.priority);
                const multiplier = getStreakMultiplier(currentStreak);
                // Arrondi à l'entier : l'XP est toujours un nombre entier dans
                // tout le reste du projet (XpEvent.amount: Int) — un multiplicateur
                // décimal ne doit jamais produire de virgule stockée en base.
                const xpGained = Math.round(baseReward * multiplier);

                await tx.habitCompletion.create({
                    data: { habitId, completedOn: today },
                });

                await tx.habit.update({
                    where: { id: habitId },
                    data: { currentStreak, bestStreak, lastCompletedOn },
                });

                const user = await tx.user.findUnique({
                    where: { id: userId },
                });
                const progression = addExperience(
                    user.xp,
                    user.level,
                    xpGained,
                );

                await tx.xpEvent.create({
                    data: {
                        type: "GAIN",
                        amount: xpGained,
                        priority: habit.priority,
                        userId,
                        habitId,
                    },
                });

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        xp: progression.newXp,
                        level: progression.newLevel,
                    },
                });

                return {
                    message: "Habitude validée !",
                    xpGained,
                    multiplier,
                    currentStreak,
                    bestStreak,
                    hasLeveledUp: progression.hasLeveledUp,
                    user: {
                        xp: progression.newXp,
                        level: progression.newLevel,
                    },
                };
            })
            .catch((error) => {
                // Filet anti-course : deux requêtes concurrentes pour la même
                // habitude le même jour passent toutes deux le check
                // findUnique ci-dessus (lu avant que l'autre transaction ait
                // commit), mais la contrainte @unique en base fait échouer la
                // seconde en P2002. Même pattern que AuthService.register.
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002"
                ) {
                    throw new HabitAlreadyCompletedError();
                }
                throw error;
            });
    }

    // ─── Méthodes privées ─────────────────────────────────────────────────

    async #getOwnedHabit(db, habitId, userId) {
        const habit = await db.habit.findUnique({ where: { id: habitId } });

        if (!habit || habit.userId !== userId) {
            throw new HabitNotFoundError();
        }

        return habit;
    }
}

export const habitService = new HabitService(prisma);
