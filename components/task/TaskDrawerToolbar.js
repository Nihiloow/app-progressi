"use client";

import { useState } from "react";
import { TagIcon } from "@/components/ui/icons";
import { getTypeConfig, TYPE_OPTIONS } from "@/components/ui/taskAppearance";
import { DrawerPopover } from "@/components/task/DrawerPopover";
import { TaskDrawerTagsField } from "@/components/task/TaskDrawerTagsField";

// Barre d'icônes basse. Popovers (Tags, Type) en flux sous la barre,
// même logique de toggle que TaskDrawerHeader.
export function TaskDrawerToolbar({
    tags,
    onAddTag,
    onRemoveTag,
    taskType,
    onTypeChange,
}) {
    const [isTagsOpen, setIsTagsOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);

    const typeConfig = getTypeConfig(taskType);
    const TypeIcon = typeConfig.icon;

    const toggleTags = () => {
        setIsTagsOpen((v) => !v);
        setIsTypeOpen(false);
    };

    const toggleType = () => {
        setIsTypeOpen((v) => !v);
        setIsTagsOpen(false);
    };

    return (
        <div className="border-t border-slate-100 pt-3 dark:border-zinc-800">
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={toggleTags}
                    aria-label="Étiquettes"
                    aria-expanded={isTagsOpen}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                        isTagsOpen
                            ? "bg-slate-100 dark:bg-zinc-800"
                            : "hover:bg-slate-100 dark:hover:bg-zinc-800"
                    } ${
                        tags.length > 0
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-500 dark:text-zinc-400"
                    }`}
                >
                    <TagIcon className="h-5 w-5" />
                </button>

                <button
                    type="button"
                    onClick={toggleType}
                    aria-label="Type de tâche"
                    aria-expanded={isTypeOpen}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                        isTypeOpen
                            ? "bg-slate-100 dark:bg-zinc-800"
                            : "hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                >
                    <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                </button>

                {tags.length > 0 && (
                    <span className="ml-1 truncate text-xs text-slate-400 dark:text-zinc-500">
                        {tags.join(", ")}
                    </span>
                )}
            </div>

            <DrawerPopover isOpen={isTagsOpen}>
                <TaskDrawerTagsField
                    tags={tags}
                    onAdd={onAddTag}
                    onRemove={onRemoveTag}
                />
            </DrawerPopover>

            <DrawerPopover isOpen={isTypeOpen}>
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Type
                </p>
                <div className="flex flex-col py-1">
                    {TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onTypeChange(option.value);
                                    setIsTypeOpen(false);
                                }}
                                className="flex items-center gap-3 rounded-lg px-3 py-4 text-left text-base font-medium hover:bg-white dark:hover:bg-zinc-800"
                            >
                                <Icon
                                    className={`h-5 w-5 ${option.iconColor}`}
                                />
                                <span className="text-slate-700 dark:text-slate-200">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </DrawerPopover>
        </div>
    );
}
