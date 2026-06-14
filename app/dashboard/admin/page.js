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

export default function AdminDashboardPage() {
    const { data: stats, isLoading, error } = useAdminStats();

    if (isLoading) {
        return (
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-800/50"
                        />
                    ))}
                </div>
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
            <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
                Tableau de bord
            </h1>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <StatCard label="Utilisateurs" value={stats.totalUsers} />
                <StatCard label="Actifs" value={stats.activeUsers} />
                <StatCard label="Désactivés" value={stats.disabledUsers} />
                <StatCard label="Niveau moyen" value={stats.averageLevel} />
                <StatCard
                    label="Quêtes accomplies"
                    value={stats.completedTasks}
                />
                <StatCard label="XP distribué" value={stats.distributedXp} />
            </section>

            <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    XP distribué — 30 derniers jours
                </h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
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

            {stats.topTasks.length > 0 && (
                <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        Quêtes les plus fréquentes
                    </h2>
                    <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {stats.topTasks.map((task) => (
                            <li
                                key={task.title}
                                className="flex justify-between py-2 text-sm"
                            >
                                <span className="text-slate-700 dark:text-zinc-300">
                                    {task.title}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                    {task.count}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
}
