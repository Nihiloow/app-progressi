import { z } from "zod";

// Validation Zero Trust de la complétion d'une session Pomodoro. Le client
// ne fournit JAMAIS l'XP ni les montants — ils sont entièrement dérivés
// côté serveur depuis actualWorkSeconds et la tâche liée (même discipline
// que taskSchema : la priorité influence l'XP, mais l'XP lui-même n'est
// jamais un champ client).
//
// workMinutes/breakMinutes sont les durées PRÉVUES, utiles pour
// l'affichage de l'historique ("session de 25 min programmée") — elles
// n'entrent dans aucun calcul d'XP, seul actualWorkSeconds compte.
export const completePomodoroSessionSchema = z
    .object({
        workMinutes: z.number().int().min(1).max(180),
        breakMinutes: z.number().int().min(0).max(60),
        autoChainBreak: z.boolean().default(false),
        actualWorkSeconds: z.number().int().min(0),
        startedAt: z.string().datetime(),
        // Optionnelle : aucune tâche n'a pu être liée, ou l'utilisateur a
        // retiré la tâche en cours de séance avant la fin.
        taskId: z.string().uuid().nullable().default(null),
    })
    .strict()
    .refine((data) => data.actualWorkSeconds <= data.workMinutes * 60, {
        message:
            "Le temps de travail réel ne peut pas dépasser la durée prévue.",
        path: ["actualWorkSeconds"],
    });
