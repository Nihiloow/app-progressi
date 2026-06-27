"use client";

import { useRouter } from "next/navigation";
import { usePomodoroHistory } from "@/hooks/usePomodoroHistory";
import { PomodoroHistoryList } from "@/components/pomodoro/PomodoroHistoryList";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PomodoroHistoryPage() {
    const router = useRouter();
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
            {/* onBack explicite vers /dashboard/pomodoro plutôt que le
                router.back() par défaut de PageHeader : cette page n'a
                qu'une seule destination logique de retour, le Timer.
                router.back() dépend de la pile d'historique réelle du
                navigateur — un rechargement de page suivi d'une navigation
                pouvait ramener ailleurs que le Timer, bug constaté en usage
                réel. Un lien fixe élimine cette classe de bug. */}
            <PageHeader
                title="Historique des séances"
                onBack={() => router.push("/dashboard/pomodoro")}
            />

            <div className="mx-auto max-w-3xl">
                <PomodoroHistoryList sessions={sessions} />
            </div>
        </main>
    );
}
