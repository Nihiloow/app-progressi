import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, pseudo } = body;

        // 1. Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé." },
                { status: 400 },
            );
        }

        // 2. Hacher le mot de passe (10 tours de salage)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Créer l'utilisateur en base de données
        const newUser = await prisma.user.create({
            data: {
                email,
                pseudo,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "Héros créé avec succès !", user: newUser },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de l'inscription." },
            { status: 500 },
        );
    }
}
