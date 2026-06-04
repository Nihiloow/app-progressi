"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Composant SVG réutilisable pour le drapeau
const FlagIcon = ({ className }) => (
    <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
        />
    </svg>
);

export default function MobileTaskForm({ isOpen, onClose }) {
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState(1); // 1: Facile, 2: Moyen, 3: Difficile
    const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

    const inputRef = useRef(null);
    const queryClient = useQueryClient();

    // UX : Auto-focus à l'ouverture
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    // CORRECTIF : Nettoyage forcé à la fermeture du tiroir principal
    useEffect(() => {
        if (!isOpen) {
            setIsPriorityMenuOpen(false);
        }
    }, [isOpen]);

    const getDifficultyConfig = (level) => {
        switch (level) {
            case 3:
                return {
                    color: "text-red-500 dark:text-red-400",
                    bg: "bg-red-50 dark:bg-red-500/10",
                    label: "Haute",
                };
            case 2:
                return {
                    color: "text-amber-500 dark:text-amber-400",
                    bg: "bg-amber-50 dark:bg-amber-500/10",
                    label: "Moyenne",
                };
            case 1:
                return {
                    color: "text-blue-500 dark:text-blue-400",
                    bg: "bg-blue-50 dark:bg-blue-500/10",
                    label: "Basse",
                };
            default:
                return {
                    color: "text-slate-400 dark:text-zinc-500",
                    bg: "transparent",
                    label: "Priorité",
                };
        }
    };

    const currentConfig = getDifficultyConfig(difficulty);

    const createTaskMutation = useMutation({
        mutationFn: async (newTask) => {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });
            if (!res.ok) throw new Error("Erreur serveur");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setTitle("");
            setDifficulty(1);
            setIsPriorityMenuOpen(false);
            onClose();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || createTaskMutation.isPending) return;
        createTaskMutation.mutate({ title, difficulty });
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <>
            {/* Fond sombre du tiroir principal */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden ${
                    isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={handleBackdropClick}
            />

            {/* Tiroir coulissant */}
            <div
                className={`fixed bottom-0 left-0 z-[70] w-full transform rounded-t-2xl bg-white p-4 shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-zinc-900 pb-safe ${
                    isOpen ? "translate-y-0" : "translate-y-full"
                }`}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Que voulez-vous faire ?"
                        className="w-full bg-transparent text-lg font-medium text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-zinc-500"
                        disabled={createTaskMutation.isPending}
                    />

                    <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 relative">
                        <div className="flex items-center gap-4 text-xl">
                            <button
                                type="button"
                                className="flex items-center gap-1 rounded text-sm font-medium text-indigo-500 transition-colors active:text-indigo-600 dark:text-indigo-400"
                            >
                                📅 Aujourd'hui
                            </button>

                            {/* Système de drapeaux */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsPriorityMenuOpen(
                                            !isPriorityMenuOpen,
                                        )
                                    }
                                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${currentConfig.color} ${currentConfig.bg} hover:bg-slate-100 dark:hover:bg-zinc-800`}
                                >
                                    <FlagIcon className="h-5 w-5" />
                                </button>

                                {isPriorityMenuOpen && (
                                    <>
                                        {/* CORRECTIF : Z-index à 80 pour être strictement au-dessus du tiroir (70) */}
                                        <div
                                            className="fixed inset-0 z-[80]"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Empêche le clic de traverser
                                                setIsPriorityMenuOpen(false);
                                            }}
                                        />

                                        {/* Boîte du menu (Z-index 90) */}
                                        <div className="absolute bottom-full left-0 mb-2 w-40 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 z-[90] dark:bg-zinc-800 dark:ring-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="flex flex-col py-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDifficulty(3);
                                                        setIsPriorityMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <FlagIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Haute
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDifficulty(2);
                                                        setIsPriorityMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <FlagIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Moyenne
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDifficulty(1);
                                                        setIsPriorityMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <FlagIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Basse
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                !title.trim() || createTaskMutation.isPending
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                                createTaskMutation.isPending || !title.trim()
                                    ? "bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-600"
                                    : "bg-indigo-500 text-white active:scale-95 dark:bg-indigo-600"
                            }`}
                        >
                            {createTaskMutation.isPending ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            ) : (
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
