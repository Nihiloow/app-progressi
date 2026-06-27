"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
    UserIcon,
    DashboardIcon,
    UsersIcon,
    BanIcon,
} from "@/components/ui/icons";

export function ProfileNavDrawer({ isOpen, onClose }) {
    const panelRef = useFocusTrap(isOpen);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    return (
        <>
            <div
                className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 md:hidden ${
                    isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation profil et administration"
                className={`pb-safe fixed bottom-0 left-0 z-[95] w-full transform rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-zinc-900 ${
                    isOpen ? "translate-y-0" : "translate-y-full"
                }`}
            >
                <div className="mx-auto mb-3 mt-3 h-1 w-10 rounded-full bg-slate-300 dark:bg-zinc-700" />

                <div className="flex flex-col px-4 pb-4">
                    <Link
                        href="/dashboard/profile"
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg px-3 py-4 text-left text-base font-medium hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                        <UserIcon className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
                        <span className="text-slate-700 dark:text-slate-200">
                            Profil
                        </span>
                    </Link>

                    <div className="mt-2 border-t border-slate-100 pt-2 dark:border-zinc-800">
                        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Administration
                        </p>

                        <Link
                            href="/dashboard/admin"
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg px-3 py-4 text-left text-base font-medium hover:bg-slate-50 dark:hover:bg-zinc-800"
                        >
                            <DashboardIcon className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
                            <span className="text-slate-700 dark:text-slate-200">
                                Dashboard
                            </span>
                        </Link>

                        <Link
                            href="/dashboard/admin/users"
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg px-3 py-4 text-left text-base font-medium hover:bg-slate-50 dark:hover:bg-zinc-800"
                        >
                            <UsersIcon className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
                            <span className="text-slate-700 dark:text-slate-200">
                                Utilisateurs
                            </span>
                        </Link>

                        <Link
                            href="/dashboard/admin/moderation"
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg px-3 py-4 text-left text-base font-medium hover:bg-slate-50 dark:hover:bg-zinc-800"
                        >
                            <BanIcon className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
                            <span className="text-slate-700 dark:text-slate-200">
                                Modération
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
