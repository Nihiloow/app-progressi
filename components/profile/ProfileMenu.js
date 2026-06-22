"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserIcon } from "@/components/ui/icons/UserIcon";
import { SettingsIcon } from "@/components/ui/icons";

// Menu déroulant générique du profil, sur le même pattern que OptionMenu
// (position absolute, fermeture Échap/clic extérieur) — mais conçu comme
// un WRAPPER autour d'un déclencheur arbitraire (children), plutôt qu'un
// bouton standardisé : il doit envelopper indifféremment l'avatar du
// MobileHeader (petit cercle) et AvatarProgress dans la Sidebar (anneau XP
// + pseudo), deux rendus visuellement différents pour la même action.
//
// Le composant NE MODIFIE PAS le déclencheur qu'on lui passe : AvatarProgress
// reste un composant de présentation pur, intouché, simplement enveloppé.
export function ProfileMenu({ children, align = "right" }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        const handleEscape = (e) => e.key === "Escape" && setIsOpen(false);

        document.addEventListener("pointerdown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const alignment = align === "right" ? "right-0" : "left-0";

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Ouvrir le menu profil"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
                {children}
            </button>

            {isOpen && (
                <div
                    role="menu"
                    aria-label="Menu profil"
                    className={`absolute top-full mt-2 ${alignment} z-[90] w-48 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 animate-in fade-in dark:bg-zinc-800 dark:ring-zinc-700`}
                >
                    <div className="flex flex-col py-1">
                        <Link
                            href="/dashboard/profile"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium outline-none hover:bg-slate-50 focus-visible:bg-slate-50 dark:hover:bg-zinc-700/50 dark:focus-visible:bg-zinc-700/50"
                        >
                            <UserIcon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                            <span className="text-slate-700 dark:text-slate-200">
                                Profil
                            </span>
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium outline-none hover:bg-slate-50 focus-visible:bg-slate-50 dark:hover:bg-zinc-700/50 dark:focus-visible:bg-zinc-700/50"
                        >
                            <SettingsIcon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                            <span className="text-slate-700 dark:text-slate-200">
                                Paramètres
                            </span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
