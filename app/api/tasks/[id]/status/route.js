// Destination : app/api/tasks/[id]/status/route.js

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/requireSession";
import { taskService } from "@/core/services/TaskService";
import { isStatusChangeRateLimited } from "@/lib/rateLimitTaskStatus";
import { handleApiError } from "@/lib/handleApiError";

// Porte d'entrée unique des trois transitions de statut. La route ne
// contient AUCUNE logique métier : elle authentifie, valide la forme,
// vérifie le rate-limit anti-triche, délègue au service et traduit le
// résultat en HTTP (SRP).
const statusSchema = z.object({
    status: z.enum(["TODO", "DONE", "WONT_DO"]),
});

export async function PATCH(request, { params }) {
    try {
        const user = await requireSession();

        const { id } = await params;
        const body = await request.json();
        const result = statusSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Statut invalide." },
                { status: 400 },
            );
        }

        // Rate-limit posé avant tout appel au service : une rafale de
        // requêtes sur la même tâche est rejetée sans même toucher à la
        // logique XP. Ne remplace pas la détection après coup
        // (ModerationService, dans TaskService) — les deux mécanismes sont
        // complémentaires : l'un bloque en temps réel, l'autre journalise
        // pour l'admin même quand le seuil de blocage n'est pas atteint.
        const isLimited = await isStatusChangeRateLimited(id);
        if (isLimited) {
            return NextResponse.json(
                {
                    error: "Trop de changements de statut sur cette quête en peu de temps. Réessaie dans une minute.",
                },
                { status: 429 },
            );
        }

        const outcome = await taskService.changeStatus(
            id,
            user.id,
            result.data.status,
        );

        return NextResponse.json(outcome, { status: 200 });
    } catch (error) {
        return handleApiError(error, "Erreur lors du changement de statut.");
    }
}
