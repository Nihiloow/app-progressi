const xpFloor = {
    1: 50,
    2: 100,
    3: 150,
};

function calculateRequiredXP(level) {
    return level * 100;
}

function addExperience(currentXp, currentLevel, difficulty) {
    const toNextLevel = calculateRequiredXP(currentLevel);

    const incomingXp = xpFloor[difficulty] || 50; // Le || 50 est une sécurité par défaut

    let totalXp = currentXp + incomingXp;
    let newLevel = currentLevel;
    let hasLeveledUp = false;
    const xpGained = totalXp;

    while (totalXp >= toNextLevel) {
        newLevel = currentLevel + 1;
        hasLeveledUp = true;
        totalXp -= toNextLevel;
    }

    return {
        newXp: totalXp, // L'XP restante après le(s) niveau(x) passé(s)
        newLevel: newLevel, // Le niveau final
        hasLeveledUp: hasLeveledUp, // true si le niveau final > currentLevel
        xpGained: xpGained, // L'XP totale ajoutée par cette action
    };
}
