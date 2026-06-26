import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireSession";
import { profileService } from "@/core/services/ProfileService";
import { avatarUploadSchema } from "@/core/validation/avatarSchema";
import { handleApiError } from "@/lib/handleApiError";

// Upload/remplacement de l'avatar. multipart/form-data, pas JSON — c'est
// pourquoi cette route ne suit pas le pattern request.json() des autres
// routes du projet. Validation Zero Trust quand même appliquée : le type
// MIME et la taille du fichier sont extraits puis passés à Zod AVANT tout
// envoi vers Supabase Storage, jamais sur la seule confiance du front.
export async function POST(request) {
    try {
        const user = await requireSession();

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return NextResponse.json(
                { error: "Aucun fichier fourni." },
                { status: 400 },
            );
        }

        const result = avatarUploadSchema.safeParse({
            mimeType: file.type,
            size: file.size,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const updated = await profileService.uploadAvatar(
            user.id,
            buffer,
            result.data.mimeType,
        );

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors du téléversement de l'avatar.",
        );
    }
}

// Supprime l'avatar (retour à l'initiale par défaut). Symétrique au DELETE
// déjà utilisé ailleurs dans le projet (tags, tâches, habitudes) pour les
// actions de suppression — cohérence REST.
export async function DELETE() {
    try {
        const user = await requireSession();

        const updated = await profileService.removeAvatar(user.id);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la suppression de l'avatar.",
        );
    }
}
