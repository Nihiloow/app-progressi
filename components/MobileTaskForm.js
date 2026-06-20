"use client";

import { useState, useEffect, useRef } from "react";
import { useTaskFormLogic } from "@/hooks/useTaskFormLogic";
import { OptionMenu } from "@/components/ui/OptionMenu";
import { DatePicker } from "@/components/ui/DatePicker";
import {
    PRIORITY_OPTIONS,
    TYPE_OPTIONS,
    getPriorityConfig,
    getTypeConfig,
} from "@/components/ui/taskAppearance";
import {
    LightningIcon,
    TagIcon,
    CheckIcon,
    SpinnerIcon,
} from "@/components/ui/icons";
import { TagPanel } from "./ui/TagPanel";

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
        tags,
        addTag,
        removeTag,
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
                            <div className="relative ml-1 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => toggleMenu("tags")}
                                    aria-label="Étiquettes"
                                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 ${
                                        tags.length > 0
                                            ? "text-indigo-600 dark:text-indigo-400"
                                            : ""
                                    }`}
                                >
                                    <TagIcon className="h-5 w-5" />
                                </button>
                                <TagPanel
                                    isOpen={openMenu === "tags"}
                                    tags={tags}
                                    onAdd={addTag}
                                    onRemove={removeTag}
                                    onClose={() => setOpenMenu(null)}
                                    align="left"
                                    direction="up"
                                />
                            </div>

                            <DatePicker
                                value={dueDate}
                                onChange={setDueDate}
                                align="left"
                                direction="up"
                            />

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
                                <SpinnerIcon className="h-4 w-4 text-white" />
                            ) : (
                                <CheckIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
