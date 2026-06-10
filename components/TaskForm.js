"use client";

import { useState, useRef, useEffect } from "react";
import { useTaskFormLogic } from "@/hooks/useTaskFormLogic";
import {
    LightningIcon,
    FocusIcon,
    ListIcon,
    InboxIcon,
    CalendarIcon,
    TagIcon,
} from "@/components/ui/icons";

export default function TaskForm() {
    const [openMenu, setOpenMenu] = useState(null); // "priority", "type", "more"
    const containerRef = useRef(null);

    // On utilise notre super Hook !
    const {
        title,
        setTitle,
        priority,
        setPriority,
        taskType,
        setTaskType,
        isPending,
        isError,
        error,
        handleSubmit,
    } = useTaskFormLogic(() => setOpenMenu(null));

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

    // Helpers UI
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
                return { icon: FocusIcon, color: "text-purple-500" };
            case "ADMINISTRATIVE":
                return { icon: InboxIcon, color: "text-slate-500" };
            default:
                return { icon: ListIcon, color: "text-indigo-500" };
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
                    disabled={isPending}
                    autoFocus
                />
                <button
                    type="submit"
                    className="hidden"
                    disabled={!title.trim() || isPending}
                >
                    Submit
                </button>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-zinc-800">
                    {/* Pop-up Type de tâche */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenMenu(openMenu === "type" ? null : "type")
                            }
                            className="flex items-center gap-1 rounded p-2 text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
                        >
                            <TypeIcon
                                className={`h-5 w-5 ${getTypeConfig(taskType).color}`}
                            />
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

                    {/* Pop-up Priorité */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenMenu(
                                    openMenu === "priority" ? null : "priority",
                                )
                            }
                            className={`flex rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800 ${currentPriority.color}`}
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

                    {/* Overflow Tags */}
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
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
            {isError && (
                <div className="absolute top-full mt-1 px-2 text-xs font-medium text-red-500">
                    {error.message}
                </div>
            )}
        </div>
    );
}
