"use client";

import { useState } from "react";
import { useTags } from "@/hooks/useTags";
import { useCreateTag } from "@/hooks/useCreateTag";
import { resolveTagColor } from "@/core/config/tagColors";
import { TagIcon } from "@/components/ui/icons";

// Version INLINE du sélecteur de tags pour le tiroir mobile.
//
// Le bloc "label + grille de chips" est passé d'un `mb-3` sur le label à
// un `gap-3` sur son conteneur flex parent : le mb (margin-bottom) ne
// produisait visuellement AUCUN espace, le label et les chips se
// touchaient malgré la marge déclarée. Cause probable : le wrapper
// flex-1 overflow-y-auto autour de la grille de chips interagissait mal
// avec la marge du label, dans un contexte de flux qui n'était pas un
// flex column direct. Un `gap` sur un conteneur flex-col s'applique
// toujours de façon fiable entre enfants directs, sans dépendre d'un
// calcul de collapse de marges qui peut se faire absorber par un wrapper
// intermédiaire — c'est la méthode robuste, pas un correctif au cas par
// cas d'une valeur de marge.
export function TaskDrawerTagsField({ tags, onAdd, onRemove }) {
    const [input, setInput] = useState("");
    const { data: existingTags = [] } = useTags();
    const createTag = useCreateTag();

    const query = input.trim();
    const filtered = query
        ? existingTags.filter((t) =>
              t.name.toLowerCase().includes(query.toLowerCase()),
          )
        : existingTags;

    const handleKeyDown = (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (!query || createTag.isPending) return;

        const exists = existingTags.some(
            (t) => t.name.toLowerCase() === query.toLowerCase(),
        );
        if (exists) {
            setInput("");
            return;
        }

        createTag.mutate({ name: query }, { onSuccess: () => setInput("") });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <TagIcon className="h-3.5 w-3.5" />
                    Étiquettes
                </h3>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Créer ou rechercher…"
                    autoFocus
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100 dark:placeholder-zinc-500"
                />

                {createTag.isError && (
                    <p className="text-xs text-red-500">
                        {createTag.error.message}
                    </p>
                )}
            </div>

            {/* border-t crée la rupture visuelle, pt + gap (sur le conteneur
                englobant, pas un mb local) garantissent l'espace réel sous
                le label "Tags disponibles" avant la première chip. */}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-zinc-800">
                <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                    {query ? "Résultats" : "Tags disponibles"}
                </p>

                {filtered.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto p-1">
                        <div className="flex flex-wrap gap-2.5">
                            {filtered.map((t) => {
                                const selected = tags.includes(t.name);
                                const color = resolveTagColor(t);

                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() =>
                                            selected
                                                ? onRemove(t.name)
                                                : onAdd(t.name)
                                        }
                                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-medium ring-1 transition-colors ${
                                            selected
                                                ? "ring-2"
                                                : "ring-slate-200 dark:ring-zinc-700"
                                        }`}
                                        style={
                                            selected
                                                ? {
                                                      backgroundColor: `${color}1a`,
                                                      color,
                                                      "--tw-ring-color": color,
                                                  }
                                                : undefined
                                        }
                                    >
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                                backgroundColor: color,
                                            }}
                                        />
                                        <span
                                            className={
                                                selected
                                                    ? ""
                                                    : "text-slate-700 dark:text-slate-200"
                                            }
                                        >
                                            {t.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {query
                            ? "Entrée pour créer ce tag."
                            : "Aucun tag pour l'instant."}
                    </p>
                )}
            </div>
        </div>
    );
}
