"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserIcon } from "@/components/ui/icons/UserIcon";
import { SettingsIcon, LogoutIcon } from "@/components/ui/icons";

// Menu déroulant du profil, sur le même pattern que OptionMenu (position
// absolute, fermeture Échap/clic extérieur) — conçu comme un WRAPPER
// autour d'un déclencheur arbitraire (children), pour envelopper
// indifféremment le petit avatar du MobileHeader et l'AvatarRing de la
// Sidebar.
//
// Positionnement façon TickTick : le popover ne s'aligne PAS sur le bord
// du déclencheur, il est DÉCALÉ vers la droite (offset positif) et
// remonte légèrement pour chevaucher le bas de l'avatar plutôt que de
// descendre franchement dessous — cf. capture de référence fournie.
export function ProfileMenu({ children, variant = "sidebar" }) {
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

    const handleSignOut = () => {
        setIsOpen(false);
        signOut({ callbackUrl: "/login" });
    };

    // Deux variantes de positionnement, deux contextes différents :
    //   - "sidebar" : avatar en haut à gauche de l'écran, le popover peut
    //     se permettre de déborder vers la droite (façon TickTick, cf.
    //     capture de référence) sans jamais sortir du viewport.
    //   - "header" : avatar en haut à DROITE de l'écran (MobileHeader) —
    //     décaler vers la droite pousserait le menu hors écran. Alignement
    //     classique sur le bord droit du déclencheur, ouverture vers le bas.
    const positionClass =
        variant === "sidebar"
            ? "absolute -top-4 left-16 w-52"
            : "absolute right-0 top-full mt-2 w-52";

    return (
        <div ref={containerRef} className="relative inline-block">
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
                    className={`z-[90] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 animate-in fade-in dark:bg-zinc-800 dark:ring-zinc-700 ${positionClass}`}
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

                        <div className="my-1 border-t border-slate-100 dark:border-zinc-700" />

                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 outline-none hover:bg-red-50 focus-visible:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:focus-visible:bg-red-500/10"
                        >
                            <LogoutIcon className="h-4 w-4" />
                            Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
