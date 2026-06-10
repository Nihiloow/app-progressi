"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    const [priority, setPriority] = useState("NONE");
    const [taskType, setTaskType] = useState("SHALLOW_WORK");
    const [dueDate, setDueDate] = useState("");

    const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);

    const inputRef = useRef(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen && inputRef.current)
            setTimeout(() => inputRef.current.focus(), 100);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setIsPriorityMenuOpen(false);
            setIsTypeMenuOpen(false);
        }
    }, [isOpen]);

    const getPriorityConfig = (level) => {
        switch (level) {
            case "HIGH":
                return {
                    color: "text-red-500",
                    bg: "bg-red-50",
                    label: "Haute",
                };
            case "MEDIUM":
                return {
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                    label: "Moyenne",
                };
            case "LOW":
                return {
                    color: "text-blue-500",
                    bg: "bg-blue-50",
                    label: "Basse",
                };
            default:
                return {
                    color: "text-slate-400",
                    bg: "transparent",
                    label: "Priorité",
                };
        }
    };

    const getTypeConfig = (type) => {
        switch (type) {
            case "DEEP_WORK":
                return {
                    icon: "🎯",
                    label: "Deep Focus",
                    color: "text-purple-500",
                };
            case "ADMINISTRATIVE":
                return { icon: "✉️", label: "Admin", color: "text-slate-500" };
            default:
                return {
                    icon: "📋",
                    label: "Shallow Work",
                    color: "text-indigo-500",
                };
        }
    };

    const currentPriority = getPriorityConfig(priority);
    const currentType = getTypeConfig(taskType);

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
            setPriority("NONE");
            setTaskType("SHALLOW_WORK");
            setDueDate("");
            setIsPriorityMenuOpen(false);
            setIsTypeMenuOpen(false);
            onClose();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || createTaskMutation.isPending) return;

        createTaskMutation.mutate({
            title,
            priority,
            taskType,
            difficulty: taskType === "DEEP_WORK" ? 3 : 1, // Le Deep Work donne + d'XP
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        });
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            />

            <div
                className={`fixed bottom-0 left-0 z-[70] w-full transform rounded-t-2xl bg-white p-4 shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-zinc-900 pb-safe ${isOpen ? "translate-y-0" : "translate-y-full"}`}
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

                    <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                        <div className="flex items-center gap-3 text-xl">
                            {/* Bouton Date avec Input Natif Invisible */}
                            <div className="relative flex items-center">
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                <button
                                    type="button"
                                    className={`flex items-center gap-1 rounded px-2 py-1 text-sm font-medium transition-colors ${dueDate ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-indigo-500 dark:text-indigo-400"}`}
                                >
                                    📅{" "}
                                    {dueDate
                                        ? new Date(dueDate).toLocaleDateString(
                                              "fr-FR",
                                              {
                                                  day: "numeric",
                                                  month: "short",
                                              },
                                          )
                                        : "Date"}
                                </button>
                            </div>

                            {/* Menu Type de Tâche */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsTypeMenuOpen(!isTypeMenuOpen);
                                        setIsPriorityMenuOpen(false);
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                                >
                                    <span className="text-base">
                                        {currentType.icon}
                                    </span>
                                </button>

                                {isTypeMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-[80]"
                                            onClick={() =>
                                                setIsTypeMenuOpen(false)
                                            }
                                        />
                                        <div className="absolute bottom-full left-0 mb-2 w-48 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 z-[90] dark:bg-zinc-800 dark:ring-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="flex flex-col py-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTaskType(
                                                            "DEEP_WORK",
                                                        );
                                                        setIsTypeMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <span>🎯</span>{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Deep Focus
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTaskType(
                                                            "SHALLOW_WORK",
                                                        );
                                                        setIsTypeMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <span>📋</span>{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Shallow Work
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTaskType(
                                                            "ADMINISTRATIVE",
                                                        );
                                                        setIsTypeMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <span>✉️</span>{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Admin
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Menu Priorité */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPriorityMenuOpen(
                                            !isPriorityMenuOpen,
                                        );
                                        setIsTypeMenuOpen(false);
                                    }}
                                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${currentPriority.color} ${currentPriority.bg} hover:bg-slate-100 dark:hover:bg-zinc-800`}
                                >
                                    <FlagIcon className="h-5 w-5" />
                                </button>

                                {isPriorityMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-[80]"
                                            onClick={() =>
                                                setIsPriorityMenuOpen(false)
                                            }
                                        />
                                        <div className="absolute bottom-full left-0 mb-2 w-40 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 z-[90] dark:bg-zinc-800 dark:ring-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="flex flex-col py-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority("HIGH");
                                                        setIsPriorityMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <FlagIcon className="h-5 w-5 text-red-500" />{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Haute
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority("MEDIUM");
                                                        setIsPriorityMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <FlagIcon className="h-5 w-5 text-amber-500" />{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Moyenne
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority("LOW");
                                                        setIsPriorityMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <FlagIcon className="h-5 w-5 text-blue-500" />{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Basse
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority("NONE");
                                                        setIsPriorityMenuOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50 border-t border-slate-100 dark:border-zinc-700/50 mt-1"
                                                >
                                                    <FlagIcon className="h-5 w-5 text-slate-400" />{" "}
                                                    <span className="text-slate-500">
                                                        Aucune
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
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${createTaskMutation.isPending || !title.trim() ? "bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-600" : "bg-indigo-500 text-white active:scale-95 dark:bg-indigo-600"}`}
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
