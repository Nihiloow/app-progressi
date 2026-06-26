import { z } from "zod";

// Formats acceptés et taille maximale pour un avatar — validés ici avant
// tout envoi vers Supabase Storage, jamais sur la seule confiance du
// front (Zero Trust, même discipline que partout ailleurs dans le projet).
const MAX_AVATAR_SIZE_BYTES = 3 * 1024 * 1024; // 3 Mo
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Ne valide PAS un objet File directement (Zod n'a pas de validateur
// natif pour ça côté Node) — la route extrait { mimeType, size } du
// File reçu via request.formData() et c'est CET objet simple qui est
// validé ici.
export const avatarUploadSchema = z.object({
    mimeType: z.enum(ALLOWED_MIME_TYPES, {
        message: "Format d'image non supporté (JPEG, PNG ou WebP uniquement).",
    }),
    size: z
        .number()
        .max(MAX_AVATAR_SIZE_BYTES, "L'image ne doit pas dépasser 3 Mo."),
});

// Dérive l'extension de fichier à partir du type MIME déjà validé — sert
// à construire un chemin de stockage prévisible (userId/avatar.ext).
export function extensionFromMimeType(mimeType) {
    const map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    };
    return map[mimeType];
}
