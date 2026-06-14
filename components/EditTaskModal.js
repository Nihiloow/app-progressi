"use client";

import { useState, useEffect } from "react";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { useTagList } from "@/hooks/useTagList";
import { OptionMenu } from "@/components/ui/OptionMenu";
import { TagPanel } from "@/components/ui/TagPanel";
import { MarkdownView } from "@/components/ui/MarkdownView";
import {
    PRIORITY_OPTIONS,
    TYPE_OPTIONS,
    getPriorityConfig,
    getTypeConfig,
    formatShortDate,
} from "@/components/ui/taskAppearance";
import { LightningIcon, CalendarIcon, TagIcon } from "@/components/ui/icons";

// Convertit une date ISO (ou null) en valeur "YYYY-MM-DD" pour <input type="date">,
// en composantes LOCALES : un simple .slice(0,10) sur l'ISO UTC décalerait d'un
// jour selon le fuseau.
const toDateInputValue = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export default function EditTaskModal({ task, isOpen, onClose }) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("NONE");
    const [taskType, setTaskType] = useState("NONE");
    const [dueDate, setDueDate] = useState("");
    const [description, setDescription] = useState("");
    const [tab, setTab] = useState("write");
    const [openMenu, setOpenMenu] = useState(null);
    const { tags, setTags, addTag, removeTag } = useTagList();

    const updateTask = useUpdateTask();

    // Préremplissage à l'ouverture. On dépend de task?.id (et non de l'objet
    // task) pour ne pas réinitialiser la saisie à chaque refetch de la liste,
    // qui recrée un objet neuf à id identique.
    useEffect(() => {
        if (!task) return;
        setTitle(task.title ?? "");
        setPriority(task.priority ?? "NONE");
        setTaskType(task.taskType ?? "NONE");
        setDueDate(toDateInputValue(task.dueDate));
        setDescription(task.description ?? "");
        setTags(task.tags?.map((t) => t.name) ?? []);
        setTab("write");
        setOpenMenu(null);
    }, [task?.id, isOpen]);

    // Échap pour fermer + gel du scroll de fond pendant l'ouverture.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !task) return null;

    const canSave = title.trim().length >= 3 && !updateTask.isPending;
    const currentPriority = getPriorityConfig(priority);
    const TypeIcon = getTypeConfig(taskType).icon;
    const toggleMenu = (m) => setOpenMenu(openMenu === m ? null : m);

    const handleSave = () => {
        if (!canSave) return;
        updateTask.mutate(
            {
                id: task.id,
                data: {
                    title: title.trim(),
                    priority,
                    taskType,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                    description: description.trim() || null,
                    tags,
                },
            },
            { onSuccess: onClose },
        );
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
                <div className="flex items-start gap-3 border-b border-slate-100 p-4 dark:border-zinc-800">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre de la quête"
                        autoFocus
                        className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-zinc-500"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-2 flex gap-1 text-sm">
                        <button
                            type="button"
                            onClick={() => setTab("write")}
                            className={`rounded-md px-3 py-1 font-medium transition-colors ${
                                tab === "write"
                                    ? "bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-slate-100"
                                    : "text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                            }`}
                        >
                            Écriture
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("preview")}
                            className={`rounded-md px-3 py-1 font-medium transition-colors ${
                                tab === "preview"
                                    ? "bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-slate-100"
                                    : "text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                            }`}
                        >
                            Aperçu
                        </button>
                    </div>

                    {tab === "write" ? (
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décris ta quête en Markdown…"
                            rows={8}
                            className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-200 dark:placeholder-zinc-500"
                        />
                    ) : (
                        <div className="min-h-[12rem] rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                            {description.trim() ? (
                                <MarkdownView source={description} />
                            ) : (
                                <p className="text-sm text-slate-400 dark:text-zinc-500">
                                    Rien à prévisualiser.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleMenu("priority")}
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 ${currentPriority.color} ${currentPriority.bg}`}
                            >
                                <LightningIcon className="h-4 w-4" />
                                {currentPriority.label}
                            </button>
                            <OptionMenu
                                isOpen={openMenu === "priority"}
                                onClose={() => setOpenMenu(null)}
                                onSelect={setPriority}
                                options={PRIORITY_OPTIONS}
                            />
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleMenu("type")}
                                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800"
                            >
                                <TypeIcon
                                    className={`h-4 w-4 ${getTypeConfig(taskType).color}`}
                                />
                                {getTypeConfig(taskType).label}
                            </button>
                            <OptionMenu
                                isOpen={openMenu === "type"}
                                onClose={() => setOpenMenu(null)}
                                onSelect={setTaskType}
                                options={TYPE_OPTIONS}
                            />
                        </div>

                        <div className="relative flex items-center">
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="absolute inset-0 cursor-pointer opacity-0"
                                aria-label="Date d'échéance"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                                    dueDate
                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800"
                                }`}
                            >
                                <CalendarIcon className="h-4 w-4" />
                                {dueDate ? formatShortDate(dueDate) : "Date"}
                            </button>
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleMenu("tags")}
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 ${
                                    tags.length > 0
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-slate-600 dark:text-slate-300"
                                }`}
                            >
                                <TagIcon className="h-4 w-4" />
                                {tags.length > 0
                                    ? `${tags.length} tag${tags.length > 1 ? "s" : ""}`
                                    : "Tags"}
                            </button>
                            <TagPanel
                                isOpen={openMenu === "tags"}
                                tags={tags}
                                onAdd={addTag}
                                onRemove={removeTag}
                                align="left"
                            />
                        </div>
                    </div>

                    {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {tags.map((name) => (
                                <span
                                    key={name}
                                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-zinc-800 dark:text-slate-300"
                                >
                                    {name}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(name)}
                                        aria-label={`Retirer ${name}`}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
                    {updateTask.isError && (
                        <p className="mb-2 text-sm text-red-500">
                            {updateTask.error.message}
                        </p>
                    )}
                    {title.trim().length > 0 && title.trim().length < 3 && (
                        <p className="mb-2 text-sm text-amber-500">
                            Le titre doit faire au moins 3 caractères.
                        </p>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                                canSave
                                    ? "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                    : "cursor-not-allowed bg-slate-300 dark:bg-zinc-700"
                            }`}
                        >
                            {updateTask.isPending
                                ? "Enregistrement…"
                                : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
