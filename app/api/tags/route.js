import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tagService } from "@/core/services/TagService";
import { createTagSchema } from "@/core/validation/tagSchema";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé." },
                { status: 401 },
            );
        }

        const tags = await tagService.list(session.user.id);

        return NextResponse.json(tags, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération des tags.",
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
        const result = createTagSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        // Doublon (name, userId) → P2002 → 409 via handleApiError
        const tag = await tagService.create(session.user.id, result.data);

        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        return handleApiError(error, "Erreur lors de la création du tag.");
    }
}
