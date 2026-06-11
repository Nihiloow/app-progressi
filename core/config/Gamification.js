// Source de vérité unique du modèle de gamification, côté serveur uniquement.
// Le client n'envoie jamais de montant d'XP ni de difficulté : tout est dérivé
// de la priorité ici. Clés alignées sur l'enum Prisma `Priority`.

// Barème de récompense par importance : on récompense "faire ce qui compte",
// pas la charge cognitive (le taskType est neutre en XP, choix produit).
export const XP_REWARDS = {
    HIGH: 150,
    MEDIUM: 100,
    LOW: 50,
    NONE: 20,
};

// Quotas journaliers de complétions rémunérées, inspirés de la méthode 1-3-5 :
// au-delà du quota, la tâche se valide mais rapporte 0 XP. C'est à la fois
// l'anti-triche (tout marquer HIGH est contre-productif) et un outil de
// hiérarchisation ("qu'est-ce qui compte vraiment aujourd'hui ?").
export const DAILY_LIMITS = {
    HIGH: 1,
    MEDIUM: 3,
    LOW: 5,
    NONE: 10,
};

// Garde-fou : une priorité inconnue doit faire échouer bruyamment le serveur
// plutôt que d'attribuer silencieusement une récompense par défaut.
export function getXpReward(priority) {
    const reward = XP_REWARDS[priority];
    if (reward === undefined) {
        throw new Error(`Priorité inconnue dans le barème XP : "${priority}"`);
    }
    return reward;
}

export function getDailyLimit(priority) {
    const limit = DAILY_LIMITS[priority];
    if (limit === undefined) {
        throw new Error(`Priorité inconnue dans les quotas : "${priority}"`);
    }
    return limit;
}
