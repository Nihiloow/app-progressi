import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { updateTaskSchema } from "@/core/validation/taskSchema";
import { handleApiError } from "@/lib/handleApiError";
import { taskService } from "@/core/services/TaskService";

// PATCH : métadonnées uniquement (titre, priorité, type, échéance, tags).
// Le statut est exclu du schéma : les transitions TODO/DONE/WONT_DO passent
// par la route /status qui délègue au TaskService (XP, quotas, ledger).
export async function PATCH(request, { params }) {
    try {
        const user = await requireSession();

        const { id } = await params;
        const body = await request.json();

        // .strict() : toute clé non prévue (userId, status, xp…) fait
        // rejeter la requête entière — fermeture du mass assignment
        const result = updateTaskSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const updatedTask = await taskService.updateTask(
            id,
            user.id,
            result.data,
        );

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        return handleApiError(error, "Erreur lors de la mise à jour.");
    }
}

export async function DELETE(request, { params }) {
    try {
        const user = await requireSession();

        const { id } = await params;

        await taskService.deleteTask(id, user.id);

        return NextResponse.json(
            { message: "Quête supprimée." },
            { status: 200 },
        );
    } catch (error) {
        return handleApiError(error, "Erreur lors de la suppression.");
    }
}
