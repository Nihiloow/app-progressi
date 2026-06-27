"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPriorityConfig } from "@/components/ui/taskAppearance";
import { CloseIcon, ChevronRightIcon } from "@/components/ui/icons";

// Sélecteur de tâche active, volontairement DISCRET : une seule ligne sous
// le minuteur, jamais une carte encadrée qui concurrencerait le cercle.
// Un seul état affiché à la fois — invite OU tâche choisie, jamais les
// deux (le ternaire interne le garantit). Popover custom (pattern
// OptionMenu du projet) pour un rendu cohérent en thème sombre, plutôt
// qu'un <select> natif. Filtre TODO uniquement.
export function PomodoroTaskPicker({ taskId, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const { data: tasks, isLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        const handleEscape = (e) => e.key === "Escape" && setIsOpen(false);
        document.addEventListener("pointerdown", handler);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("pointerdown", handler);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const todoTasks = tasks?.filter((t) => t.status === "TODO") ?? [];
    const selectedTask = todoTasks.find((t) => t.id === taskId);

    if (isLoading) {
        return (
            <div className="h-6 w-40 animate-pulse rounded bg-slate-100 dark:bg-zinc-800/50" />
        );
    }

    return (
        <div ref={containerRef} className="relative flex flex-col items-center">
            {selectedTask ? (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setIsOpen((v) => !v)}
                        className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 ${getPriorityConfig(selectedTask.priority).color}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                            {selectedTask.title}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        aria-label="Retirer la quête"
                        className="rounded-full p-0.5 text-slate-300 transition-colors hover:text-slate-500 dark:text-zinc-600 dark:hover:text-zinc-400"
                    >
                        <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : todoTasks.length === 0 ? (
                <span className="text-sm text-slate-400 dark:text-zinc-600">
                    Aucune quête en cours
                </span>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-slate-400 outline-none transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                    À quoi travailles-tu ?
                    <ChevronRightIcon
                        className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                </button>
            )}

            {isOpen && (
                <div
                    role="menu"
                    aria-label="Choisir une quête"
                    className="absolute bottom-full left-1/2 z-50 mb-2 max-h-60 w-64 -translate-x-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 animate-in fade-in"
                >
                    {todoTasks.map((task) => {
                        const priorityConfig = getPriorityConfig(task.priority);
                        return (
                            <button
                                key={task.id}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    onChange(task.id);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 ${
                                    task.id === taskId
                                        ? "bg-indigo-50 dark:bg-indigo-500/10"
                                        : ""
                                }`}
                            >
                                <span
                                    className={`text-[10px] font-bold uppercase ${priorityConfig.color}`}
                                >
                                    {priorityConfig.label}
                                </span>
                                <span className="flex-1 truncate font-medium text-slate-700 dark:text-slate-200">
                                    {task.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
