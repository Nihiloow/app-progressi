// Destination : app/api/tasks/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createTaskSchema } from "@/core/validation/taskSchema";
import { handleApiError } from "@/lib/handleApiError";
import { tagService } from "@/core/services/TagService";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé." },
                { status: 401 },
            );
        }

        const tasks = await prisma.task.findMany({
            where: { userId: session.user.id },
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
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé." },
                { status: 401 },
            );
        }

        const body = await request.json();
        const result = createTaskSchema.safeParse(body);
        const { tags, ...taskData } = result.data;

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        // Le client ne fournit ni statut, ni XP, ni difficulté : uniquement
        // les champs du schéma. Tout le reste est dérivé côté serveur.
        const newTask = await prisma.$transaction(async (tx) => {
            const task = await tx.task.create({
                data: {
                    ...taskData,
                    userId: session.user.id,
                },
            });

            // tags a un .default([]) dans createTaskSchema : toujours un tableau.
            // syncTagsForTask gère le cas [] (aucune liaison créée).
            await tagService.syncTagsForTask(
                tx,
                session.user.id,
                task.id,
                tags,
            );

            // Recharge avec les tags pour que le front les ait dans la réponse 201
            return tx.task.findUnique({
                where: { id: task.id },
                include: { tags: true },
            });
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        return handleApiError(error, "Erreur lors de la création de la quête.");
    }
}
