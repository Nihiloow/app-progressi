"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@/hooks/useUser";
import AvatarProgress from "@/components/AvatarProgress";
import { FlameIcon } from "@/components/ui/icons";

const PRIORITY_LABELS = {
    HIGH: "Surcharge",
    MEDIUM: "Soutenu",
    LOW: "Calme",
    NONE: "Énergie",
};

export default function ProfilePage() {
    const { data: user } = useUser();
    const { data: profile, isLoading, error } = useProfile();

    if (isLoading || !user) {
        return (
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-64 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-800/50" />
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex-1 p-6">
                <p className="text-sm text-red-600 dark:text-red-400">
                    {error.message}
                </p>
            </main>
        );
    }

    const { xpTimeline, productivityStats, bestStreaks } = profile;

    return (
        <main className="flex-1 overflow-y-auto p-6">
            <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
                Profil
            </h1>

            <section className="mb-8 flex justify-center">
                <AvatarProgress user={user} />
            </section>

            <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                        Quêtes accomplies
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {productivityStats.completedTasks}
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                        Taux de complétion
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {productivityStats.completionRate}%
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                        Quêtes créées
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {productivityStats.totalTasks}
                    </p>
                </div>
            </section>

            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    XP gagné — 30 derniers jours
                </h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={xpTimeline}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                className="text-slate-200 dark:text-zinc-800"
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(d) => d.slice(5)}
                                stroke="currentColor"
                                className="text-slate-400"
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                stroke="currentColor"
                                className="text-slate-400"
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "0.5rem",
                                    fontSize: "0.8rem",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="xp"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {productivityStats.priorityBreakdown.length > 0 && (
                <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        Répartition des quêtes accomplies par priorité
                    </h2>
                    <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {productivityStats.priorityBreakdown.map((row) => (
                            <li
                                key={row.priority}
                                className="flex justify-between py-2 text-sm"
                            >
                                <span className="text-slate-700 dark:text-zinc-300">
                                    {PRIORITY_LABELS[row.priority] ??
                                        row.priority}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                    {row.count}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    Meilleures séries
                </h2>
                {bestStreaks.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-zinc-500">
                        Aucune habitude pour l&apos;instant.
                    </p>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {bestStreaks.map((habit) => (
                            <li
                                key={habit.id}
                                className="flex items-center justify-between py-2 text-sm"
                            >
                                <span className="text-slate-700 dark:text-zinc-300">
                                    {habit.title}
                                </span>
                                <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                                    <FlameIcon className="h-4 w-4" />
                                    {habit.bestStreak} jour
                                    {habit.bestStreak > 1 ? "s" : ""}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
