"use client";

import { useHabits } from "@/hooks/useHabits";
import HabitForm from "@/components/habits/HabitForm";
import { HabitList } from "@/components/habits/HabitList";

export default function HabitsPage() {
    const { data: habits, isLoading, error } = useHabits();

    if (isLoading) {
        return (
            <main className="flex flex-1 flex-col overflow-hidden p-6">
                <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-zinc-800"></div>
                <div className="mb-8 h-16 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800/50"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800/50"
                        ></div>
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
        <main className="flex flex-1 flex-col overflow-hidden">
            <header className="border-b border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h1 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Habitudes
                </h1>
                <HabitForm />
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl">
                    <HabitList habits={habits} />
                </div>
            </div>
        </main>
    );
}
