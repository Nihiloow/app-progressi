import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { pseudo: true, xp: true, level: true },
        });

        if (!user)
            return NextResponse.json(
                { error: "Joueur introuvable" },
                { status: 404 },
            );

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
