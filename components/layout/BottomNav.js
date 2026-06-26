"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { ListIcon, FlameIcon, UserIcon } from "@/components/ui/icons";
import { ProfileNavDrawer } from "@/components/layout/ProfileNavDrawer";

// Nav mobile basse. 4 slots de largeur fixe identique, que le compte soit
// admin ou non — alignement visuel garanti dans les deux cas :
//   Tâches | Habitudes | Profil (3ème slot, lien direct non-admin /
//   toujours vide pour un admin) | 4ème slot (vide non-admin / tiroir
//   Profil+Admin pour un admin)
//
// Remplace l'ancien bouton "Focus" (mort, aucune route derrière) et la
// réserve FAB centrale, tous deux supprimés : on ne réserve pas d'avance
// un slot pour une feature (Pomodoro) qui n'est pas encore cadrée — YAGNI.
// Si Pomodoro revient, la question de la barre sera rouverte à ce moment,
// en connaissance des besoins réels de la feature.
export default function BottomNav() {
    const pathname = usePathname();
    const { data: user } = useUser();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const isAdmin = user?.role === "ADMIN";

    const itemClass = (href) =>
        pathname === href
            ? "flex flex-col items-center justify-center gap-1 text-indigo-500 transition-transform active:scale-95 dark:text-indigo-400"
            : "flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300";

    // Le 4ème slot (admin) doit apparaître "actif" si on est déjà sur
    // Profil OU Admin : les deux routes vivent derrière ce même bouton,
    // contrairement aux autres slots qui pointent vers une seule route.
    const drawerSlotClass =
        pathname === "/dashboard/profile" || pathname === "/dashboard/admin"
            ? "flex flex-col items-center justify-center gap-1 text-indigo-500 transition-transform active:scale-95 dark:text-indigo-400"
            : "flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300";

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white pb-safe dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex h-16 items-center justify-around px-2 sm:px-4">
                <Link href="/dashboard" className={itemClass("/dashboard")}>
                    <ListIcon className="h-6 w-6" />
                    <span className="text-[10px] font-semibold">Tâches</span>
                </Link>

                <Link
                    href="/dashboard/habits"
                    className={itemClass("/dashboard/habits")}
                >
                    <FlameIcon className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Habitudes</span>
                </Link>

                {/* 3ème slot : lien direct Profil pour un non-admin, vide
                    (largeur fixe) pour un admin — qui accède à Profil via
                    le tiroir du 4ème slot. */}
                {isAdmin ? (
                    <div className="w-12" />
                ) : (
                    <Link
                        href="/dashboard/profile"
                        className={itemClass("/dashboard/profile")}
                    >
                        <UserIcon className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Profil</span>
                    </Link>
                )}

                {/* 4ème slot : vide (largeur fixe) pour un non-admin, tiroir
                    Profil/Admin pour un admin. */}
                {isAdmin ? (
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        aria-haspopup="true"
                        aria-expanded={isDrawerOpen}
                        className={drawerSlotClass}
                    >
                        <UserIcon className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Profil</span>
                    </button>
                ) : (
                    <div className="w-12" />
                )}
            </div>

            {isAdmin && (
                <ProfileNavDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                />
            )}
        </nav>
    );
}
