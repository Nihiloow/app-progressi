import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { pomodoroService } from "@/core/services/PomodoroService";
import { updatePomodoroSettingsSchema } from "@/core/validation/pomodoroSchema";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        const user = await requireSession();

        const settings = await pomodoroService.getSettings(user.id);

        return NextResponse.json(settings, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération des réglages.",
        );
    }
}

export async function PATCH(request) {
    try {
        const user = await requireSession();

        const body = await request.json();
        const result = updatePomodoroSettingsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const settings = await pomodoroService.updateSettings(
            user.id,
            result.data,
        );

        return NextResponse.json(settings, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la mise à jour des réglages.",
        );
    }
}
