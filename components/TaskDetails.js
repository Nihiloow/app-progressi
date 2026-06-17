"use client";

import { useState, useEffect, useRef } from "react";
import { XP_REWARDS } from "@/core/config/gamification";
import {
    getPriorityConfig,
    getTypeConfig,
    STATUS_LABELS,
} from "@/components/ui/taskAppearance";
import { ListIcon } from "@/components/ui/icons";
import { resolveTagColor } from "@/core/config/tagColors";
import { MarkdownView } from "@/components/ui/MarkdownView";
import { useUpdateTask } from "@/hooks/useUpdateTask";

// Titre éditable inline : <span> en lecture, <input> au clic.
// Sauvegarde onBlur si la valeur a changé et est valide (≥ 3 caractères).
// Abandon sur Échap : restaure la valeur d'origine.
function EditableTitle({ task, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.title);
    const inputRef = useRef(null);

    // Synchronise si la tâche sélectionnée change (selectedTaskId dans le parent).
    useEffect(() => {
        setValue(task.title);
        setIsEditing(false);
    }, [task.id, task.title]);

    useEffect(() => {
        if (isEditing) inputRef.current?.select();
    }, [isEditing]);

    const handleBlur = () => {
        const trimmed = value.trim();
        if (trimmed.length >= 3 && trimmed !== task.title) {
            onSave({ title: trimmed });
        } else {
            // Valeur invalide ou inchangée : on restaure
            setValue(task.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") inputRef.current?.blur();
        if (e.key === "Escape") {
            setValue(task.title);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`w-full bg-transparent text-xl font-bold leading-tight focus:outline-none ${
                    task.status === "TODO"
                        ? "text-slate-800 dark:text-slate-100"
                        : "text-slate-400 line-through"
                }`}
            />
        );
    }

    return (
        <h2
            onClick={() => setIsEditing(true)}
            title="Cliquer pour modifier le titre"
            className={`cursor-text text-xl font-bold leading-tight ${
                task.status === "TODO"
                    ? "text-slate-800 dark:text-slate-100"
                    : "text-slate-400 line-through"
            }`}
        >
            {task.title}
        </h2>
    );
}

// Description éditable inline : MarkdownView en lecture, textarea au clic.
// Sauvegarde onBlur si la valeur a changé.
// Une description vidée repasse à null (pas de chaîne vide en base).
function EditableDescription({ task, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description ?? "");
    const textareaRef = useRef(null);

    useEffect(() => {
        setValue(task.description ?? "");
        setIsEditing(false);
    }, [task.id, task.description]);

    useEffect(() => {
        if (isEditing) textareaRef.current?.focus();
    }, [isEditing]);

    const handleBlur = () => {
        const trimmed = value.trim();
        const original = task.description ?? "";
        if (trimmed !== original) {
            // Chaîne vide → null pour ne pas stocker "" en base
            onSave({ description: trimmed || null });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        // Échap annule sans sauvegarder
        if (e.key === "Escape") {
            setValue(task.description ?? "");
            setIsEditing(false);
        }
        // Entrée normale autorisée (saut de ligne Markdown)
    };

    if (isEditing) {
        return (
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Décris ta quête en Markdown…"
                rows={8}
                className="w-full resize-y rounded-lg border border-indigo-300 bg-slate-50 p-3 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-indigo-500/40 dark:bg-zinc-950 dark:text-slate-200 dark:placeholder-zinc-500"
            />
        );
    }

    if (task.description) {
        return (
            <div
                onClick={() => setIsEditing(true)}
                title="Cliquer pour modifier la description"
                className="min-h-[120px] cursor-text rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900"
            >
                <MarkdownView source={task.description} />
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="flex min-h-[185px] cursor-text items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-500 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5"
        >
            Clique pour ajouter une description...
        </div>
    );
}

export default function TaskDetails({ task }) {
    const updateTask = useUpdateTask();

    // État vide : aucune quête sélectionnée
    if (!task) {
        return (
            <aside className="hidden w-80 border-l border-slate-200 bg-slate-50 p-6 lg:block dark:border-zinc-800 dark:bg-[#18181b]">
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 dark:text-zinc-500">
                    <ListIcon className="mb-4 h-10 w-10 opacity-50" />
                    <p className="text-sm">
                        Clique sur une quête pour voir ses détails ou la
                        modifier.
                    </p>
                </div>
            </aside>
        );
    }

    const priorityConfig = getPriorityConfig(task.priority);
    const typeConfig = getTypeConfig(task.taskType);
    const TypeIcon = typeConfig.icon;
    // Affichage informatif uniquement : le serveur reste seul juge du
    // montant réellement accordé (quotas journaliers)
    const xpReward = XP_REWARDS[task.priority] ?? 0;

    // Les deux champs inline délèguent ici — un seul PATCH par champ modifié.
    const handleSave = (patch) => {
        updateTask.mutate({ id: task.id, data: patch });
    };

    return (
        <aside className="hidden w-80 flex-col border-l border-slate-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-950">
            <header className="border-b border-slate-100 p-6 dark:border-zinc-800/50">
                <div className="mb-2 flex items-center gap-2">
                    <span
                        className={`text-xs font-bold uppercase tracking-wider ${priorityConfig.color}`}
                    >
                        {priorityConfig.label}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                        •
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                        {xpReward} XP
                    </span>
                    {task.taskType !== "NONE" && (
                        <>
                            <span className="text-xs text-slate-400 dark:text-zinc-500">
                                •
                            </span>
                            <TypeIcon
                                className={`h-4 w-4 ${typeConfig.color}`}
                            />
                        </>
                    )}
                </div>

                <EditableTitle task={task} onSave={handleSave} />
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                {task.tags?.length > 0 && (
                    <div className="mb-6">
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Étiquettes
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {task.tags.map((tag) => {
                                const color = resolveTagColor(tag);
                                return (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1"
                                        style={{
                                            backgroundColor: `${color}1a`,
                                            color,
                                            "--tw-ring-color": `${color}33`,
                                        }}
                                    >
                                        <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        {tag.name}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                <EditableDescription task={task} onSave={handleSave} />
            </div>

            <footer className="border-t border-slate-100 p-6 text-center text-xs text-slate-400 dark:border-zinc-800/50 dark:text-zinc-500">
                Statut : {STATUS_LABELS[task.status] ?? task.status}
            </footer>
        </aside>
    );
}
