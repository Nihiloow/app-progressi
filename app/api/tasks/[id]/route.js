import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TaskService } from "@/core/services/TaskService";

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        // attendre la lecture des paramètres d'URL
        const resolvedParams = await params;
        const taskId = resolvedParams.id;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        // Svérifie que la quête existe et qu'elle appartient bien au joueur
        if (!task || task.userId !== userId) {
            return NextResponse.json(
                { error: "Quête introuvable." },
                { status: 404 },
            );
        }

        await prisma.task.delete({
            where: { id: taskId },
        });

        return NextResponse.json(
            { message: "Quête abandonnée." },
            { status: 200 },
        );
    } catch (error) {
        console.error("Erreur DELETE :", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression." },
            { status: 500 },
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const resolvedParams = await params;

        if (body.isCompleted === false) {
            const result = await TaskService.uncompleteTask(
                resolvedParams.id,
                session.user.id,
            );
            return NextResponse.json(result.task, { status: 200 });
        }

        const task = await prisma.task.update({
            where: { id: resolvedParams.id },
            data: body,
        });

        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        console.error("Erreur PATCH Task :", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour." },
            { status: 500 },
        );
    }
}
