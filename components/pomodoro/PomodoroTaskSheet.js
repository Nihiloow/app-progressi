"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    getPriorityConfig,
    formatShortDate,
    dueDateColor,
} from "@/components/ui/taskAppearance";
import { CloseIcon } from "@/components/ui/icons";

// Panneau de sélection de tâche, façon TickTick : descend depuis le haut,
// champ de recherche, tâches groupées (en retard / à venir), pastille de
// priorité creuse réutilisant PRIORITY_CONFIG.ring (la même que le bouton
// de complétion de TaskItem — pas une nouvelle convention). Overlay
// dédié : ne partage jamais l'espace du cercle, ce qui élimine par
// construction tout chevauchement. Filtre TODO uniquement.
export function PomodoroTaskSheet({ isOpen, onClose, taskId, onSelect }) {
    const [search, setSearch] = useState("");

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
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) setSearch("");
    }, [isOpen]);

    if (!isOpen) return null;

    const todoTasks = (tasks ?? []).filter((t) => t.status === "TODO");
    const query = search.trim().toLowerCase();
    const filtered = query
        ? todoTasks.filter((t) => t.title.toLowerCase().includes(query))
        : todoTasks;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = filtered.filter(
        (t) => t.dueDate && new Date(t.dueDate) < today,
    );
    const rest = filtered.filter(
        (t) => !t.dueDate || new Date(t.dueDate) >= today,
    );

    return (
        <div className="absolute inset-0 z-50 flex flex-col">
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative z-10 mx-auto mt-4 flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Choisir une quête
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="border-b border-slate-100 p-3 dark:border-zinc-800">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher"
                        autoFocus
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-200 dark:placeholder-zinc-500"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="space-y-2 p-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800/50"
                                />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-400 dark:text-zinc-500">
                            {query
                                ? "Aucune quête ne correspond."
                                : "Aucune quête en cours à lier."}
                        </p>
                    ) : (
                        <>
                            <TaskGroup
                                label="En retard"
                                tasks={overdue}
                                taskId={taskId}
                                onSelect={onSelect}
                            />
                            <TaskGroup
                                label={overdue.length > 0 ? "À venir" : null}
                                tasks={rest}
                                taskId={taskId}
                                onSelect={onSelect}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function TaskGroup({ label, tasks, taskId, onSelect }) {
    if (tasks.length === 0) return null;

    return (
        <div className="mb-2">
            {label && (
                <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {label}
                </p>
            )}
            {tasks.map((task) => {
                const priorityConfig = getPriorityConfig(task.priority);
                const isSelected = task.id === taskId;

                return (
                    <button
                        key={task.id}
                        type="button"
                        onClick={() => onSelect(task.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 ${
                            isSelected
                                ? "bg-indigo-50 dark:bg-indigo-500/10"
                                : ""
                        }`}
                    >
                        <span
                            className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${priorityConfig.ring}`}
                        />
                        <span className="flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                            {task.title}
                        </span>
                        {task.dueDate && (
                            <span
                                className={`flex-shrink-0 text-xs font-medium ${dueDateColor(task.dueDate)}`}
                            >
                                {formatShortDate(task.dueDate)}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
