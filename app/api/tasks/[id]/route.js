import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(request, { params }) {
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

        // Vérifier que la tâche appartient bien à celui qui demande sa suppression
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task || task.userId !== userId) {
            return NextResponse.json(
                { error: "Quête introuvable ou accès refusé." },
                { status: 404 },
            );
        }

        // Supprimer la tâche
        await prisma.task.delete({
            where: { id: taskId },
        });

        return NextResponse.json(
            { message: "Quête abandonnée avec succès." },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la suppression." },
            { status: 500 },
        );
    }
}
