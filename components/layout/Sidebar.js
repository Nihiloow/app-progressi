"use client";

import AvatarProgress from "@/components/AvatarProgress";
import { useQuery } from "@tanstack/react-query";

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
            <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-[#18181b]">
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
        <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-[#18181b]">
            <div className="mb-8">
                <AvatarProgress user={user} />
            </div>

            <nav className="flex flex-col gap-2">
                <button className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    Aujourd'hui
                </button>
                <button className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50">
                    Boîte de réception
                </button>
            </nav>
        </aside>
    );
}
