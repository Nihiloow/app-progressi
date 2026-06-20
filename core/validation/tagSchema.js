import { z } from "zod";

// Regex hex stricte : empêche de stocker du CSS arbitraire en base.
// Le ? final autorise null/undefined (couleur facultative).
const hexColorSchema = z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide (format attendu : #RRGGBB).")
    .optional()
    .nullable();

// .strict() : même rationale que createTaskSchema — un champ hors schéma
// (userId, id…) doit faire échouer la requête, pas être ignoré en silence.
export const createTagSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Le nom du tag ne peut pas être vide.")
            .max(30, "Le nom du tag est trop long (30 caractères maximum)."),
        color: hexColorSchema,
    })
    .strict();

export const updateTagSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Le nom du tag ne peut pas être vide.")
            .max(30, "Le nom du tag est trop long (30 caractères maximum)."),
        color: hexColorSchema,
    })
    .partial()
    .strict();
