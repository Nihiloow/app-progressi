import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, pseudo, password } = body;

        // vérifie si le joueur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé par un autre héros." },
                { status: 400 },
            );
        }

        // sécurise le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // forge le nouveau compte dans la base de données
        const newUser = await prisma.user.create({
            data: {
                email,
                pseudo,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "Compte créé avec succès !" },
            { status: 201 },
        );
    } catch (error) {
        console.error("Erreur Inscription :", error);
        return NextResponse.json(
            { error: "Erreur lors de la création du compte." },
            { status: 500 },
        );
    }
}
