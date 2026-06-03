import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
