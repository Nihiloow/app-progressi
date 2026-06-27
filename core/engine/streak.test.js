import { expect, test, describe } from "vitest";
import { isStreakAlive, getEffectiveStreak, applyCompletion } from "./streak";

// Date de référence fixe pour tous les tests : évite toute dépendance au
// jour réel d'exécution (un test qui passe aujourd'hui et échoue demain
// serait un test qui ne teste rien de fiable).
const REFERENCE = new Date("2026-06-15T10:00:00");

function daysBefore(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() - n);
    return d;
}

describe("isStreakAlive — fenêtre de grâce d'un jour", () => {
    test("Jamais validé (lastCompletedOn null) : streak mort par définition", () => {
        expect(isStreakAlive(null, REFERENCE)).toBe(false);
    });

    test("Validé aujourd'hui (gap = 0) : vivant", () => {
        expect(isStreakAlive(REFERENCE, REFERENCE)).toBe(true);
    });

    test("Validé hier (gap = 1) : encore dans la fenêtre de grâce, vivant", () => {
        const yesterday = daysBefore(REFERENCE, 1);
        expect(isStreakAlive(yesterday, REFERENCE)).toBe(true);
    });

    test("Validé il y a 2 jours (gap = 2) : un jour complet sauté, rompu", () => {
        const twoDaysAgo = daysBefore(REFERENCE, 2);
        expect(isStreakAlive(twoDaysAgo, REFERENCE)).toBe(false);
    });

    test("Validé il y a longtemps (gap large) : rompu", () => {
        const longAgo = daysBefore(REFERENCE, 30);
        expect(isStreakAlive(longAgo, REFERENCE)).toBe(false);
    });

    test("L'heure de la journée n'affecte pas le calcul (comparaison par jour calendaire)", () => {
        // Validé hier à 23h59 vs référence à 00h01 aujourd'hui : toujours
        // gap = 1, jamais un faux "2 jours" dû à un écart d'horaire.
        const lateYesterday = new Date(REFERENCE);
        lateYesterday.setDate(lateYesterday.getDate() - 1);
        lateYesterday.setHours(23, 59, 0, 0);

        const earlyToday = new Date(REFERENCE);
        earlyToday.setHours(0, 1, 0, 0);

        expect(isStreakAlive(lateYesterday, earlyToday)).toBe(true);
    });
});

describe("getEffectiveStreak — lecture sans effet de bord", () => {
    test("Streak vivant : renvoie currentStreak tel quel", () => {
        const habit = {
            currentStreak: 7,
            bestStreak: 10,
            lastCompletedOn: daysBefore(REFERENCE, 1),
        };

        expect(getEffectiveStreak(habit, REFERENCE)).toBe(7);
    });

    test("Streak rompu : renvoie 0 sans modifier l'objet habit reçu", () => {
        const habit = {
            currentStreak: 7,
            bestStreak: 10,
            lastCompletedOn: daysBefore(REFERENCE, 5),
        };

        expect(getEffectiveStreak(habit, REFERENCE)).toBe(0);
        // Aucune écriture : une lecture ne doit jamais avoir d'effet de
        // bord, la correction réelle n'a lieu qu'à la prochaine validation.
        expect(habit.currentStreak).toBe(7);
    });

    test("Jamais validé : 0", () => {
        const habit = {
            currentStreak: 0,
            bestStreak: 0,
            lastCompletedOn: null,
        };

        expect(getEffectiveStreak(habit, REFERENCE)).toBe(0);
    });
});

describe("applyCompletion — calcul du nouveau streak", () => {
    test("Première validation jamais faite : repart à 1", () => {
        const habit = {
            currentStreak: 0,
            bestStreak: 0,
            lastCompletedOn: null,
        };

        const result = applyCompletion(habit, REFERENCE);

        expect(result.currentStreak).toBe(1);
        expect(result.bestStreak).toBe(1);
    });

    test("Continuité (vivant, jour suivant) : +1", () => {
        const habit = {
            currentStreak: 4,
            bestStreak: 4,
            lastCompletedOn: daysBefore(REFERENCE, 1),
        };

        const result = applyCompletion(habit, REFERENCE);

        expect(result.currentStreak).toBe(5);
        expect(result.bestStreak).toBe(5);
    });

    test("Rupture (gap >= 2) : repart à 1, jamais négatif ni décrémenté", () => {
        const habit = {
            currentStreak: 12,
            bestStreak: 12,
            lastCompletedOn: daysBefore(REFERENCE, 6),
        };

        const result = applyCompletion(habit, REFERENCE);

        expect(result.currentStreak).toBe(1);
    });

    test("bestStreak progresse quand le nouveau streak le dépasse", () => {
        const habit = {
            currentStreak: 4,
            bestStreak: 4,
            lastCompletedOn: daysBefore(REFERENCE, 1),
        };

        const result = applyCompletion(habit, REFERENCE);

        expect(result.bestStreak).toBe(5);
    });

    test("bestStreak ne diminue jamais, même après une rupture", () => {
        const habit = {
            currentStreak: 15,
            bestStreak: 15,
            lastCompletedOn: daysBefore(REFERENCE, 10), // rompu depuis longtemps
        };

        const result = applyCompletion(habit, REFERENCE);

        // Le streak courant repart à 1, mais le record acquis reste acquis
        // (même philosophie checkpoint que core/engine/progression.js).
        expect(result.currentStreak).toBe(1);
        expect(result.bestStreak).toBe(15);
    });

    test("lastCompletedOn est normalisé au jour calendaire (00:00), pas le timestamp brut", () => {
        const habit = {
            currentStreak: 0,
            bestStreak: 0,
            lastCompletedOn: null,
        };

        // REFERENCE porte une heure (10:00) ; le résultat doit être
        // normalisé à minuit, pour rester comparable d'une validation à
        // l'autre quelle que soit l'heure de la journée où l'utilisateur valide.
        const result = applyCompletion(habit, REFERENCE);

        expect(result.lastCompletedOn.getHours()).toBe(0);
        expect(result.lastCompletedOn.getMinutes()).toBe(0);
        expect(result.lastCompletedOn.getSeconds()).toBe(0);
    });
});
