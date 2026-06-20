// Destination : app/api/tasks/[id]/status/route.js

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/requireSession";
import { taskService } from "@/core/services/TaskService";
import { handleApiError } from "@/lib/handleApiError";

// Porte d'entrée unique des trois transitions de statut. La route ne
// contient AUCUNE logique métier : elle authentifie, valide la forme,
// délègue au service et traduit le résultat en HTTP (SRP).
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
