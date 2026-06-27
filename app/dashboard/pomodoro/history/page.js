"use client";

import { usePomodoroHistory } from "@/hooks/usePomodoroHistory";
import { PomodoroHistoryList } from "@/components/pomodoro/PomodoroHistoryList";

export default function PomodoroHistoryPage() {
    const { data: sessions, isLoading, error } = usePomodoroHistory();

    if (isLoading) {
        return (
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800/50"
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
                Historique des séances
            </h1>

            <div className="mx-auto max-w-3xl">
                <PomodoroHistoryList sessions={sessions} />
            </div>
        </main>
    );
}
