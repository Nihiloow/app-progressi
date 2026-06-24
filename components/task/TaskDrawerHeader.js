"use client";

import { useState } from "react";
import {
    getPriorityConfig,
    PRIORITY_OPTIONS,
} from "@/components/ui/taskAppearance";
import { LightningIcon, BanIcon, TrashIcon } from "@/components/ui/icons";
import { DrawerPopover } from "@/components/task/DrawerPopover";

// En-tête compact du tiroir. Les popovers (priorité, actions) s'ouvrent
// maintenant EN FLUX directement sous cet en-tête — c'est tout le tiroir
// parent qui grandit pour les accueillir (cf. TaskActionDrawer) plutôt
// qu'un calque séparé par-dessus l'écran. Toggle au clic : ré-appuyer sur
// le même bouton referme le popover (pas de voile externe à cliquer).
export function TaskDrawerHeader({
    statusLabel,
    priority,
    onPriorityChange,
    isAbandoned,
    onToggleWontDo,
    onDelete,
}) {
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isActionsOpen, setIsActionsOpen] = useState(false);

    const priorityConfig = getPriorityConfig(priority);

    const togglePriority = () => {
        setIsPriorityOpen((v) => !v);
        setIsActionsOpen(false);
    };

    const toggleActions = () => {
        setIsActionsOpen((v) => !v);
        setIsPriorityOpen(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    {statusLabel}
                </span>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={togglePriority}
                        aria-label="Changer la priorité"
                        aria-expanded={isPriorityOpen}
                        className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                            isPriorityOpen
                                ? "bg-slate-100 dark:bg-zinc-800"
                                : "hover:bg-slate-100 dark:hover:bg-zinc-800"
                        } ${priorityConfig.color}`}
                    >
                        <LightningIcon className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={toggleActions}
                        aria-label="Plus d'options"
                        aria-expanded={isActionsOpen}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors dark:text-zinc-400 ${
                            isActionsOpen
                                ? "bg-slate-100 dark:bg-zinc-800"
                                : "hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="6" r="1.6" />
                            <circle cx="12" cy="12" r="1.6" />
                            <circle cx="12" cy="18" r="1.6" />
                        </svg>
                    </button>
                </div>
            </div>

            <DrawerPopover isOpen={isPriorityOpen}>
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Priorité
                </p>
                <div className="flex flex-col py-1">
                    {PRIORITY_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onPriorityChange(option.value);
                                setIsPriorityOpen(false);
                            }}
                            className="flex items-center gap-3 rounded-lg px-3 py-4 text-left text-base font-medium hover:bg-white dark:hover:bg-zinc-800"
                        >
                            <LightningIcon
                                className={`h-5 w-5 ${option.iconColor}`}
                            />
                            <span className="text-slate-700 dark:text-slate-200">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </DrawerPopover>

            <DrawerPopover isOpen={isActionsOpen}>
                <div className="flex flex-col py-1">
                    <button
                        type="button"
                        onClick={() => {
                            onToggleWontDo();
                            setIsActionsOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-4 text-left text-base hover:bg-white dark:hover:bg-zinc-800"
                    >
                        <BanIcon className="h-5 w-5 text-slate-500" />
                        <span
                            className={
                                isAbandoned
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-700 dark:text-slate-200"
                            }
                        >
                            {isAbandoned ? "Réactiver la quête" : "Ne fera pas"}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onDelete();
                            setIsActionsOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-4 text-left text-base text-red-500 hover:bg-white dark:text-red-400 dark:hover:bg-zinc-800"
                    >
                        <TrashIcon className="h-5 w-5" />
                        Supprimer la quête
                    </button>
                </div>
            </DrawerPopover>
        </div>
    );
}
