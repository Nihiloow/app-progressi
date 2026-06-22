"use client";

import { useModerationFlags } from "@/hooks/useModerationFlags";

const FLAG_LABELS = {
    RAPID_CYCLE: "Cycle rapide validation/décochage",
};

export default function ModerationPage() {
    const { data: flags, isLoading, error } = useModerationFlags();

    if (isLoading) {
        return (
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800/50"
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
            <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
                Modération
            </h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-zinc-400">
                Comportements signalés automatiquement. Aucune sanction
                n&apos;est appliquée par le système — la décision reste à ton
                appréciation.
            </p>

            {flags.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-zinc-700 dark:text-zinc-500">
                    Aucun signalement pour l&apos;instant.
                </p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    Utilisateur
                                </th>
                                <th className="px-4 py-3 font-medium">Quête</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">
                                    Détail
                                </th>
                                <th className="px-4 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {flags.map((flag) => (
                                <tr
                                    key={flag.id}
                                    className="bg-white dark:bg-zinc-950"
                                >
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                        {flag.user?.pseudo ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                                        {flag.task?.title ?? "Quête supprimée"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                            {FLAG_LABELS[flag.type] ??
                                                flag.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-zinc-400">
                                        {flag.detail}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 dark:text-zinc-500">
                                        {new Date(
                                            flag.createdAt,
                                        ).toLocaleString("fr-FR")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
