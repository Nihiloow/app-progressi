import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 1. Chercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Identifiants incorrects." },
                { status: 401 },
            );
        }

        // 2. Comparer les mots de passe
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Identifiants incorrects." },
                { status: 401 },
            );
        }

        // 3. Créer une session basique (via les Cookies Next.js)
        // C'est notre passeport pour le Dashboard !
        cookies().set("levelup_session", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 semaine
        });

        return NextResponse.json(
            {
                message: "Connexion réussie !",
                user: { id: user.id, pseudo: user.pseudo, level: user.level },
            },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la connexion." },
            { status: 500 },
        );
    }
}
