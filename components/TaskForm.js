"use client";

import { useState, useRef, useEffect } from "react";
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
import { TagPanel } from "./ui/TagPanel";

export default function TaskForm() {
    const [openMenu, setOpenMenu] = useState(null);
    const containerRef = useRef(null);

    const {
        title,
        setTitle,
        priority,
        setPriority,
        taskType,
        setTaskType,
        dueDate,
        setDueDate,
        tags,
        addTag,
        removeTag,
        isPending,
        handleSubmit,
    } = useTaskFormLogic(() => setOpenMenu(null));

    // pointerdown (et non mousedown) : couvre souris ET tactile sans
    // déclencher l'avertissement pointerCapture dans la console
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("pointerdown", handleClickOutside);
        return () =>
            document.removeEventListener("pointerdown", handleClickOutside);
    }, []);

    const currentPriority = getPriorityConfig(priority);
    const TypeIcon = getTypeConfig(taskType).icon;

    const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);

    return (
        <div className="relative mb-6" ref={containerRef}>
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
                    placeholder="Que veux-tu accomplir ?"
                    className="min-w-0 flex-1 bg-transparent p-2 font-medium text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-zinc-500"
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
                    Créer
                </button>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-zinc-800">
                    {/* Date : input natif invisible par-dessus le bouton
                        (solution temporaire avant le calendrier sur-mesure) */}
                    <div className="relative flex items-center">
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            aria-label="Date d'échéance"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            className={`flex items-center gap-1 rounded p-2 text-sm font-medium transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800 ${
                                dueDate
                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            <CalendarIcon className="h-5 w-5" />
                            <span className="hidden font-semibold xl:block">
                                {dueDate ? formatShortDate(dueDate) : "Date"}
                            </span>
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => toggleMenu("type")}
                            title="Type de tâche"
                            className="flex items-center gap-1 rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
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
                            align="right"
                        />
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => toggleMenu("priority")}
                            title="Priorité (détermine l'XP)"
                            className={`flex h-9 w-9 items-center justify-center rounded transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800 ${currentPriority.color} ${currentPriority.bg}`}
                        >
                            <LightningIcon className="h-5 w-5" />
                        </button>
                        <OptionMenu
                            isOpen={openMenu === "priority"}
                            onClose={() => setOpenMenu(null)}
                            onSelect={setPriority}
                            options={PRIORITY_OPTIONS}
                            align="right"
                        />
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => toggleMenu("tags")}
                            title="Étiquettes"
                            className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800 ${
                                tags.length > 0
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            <TagIcon className="h-5 w-5" />
                        </button>
                        <TagPanel
                            isOpen={openMenu === "tags"}
                            tags={tags}
                            onAdd={addTag}
                            onRemove={removeTag}
                            align="right"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
