import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { userService } from "@/core/services/UserService";
import { updateUserStatusSchema } from "@/core/validation/adminSchema";
import { handleApiError } from "@/lib/handleApiError";

// Bascule ACTIVE ↔ DISABLED. Le self-target est rejeté dans le service
// (SelfTargetError → 409), pas ici : la route ne porte aucune règle.
export async function PATCH(request, { params }) {
    try {
        const admin = await requireAdmin();

        const { id } = await params;
        const body = await request.json();
        const result = updateUserStatusSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const user = await userService.setStatus(
            id,
            admin.id,
            result.data.status,
        );

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la mise à jour du statut.",
        );
    }
}

// Hard-delete (cascade). Irréversible : la confirmation est côté front.
export async function DELETE(request, { params }) {
    try {
        const admin = await requireAdmin();

        const { id } = await params;

        await userService.deleteUser(id, admin.id);

        return NextResponse.json(
            { message: "Utilisateur supprimé." },
            { status: 200 },
        );
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la suppression de l'utilisateur.",
        );
    }
}
