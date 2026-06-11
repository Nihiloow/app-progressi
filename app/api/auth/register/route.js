// Destination : app/api/auth/register/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/core/validation/userSchema";
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

        // Données validées ET normalisées (email en minuscules, champs trim)
        const { email, pseudo, password } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé par un autre héros." },
                { status: 409 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: { email, pseudo, password: hashedPassword },
        });

        return NextResponse.json(
            { message: "Compte créé avec succès !" },
            { status: 201 },
        );
    } catch (error) {
        // Filet anti-course : deux inscriptions simultanées avec le même
        // email passent toutes deux le check ci-dessus, mais la contrainte
        // @unique en base fait échouer la seconde (code Prisma P2002)
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé par un autre héros." },
                { status: 409 },
            );
        }

        return handleApiError(error, "Erreur lors de la création du compte.");
    }
}
