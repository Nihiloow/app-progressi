// ─── EXTENSION À AJOUTER À LA FIN DE core/config/gamification.js ───────────
// Le fichier existant n'a pas pu être relu en clair (binaire dans l'ingest
// fourni) : je livre ce bloc en AJOUT plutôt qu'en réécriture complète, pour
// ne pas risquer d'effacer une subtilité du fichier réel. Colle ce bloc à la
// fin du fichier, après les exports existants de getXpReward/getDailyLimit.

// Paliers de multiplicateur d'XP selon le streak courant d'une habitude.
// Lisibles pour la soutenance : ×1.0 en base, puis paliers à 3/7/30 jours.
// Triés du plus haut seuil au plus bas : on retient le premier qui matche.
const STREAK_MULTIPLIER_TIERS = [
    { minStreak: 30, multiplier: 2.0 },
    { minStreak: 7, multiplier: 1.5 },
    { minStreak: 3, multiplier: 1.2 },
    { minStreak: 0, multiplier: 1.0 },
];

// Renvoie le multiplicateur applicable pour un streak donné. Un streak
// négatif ou non numérique échoue bruyamment (cohérent avec getXpReward
// qui throw sur une priorité inconnue plutôt que de retomber sur un défaut
// silencieux).
export function getStreakMultiplier(streak) {
    if (typeof streak !== "number" || streak < 0 || Number.isNaN(streak)) {
        throw new Error(`Streak invalide : ${streak}`);
    }

    const tier = STREAK_MULTIPLIER_TIERS.find((t) => streak >= t.minStreak);
    return tier.multiplier;
}
