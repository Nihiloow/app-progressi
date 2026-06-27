"use client";

import { useCompleteHabit } from "@/hooks/useCompleteHabit";
import { useDeleteHabit } from "@/hooks/useDeleteHabit";
import { isStreakAlive } from "@/core/engine/streak";
import { getPriorityConfig } from "@/components/ui/taskAppearance";
import { FlameIcon, CheckIcon, TrashIcon } from "@/components/ui/icons";

// Détermine si l'habitude a déjà été validée aujourd'hui, côté front,
// SANS appel serveur supplémentaire : on compare lastCompletedOn (déjà
// présent dans la réponse de GET /api/habits) au jour calendaire courant.
// Même logique que core/engine/streak.js#isStreakAlive, réutilisée pour
// éviter une seconde source de vérité sur "c'est aujourd'hui ou pas".
function isDoneToday(lastCompletedOn) {
    if (!lastCompletedOn) return false;
    const today = new Date();
    const last = new Date(lastCompletedOn);
    return (
        today.getFullYear() === last.getFullYear() &&
        today.getMonth() === last.getMonth() &&
        today.getDate() === last.getDate()
    );
}

export function HabitItem({ habit }) {
    const completeHabit = useCompleteHabit();
    const deleteHabit = useDeleteHabit();
    const priorityConfig = getPriorityConfig(habit.priority);

    const doneToday = isDoneToday(habit.lastCompletedOn);
    // Le streak affiché est "vivant" seulement s'il n'a pas été rompu par
    // un jour sauté — calcul paresseux, jamais corrigé en base à la lecture
    // (cf. core/engine/streak.js). Si rompu, on affiche 0 même si le champ
    // brut en base indique encore une ancienne valeur non recalculée.
    const effectiveStreak = isStreakAlive(habit.lastCompletedOn)
        ? habit.currentStreak
        : 0;

    const handleComplete = () => {
        if (doneToday || completeHabit.isPending) return;
        completeHabit.mutate(habit.id);
    };

    // Suppression directe, sans confirmation — alignée sur le
    // comportement des tâches (useDeleteTask), pas un dialogue à deux
    // étapes comme DeleteUserDialog, qui reste réservé à la suppression
    // d'un compte utilisateur entier.
    const handleDelete = () => {
        if (deleteHabit.isPending) return;
        deleteHabit.mutate(habit.id);
    };

    return (
        <div
            className={`flex items-center gap-4 rounded-xl border p-3 transition-all duration-200 ${
                doneToday
                    ? "border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/50"
                    : "border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            }`}
        >
            <button
                onClick={handleComplete}
                disabled={doneToday || completeHabit.isPending}
                aria-label={
                    doneToday
                        ? "Habitude déjà validée aujourd'hui"
                        : "Valider l'habitude du jour"
                }
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
                    doneToday
                        ? "cursor-not-allowed border-indigo-500 bg-indigo-500 text-white dark:border-indigo-600 dark:bg-indigo-600"
                        : `cursor-pointer ${priorityConfig.ring} hover:bg-slate-50 dark:hover:bg-zinc-800`
                } ${completeHabit.isPending ? "cursor-wait opacity-50" : ""}`}
            >
                {doneToday && <CheckIcon className="h-4 w-4" />}
            </button>

            <div className="flex flex-1 flex-col overflow-hidden">
                <span
                    className={`truncate text-sm font-medium ${
                        doneToday
                            ? "text-slate-400 dark:text-zinc-500"
                            : "text-slate-800 dark:text-slate-200"
                    }`}
                >
                    {habit.title}
                </span>
                <div className="mt-1 flex items-center gap-3">
                    <span
                        className={`flex items-center gap-1 text-xs font-semibold ${
                            effectiveStreak > 0
                                ? "text-amber-500 dark:text-amber-400"
                                : "text-slate-400 dark:text-zinc-500"
                        }`}
                    >
                        <FlameIcon className="h-3.5 w-3.5" />
                        {effectiveStreak} jour{effectiveStreak > 1 ? "s" : ""}
                    </span>
                    {habit.bestStreak > 0 && (
                        <span className="text-xs text-slate-400 dark:text-zinc-500">
                            Record : {habit.bestStreak}
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={handleDelete}
                disabled={deleteHabit.isPending}
                aria-label="Supprimer l'habitude"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-wait disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
                <TrashIcon className="h-4 w-4" />
            </button>

            {completeHabit.isError && (
                <p className="text-xs text-red-500">
                    {completeHabit.error.message}
                </p>
            )}
            {deleteHabit.isError && (
                <p className="text-xs text-red-500">
                    {deleteHabit.error.message}
                </p>
            )}
        </div>
    );
}
