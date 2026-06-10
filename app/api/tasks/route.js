import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/core/validation/taskShema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const userId = session.user.id;

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
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 },
            );
        }

        const userId = session.user.id;

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
                priority: result.data.priority,
                taskType: result.data.taskType,
                dueDate: result.data.dueDate,
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
