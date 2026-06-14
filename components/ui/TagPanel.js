"use client";

import { useState } from "react";
import { useTags } from "@/hooks/useTags";

// Panneau de saisie de tags, ouvert par le bouton TagIcon de la barre.
// Même logique d'ouverture/fermeture que OptionMenu (priorité, type).
// Saisie libre + suggestions des tags existants. Les tags choisis ne
// s'affichent PAS dans la barre : on les voit sur la tâche une fois créée.
export function TagPanel({ isOpen, tags, onAdd, onRemove, align = "right" }) {
    const [input, setInput] = useState("");
    const { data: existingTags = [] } = useTags();

    if (!isOpen) return null;

    const available = existingTags.filter((t) => !tags.includes(t.name));
    const suggestions =
        input.trim().length > 0
            ? available.filter((t) =>
                  t.name.toLowerCase().includes(input.toLowerCase()),
              )
            : available;

    const commit = (name) => {
        const clean = name.trim();
        if (!clean) return;
        onAdd(clean);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            commit(input);
        }
    };

    return (
        <div
            className={`absolute top-full z-30 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 ${
                align === "right" ? "right-0" : "left-0"
            }`}
        >
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ajouter un tag…"
                autoFocus
                className="w-full rounded-md border border-slate-200 bg-transparent px-2 py-1.5 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:text-slate-200 dark:placeholder-zinc-500"
            />

            {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {tags.map((name) => (
                        <span
                            key={name}
                            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                        >
                            {name}
                            <button
                                type="button"
                                onClick={() => onRemove(name)}
                                className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                                aria-label={`Retirer ${name}`}
                            >
                                <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {suggestions.length > 0 && (
                <ul className="mt-2 max-h-40 overflow-auto border-t border-slate-100 pt-1 dark:border-zinc-800">
                    {suggestions.map((t) => (
                        <li key={t.id}>
                            <button
                                type="button"
                                onClick={() => commit(t.name)}
                                className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-zinc-800"
                            >
                                {t.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
