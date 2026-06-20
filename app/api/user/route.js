// Destination : app/api/user/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/requireSession";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        const sessionUser = await requireSession();

        // Lookup par id (immuable) plutôt que par email : c'est la clé
        // primaire, et l'id est désormais garanti dans le token
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: { pseudo: true, xp: true, level: true, role: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Joueur introuvable." },
                { status: 404 },
            );
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return handleApiError(error, "Erreur serveur.");
    }
}
