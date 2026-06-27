"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarRing } from "@/components/AvatarProgress";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { useUser } from "@/hooks/useUser";
import {
    DashboardIcon,
    UsersIcon,
    FlameIcon,
    BanIcon,
    FocusIcon,
    ListIcon,
} from "@/components/ui/icons";

export default function Sidebar() {
    const { data: user, isLoading } = useUser();
    const pathname = usePathname();

    const linkClass = (href) =>
        pathname === href
            ? "flex items-center gap-3 rounded-lg bg-indigo-50 p-3 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            : "flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50";

    if (isLoading) {
        return (
            <aside className="hidden h-full w-64 flex-col border-r border-slate-200 bg-slate-50 p-6 md:flex dark:border-zinc-800 dark:bg-[#18181b]">
                <div className="mx-auto mb-8 flex flex-col items-center space-y-4">
                    <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-zinc-800"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-zinc-800"></div>
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-zinc-800"></div>
                </div>
            </aside>
        );
    }

    if (!user || user.error) return null;

    return (
        <aside className="hidden h-full w-64 flex-col border-r border-slate-200 bg-slate-50 p-6 md:flex dark:border-zinc-800 dark:bg-[#18181b]">
            <div className="mb-2 flex flex-col items-center">
                <ProfileMenu variant="sidebar">
                    <AvatarRing user={user} />
                </ProfileMenu>
                <span className="mt-5 font-semibold text-slate-700 dark:text-slate-200">
                    {user.pseudo}
                </span>
            </div>

            <nav className="mt-6 flex flex-col gap-2">
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                    <ListIcon className="h-4 w-4" />
                    Tasks
                </Link>
                <Link
                    href="/dashboard/habits"
                    className={linkClass("/dashboard/habits")}
                >
                    <FlameIcon className="h-4 w-4" />
                    Habitudes
                </Link>
                <Link
                    href="/dashboard/pomodoro"
                    className={linkClass("/dashboard/pomodoro")}
                >
                    <FocusIcon className="h-4 w-4" />
                    Focus
                </Link>

                {user.role === "ADMIN" && (
                    <div className="flex flex-col gap-1 mt-4 border-t border-slate-200 pt-4 dark:border-zinc-800">
                        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Administration
                        </p>
                        <Link
                            href="/dashboard/admin"
                            className={linkClass("/dashboard/admin")}
                        >
                            <DashboardIcon />
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/admin/users"
                            className={linkClass("/dashboard/admin/users")}
                        >
                            <UsersIcon />
                            Users
                        </Link>
                        <Link
                            href="/dashboard/admin/moderation"
                            className={linkClass("/dashboard/admin/moderation")}
                        >
                            <BanIcon />
                            Modération
                        </Link>
                    </div>
                )}
            </nav>
        </aside>
    );
}
