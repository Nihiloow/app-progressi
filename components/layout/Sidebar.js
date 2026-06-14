"use client";

import AvatarProgress from "@/components/AvatarProgress";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Sidebar() {
    const { data: user, isLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch("/api/user");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

    // écran de chargement local pour la sidebar
    if (isLoading) {
        return (
            // Ajout de : hidden md:flex h-full
            <aside className="hidden h-full w-64 flex-col border-r border-slate-200 bg-slate-50 p-6 md:flex dark:border-zinc-800 dark:bg-[#18181b]">
                <div className="mx-auto mb-8 flex flex-col items-center space-y-4">
                    <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-zinc-800"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-zinc-800"></div>
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-zinc-800"></div>
                </div>
            </aside>
        );
    }

    // si l'utilisateur n'existe pas, on ne rend rien
    if (!user || user.error) return null;

    return (
        <aside className="hidden h-full w-64 flex-col border-r border-slate-200 bg-slate-50 p-6 md:flex dark:border-zinc-800 dark:bg-[#18181b]">
            <div className="mb-8">
                <AvatarProgress user={user} />
            </div>

            <nav className="flex flex-col gap-2">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                >
                    Tasks
                </Link>
                <button className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50">
                    ...
                </button>
                <button className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50">
                    ...
                </button>
                <button className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50">
                    ...
                </button>
                {/* Rubrique admin : visible uniquement pour les comptes ADMIN.
                    role provient du même query ["user"] déjà chargé ci-dessus,
                    aucune requête supplémentaire. */}
                {user.role === "ADMIN" && (
                    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-zinc-800">
                        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Administration
                        </p>
                        <Link
                            href="/dashboard/admin"
                            className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Tableau de bord
                        </Link>
                        <Link
                            href="/dashboard/admin/users"
                            className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-1.5"
                                />
                            </svg>
                            Utilisateurs
                        </Link>
                    </div>
                )}
            </nav>
        </aside>
    );
}
