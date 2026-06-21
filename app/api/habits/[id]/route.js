import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { habitService } from "@/core/services/HabitService";
import { updateHabitSchema } from "@/core/validation/habitSchema";
import { handleApiError } from "@/lib/handleApiError";

export async function PATCH(request, { params }) {
    try {
        const user = await requireSession();

        const { id } = await params;
        const body = await request.json();
        const result = updateHabitSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const habit = await habitService.update(id, user.id, result.data);

        return NextResponse.json(habit, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la mise à jour de l'habitude.",
        );
    }
}

// Suppression dure : exposée pour l'instant uniquement ici (pas de bouton
// "supprimer" prévu dans l'UI v1, archive() lui est préféré côté front).
// Gardée disponible côté API au cas où Nathan en ait besoin ponctuellement
// (ex: nettoyage manuel pendant le développement).
export async function DELETE(request, { params }) {
    try {
        const user = await requireSession();

        const { id } = await params;

        await habitService.remove(id, user.id);

        return NextResponse.json(
            { message: "Habitude supprimée." },
            { status: 200 },
        );
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la suppression de l'habitude.",
        );
    }
}
