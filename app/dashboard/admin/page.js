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
import { useAdminStats } from "@/hooks/useAdminStats";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminDashboardPage() {
    const { data: stats, isLoading, error } = useAdminStats();

    if (isLoading) {
        return (
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-800/50"
                        />
                    ))}
                </div>
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

    return (
        <main className="flex-1 overflow-y-auto p-6">
            <PageHeader title="Dashboard" />

            <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Utilisateurs" value={stats.totalUsers} />
                <StatCard label="Comptes actifs" value={stats.activeUsers} />
                <StatCard label="Niveau moyen" value={stats.averageLevel} />
                <StatCard
                    label="Quêtes accomplies"
                    value={stats.completedTasks}
                />
            </section>

            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    XP distribué — 30 derniers jours
                </h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                    >
                        <LineChart data={stats.xpTimeline}>
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

            <div className="grid gap-8 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        Quêtes les plus fréquentes
                    </h2>
                    {stats.topTasks.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-zinc-500">
                            Aucune quête créée pour l&apos;instant.
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {stats.topTasks.map((row) => (
                                <li
                                    key={row.title}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <span className="truncate text-slate-700 dark:text-zinc-300">
                                        {row.title}
                                    </span>
                                    <span className="ml-3 flex-shrink-0 font-semibold text-slate-900 dark:text-slate-100">
                                        {row.count}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        Répartition des comptes
                    </h2>
                    <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                        <li className="flex items-center justify-between py-2 text-sm">
                            <span className="text-slate-700 dark:text-zinc-300">
                                Actifs
                            </span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {stats.activeUsers}
                            </span>
                        </li>
                        <li className="flex items-center justify-between py-2 text-sm">
                            <span className="text-slate-700 dark:text-zinc-300">
                                Désactivés
                            </span>
                            <span className="font-semibold text-slate-500 dark:text-zinc-400">
                                {stats.disabledUsers}
                            </span>
                        </li>
                        <li className="flex items-center justify-between py-2 text-sm">
                            <span className="text-slate-700 dark:text-zinc-300">
                                XP total distribué
                            </span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {stats.distributedXp}
                            </span>
                        </li>
                    </ul>
                </section>
            </div>
        </main>
    );
}
