import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { authService } from "@/core/services/AuthService";
import { changePasswordSchema } from "@/core/validation/userSchema";
import { handleApiError } from "@/lib/handleApiError";

export async function PATCH(request) {
    try {
        const user = await requireSession();

        const body = await request.json();
        const result = changePasswordSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        await authService.changePassword(user.id, result.data);

        return NextResponse.json(
            { message: "Mot de passe mis à jour." },
            { status: 200 },
        );
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors du changement de mot de passe.",
        );
    }
}
