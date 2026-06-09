import { prisma } from "@/lib/prisma";
import {
    addExperience,
    removeExperience,
    dailyLimits,
} from "../engine/progression";

export const TaskService = {
    async completeTask(taskId, userId) {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task || task.userId !== userId)
            throw new Error("Quête introuvable.");
        if (task.isCompleted) throw new Error("Quête déjà validée.");

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const completedToday = await prisma.task.count({
            where: {
                userId,
                difficulty: task.difficulty,
                isCompleted: true,
                updatedAt: { gte: startOfDay },
            },
        });

        const limit = dailyLimits[task.difficulty];
        let progressionResult = {
            newXp: user.xp,
            newLevel: user.level,
            xpGained: 0,
            hasLeveledUp: false,
        };
        let message = "Quête accomplie !";

        if (completedToday < limit) {
            progressionResult = addExperience(
                user.xp,
                user.level,
                task.difficulty,
            );
        } else {
            message =
                "Quête accomplie ! (Limite d'XP journalière atteinte pour cette difficulté)";
        }

        await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted: true },
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: progressionResult.newXp,
                level: progressionResult.newLevel,
            },
        });

        return {
            message,
            xpGained: progressionResult.xpGained,
            hasLeveledUp: progressionResult.hasLeveledUp,
            user: {
                level: progressionResult.newLevel,
                xp: progressionResult.newXp,
            },
        };
    },

    async uncompleteTask(taskId, userId) {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task || task.userId !== userId)
            throw new Error("Quête introuvable.");
        if (!task.isCompleted) throw new Error("Quête déjà non validée.");

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const progressionResult = removeExperience(
            user.xp,
            user.level,
            task.difficulty,
        );

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted: false },
        });

        await prisma.user.update({
            where: { id: userId },
            data: { xp: progressionResult.newXp },
        });

        return {
            message: "Validation annulée.",
            xpLost: progressionResult.xpLost,
            task: updatedTask,
        };
    },
};
