import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies(); // <-- CORRECTION ICI
        const userId = cookieStore.get("levelup_session")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const tasks = await prisma.task.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la récupération." },
            { status: 500 },
        );
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies(); // <-- CORRECTION ICI
        const userId = cookieStore.get("levelup_session")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { title, difficulty } = body;

        const newTask = await prisma.task.create({
            data: {
                title,
                difficulty: parseInt(difficulty),
                userId: userId,
            },
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la création." },
            { status: 500 },
        );
    }
}
