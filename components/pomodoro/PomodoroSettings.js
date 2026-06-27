"use client";

import { useState, useEffect } from "react";
import { CloseIcon, CheckIcon, SettingsIcon } from "@/components/ui/icons";
import { useUpdatePomodoroSettings } from "@/hooks/usePomodoroSettings";
import { useFocusTrap } from "@/hooks/useFocusTrap";

// Réglages du minuteur, en MODALE centrée (voile + panneau) plutôt qu'en
// popover ancré au déclencheur — pattern repris d'AvatarUploadModal.
// Un popover positionné relativement au cercle (centré au milieu de
// l'écran) n'a pas toujours assez d'espace en dessous selon la hauteur du
// viewport, ce qui produisait un rendu "découpé". Une modale centrée à
// l'écran, indépendante de la position du déclencheur, élimine ce
// problème par construction. Déclencheur toujours arbitraire (children),
// même pattern que ProfileMenu/AvatarEditor.
//
// L'overlay au survol (icône réglages en fondu, centré) reprend le même
// signal visuel qu'AvatarEditor pour son propre cercle cliquable : style
// inline plutôt que classes Tailwind conditionnelles, pour la même raison
// que dans AvatarEditor — un style inline s'applique toujours sans
// dépendre d'aucune étape de compilation. Affiché uniquement quand isOpen
// est false : inutile de montrer "clique pour ouvrir" pendant que la
// modale est déjà ouverte.
export function PomodoroSettings({ settings, onChange, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [draft, setDraft] = useState(settings);
    const updateSettings = useUpdatePomodoroSettings();
    const panelRef = useFocusTrap(isOpen);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && setIsOpen(false);
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen]);

    const handleOpen = () => {
        setDraft(settings);
        setIsOpen(true);
    };

    const handleSave = () => {
        updateSettings.mutate(draft, {
            onSuccess: (saved) => {
                onChange(saved);
                setIsOpen(false);
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Régler la durée du minuteur"
                className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
                {children}

                {/* Centré sur le cercle entier (PomodoroRing fait h-72 w-72) :
                    pas besoin de dimensions précises, inset-0 + flex suffit
                    à centrer l'icône quel que soit le contenu de children. */}
                <div
                    style={{
                        opacity: isHovering && !isOpen ? 1 : 0,
                        backgroundColor:
                            isHovering && !isOpen
                                ? "rgba(0, 0, 0, 0.35)"
                                : "transparent",
                    }}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full transition-opacity duration-200"
                ></div>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
                    onClick={(e) =>
                        e.target === e.currentTarget && setIsOpen(false)
                    }
                >
                    <div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Réglages du minuteur"
                        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                Réglages
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Fermer"
                                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                            >
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-zinc-400">
                            Travail (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="180"
                            value={draft.workMinutes}
                            onChange={(e) =>
                                setDraft((d) => ({
                                    ...d,
                                    workMinutes: Number(e.target.value),
                                }))
                            }
                            className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-200"
                        />

                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-zinc-400">
                            Pause (minutes)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="60"
                            value={draft.breakMinutes}
                            onChange={(e) =>
                                setDraft((d) => ({
                                    ...d,
                                    breakMinutes: Number(e.target.value),
                                }))
                            }
                            className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-200"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setDraft((d) => ({
                                    ...d,
                                    autoChainBreak: !d.autoChainBreak,
                                }))
                            }
                            className="mb-6 flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left"
                        >
                            <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                                Enchaîner la pause automatiquement
                            </span>
                            <span
                                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                    draft.autoChainBreak
                                        ? "border-indigo-500 bg-indigo-500 text-white"
                                        : "border-slate-300 dark:border-zinc-600"
                                }`}
                            >
                                {draft.autoChainBreak && (
                                    <CheckIcon className="h-3 w-3" />
                                )}
                            </span>
                        </button>

                        {updateSettings.isError && (
                            <p className="mb-3 text-xs text-red-500">
                                {updateSettings.error.message}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={updateSettings.isPending}
                            className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-600"
                        >
                            {updateSettings.isPending
                                ? "Enregistrement…"
                                : "Enregistrer"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
