import { expect, test, describe } from "vitest";
import { addExperience } from "./progression";

describe("Moteur de progression RPG", () => {
    test("Cas 1 : Gain simple sans passage de niveau", () => {
        const result = addExperience(0, 1, 1);

        expect(result.xpGained).toBe(50);
        expect(result.newXp).toBe(50);
        expect(result.newLevel).toBe(1);
        expect(result.hasLeveledUp).toBe(false);
    });

    test("Cas 2 : Gain massif avec passage de niveau (Level Up)", () => {
        const result = addExperience(90, 1, 3);

        expect(result.xpGained).toBe(150);
        expect(result.newXp).toBe(140);
        expect(result.newLevel).toBe(2);
        expect(result.hasLeveledUp).toBe(true);
    });
});
