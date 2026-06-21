import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { habitService } from "@/core/services/HabitService";
import { createHabitSchema } from "@/core/validation/habitSchema";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        const user = await requireSession();

        const habits = await habitService.list(user.id);

        return NextResponse.json(habits, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération des habitudes.",
        );
    }
}

export async function POST(request) {
    try {
        const user = await requireSession();

        const body = await request.json();
        const result = createHabitSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const habit = await habitService.create(user.id, result.data);

        return NextResponse.json(habit, { status: 201 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la création de l'habitude.",
        );
    }
}
