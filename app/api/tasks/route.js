import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createTaskSchema } from "@/core/validation/taskShema";

export async function GET() {
    try {
        const cookieStore = await cookies();
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
        const cookieStore = await cookies();
        const userId = cookieStore.get("levelup_session")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const result = createTaskSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Données invalides." },
                { status: 400 },
            );
        }

        const newTask = await prisma.task.create({
            data: {
                title: result.data.title,
                difficulty: result.data.difficulty,
                userId: userId,
            },
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error("Erreur POST Task : ", error);
        return NextResponse.json(
            { error: "Erreur lors de la création de la quête." },
            { status: 500 },
        );
    }
}
