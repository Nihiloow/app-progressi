// Destination : app/api/tasks/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/requireSession";
import { createTaskSchema } from "@/core/validation/taskSchema";
import { handleApiError } from "@/lib/handleApiError";
import { taskService } from "@/core/services/TaskService";

export async function GET() {
    try {
        const user = await requireSession();

        const tasks = await prisma.task.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: { tags: true },
        });

        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération des quêtes.",
        );
    }
}

export async function POST(request) {
    try {
        const user = await requireSession();

        const body = await request.json();
        const result = createTaskSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const newTask = await taskService.createTask(user.id, result.data);

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        return handleApiError(error, "Erreur lors de la création de la quête.");
    }
}
