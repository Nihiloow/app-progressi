import { expect, test, describe } from "vitest";
import { addExperience } from "./progression";

describe("Moteur de progression RPG", () => {
    test("Cas 1 : Gain simple sans passage de niveau", () => {
        // Un joueur Lvl 1 avec 0 XP fait une quête Facile (1)
        const result = addExperience(0, 1, 1);

        expect(result.xpGained).toBe(50);
        expect(result.newXp).toBe(50);
        expect(result.newLevel).toBe(1);
        expect(result.hasLeveledUp).toBe(false);
    });

    test("Cas 2 : Gain massif avec passage de niveau (Level Up)", () => {
        // Un joueur Lvl 1 avec 90 XP fait une quête Difficile (3) qui rapporte 150 XP.
        const result = addExperience(90, 1, 3);

        // -----------------------------------------------------
        // À TOI DE JOUER :
        // Sachant qu'il faut 100 XP pour passer au niveau 2...
        // Écris les 4 'expect' pour vérifier :
        // 1. L'XP totale gagnée (xpGained)
        // 2. L'XP restante après le passage de niveau (newXp)
        // 3. Le nouveau niveau exact (newLevel)
        // 4. Si hasLeveledUp est bien 'true'
        // -----------------------------------------------------

        expect(result.xpGained).toBe(150);
        expect(result.newXp).toBe(140);
        expect(result.newLevel).toBe(2);
        expect(result.hasLeveledUp).toBe(true);
    });
});
