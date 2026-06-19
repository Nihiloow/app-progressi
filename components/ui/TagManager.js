"use client";

import { useState } from "react";
import { useTags } from "@/hooks/useTags";
import { useUpdateTag } from "@/hooks/useUpdateTag";
import { useDeleteTag } from "@/hooks/useDeleteTag";
import { TAG_COLORS, resolveTagColor } from "@/core/config/tagColors";
import { CloseIcon, EditIcon, TrashIcon } from "@/components/ui/icons";

// Gestionnaire de tags : liste verticale, crayon (édition inline) +
// poubelle (suppression confirmée) par ligne. Pop-up parallèle au TagPanel,
// ouvert par l'engrenage. Aligné sur le style OptionMenu.
export function TagManager({
    isOpen,
    onClose,
    align = "right",
    direction = "down",
}) {
    const { data: tags = [] } = useTags();
    const [editingId, setEditingId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);

    if (!isOpen) return null;

    const alignment = align === "right" ? "right-0" : "left-0";
    const position = direction === "up" ? "bottom-full mb-2" : "top-full mt-2";

    return (
        <div
            className={`absolute ${position} ${alignment} z-[95] w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 animate-in fade-in dark:bg-zinc-800 dark:ring-zinc-700`}
        >
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-zinc-700">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Gérer les tags
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700"
                >
                    <CloseIcon className="h-4 w-4" />
                </button>
            </div>

            <div className="max-h-64 overflow-auto py-1">
                {tags.length === 0 && (
                    <p className="px-3 py-4 text-center text-xs text-slate-400 dark:text-zinc-500">
                        Aucun tag à gérer.
                    </p>
                )}

                {tags.map((tag) =>
                    editingId === tag.id ? (
                        <TagRowEditor
                            key={tag.id}
                            tag={tag}
                            onDone={() => setEditingId(null)}
                        />
                    ) : confirmingId === tag.id ? (
                        <TagRowConfirm
                            key={tag.id}
                            tag={tag}
                            onCancel={() => setConfirmingId(null)}
                        />
                    ) : (
                        <TagRow
                            key={tag.id}
                            tag={tag}
                            onEdit={() => setEditingId(tag.id)}
                            onDelete={() => setConfirmingId(tag.id)}
                        />
                    ),
                )}
            </div>
        </div>
    );
}

// Ligne par défaut : pastille + nom + crayon + poubelle.
function TagRow({ tag, onEdit, onDelete }) {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-700/50">
            <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: resolveTagColor(tag) }}
            />
            <span className="flex-1 truncate text-sm text-slate-700 dark:text-slate-200">
                {tag.name}
            </span>
            <button
                type="button"
                onClick={onEdit}
                aria-label={`Modifier ${tag.name}`}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-zinc-600"
            >
                <EditIcon className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={onDelete}
                aria-label={`Supprimer ${tag.name}`}
                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
                <TrashIcon className="h-4 w-4" />
            </button>
        </div>
    );
}

// Édition inline : nom + palette de pastilles.
function TagRowEditor({ tag, onDone }) {
    const [name, setName] = useState(tag.name);
    const [color, setColor] = useState(resolveTagColor(tag));
    const updateTag = useUpdateTag();

    const save = () => {
        const clean = name.trim();
        if (!clean || updateTag.isPending) return;
        updateTag.mutate(
            { id: tag.id, data: { name: clean, color } },
            { onSuccess: onDone },
        );
    };

    return (
        <div className="flex flex-col gap-2 bg-slate-50 px-3 py-2 dark:bg-zinc-900/50">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                autoFocus
                className="w-full rounded-md bg-white px-2 py-1 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-indigo-500 focus:outline-none dark:bg-zinc-800 dark:text-slate-200 dark:ring-zinc-700"
            />
            <div className="flex flex-wrap gap-1.5">
                {TAG_COLORS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={`Couleur ${c}`}
                        style={{ backgroundColor: c }}
                        className={`h-5 w-5 rounded-full transition-transform ${
                            color === c
                                ? "scale-110 ring-2 ring-slate-400 ring-offset-1 dark:ring-offset-zinc-900"
                                : "hover:scale-105"
                        }`}
                    />
                ))}
            </div>
            {updateTag.isError && (
                <p className="text-xs text-red-500">
                    {updateTag.error.message}
                </p>
            )}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onDone}
                    className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-zinc-700"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={save}
                    disabled={!name.trim() || updateTag.isPending}
                    className="rounded bg-indigo-500 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 dark:bg-indigo-600"
                >
                    {updateTag.isPending ? "..." : "Enregistrer"}
                </button>
            </div>
        </div>
    );
}

// Confirmation de suppression inline.
function TagRowConfirm({ tag, onCancel }) {
    const deleteTag = useDeleteTag();

    return (
        <div className="flex flex-col gap-2 bg-red-50 px-3 py-2 dark:bg-red-500/10">
            <p className="text-xs text-slate-600 dark:text-slate-300">
                Supprimer « {tag.name} » ? Il sera retiré de toutes ses tâches.
            </p>
            {deleteTag.isError && (
                <p className="text-xs text-red-500">
                    {deleteTag.error.message}
                </p>
            )}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-zinc-700"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={() =>
                        deleteTag.mutate(tag.id, { onSuccess: onCancel })
                    }
                    disabled={deleteTag.isPending}
                    className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                    {deleteTag.isPending ? "..." : "Supprimer"}
                </button>
            </div>
        </div>
    );
}
