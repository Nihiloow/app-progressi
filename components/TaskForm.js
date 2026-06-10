"use client";

import { useState, useRef, useEffect } from "react";
import { useCreateTask } from "@/hooks/useCreateTask";

// --- NOUVELLE IDENTITÉ VISUELLE (SVGs minimalistes) ---
const LightningIcon = (
    { className }, // Remplace le drapeau (Priorité)
) => (
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
        />
    </svg>
);
const FocusIcon = (
    { className }, // Deep Work
) => (
    <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);
const ListIcon = (
    { className }, // Shallow Work
) => (
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
            d="M4 6h16M4 12h16M4 18h16"
        />
    </svg>
);
const InboxIcon = (
    { className }, // Admin
) => (
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
    </svg>
);
const CalendarIcon = ({ className }) => (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
    </svg>
);
const TagIcon = ({ className }) => (
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
    </svg>
);

export default function TaskForm() {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("NONE");
    const [taskType, setTaskType] = useState("SHALLOW_WORK");

    // Gestion des menus
    const [openMenu, setOpenMenu] = useState(null); // "priority", "type", "more", ou null
    const containerRef = useRef(null);
    const createTaskMutation = useCreateTask();

    // Fermeture clique-extérieur
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            )
                setOpenMenu(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        createTaskMutation.mutate(
            {
                title,
                priority,
                taskType,
                difficulty: taskType === "DEEP_WORK" ? 3 : 1,
            },
            {
                onSuccess: () => {
                    setTitle("");
                    setPriority("NONE");
                    setTaskType("SHALLOW_WORK");
                    setOpenMenu(null);
                },
            },
        );
    };

    // Configurations visuelles
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
                    label: "Énergie",
                };
        }
    };

    const getTypeConfig = (type) => {
        switch (type) {
            case "DEEP_WORK":
                return {
                    icon: FocusIcon,
                    label: "Deep Focus",
                    color: "text-purple-500",
                };
            case "ADMINISTRATIVE":
                return {
                    icon: InboxIcon,
                    label: "Admin",
                    color: "text-slate-500",
                };
            default:
                return {
                    icon: ListIcon,
                    label: "Shallow Work",
                    color: "text-indigo-500",
                };
        }
    };

    const currentPriority = getPriorityConfig(priority);
    const TypeIcon = getTypeConfig(taskType).icon;

    return (
        <div className="mb-6 relative" ref={containerRef}>
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 pr-3 shadow-sm transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus-within:bg-zinc-950"
            >
                <div className="pl-3 text-slate-400">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </div>

                <input
                    type="text"
                    placeholder="Que veux-tu accomplir ? (Appuie sur Entrée pour forger)"
                    className="flex-1 bg-transparent p-2 text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-zinc-500 font-medium"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={createTaskMutation.isPending}
                    autoFocus
                />

                {/* Bouton de validation invisible (nécessaire pour que 'Entrée' fonctionne proprement sur tous les navigateurs) */}
                <button
                    type="submit"
                    className="hidden"
                    disabled={!title.trim() || createTaskMutation.isPending}
                >
                    Submit
                </button>

                {/* --- BARRE D'OUTILS --- */}
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-zinc-800">
                    {/* Raccourci Date (Visuel uniquement pour l'instant) */}
                    <button
                        type="button"
                        className="flex items-center gap-1 rounded p-2 text-sm text-indigo-500 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
                    >
                        <CalendarIcon className="h-5 w-5" />
                        <span className="hidden lg:block font-medium">
                            Aujourd'hui
                        </span>
                    </button>

                    {/* Pop-up Type de tâche */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenMenu(openMenu === "type" ? null : "type")
                            }
                            className="flex items-center gap-1 rounded p-2 text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
                            title="Type de tâche"
                        >
                            <TypeIcon className="h-5 w-5" />
                        </button>
                        {openMenu === "type" && (
                            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50 dark:border-zinc-700 dark:bg-zinc-800 animate-in fade-in slide-in-from-top-2">
                                <div className="flex flex-col p-1 text-sm font-medium">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTaskType("DEEP_WORK");
                                            setOpenMenu(null);
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-700"
                                    >
                                        <FocusIcon className="h-4 w-4 text-purple-500" />{" "}
                                        <span className="text-slate-700 dark:text-slate-200">
                                            Deep Focus
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTaskType("SHALLOW_WORK");
                                            setOpenMenu(null);
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-700"
                                    >
                                        <ListIcon className="h-4 w-4 text-indigo-500" />{" "}
                                        <span className="text-slate-700 dark:text-slate-200">
                                            Shallow Work
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTaskType("ADMINISTRATIVE");
                                            setOpenMenu(null);
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-700"
                                    >
                                        <InboxIcon className="h-4 w-4 text-slate-500" />{" "}
                                        <span className="text-slate-700 dark:text-slate-200">
                                            Admin
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pop-up Priorité (Éclairs) */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenMenu(
                                    openMenu === "priority" ? null : "priority",
                                )
                            }
                            className={`flex rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800 ${currentPriority.color}`}
                            title={currentPriority.label}
                        >
                            <LightningIcon className="h-5 w-5" />
                        </button>
                        {openMenu === "priority" && (
                            <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50 dark:border-zinc-700 dark:bg-zinc-800 animate-in fade-in slide-in-from-top-2">
                                <div className="flex flex-col p-1 text-sm font-medium">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPriority("HIGH");
                                            setOpenMenu(null);
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-700"
                                    >
                                        <LightningIcon className="h-4 w-4 text-red-500" />{" "}
                                        <span className="text-slate-700 dark:text-slate-200">
                                            Surcharge
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPriority("MEDIUM");
                                            setOpenMenu(null);
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-700"
                                    >
                                        <LightningIcon className="h-4 w-4 text-amber-500" />{" "}
                                        <span className="text-slate-700 dark:text-slate-200">
                                            Soutenu
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPriority("LOW");
                                            setOpenMenu(null);
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-700"
                                    >
                                        <LightningIcon className="h-4 w-4 text-blue-500" />{" "}
                                        <span className="text-slate-700 dark:text-slate-200">
                                            Calme
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPriority("NONE");
                                            setOpenMenu(null);
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-700 border-t border-slate-100 mt-1 dark:border-zinc-700"
                                    >
                                        <LightningIcon className="h-4 w-4 text-slate-400" />{" "}
                                        <span className="text-slate-500">
                                            Aucune
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Menu Overflow (Tags et autres) - Le Chevron de TickTick */}
                    <div className="relative border-l border-slate-200 pl-1 ml-1 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenMenu(openMenu === "more" ? null : "more")
                            }
                            className="flex rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                        >
                            <svg
                                className={`h-5 w-5 transition-transform ${openMenu === "more" ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {openMenu === "more" && (
                            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50 dark:border-zinc-700 dark:bg-zinc-800 animate-in fade-in slide-in-from-top-2">
                                <div className="flex flex-col p-1 text-sm font-medium">
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-700"
                                    >
                                        <TagIcon className="h-4 w-4 text-slate-400" />{" "}
                                        Étiquettes
                                    </button>
                                    {/* On pourra rajouter les sous-tâches, récurrence, etc. ici */}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {createTaskMutation.isError && (
                <div className="absolute top-full mt-1 px-2 text-xs font-medium text-red-500">
                    {createTaskMutation.error.message}
                </div>
            )}
        </div>
    );
}
