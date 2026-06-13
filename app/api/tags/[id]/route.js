import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tagService } from "@/core/services/TagService";
import { updateTagSchema } from "@/core/validation/tagSchema";
import { handleApiError } from "@/lib/handleApiError";

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé." },
                { status: 401 },
            );
        }

        const { id } = await params;
        const body = await request.json();
        const result = updateTagSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const tag = await tagService.update(id, session.user.id, result.data);

        return NextResponse.json(tag, { status: 200 });
    } catch (error) {
        return handleApiError(error, "Erreur lors de la mise à jour du tag.");
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé." },
                { status: 401 },
            );
        }

        const { id } = await params;

        await tagService.remove(id, session.user.id);

        return NextResponse.json({ message: "Tag supprimé." }, { status: 200 });
    } catch (error) {
        return handleApiError(error, "Erreur lors de la suppression du tag.");
    }
}
