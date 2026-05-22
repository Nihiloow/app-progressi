// Détermine l'XP nécessaire pour atteindre le prochain niveau
// Formule simple pour le MVP : Le niveau actuel multiplié par 100
export function calculateRequiredXP(level) {
    return level * 100;
}

// Détermine l'XP gagnée selon la difficulté de la tâche
export function calculateTaskXP(difficulty) {
    const xpMap = {
        1: 50, // Facile
        2: 100, // Moyen
        3: 150, // Difficile
    };

    return xpMap[difficulty] || 50; // Par défaut, difficulté facile
}
