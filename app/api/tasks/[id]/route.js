import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/requireSession";
import { updateTaskSchema } from "@/core/validation/taskSchema";
import { TaskNotFoundError } from "@/core/errors/domainErrors";
import { handleApiError } from "@/lib/handleApiError";
import { taskService } from "@/core/services/TaskService";

// Vérifie que la quête existe ET appartient à l'utilisateur connecté.
// Jette une erreur métier (traduite en 404 par handleApiError) : impossible
// de lire ou modifier la ressource d'un autre joueur. Reste utilisé ici
// pour DELETE uniquement — PATCH délègue son ownership check à
// taskService.updateTask, qui porte désormais la même règle.
async function assertTaskOwnership(taskId, userId) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task || task.userId !== userId) {
        throw new TaskNotFoundError();
    }

    return task;
}

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

        await assertTaskOwnership(id, user.id);

        // Le ledger XpEvent survit à la suppression (onDelete: SetNull) :
        // supprimer une quête complétée ne rembourse rien, ne libère pas de
        // créneau de quota, et l'historique d'XP reste exact
        await prisma.task.delete({ where: { id } });

        return NextResponse.json(
            { message: "Quête supprimée." },
            { status: 200 },
        );
    } catch (error) {
        return handleApiError(error, "Erreur lors de la suppression.");
    }
}
