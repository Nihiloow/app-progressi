// Moteur de progression RPG : fonctions pures, sans effet de bord.
// Le moteur ne connaît ni les priorités ni le barème (responsabilité de
// core/config/gamification.js) : il reçoit un montant et applique les
// règles de niveaux. Cela le rend trivial à tester et à faire évoluer.

export function calculateRequiredXP(level) {
    return level * 100;
}

// Applique un gain d'XP et fait passer les niveaux nécessaires.
// L'XP "déborde" d'un niveau à l'autre (checkpoint RPG : on ne perd
// jamais l'excédent).
export function addExperience(currentXp, currentLevel, amount) {
    let totalXp = currentXp + amount;
    let newLevel = currentLevel;
    let hasLeveledUp = false;

    while (totalXp >= calculateRequiredXP(newLevel)) {
        totalXp -= calculateRequiredXP(newLevel);
        newLevel += 1;
        hasLeveledUp = true;
    }

    return {
        newXp: totalXp,
        newLevel,
        hasLeveledUp,
        xpGained: amount,
    };
}

// Retire de l'XP avec plancher à 0 pour le niveau en cours :
// un niveau acquis ne se perd jamais (règle checkpoint).
export function removeExperience(currentXp, currentLevel, amount) {
    const newXp = Math.max(0, currentXp - amount);

    return {
        newXp,
        newLevel: currentLevel,
        xpLost: currentXp - newXp,
    };
}
