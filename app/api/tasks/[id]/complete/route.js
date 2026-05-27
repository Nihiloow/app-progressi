import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TaskService } from "@/core/services/TaskService";

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        const resolvedParams = await params;
        const taskId = resolvedParams.id;

        const result = await TaskService.completeTask(taskId, userId);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (
            error.message === "Quête introuvable." ||
            error.message === "Quête déjà validée."
        ) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        console.error("Erreur PUT Complete :", error);
        return NextResponse.json(
            { error: "Erreur lors de la validation." },
            { status: 500 },
        );
    }
}
