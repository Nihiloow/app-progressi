// Menu déroulant générique : remplace les blocs copiés-collés des menus
// type/priorité de TaskForm et MobileTaskForm. Le parent garde la main sur
// l'état d'ouverture (il gère plusieurs menus), le composant gère le rendu.

"use client";

import { useEffect, useRef } from "react";

export function OptionMenu({
    isOpen,
    onClose,
    onSelect,
    options,
    direction = "down", // "down" | "up" | "right"
    align = "left",
    withOverlay = false, // mobile : un voile transparent capte le clic extérieur
}) {
    const menuRef = useRef(null);

    // Fermeture sur Échap uniquement — pas de focus automatique du premier
    // item : ça avait introduit un décalage visuel du popover (un focus
    // programmatique peut déclencher un scroll-into-view du navigateur,
    // qui perturbe le positionnement absolute calculé au même cycle de
    // rendu). La navigation clavier reste possible via Tab normal.
    useEffect(() => {
        if (!isOpen) return;

        const handler = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handler);

        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // "right" : sous-menu latéral façon TickTick — s'ouvre à droite du panneau
    // parent, aligné avec le haut du bouton déclencheur.
    const position =
        direction === "right"
            ? "left-full top-0 ml-1"
            : direction === "up"
              ? "bottom-full mb-2"
              : "top-full mt-2";

    const alignment = align === "right" ? "right-0" : "left-0";
    // En mode "right", l'alignement horizontal est géré par left-full,
    // la prop align n'a plus d'effet.
    const positionClass =
        direction === "right" ? position : `${position} ${alignment}`;

    return (
        <>
            {withOverlay && (
                <div
                    className="fixed inset-0 z-[80] bg-transparent"
                    onClick={onClose}
                />
            )}
            <div
                ref={menuRef}
                role="menu"
                className={`absolute ${positionClass} z-[90] w-48 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 animate-in fade-in dark:bg-zinc-800 dark:ring-zinc-700`}
            >
                <div className="flex flex-col py-1">
                    {options.map((option) => {
                        const Icon = option.icon;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium outline-none hover:bg-slate-50 focus-visible:bg-slate-50 dark:hover:bg-zinc-700/50 dark:focus-visible:bg-zinc-700/50"
                            >
                                <Icon
                                    className={`h-4 w-4 ${option.iconColor}`}
                                />
                                <span className="text-slate-700 dark:text-slate-200">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
