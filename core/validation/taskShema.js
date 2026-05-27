import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().min(3, "Le titre est trop court."),
    difficulty: z.number().int().min(1).max(3),
});
