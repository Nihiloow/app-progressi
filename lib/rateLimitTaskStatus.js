import { prisma } from "@/lib/prisma";

// Fenêtre et seuil du rate-limit actif sur les transitions de statut d'une
// tâche. Séparé de ModerationService.checkRapidCycle (qui journalise après
// coup, dans la transaction de complétion) : ce garde-fou agit EN AMONT,
// avant même d'entrer dans le service, et bloque la requête elle-même.
//
// Seuil volontairement généreux par rapport au seuil de détection (3) :
// 5 transitions en 60 secondes ne devrait jamais arriver en usage normal,
// même en cliquant vite sur plusieurs tâches différentes — mais on laisse
// une marge avant de répondre 429, pour ne jamais gêner un usage légitime.
//
// Implémentation : pas de Redis ni de store en mémoire (un déploiement
// Vercel serverless n'a pas de mémoire partagée entre invocations) — on
// interroge directement XpEvent + Task.updatedAt, déjà en base. Coût
// négligeable : un count() indexé, pas un scan.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_TRANSITIONS = 5;

// Compte les transitions récentes RÉMUNÉRÉES sur une tâche (GAIN/REFUND
// dans XpEvent). Portée volontairement limitée au cycle DONE↔TODO : c'est
// le seul qui a une valeur économique à spammer (gain d'XP, même si chaque
// cycle individuel est remboursé à l'identique). Les transitions vers/
// depuis WONT_DO ne créent aucun XpEvent et ne sont pas comptées ici — les
// spammer n'a aucun intérêt de triche puisqu'aucun XP n'est en jeu dans ce
// cas, le couvrir ajouterait de la complexité pour un risque nul (YAGNI).
export async function isStatusChangeRateLimited(taskId) {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    const recentXpEvents = await prisma.xpEvent.count({
        where: {
            taskId,
            createdAt: { gte: windowStart },
        },
    });

    return recentXpEvents >= RATE_LIMIT_MAX_TRANSITIONS;
}
