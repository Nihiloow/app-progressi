import { z } from "zod";

const PRIORITIES = ["HIGH", "MEDIUM", "LOW", "NONE"];

// Seul DAILY est accepté en v1 (cf. commentaire schema.prisma) : WEEKLY
// existe dans l'enum Prisma pour l'avenir, mais n'a aucune logique de
// streak implémentée derrière. Le rejeter ici plutôt que de l'accepter
// silencieusement et produire un comportement non défini.
const frequencySchema = z.enum(["DAILY"]).optional().default("DAILY");

// .strict() : même rationale que createTaskSchema — un champ hors schéma
// (userId, currentStreak, bestStreak…) fait échouer la requête entière,
// pas l'objet d'un cache que le client n'a pas le droit d'écrire lui-même.
export const createHabitSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(3, "Le titre est trop court (3 caractères minimum).")
            .max(120, "Le titre est trop long (120 caractères maximum)."),
        priority: z.enum(PRIORITIES).optional().default("NONE"),
        frequency: frequencySchema,
    })
    .strict();

export const updateHabitSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(3, "Le titre est trop court (3 caractères minimum).")
            .max(120, "Le titre est trop long (120 caractères maximum)."),
        priority: z.enum(PRIORITIES),
        isArchived: z.boolean(),
    })
    .partial()
    .strict();
