import { z } from "zod";

// Valeurs alignées sur les enums Prisma (Priority et TaskType)
const PRIORITIES = ["HIGH", "MEDIUM", "LOW", "NONE"];
const TASK_TYPES = ["DEEP_WORK", "SHALLOW_WORK", "ADMINISTRATIVE", "NONE"];

export const createTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Le titre est trop court (3 caractères minimum).")
        .max(120, "Le titre est trop long (120 caractères maximum)."),
    priority: z.enum(PRIORITIES).optional().default("NONE"),
    taskType: z.enum(TASK_TYPES).optional().default("NONE"),
    dueDate: z.coerce.date().optional().nullable(),
});

// Schéma de la route PATCH : uniquement les champs modifiables librement,
// tous optionnels. Deux exclusions volontaires :
// - status : les transitions passent par TaskService (XP, quotas, ledger)
// - userId / xp / etc. : .strict() rejette toute clé inconnue, ce qui ferme
//   le mass assignment (impossible d'injecter un champ non prévu)
export const updateTaskSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(3, "Le titre est trop court (3 caractères minimum).")
            .max(120, "Le titre est trop long (120 caractères maximum)."),
        priority: z.enum(PRIORITIES),
        taskType: z.enum(TASK_TYPES),
        dueDate: z.coerce.date().nullable(),
    })
    .partial()
    .strict();
