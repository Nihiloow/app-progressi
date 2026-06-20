"use client";

import { useState, useEffect } from "react";
import { useTags } from "@/hooks/useTags";
import { useCreateTag } from "@/hooks/useCreateTag";
import { resolveTagColor } from "@/core/config/tagColors";
import { TagManager } from "@/components/ui/TagManager";
import { SettingsIcon } from "@/components/ui/icons";

// Panneau de saisie de tags, ouvert par le bouton TagIcon de la barre.
// Style aligné sur OptionMenu. Le champ crée un tag à la frappe (Entrée),
// la grille de chips ne sert qu'à appliquer/retirer. L'engrenage ouvre le
// TagManager (édition/suppression) en pop-up parallèle.
export function TagPanel({
    isOpen,
    tags,
    onAdd,
    onRemove,
    onClose,
    align = "right",
    direction = "down",
}) {
    const [input, setInput] = useState("");
    const [managerOpen, setManagerOpen] = useState(false);
    const { data: existingTags = [] } = useTags();
    const createTag = useCreateTag();

    useEffect(() => {
        if (!isOpen) setManagerOpen(false);
    }, [isOpen]);

    // Fermeture sur Échap, seulement si un onClose a été fourni par
    // l'appelant — certains appelants (ex: TaskContextMenu) gèrent déjà
    // leur propre Échap au niveau du sous-menu parent et ne passent pas
    // cette prop pour éviter une double fermeture en cascade.
    useEffect(() => {
        if (!isOpen || !onClose) return;
        const handler = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const query = input.trim();
    const filtered = query
        ? existingTags.filter((t) =>
              t.name.toLowerCase().includes(query.toLowerCase()),
          )
        : existingTags;

    // "right" : s'ouvre à droite du panneau parent, aligné en haut —
    // même logique que OptionMenu en direction="right".
    const position =
        direction === "right"
            ? "left-full top-0 ml-1"
            : direction === "up"
              ? "bottom-full mb-2"
              : "top-full mt-2";

    const alignment =
        direction === "right" ? "" : align === "right" ? "right-0" : "left-0";

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
            role="group"
            aria-label="Gestion des étiquettes"
            className={`absolute ${position} ${alignment} z-[90] w-64 max-w-[calc(100vw-1rem)] overflow-visible rounded-xl bg-white p-3 shadow-xl ring-1 ring-slate-200 animate-in fade-in dark:bg-zinc-800 dark:ring-zinc-700`}
        >
            <div className="mb-3 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Créer ou rechercher…"
                    autoFocus
                    className="flex-1 rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-700 placeholder-slate-400 outline-none ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-900 dark:text-slate-200 dark:ring-zinc-700 dark:placeholder-zinc-500"
                />
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setManagerOpen((v) => !v)}
                        aria-label="Gérer les tags"
                        aria-expanded={managerOpen}
                        className={`rounded-md p-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            managerOpen
                                ? "bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-200"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-700"
                        }`}
                    >
                        <SettingsIcon className="h-4 w-4" />
                    </button>
                    <TagManager
                        isOpen={managerOpen}
                        onClose={() => setManagerOpen(false)}
                        align="right"
                        direction={direction}
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
                                aria-pressed={selected}
                                onClick={() =>
                                    selected ? onRemove(t.name) : onAdd(t.name)
                                }
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium outline-none ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
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
