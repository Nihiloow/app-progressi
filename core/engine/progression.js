const xpFloor = {
    1: 50,
    2: 100,
    3: 150,
};

export const dailyLimits = {
    1: 5,
    2: 3,
    3: 1,
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

    while (totalXp >= calculateRequiredXP(newLevel)) {
        totalXp -= calculateRequiredXP(newLevel);
        newLevel += 1;
        hasLeveledUp = true;
    }

    return {
        newXp: totalXp,
        newLevel: newLevel,
        hasLeveledUp: hasLeveledUp,
        xpGained: incomingXp,
    };
}

export function removeExperience(currentXp, currentLevel, difficulty) {
    const xpToRemove = xpFloor[difficulty] || 50;
    let newXp = currentXp - xpToRemove;

    if (newXp < 0) {
        newXp = 0;
    }

    return {
        newXp: newXp,
        newLevel: currentLevel,
        xpLost: currentXp - newXp,
    };
}
