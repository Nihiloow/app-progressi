import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { userService } from "@/core/services/UserService";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        await requireAdmin();

        // Deux agrégations indépendantes, parallélisées : le socle de
        // chiffres et la série temporelle du graphe.
        const [stats, xpTimeline] = await Promise.all([
            userService.getGlobalStats(),
            userService.getXpTimeline(),
        ]);

        return NextResponse.json({ ...stats, xpTimeline }, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération des statistiques.",
        );
    }
}
