// Destination : app/api/user/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non autorisé." },
                { status: 401 },
            );
        }

        // Lookup par id (immuable) plutôt que par email : c'est la clé
        // primaire, et l'id est désormais garanti dans le token
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
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
