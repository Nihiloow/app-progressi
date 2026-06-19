"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import {
    ListIcon,
    CalendarIcon,
    FocusIcon,
    DashboardIcon,
} from "@/components/ui/icons";

// Nav mobile basse. Les icônes viennent du barrel (règle d'or : zéro
// émoji dans l'UI). L'actif est calculé par usePathname, comme la Sidebar.
// L'entrée admin n'apparaît que pour les comptes ADMIN.
export default function BottomNav() {
    const pathname = usePathname();
    const { data: user } = useUser();

    const itemClass = (href) =>
        pathname === href
            ? "flex flex-col items-center justify-center gap-1 text-indigo-500 transition-transform active:scale-95 dark:text-indigo-400"
            : "flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300";

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white pb-safe dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex h-16 items-center justify-around px-2 sm:px-4">
                <Link href="/dashboard" className={itemClass("/dashboard")}>
                    <ListIcon className="h-6 w-6" />
                    <span className="text-[10px] font-semibold">Tâches</span>
                </Link>

                <button className="flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300">
                    <CalendarIcon className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Agenda</span>
                </button>

                {/* Espace central : réserve pour le futur bouton + flottant */}
                <div className="w-12"></div>

                <button className="flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300">
                    <FocusIcon className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Focus</span>
                </button>

                {/* Entrée admin : visible uniquement pour les comptes ADMIN */}
                {user?.role === "ADMIN" ? (
                    <Link
                        href="/dashboard/admin"
                        className={itemClass("/dashboard/admin")}
                    >
                        <DashboardIcon className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Admin</span>
                    </Link>
                ) : (
                    <div className="w-12"></div>
                )}
            </div>
        </nav>
    );
}
