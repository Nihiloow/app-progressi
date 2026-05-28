const xpFloor = {
    1: 50,
    2: 100,
    3: 150,
};

export function calculateRequiredXP(level) {
    return level * 100;
}

export function addExperience(currentXp, currentLevel, difficulty) {
    const toNextLevel = calculateRequiredXP(currentLevel);

    const incomingXp = xpFloor[difficulty] || 50;

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
        newXp: totalXp,
        newLevel: newLevel,
        hasLeveledUp: hasLeveledUp,
        xpGained: incomingXp,
    };
}
