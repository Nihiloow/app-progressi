import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { calculateRequiredXP, calculateTaskXP } from "@/utils/xpLogic";

export async function PUT(request, { params }) {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get("levelup_session")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const taskId = params.id;

        // 1. Récupérer la tâche et vérifier les droits
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task || task.userId !== userId) {
            return NextResponse.json(
                { error: "Quête introuvable." },
                { status: 404 },
            );
        }

        if (task.isCompleted) {
            return NextResponse.json(
                { error: "Cette quête est déjà validée !" },
                { status: 400 },
            );
        }

        // 2. Calcul du gain d'XP
        const xpGained = calculateTaskXP(task.difficulty);

        // 3. Récupérer les statistiques actuelles du joueur
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        let newXp = user.xp + xpGained;
        let newLevel = user.level;
        let xpRequired = calculateRequiredXP(newLevel);
        let hasLeveledUp = false;

        // 4. L'algorithme de passage de niveau
        // On utilise une boucle 'while' au cas où le joueur gagne assez d'XP
        // pour passer plusieurs niveaux d'un coup.
        while (newXp >= xpRequired) {
            newXp -= xpRequired; // Le joueur conserve son surplus d'XP
            newLevel += 1;
            xpRequired = calculateRequiredXP(newLevel);
            hasLeveledUp = true;
        }

        // 5. Sauvegarder les modifications (Tâche et Joueur) en Base de Données
        await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted: true },
        });

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { xp: newXp, level: newLevel },
        });

        // 6. Retourner les nouvelles données au Frontend pour l'affichage visuel
        return NextResponse.json(
            {
                message: "Quête accomplie !",
                xpGained,
                hasLeveledUp,
                user: {
                    level: updatedUser.level,
                    xp: updatedUser.xp,
                    nextXpGoal: xpRequired,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la validation." },
            { status: 500 },
        );
    }
}
