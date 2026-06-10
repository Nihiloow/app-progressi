"use client";

import { useState, useEffect, useRef } from "react";
import { useTaskFormLogic } from "@/hooks/useTaskFormLogic";
import {
    LightningIcon,
    FocusIcon,
    ListIcon,
    InboxIcon,
    TagIcon, // Ajout du TagIcon
} from "@/components/ui/icons";

export default function MobileTaskForm({ isOpen, onClose }) {
    const [openMenu, setOpenMenu] = useState(null);
    const inputRef = useRef(null);

    const {
        title,
        setTitle,
        priority,
        setPriority,
        taskType,
        setTaskType,
        dueDate,
        setDueDate,
        isPending,
        handleSubmit,
    } = useTaskFormLogic(() => {
        setOpenMenu(null);
        onClose();
    });

    useEffect(() => {
        if (isOpen && inputRef.current)
            setTimeout(() => inputRef.current.focus(), 100);
        if (!isOpen) setOpenMenu(null);
    }, [isOpen]);

    const getPriorityConfig = (level) => {
        switch (level) {
            case "HIGH":
                return {
                    color: "text-red-500",
                    bg: "bg-red-50 dark:bg-red-500/10",
                };
            case "MEDIUM":
                return {
                    color: "text-amber-500",
                    bg: "bg-amber-50 dark:bg-amber-500/10",
                };
            case "LOW":
                return {
                    color: "text-blue-500",
                    bg: "bg-blue-50 dark:bg-blue-500/10",
                };
            default:
                return {
                    color: "text-slate-400 dark:text-zinc-400",
                    bg: "transparent",
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
                        disabled={isPending}
                    />

                    <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                        <div className="flex items-center gap-3 text-xl">
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

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenMenu(
                                            openMenu === "type" ? null : "type",
                                        )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                                >
                                    <TypeIcon
                                        className={`h-5 w-5 ${getTypeConfig(taskType).color}`}
                                    />
                                </button>
                                {openMenu === "type" && (
                                    <>
                                        {/* CORRECTIF CASE NOIRE : Ajout de bg-transparent */}
                                        <div
                                            className="fixed inset-0 z-[80] bg-transparent"
                                            onClick={() => setOpenMenu(null)}
                                        />
                                        <div className="absolute bottom-full left-0 mb-2 w-48 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 z-[90] dark:bg-zinc-800 dark:ring-zinc-700 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex flex-col py-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTaskType(
                                                            "DEEP_WORK",
                                                        );
                                                        setOpenMenu(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <FocusIcon className="h-4 w-4 text-purple-500" />{" "}
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
                                                        setOpenMenu(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <ListIcon className="h-4 w-4 text-indigo-500" />{" "}
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
                                                        setOpenMenu(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <InboxIcon className="h-4 w-4 text-slate-500" />{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Admin
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenMenu(
                                            openMenu === "priority"
                                                ? null
                                                : "priority",
                                        )
                                    }
                                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${currentPriority.color} ${currentPriority.bg} hover:bg-slate-100 dark:hover:bg-zinc-800`}
                                >
                                    <LightningIcon className="h-5 w-5" />
                                </button>
                                {openMenu === "priority" && (
                                    <>
                                        {/* CORRECTIF CASE NOIRE : Ajout de bg-transparent */}
                                        <div
                                            className="fixed inset-0 z-[80] bg-transparent"
                                            onClick={() => setOpenMenu(null)}
                                        />
                                        <div className="absolute bottom-full left-0 mb-2 w-40 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 z-[90] dark:bg-zinc-800 dark:ring-zinc-700 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex flex-col py-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority("HIGH");
                                                        setOpenMenu(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <LightningIcon className="h-4 w-4 text-red-500" />{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Haute
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority("MEDIUM");
                                                        setOpenMenu(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <LightningIcon className="h-4 w-4 text-amber-500" />{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Moyenne
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority("LOW");
                                                        setOpenMenu(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                                >
                                                    <LightningIcon className="h-4 w-4 text-blue-500" />{" "}
                                                    <span className="text-slate-700 dark:text-slate-200">
                                                        Basse
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority("NONE");
                                                        setOpenMenu(null);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50 border-t border-slate-100 dark:border-zinc-700/50 mt-1"
                                                >
                                                    <LightningIcon className="h-4 w-4 text-slate-400" />{" "}
                                                    <span className="text-slate-500">
                                                        Aucune
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* LE BOUTON PLUS AVEC LES TAGS SUR MOBILE */}
                            <div className="relative border-l border-slate-200 pl-1 ml-1 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenMenu(
                                            openMenu === "more" ? null : "more",
                                        )
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
                                    <>
                                        <div
                                            className="fixed inset-0 z-[80] bg-transparent"
                                            onClick={() => setOpenMenu(null)}
                                        />
                                        <div className="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 z-[90] dark:bg-zinc-800 dark:ring-zinc-700 animate-in fade-in slide-in-from-bottom-2">
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
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!title.trim() || isPending}
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${isPending || !title.trim() ? "bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-600" : "bg-indigo-500 text-white active:scale-95 dark:bg-indigo-600"}`}
                        >
                            {isPending ? (
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
