import { prisma } from "@/lib/prisma";

// Fenêtre et seuil de détection du cycle rapide validation/décochage.
// Choix actés : 3 cycles complets en moins de 10 minutes sur une même
// tâche. Volontairement large — un usage légitime (se tromper, corriger)
// ne fait jamais ça trois fois de suite en si peu de temps ; le but est
// de ne jamais flaguer un comportement honnête, pas de traquer la moindre
// hésitation.
const RAPID_CYCLE_WINDOW_MS = 10 * 60 * 1000;
const RAPID_CYCLE_THRESHOLD = 3;

// Orchestrateur de modération : détection d'anomalies + journal consultable
// par l'admin. Ne sanctionne jamais automatiquement — il informe, la
// décision (désactiver, contacter l'utilisateur, ignorer) reste humaine.
// Reçoit son client DB par injection, même pattern que les autres services.
export class ModerationService {
    #db;

    constructor(db) {
        this.#db = db;
    }

    // Appelée par TaskService après une complétion réussie. Compte les
    // GAIN actifs (non encore remboursés ou redevenus actifs) sur cette
    // tâche dans la fenêtre récente — un GAIN suivi d'un REFUND puis d'un
    // nouveau GAIN constitue un cycle. On compte simplement le nombre de
    // GAIN créés sur ce taskId dans la fenêtre : un cycle = un GAIN, donc
    // 3 GAIN sur la même tâche en 10 minutes = 3 cycles (le premier n'est
    // pas suspect isolément, c'est la répétition qui l'est).
    //
    // Reçoit tx (le client de transaction actif dans TaskService) plutôt
    // que this.#db : la détection doit voir le GAIN qui vient juste d'être
    // créé dans la même transaction, avant qu'elle ne soit commitée.
    async checkRapidCycle(tx, userId, taskId) {
        const windowStart = new Date(Date.now() - RAPID_CYCLE_WINDOW_MS);

        const recentGains = await tx.xpEvent.count({
            where: {
                taskId,
                type: "GAIN",
                createdAt: { gte: windowStart },
            },
        });

        if (recentGains < RAPID_CYCLE_THRESHOLD) return;

        await tx.moderationFlag.create({
            data: {
                type: "RAPID_CYCLE",
                detail: `${recentGains} validations de la même quête en moins de 10 minutes.`,
                userId,
                taskId,
            },
        });
    }

    // Liste des flags pour le dashboard admin, du plus récent au plus
    // ancien. include user/task : l'admin a besoin du pseudo et du titre
    // sans requête supplémentaire — petite table, pas de pagination
    // nécessaire pour la portée de ce projet (YAGNI : pas de curseur tant
    // que le volume ne le justifie pas).
    async listFlags() {
        return this.#db.moderationFlag.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, pseudo: true } },
                task: { select: { id: true, title: true } },
            },
        });
    }
}

export const moderationService = new ModerationService(prisma);
