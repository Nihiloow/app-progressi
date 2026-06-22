"use client";

import { useUser } from "@/hooks/useUser";
import { ProfileMenu } from "@/components/profile/ProfileMenu";

export default function MobileHeader() {
    const { data: user, isLoading } = useUser();

    if (isLoading || !user) {
        return (
            <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-zinc-800"></div>
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-zinc-800"></div>
            </header>
        );
    }

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Tasks du jour
            </h1>

            <ProfileMenu align="right">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 transition-transform hover:scale-105 active:scale-95 dark:bg-indigo-500/20 dark:text-indigo-400">
                    {user?.pseudo ? user.pseudo.charAt(0).toUpperCase() : "T"}
                </span>
            </ProfileMenu>
        </header>
    );
}
