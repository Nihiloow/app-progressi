// Destination : components/TaskDetails.js (REMPLACE l'existant)

"use client";

import { XP_REWARDS } from "@/core/config/gamification";
import {
    getPriorityConfig,
    getTypeConfig,
    STATUS_LABELS,
} from "@/components/ui/taskAppearance";
import { ListIcon } from "@/components/ui/icons";

export default function TaskDetails({ task }) {
    // État vide : aucune quête sélectionnée
    if (!task) {
        return (
            <aside className="hidden w-80 border-l border-slate-200 bg-slate-50 p-6 lg:block dark:border-zinc-800 dark:bg-[#18181b]">
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 dark:text-zinc-500">
                    <ListIcon className="mb-4 h-10 w-10 opacity-50" />
                    <p className="text-sm">
                        Clique sur une quête pour voir ses détails ou la
                        modifier.
                    </p>
                </div>
            </aside>
        );
    }

    const priorityConfig = getPriorityConfig(task.priority);
    const typeConfig = getTypeConfig(task.taskType);
    const TypeIcon = typeConfig.icon;
    // Affichage informatif uniquement : le serveur reste seul juge du
    // montant réellement accordé (quotas journaliers)
    const xpReward = XP_REWARDS[task.priority] ?? 0;

    return (
        <aside className="hidden w-80 flex-col border-l border-slate-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-950">
            <header className="border-b border-slate-100 p-6 dark:border-zinc-800/50">
                <div className="mb-2 flex items-center gap-2">
                    <span
                        className={`text-xs font-bold uppercase tracking-wider ${priorityConfig.color}`}
                    >
                        {priorityConfig.label}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                        •
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                        {xpReward} XP
                    </span>
                    {task.taskType !== "NONE" && (
                        <>
                            <span className="text-xs text-slate-400 dark:text-zinc-500">
                                •
                            </span>
                            <TypeIcon
                                className={`h-4 w-4 ${typeConfig.color}`}
                            />
                        </>
                    )}
                </div>
                <h2
                    className={`text-xl font-bold ${
                        task.status === "TODO"
                            ? "text-slate-800 dark:text-slate-100"
                            : "text-slate-400 line-through"
                    }`}
                >
                    {task.title}
                </h2>
            </header>

            {/* Zone réservée aux futures features (description, sous-tâches) */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
                    Cette zone accueillera bientôt la description de la quête,
                    les sous-tâches, ou des notes personnelles.
                </div>
            </div>

            <footer className="border-t border-slate-100 p-6 text-center text-xs text-slate-400 dark:border-zinc-800/50 dark:text-zinc-500">
                Statut : {STATUS_LABELS[task.status] ?? task.status}
            </footer>
        </aside>
    );
}
