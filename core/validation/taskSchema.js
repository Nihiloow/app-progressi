import { z } from "zod";

const PRIORITIES = ["HIGH", "MEDIUM", "LOW", "NONE"];
const TASK_TYPES = ["DEEP_WORK", "SHALLOW_WORK", "ADMINISTRATIVE", "NONE"];

// Max 10 tags par tâche : limite arbitraire mais nécessaire (Zero Trust —
// sans ça, un body avec 10 000 noms de tags passe la validation et tente
// 10 000 upserts en base).
const tagsSchema = z
    .array(z.string().trim().min(1).max(30))
    .max(10, "10 tags maximum par tâche.")
    .optional()
    .default([]);

export const createTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Le titre est trop court (3 caractères minimum).")
        .max(120, "Le titre est trop long (120 caractères maximum)."),
    priority: z.enum(PRIORITIES).optional().default("NONE"),
    taskType: z.enum(TASK_TYPES).optional().default("NONE"),
    dueDate: z.coerce.date().optional().nullable(),
    tags: tagsSchema,
});

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
        description: z
            .string()
            .trim()
            .max(
                5000,
                "La description est trop longue (5000 caractères maximum).",
            )
            .nullable(),
        tags: z.array(z.string().trim().min(1).max(30)).max(10),
    })
    .partial()
    .strict();
