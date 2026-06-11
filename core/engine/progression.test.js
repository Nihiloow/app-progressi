import { expect, test, describe } from "vitest";
import {
    addExperience,
    removeExperience,
    calculateRequiredXP,
} from "./progression";
import { getXpReward, getDailyLimit } from "../config/gamification.js";

describe("Palier de niveau", () => {
    test("Le palier vaut niveau * 100", () => {
        expect(calculateRequiredXP(1)).toBe(100);
        expect(calculateRequiredXP(7)).toBe(700);
    });
});

describe("Gain d'expérience", () => {
    test("Gain simple sans passage de niveau", () => {
        const result = addExperience(0, 1, 50);

        expect(result.newXp).toBe(50);
        expect(result.newLevel).toBe(1);
        expect(result.hasLeveledUp).toBe(false);
        expect(result.xpGained).toBe(50);
    });

    test("Passage de niveau avec report de l'excédent", () => {
        // 90 + 150 = 240 ; palier niv.1 = 100 → niv.2 avec 140 restants
        const result = addExperience(90, 1, 150);

        expect(result.newLevel).toBe(2);
        expect(result.newXp).toBe(140);
        expect(result.hasLeveledUp).toBe(true);
    });

    test("Passage de plusieurs niveaux d'un coup", () => {
        // 90 + 350 = 440 ; -100 (niv.1→2) = 340 ; -200 (niv.2→3) = 140
        const result = addExperience(90, 1, 350);

        expect(result.newLevel).toBe(3);
        expect(result.newXp).toBe(140);
        expect(result.hasLeveledUp).toBe(true);
    });

    test("Gain de 0 XP (quota journalier dépassé) : aucun changement", () => {
        const result = addExperience(80, 2, 0);

        expect(result.newXp).toBe(80);
        expect(result.newLevel).toBe(2);
        expect(result.hasLeveledUp).toBe(false);
        expect(result.xpGained).toBe(0);
    });

    test("Atteindre exactement le palier déclenche le passage", () => {
        const result = addExperience(50, 1, 50);

        expect(result.newLevel).toBe(2);
        expect(result.newXp).toBe(0);
        expect(result.hasLeveledUp).toBe(true);
    });
});

describe("Retrait d'expérience (checkpoint RPG)", () => {
    test("Retrait simple", () => {
        const result = removeExperience(80, 2, 50);

        expect(result.newXp).toBe(30);
        expect(result.newLevel).toBe(2);
        expect(result.xpLost).toBe(50);
    });

    test("Plancher à 0 : on ne descend jamais en négatif", () => {
        const result = removeExperience(30, 2, 150);

        expect(result.newXp).toBe(0);
        expect(result.xpLost).toBe(30);
    });

    test("Le niveau acquis n'est jamais perdu", () => {
        const result = removeExperience(0, 5, 9999);

        expect(result.newLevel).toBe(5);
        expect(result.newXp).toBe(0);
    });

    test("Remboursement de 0 XP (gain hors quota) : aucun changement", () => {
        const result = removeExperience(80, 2, 0);

        expect(result.newXp).toBe(80);
        expect(result.xpLost).toBe(0);
    });
});

describe("Barème de gamification", () => {
    test("Récompenses par priorité", () => {
        expect(getXpReward("HIGH")).toBe(150);
        expect(getXpReward("MEDIUM")).toBe(100);
        expect(getXpReward("LOW")).toBe(50);
        expect(getXpReward("NONE")).toBe(20);
    });

    test("Quotas journaliers (méthode 1-3-5 étendue)", () => {
        expect(getDailyLimit("HIGH")).toBe(1);
        expect(getDailyLimit("MEDIUM")).toBe(3);
        expect(getDailyLimit("LOW")).toBe(5);
        expect(getDailyLimit("NONE")).toBe(10);
    });

    test("Une priorité inconnue échoue bruyamment au lieu d'un défaut silencieux", () => {
        expect(() => getXpReward("LEGENDARY")).toThrow();
        expect(() => getDailyLimit(undefined)).toThrow();
    });
});
