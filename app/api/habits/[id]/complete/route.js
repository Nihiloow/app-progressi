import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { habitService } from "@/core/services/HabitService";
import { handleApiError } from "@/lib/handleApiError";

// Route dédiée à la validation du jour, sur le modèle de
// /api/tasks/[id]/status : zéro logique métier ici, juste authentifier et
// déléguer. Pas de corps de requête à valider (l'action ne porte aucun
// paramètre) — POST plutôt que PATCH puisqu'il ne s'agit pas de modifier
// l'état d'une ressource au sens REST classique mais de déclencher un
// événement ("valider aujourd'hui").
export async function POST(request, { params }) {
    try {
        const user = await requireSession();

        const { id } = await params;

        const outcome = await habitService.completeToday(id, user.id);

        return NextResponse.json(outcome, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la validation de l'habitude.",
        );
    }
}
