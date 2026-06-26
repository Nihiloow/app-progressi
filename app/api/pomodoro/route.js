import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { pomodoroService } from "@/core/services/PomodoroService";
import { completePomodoroSessionSchema } from "@/core/validation/pomodoroSchema";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        const user = await requireSession();

        const sessions = await pomodoroService.list(user.id);

        return NextResponse.json(sessions, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération de l'historique Pomodoro.",
        );
    }
}

// Point d'entrée unique : le minuteur en cours est un state CLIENT
// volatile (jamais persisté pendant qu'il tourne), donc il n'existe pas
// de route "démarrer une session" — seule la fin (naturelle ou arrêt
// manuel) écrit en base, via ce POST.
export async function POST(request) {
    try {
        const user = await requireSession();

        const body = await request.json();
        const result = completePomodoroSessionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const outcome = await pomodoroService.completeSession(
            user.id,
            result.data,
        );

        return NextResponse.json(outcome, { status: 201 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de l'enregistrement de la session Pomodoro.",
        );
    }
}
