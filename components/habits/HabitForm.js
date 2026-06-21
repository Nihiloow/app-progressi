"use client";

import { useState, useRef, useEffect } from "react";
import { useCreateHabit } from "@/hooks/useCreateHabit";
import { OptionMenu } from "@/components/ui/OptionMenu";
import {
    PRIORITY_OPTIONS,
    getPriorityConfig,
} from "@/components/ui/taskAppearance";
import { LightningIcon, PlusIcon } from "@/components/ui/icons";

// Formulaire de création d'habitude. Volontairement plus court que
// TaskForm : ni date d'échéance (une habitude est récurrente, pas
// ponctuelle), ni type cognitif (DEEP_WORK/SHALLOW_WORK n'a pas de sens
// pour une routine répétée), ni tags (non demandés par le CDC pour les
// habitudes). YAGNI : on n'ajoute pas ces champs avant qu'un besoin réel
// les justifie.
export default function HabitForm() {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("NONE");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const containerRef = useRef(null);

    const createHabit = useCreateHabit();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("pointerdown", handleClickOutside);
        return () =>
            document.removeEventListener("pointerdown", handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || createHabit.isPending) return;

        createHabit.mutate(
            { title, priority },
            {
                onSuccess: () => {
                    setTitle("");
                    setPriority("NONE");
                    setIsMenuOpen(false);
                },
            },
        );
    };

    const currentPriority = getPriorityConfig(priority);

    return (
        <div className="relative mb-6" ref={containerRef}>
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 pr-3 shadow-sm transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus-within:bg-zinc-950"
            >
                <div className="pl-3 text-slate-400">
                    <PlusIcon className="h-5 w-5" />
                </div>

                <input
                    type="text"
                    placeholder="Quelle nouvelle habitude ?"
                    className="min-w-0 flex-1 bg-transparent p-2 font-medium text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-zinc-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={createHabit.isPending}
                />
                <button
                    type="submit"
                    className="hidden"
                    disabled={!title.trim() || createHabit.isPending}
                >
                    Créer
                </button>

                <div className="relative border-l border-slate-200 pl-2 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((v) => !v)}
                        title="Priorité (détermine l'XP de base)"
                        className={`flex h-9 w-9 items-center justify-center rounded transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800 ${currentPriority.color} ${currentPriority.bg}`}
                    >
                        <LightningIcon className="h-5 w-5" />
                    </button>
                    <OptionMenu
                        isOpen={isMenuOpen}
                        onClose={() => setIsMenuOpen(false)}
                        onSelect={setPriority}
                        options={PRIORITY_OPTIONS}
                        align="right"
                    />
                </div>
            </form>

            {createHabit.isError && (
                <p className="mt-2 text-sm text-red-500">
                    {createHabit.error.message}
                </p>
            )}
        </div>
    );
}
