import { prisma } from "@/lib/prisma";
import { addExperience } from "../engine/progression";

export const TaskService = {
    async completeTask(taskId, userId) {
        // 1. Récupération et vérification de la quête
        const task = await prisma.task.findUnique({ where: { id: taskId } });

        if (!task || task.userId !== userId)
            throw new Error("Quête introuvable.");
        if (task.isCompleted) throw new Error("Quête déjà validée.");

        // 2. Récupération du joueur
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("Joueur introuvable.");

        // -----------------------------------------------------
        // À TOI DE JOUER :
        // 1. Utilise 'addExperience' en lui passant l'XP du joueur, son niveau, et la difficulté de la quête.
        // 2. Stocke le résultat dans une constante (ex: 'progressionResult').
        // 3. Mets à jour la Task dans Prisma (isCompleted: true).
        // 4. Mets à jour le User dans Prisma (xp et level) en utilisant les données de 'progressionResult'.
        // -----------------------------------------------------

        const progressionResult = addExperience(
            user.xp,
            user.level,
            task.difficulty,
        );

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

        // 5. On retourne un objet formaté pour l'API
        return {
            message: "Quête accomplie !",
            xpGained: progressionResult.xpGained,
            hasLeveledUp: progressionResult.hasLeveledUp,
            user: {
                level: progressionResult.newLevel,
                xp: progressionResult.newXp,
            },
        };
    },
};
