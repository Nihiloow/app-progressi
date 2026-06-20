// Destination : app/api/auth/register/route.js

import { NextResponse } from "next/server";
import { registerSchema } from "@/core/validation/userSchema";
import { authService } from "@/core/services/AuthService";
import { handleApiError } from "@/lib/handleApiError";

export async function POST(request) {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        await authService.register(result.data);

        return NextResponse.json(
            { message: "Compte créé avec succès !" },
            { status: 201 },
        );
    } catch (error) {
        // Filet anti-course : la vérification findUnique de AuthService.register
        // peut être doublée par deux requêtes concurrentes (même email) — la
        // seconde échoue ici sur la contrainte @unique en base (P2002), avec
        // un message plus parlant que le générique de handleApiError.
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé par un autre héros." },
                { status: 409 },
            );
        }

        return handleApiError(error, "Erreur lors de la création du compte.");
    }
}
