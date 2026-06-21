// Moteur de streak : fonctions pures, sans effet de bord, sans Prisma.
// Même esprit que core/engine/progression.js — le moteur ne sait rien de
// la base de données, il reçoit des dates et applique les règles.
//
// Modèle retenu : calcul PARESSEUX (lazy). Il n'existe aucune tâche planifiée
// qui "casse" un streak à minuit. À la place : on stocke currentStreak +
// lastCompletedOn, et c'est CHAQUE LECTURE/VALIDATION qui détermine si le
// streak stocké est encore valide ou s'il doit être considéré comme rompu.
// Mêmes garanties qu'un cron, sans aucune infra de scheduling.

// Normalise une date à son jour calendaire LOCAL (00:00), sans l'heure.
// Indispensable pour comparer des "jours" plutôt que des timestamps :
// deux Date à 9h et 23h le même jour doivent être considérées identiques.
export function toCalendarDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Différence en jours pleins entre deux jours calendaires déjà normalisés.
function daysBetween(dayA, dayB) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.round((dayA.getTime() - dayB.getTime()) / MS_PER_DAY);
}

// Détermine si le streak stocké est encore "vivant" à la date de référence
// (par défaut : aujourd'hui). Un streak reste vivant si la dernière
// validation date d'aujourd'hui OU d'hier (la fenêtre de grâce d'un jour :
// on n'a pas encore "manqué" la journée en cours). Au-delà, il est rompu.
//
// lastCompletedOn peut être null (habitude jamais validée) : streak mort
// par définition.
export function isStreakAlive(lastCompletedOn, referenceDate = new Date()) {
    if (!lastCompletedOn) return false;

    const today = toCalendarDay(referenceDate);
    const lastDay = toCalendarDay(lastCompletedOn);
    const gap = daysBetween(today, lastDay);

    // gap === 0 : déjà validé aujourd'hui. gap === 1 : validé hier, encore
    // dans la fenêtre. gap >= 2 : au moins un jour complet sauté → rompu.
    return gap <= 1;
}

// Calcule le streak EFFECTIF à afficher en lecture, sans rien écrire :
// si la chaîne stockée est rompue (cf. isStreakAlive), le streak affiché
// retombe à 0 — mais on ne corrige PAS la base à la lecture (une lecture
// ne doit jamais avoir d'effet de bord en écriture ; la correction réelle
// n'a lieu qu'à la prochaine validation, via applyCompletion ci-dessous).
export function getEffectiveStreak(habit, referenceDate = new Date()) {
    if (isStreakAlive(habit.lastCompletedOn, referenceDate)) {
        return habit.currentStreak;
    }
    return 0;
}

// Calcule le nouveau streak après une validation au jour `completedOn`.
// Trois cas :
//   - Déjà vivant et continué depuis hier (ou première validation du jour
//     suivant immédiatement le dernier) → +1.
//   - Streak rompu (gap >= 2 ou jamais validé) → repart à 1.
//   - Revalidation du même jour : ne devrait jamais arriver ici, c'est la
//     responsabilité de la couche service de le rejeter avant (contrainte
//     unique habitId+completedOn) — cette fonction part du principe qu'elle
//     reçoit un jour neuf.
export function applyCompletion(habit, completedOn = new Date()) {
    const wasAlive = isStreakAlive(habit.lastCompletedOn, completedOn);
    const newStreak = wasAlive ? habit.currentStreak + 1 : 1;
    const newBest = Math.max(newStreak, habit.bestStreak);

    return {
        currentStreak: newStreak,
        bestStreak: newBest,
        lastCompletedOn: toCalendarDay(completedOn),
    };
}
