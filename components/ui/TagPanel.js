"use client";

import { useState } from "react";
import { useTags } from "@/hooks/useTags";
import { useCreateTag } from "@/hooks/useCreateTag";
import { resolveTagColor } from "@/core/config/tagColors";
import { TagManager } from "@/components/ui/TagManager";

// Panneau de saisie de tags, ouvert par le bouton TagIcon de la barre.
// Style aligné sur OptionMenu. Le champ crée un tag à la frappe (Entrée),
// la grille de chips ne sert qu'à appliquer/retirer. L'engrenage ouvre le
// TagManager (édition/suppression) en pop-up parallèle.
export function TagPanel({ isOpen, tags, onAdd, onRemove, align = "right" }) {
    const [input, setInput] = useState("");
    const [managerOpen, setManagerOpen] = useState(false);
    const { data: existingTags = [] } = useTags();
    const createTag = useCreateTag();

    if (!isOpen) return null;

    const query = input.trim();
    const filtered = query
        ? existingTags.filter((t) =>
              t.name.toLowerCase().includes(query.toLowerCase()),
          )
        : existingTags;

    const alignment = align === "right" ? "right-0" : "left-0";

    // Entrée : nom déjà existant → on vide (la chip est dans la grille).
    // Sinon → création serveur, sans application.
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
        <div
            className={`absolute top-full mt-2 ${alignment} z-[90] w-64 overflow-visible rounded-xl bg-white p-3 shadow-xl ring-1 ring-slate-200 animate-in fade-in dark:bg-zinc-800 dark:ring-zinc-700`}
        >
            <div className="mb-3 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Créer ou rechercher…"
                    autoFocus
                    className="flex-1 rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-700 placeholder-slate-400 ring-1 ring-slate-200 focus:ring-indigo-500 focus:outline-none dark:bg-zinc-900 dark:text-slate-200 dark:ring-zinc-700 dark:placeholder-zinc-500"
                />
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setManagerOpen((v) => !v)}
                        aria-label="Gérer les tags"
                        className={`rounded-md p-1.5 transition-colors ${
                            managerOpen
                                ? "bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-200"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-700"
                        }`}
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </button>
                    <TagManager
                        isOpen={managerOpen}
                        onClose={() => setManagerOpen(false)}
                        align="right"
                    />
                </div>
            </div>

            {createTag.isError && (
                <p className="mb-2 text-xs text-red-500">
                    {createTag.error.message}
                </p>
            )}

            {filtered.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {filtered.map((t) => {
                        const selected = tags.includes(t.name);
                        const color = resolveTagColor(t);

                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() =>
                                    selected ? onRemove(t.name) : onAdd(t.name)
                                }
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-colors ${
                                    selected
                                        ? "ring-2"
                                        : "ring-slate-200 hover:bg-slate-50 dark:ring-zinc-700 dark:hover:bg-zinc-700/50"
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
                                    style={{ backgroundColor: color }}
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
            ) : (
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                    {query
                        ? "Entrée pour créer ce tag."
                        : "Aucun tag pour l'instant."}
                </p>
            )}
        </div>
    );
}
