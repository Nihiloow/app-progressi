"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import {
    ListIcon,
    FlameIcon,
    UserIcon,
    FocusIcon,
} from "@/components/ui/icons";
import { ProfileNavDrawer } from "@/components/layout/ProfileNavDrawer";

// Nav mobile basse, grille à 4 colonnes égales. Focus est désormais un
// LIEN normal vers /dashboard/pomodoro (page intégrée au layout), plus un
// bouton qui montait un overlay plein écran — la nav reste donc TOUJOURS
// visible, y compris sur la page du chrono elle-même.
export default function BottomNav() {
    const pathname = usePathname();
    const { data: user } = useUser();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const isAdmin = user?.role === "ADMIN";

    const itemClass = (href) =>
        pathname === href
            ? "flex flex-col items-center justify-center gap-1 text-indigo-500 transition-transform active:scale-95 dark:text-indigo-400"
            : "flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300";

    const drawerSlotClass =
        pathname === "/dashboard/profile" || pathname === "/dashboard/admin"
            ? "flex flex-col items-center justify-center gap-1 text-indigo-500 transition-transform active:scale-95 dark:text-indigo-400"
            : "flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300";

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white pb-safe dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid h-16 grid-cols-4">
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

                <Link
                    href="/dashboard/pomodoro"
                    className={itemClass("/dashboard/pomodoro")}
                >
                    <FocusIcon className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Focus</span>
                </Link>

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
                    <Link
                        href="/dashboard/profile"
                        className={itemClass("/dashboard/profile")}
                    >
                        <UserIcon className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Profil</span>
                    </Link>
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
