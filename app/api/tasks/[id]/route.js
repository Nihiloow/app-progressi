import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(request, { params }) {
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
