// Destination : components/MobileTaskForm.js (REMPLACE l'existant)

"use client";

import { useState, useEffect, useRef } from "react";
import { useTaskFormLogic } from "@/hooks/useTaskFormLogic";
import { OptionMenu } from "@/components/ui/OptionMenu";
import {
    PRIORITY_OPTIONS,
    TYPE_OPTIONS,
    getPriorityConfig,
    getTypeConfig,
    formatShortDate,
} from "@/components/ui/taskAppearance";
import { LightningIcon, CalendarIcon, TagIcon } from "@/components/ui/icons";

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

    // Focus du champ à l'ouverture du panneau (délai : laisser finir
    // l'animation de translation avant d'invoquer le clavier mobile)
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
        if (!isOpen) setOpenMenu(null);
    }, [isOpen]);

    const currentPriority = getPriorityConfig(priority);
    const TypeIcon = getTypeConfig(taskType).icon;

    const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);

    return (
        <>
            {/* Voile d'arrière-plan */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden ${
                    isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            />

            {/* Panneau bas */}
            <div
                className={`pb-safe fixed bottom-0 left-0 z-[70] w-full transform rounded-t-2xl bg-white p-4 shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-zinc-900 ${
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
                        disabled={isPending}
                    />

                    <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                        <div className="flex items-center gap-3">
                            {/* Date : input natif invisible (temporaire) */}
                            <div className="relative flex items-center">
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    aria-label="Date d'échéance"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className={`flex items-center gap-1 rounded px-2 py-1 text-sm font-medium transition-colors ${
                                        dueDate
                                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                            : "text-indigo-500 dark:text-indigo-400"
                                    }`}
                                >
                                    <CalendarIcon className="h-5 w-5" />
                                    {dueDate
                                        ? formatShortDate(dueDate)
                                        : "Date"}
                                </button>
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => toggleMenu("type")}
                                    aria-label="Type de tâche"
                                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                                >
                                    <TypeIcon
                                        className={`h-5 w-5 ${getTypeConfig(taskType).color}`}
                                    />
                                </button>
                                <OptionMenu
                                    isOpen={openMenu === "type"}
                                    onClose={() => setOpenMenu(null)}
                                    onSelect={setTaskType}
                                    options={TYPE_OPTIONS}
                                    direction="up"
                                    withOverlay
                                />
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => toggleMenu("priority")}
                                    aria-label="Priorité"
                                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 ${currentPriority.color} ${currentPriority.bg}`}
                                >
                                    <LightningIcon className="h-5 w-5" />
                                </button>
                                <OptionMenu
                                    isOpen={openMenu === "priority"}
                                    onClose={() => setOpenMenu(null)}
                                    onSelect={setPriority}
                                    options={PRIORITY_OPTIONS}
                                    direction="up"
                                    withOverlay
                                />
                            </div>

                            {/* Étiquettes : prochain chantier */}
                            <button
                                type="button"
                                disabled
                                aria-label="Étiquettes (bientôt disponible)"
                                className="ml-1 cursor-not-allowed border-l border-slate-200 pl-3 text-slate-300 dark:border-zinc-800 dark:text-zinc-700"
                            >
                                <TagIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={!title.trim() || isPending}
                            aria-label="Créer la quête"
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                                isPending || !title.trim()
                                    ? "bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-600"
                                    : "bg-indigo-500 text-white active:scale-95 dark:bg-indigo-600"
                            }`}
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
