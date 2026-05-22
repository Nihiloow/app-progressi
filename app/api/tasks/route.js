import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
    try {
        // 1. Vérifier qui fait la demande via le cookie de session
        const cookieStore = cookies();
        const userId = cookieStore.get("levelup_session")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        // 2. Récupérer uniquement les tâches de ce joueur spécifique
        const tasks = await prisma.task.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc" }, // Les plus récentes en premier
        });

        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la récupération des quêtes." },
            { status: 500 },
        );
    }
}

export async function POST(request) {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get("levelup_session")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { title, difficulty } = body;

        // Créer la tâche et l'attacher au joueur
        const newTask = await prisma.task.create({
            data: {
                title,
                difficulty: parseInt(difficulty),
                userId: userId,
            },
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la création de la quête." },
            { status: 500 },
        );
    }
}
