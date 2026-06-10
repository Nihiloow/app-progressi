import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().min(3, "Le titre est trop court."),
    difficulty: z.number().int().min(1).max(3).optional().default(1),
    priority: z
        .enum(["HIGH", "MEDIUM", "LOW", "NONE"])
        .optional()
        .default("NONE"),
    taskType: z
        .enum(["DEEP_WORK", "SHALLOW_WORK", "ADMINISTRATIVE", "NONE"])
        .optional()
        .default("SHALLOW_WORK"),
    dueDate: z.coerce.date().optional().nullable(),
});
