import { prisma } from "@/lib/prisma";
import { addExperience } from "../engine/progression";
import { getXpReward, getDailyLimit } from "../config/gamification";
import { TaskNotFoundError } from "../errors/domainErrors";

// Taux d'XP du temps de focus, indépendant du barème de priorité des
// tâches/habitudes : 1 XP par minute effective de travail (phase WORK
// uniquement, jamais la pause). Vit ici et non dans gamification.js — ce
// fichier est la source unique du barème de PRIORITÉ (HIGH/MEDIUM/LOW/
// NONE), le Pomodoro a un axe de récompense différent (le temps, pas la
// difficulté déclarée) qui ne s'y mélange pas.
const XP_PER_MINUTE_FOCUSED = 1;

// Orchestrateur métier des sessions Pomodoro. Contrairement à TaskService
// et HabitService, ce service n'a qu'une seule méthode d'écriture
// significative : completeSession. Il n'existe pas de "créer puis
// modifier" — le minuteur en cours est un state CLIENT volatile (jamais
// persisté), seule la complétion (fin naturelle ou arrêt manuel) écrit en
// base, en une transaction unique.
export class PomodoroService {
    #db;

    constructor(db) {
        this.#db = db;
    }

    // Historique des sessions terminées, plus récentes en premier
    async list(userId) {
        return this.#db.pomodoroSession.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { task: { select: { id: true, title: true } } },
        });
    }

    // Termine une session (fin naturelle ou arrêt manuel — le service ne
    // distingue pas les deux, le client envoie simplement le temps réel
    // écoulé). Calcule xpFromTime (toujours acquis, jamais soumis à
    // quota) et xpFromTask (bonus de priorité de la tâche active à la
    // fin, soumis au même quota journalier qu'une complétion classique).
    async completeSession(userId, data) {
        const { taskId, actualWorkSeconds, ...sessionMeta } = data;

        return this.#db.$transaction(async (tx) => {
            // Ownership de la tâche liée, si fournie — même garde que
            // TaskService : 404 identique que la tâche n'existe pas ou
            // appartienne à un autre utilisateur.
            const task = taskId
                ? await this.#getOwnedTask(tx, taskId, userId)
                : null;

            const xpFromTime = this.#computeTimeReward(actualWorkSeconds);

            const xpFromTask = task
                ? await this.#computeTaskBonus(tx, userId, task)
                : 0;

            const totalXp = xpFromTime + xpFromTask;

            const session = await tx.pomodoroSession.create({
                data: {
                    ...sessionMeta,
                    actualWorkSeconds,
                    xpFromTime,
                    xpFromTask,
                    userId,
                    taskId: task?.id ?? null,
                },
            });

            const user = await tx.user.findUnique({ where: { id: userId } });
            const progression = addExperience(user.xp, user.level, totalXp);

            // Un seul XpEvent pour le total : une session Pomodoro est UN
            // événement de gamification du point de vue du ledger, pas
            // deux — cohérent avec ModerationService.checkRapidCycle qui
            // compte les GAIN par fenêtre de temps (deux lignes pour une
            // même action utilisateur fausserait la détection de triche).
            // priority: NONE si aucune tâche liée (valeur neutre déjà
            // utilisée comme défaut ailleurs dans le schéma), sinon la
            // priorité réelle de la tâche au moment de la complétion.
            if (totalXp > 0) {
                await tx.xpEvent.create({
                    data: {
                        type: "GAIN",
                        amount: totalXp,
                        priority: task?.priority ?? "NONE",
                        userId,
                        pomodoroSessionId: session.id,
                    },
                });
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    xp: progression.newXp,
                    level: progression.newLevel,
                },
            });

            return {
                message: "Session terminée.",
                xpFromTime,
                xpFromTask,
                xpGained: totalXp,
                hasLeveledUp: progression.hasLeveledUp,
                user: {
                    xp: progression.newXp,
                    level: progression.newLevel,
                },
                session,
            };
        });
    }

    // Lit les préférences persistées de l'utilisateur — appelé au montage du
    // PomodoroTimerProvider pour initialiser le hook avec les VRAIES valeurs
    // de l'utilisateur plutôt qu'un défaut générique 25/5.
    async getSettings(userId) {
        const user = await this.#db.user.findUnique({
            where: { id: userId },
            select: {
                pomodoroWorkMinutes: true,
                pomodoroBreakMinutes: true,
                pomodoroAutoChainBreak: true,
            },
        });

        return {
            workMinutes: user.pomodoroWorkMinutes,
            breakMinutes: user.pomodoroBreakMinutes,
            autoChainBreak: user.pomodoroAutoChainBreak,
        };
    }

    // Persiste les nouvelles préférences. Simple mise à jour, aucune règle
    // métier ici au-delà de la validation Zod déjà appliquée en amont par la
    // route — pas besoin de transaction, une seule table touchée.
    async updateSettings(userId, settings) {
        const user = await this.#db.user.update({
            where: { id: userId },
            data: {
                pomodoroWorkMinutes: settings.workMinutes,
                pomodoroBreakMinutes: settings.breakMinutes,
                pomodoroAutoChainBreak: settings.autoChainBreak,
            },
            select: {
                pomodoroWorkMinutes: true,
                pomodoroBreakMinutes: true,
                pomodoroAutoChainBreak: true,
            },
        });

        return {
            workMinutes: user.pomodoroWorkMinutes,
            breakMinutes: user.pomodoroBreakMinutes,
            autoChainBreak: user.pomodoroAutoChainBreak,
        };
    }

    // ─── Méthodes privées ─────────────────────────────────────────────────

    async #getOwnedTask(db, taskId, userId) {
        const task = await db.task.findUnique({ where: { id: taskId } });

        if (!task || task.userId !== userId) {
            throw new TaskNotFoundError();
        }

        return task;
    }

    // XP temps : proportionnel aux minutes RÉELLES de travail, jamais
    // soumis à quota (contrairement au bonus tâche ci-dessous) — le focus
    // lui-même est toujours récompensé, quelle que soit l'activité du
    // jour sur les quêtes.
    #computeTimeReward(actualWorkSeconds) {
        const minutes = actualWorkSeconds / 60;
        return Math.round(minutes * XP_PER_MINUTE_FOCUSED);
    }

    // Bonus tâche : l'XP de priorité de la tâche active à la fin de la
    // session, SOUMIS au même quota journalier qu'une complétion normale
    // depuis le dashboard — si le quota de cette priorité est déjà
    // consommé aujourd'hui, le bonus est 0 (créneau non consommé, comme
    // pour une tâche classique au-delà du quota).
    //
    // Duplique volontairement la logique de #isWithinDailyLimit de
    // TaskService (méthode privée, donc inaccessible depuis l'extérieur
    // de cette classe) plutôt que de casser son encapsulation. Un futur
    // refactor pourrait extraire cette logique dans core/engine/quota.js
    // pour que les deux services l'appellent — non fait ici pour ne pas
    // toucher à TaskService, qui fonctionne déjà en prod, sans nécessité
    // immédiate.
    async #computeTaskBonus(db, userId, task) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const paidCompletionsToday = await db.xpEvent.count({
            where: {
                userId,
                priority: task.priority,
                type: "GAIN",
                createdAt: { gte: startOfDay },
                revertedBy: null,
            },
        });

        const isWithinLimit =
            paidCompletionsToday < getDailyLimit(task.priority);

        return isWithinLimit ? getXpReward(task.priority) : 0;
    }
}

export const pomodoroService = new PomodoroService(prisma);
