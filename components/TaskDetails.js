"use client";

export default function TaskDetails({ task }) {
    // si aucune tâche n'est sélectionnée, on affiche l'état vide
    if (!task) {
        return (
            <aside className="hidden w-80 border-l border-slate-200 bg-slate-50 p-6 lg:block dark:border-zinc-800 dark:bg-[#18181b]">
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 dark:text-zinc-500">
                    <span className="text-4xl mb-4 opacity-50">📝</span>
                    <p className="text-sm">
                        Clique sur une quête pour voir ses détails ou la
                        modifier.
                    </p>
                </div>
            </aside>
        );
    }

    // si une tâche est sélectionnée, on affiche ses détails
    return (
        <aside className="hidden w-80 flex-col border-l border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
            {/* En-tête des détails */}
            <header className="border-b border-slate-100 p-6 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        {task.difficulty === 1
                            ? "Facile"
                            : task.difficulty === 2
                              ? "Moyen"
                              : "Difficile"}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                        •
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                        {task.difficulty * 50} XP
                    </span>
                </div>
                <h2
                    className={`text-xl font-bold ${task.isCompleted ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}
                >
                    {task.title}
                </h2>
            </header>

            {/* Corps des détails (Zone pour nos futures features) */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
                    Cette zone accueillera bientôt la description de la quête,
                    les sous-tâches, ou des notes personnelles.
                </div>
            </div>

            {/* Pied de page avec statut */}
            <footer className="p-6 text-xs text-center text-slate-400 dark:text-zinc-500 border-t border-slate-100 dark:border-zinc-800/50">
                Statut : {task.isCompleted ? "Validée" : "En cours"}
            </footer>
        </aside>
    );
}
