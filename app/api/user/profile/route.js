import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { profileService } from "@/core/services/ProfileService";
import { handleApiError } from "@/lib/handleApiError";

// Un seul GET agrège les trois données affichées sur la page Profil
// (timeline, stats de productivité, streaks) : trois requêtes Promise.all
// en parallèle côté serveur, UNE seule requête réseau côté front — plutôt
// que trois hooks séparés qui multiplieraient les allers-retours pour un
// écran qui s'affiche toujours en bloc.
export async function GET() {
    try {
        const user = await requireSession();

        const [xpTimeline, productivityStats, bestStreaks] = await Promise.all([
            profileService.getXpTimeline(user.id),
            profileService.getProductivityStats(user.id),
            profileService.getBestStreaks(user.id),
        ]);

        return NextResponse.json(
            { xpTimeline, productivityStats, bestStreaks },
            { status: 200 },
        );
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération du profil.",
        );
    }
}
