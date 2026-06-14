"use client";

import { useState } from "react";
import { useUpdateTag } from "@/hooks/useUpdateTag";
import { TAG_COLORS, resolveTagColor } from "@/core/config/tagColors";

// Édition d'un tag : renommer + recolorer via palette.
// Pré-rempli avec les valeurs actuelles ; la couleur de départ vient de
// resolveTagColor pour qu'un tag null montre quand même sa pastille active.
export function TagEditor({ tag, onDone }) {
    const [name, setName] = useState(tag.name);
    const [color, setColor] = useState(resolveTagColor(tag));
    const updateTag = useUpdateTag();

    const handleSave = () => {
        const clean = name.trim();
        if (!clean || updateTag.isPending) return;

        updateTag.mutate(
            { id: tag.id, data: { name: clean, color } },
            { onSuccess: () => onDone() },
        );
    };

    return (
        <div className="flex flex-col gap-3 p-3">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
                className="rounded-md border border-slate-200 bg-transparent px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:text-slate-200"
            />

            <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={`Couleur ${c}`}
                        style={{ backgroundColor: c }}
                        className={`h-6 w-6 rounded-full transition-transform ${
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
                    className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!name.trim() || updateTag.isPending}
                    className="rounded-md bg-indigo-500 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 dark:bg-indigo-600"
                >
                    {updateTag.isPending ? "..." : "Enregistrer"}
                </button>
            </div>
        </div>
    );
}
