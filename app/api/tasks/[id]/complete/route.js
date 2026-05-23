import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { calculateRequiredXP, calculateTaskXP } from "@/utils/xpLogic";

export async function PUT(request, { params }) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("levelup_session")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        // CORRECTION NEXT.JS 16 : Attendre la lecture des paramètres d'URL
        const resolvedParams = await params;
        const taskId = resolvedParams.id;

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
                { error: "Quête déjà validée !" },
                { status: 400 },
            );
        }

        const xpGained = calculateTaskXP(task.difficulty);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        let newXp = user.xp + xpGained;
        let newLevel = user.level;
        let xpRequired = calculateRequiredXP(newLevel);
        let hasLeveledUp = false;

        while (newXp >= xpRequired) {
            newXp -= xpRequired;
            newLevel += 1;
            xpRequired = calculateRequiredXP(newLevel);
            hasLeveledUp = true;
        }

        await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted: true },
        });

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { xp: newXp, level: newLevel },
        });

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
        console.error("Erreur PUT Complete :", error);
        return NextResponse.json(
            { error: "Erreur lors de la validation." },
            { status: 500 },
        );
    }
}
