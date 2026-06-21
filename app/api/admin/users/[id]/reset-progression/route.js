import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { userService } from "@/core/services/UserService";
import { handleApiError } from "@/lib/handleApiError";

// Route dédiée à la réinitialisation de progression, sur le modèle de
// PATCH /api/admin/users/[id] : zéro logique métier ici, juste
// authentifier (admin) et déléguer. POST plutôt que PATCH : l'action
// déclenche un événement métier ("repartir à zéro"), pas une mise à jour
// de champ au sens REST classique — même rationale que
// /api/habits/[id]/complete. Le self-target est rejeté dans le service
// (SelfTargetError → 409), pas ici.
export async function POST(request, { params }) {
    try {
        const admin = await requireAdmin();

        const { id } = await params;

        const user = await userService.resetProgression(id, admin.id);

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la réinitialisation de la progression.",
        );
    }
}
