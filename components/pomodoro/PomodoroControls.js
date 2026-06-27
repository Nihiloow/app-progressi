"use client";

// Contrôles façon TickTick : boutons EMPILÉS verticalement, pas côte à
// côte. Action principale (Pause/Reprendre) en pilule PLEINE, "Fin" en
// pilule OUTLINE juste dessous. Le skip n'apparaît QUE pendant la phase
// BREAK — sauter une pause pour enchaîner sur le prochain cycle WORK a un
// sens métier ; sauter une phase WORK n'en a pas, puisqu'elle a déjà sa
// propre fin naturelle (décompte à zéro) et son propre arrêt (bouton
// "Fin", qui enregistre le temps partiel). Le texte d'état sous les
// boutons est géré par l'appelant (PomodoroScreen), pas ici — ce
// composant reste un pur ensemble de contrôles, sans connaissance du
// libellé de phase.
export function PomodoroControls({
    phase,
    isRunning,
    onStart,
    onPause,
    onSkip,
    onStop,
}) {
    if (phase === "IDLE") {
        return (
            <button
                type="button"
                onClick={onStart}
                className="w-56 rounded-full border-2 border-indigo-500 px-8 py-3.5 text-base font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
            >
                Démarrer
            </button>
        );
    }

    const primaryLabel = isRunning ? "Pause" : "Reprendre";

    return (
        <div className="flex w-56 flex-col gap-3">
            <button
                type="button"
                onClick={isRunning ? onPause : onStart}
                className="w-full rounded-full bg-indigo-500 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
                {primaryLabel}
            </button>

            <button
                type="button"
                onClick={onStop}
                className="w-full rounded-full border-2 border-slate-300 px-8 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
                Fin
            </button>

            {phase === "BREAK" && (
                <button
                    type="button"
                    onClick={onSkip}
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                    Passer la pause
                </button>
            )}
        </div>
    );
}
