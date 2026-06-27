"use client";

import { FocusIcon } from "@/components/ui/icons";

// Formatte une date en libellé de groupe ("Aujourd'hui", "Hier", ou date
// complète) — même logique de regroupement que l'historique TickTick.
function formatGroupLabel(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Aujourd'hui";
    if (isSameDay(date, yesterday)) return "Hier";

    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
    });
}

function formatDuration(seconds) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Regroupe les sessions par jour calendaire, dans l'ordre déjà fourni par
// l'API (plus récent en premier) — aucun retri ici, la source de vérité
// du tri reste le service (orderBy: createdAt desc).
function groupByDay(sessions) {
    const groups = [];
    let currentLabel = null;
    let currentGroup = null;

    for (const session of sessions) {
        const label = formatGroupLabel(session.endedAt);
        if (label !== currentLabel) {
            currentLabel = label;
            currentGroup = { label, sessions: [] };
            groups.push(currentGroup);
        }
        currentGroup.sessions.push(session);
    }

    return groups;
}

export function PomodoroHistoryList({ sessions }) {
    if (!sessions || sessions.length === 0) {
        return (
            <p className="mt-10 text-center text-sm text-slate-400">
                Aucune séance de focus pour l&apos;instant. Lance ton premier
                Pomodoro pour commencer ton historique.
            </p>
        );
    }

    const groups = groupByDay(sessions);

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <section key={group.label}>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        {group.label}
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
                        <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {group.sessions.map((session) => (
                                <li
                                    key={session.id}
                                    className="flex items-center gap-4 bg-white p-4 dark:bg-zinc-900"
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        <FocusIcon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                {formatDuration(
                                                    session.actualWorkSeconds,
                                                )}
                                            </span>
                                            <span className="text-xs text-slate-400 dark:text-zinc-500">
                                                {formatTime(session.endedAt)}
                                            </span>
                                        </div>
                                        {session.task ? (
                                            <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                                                {session.task.title}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-400 dark:text-zinc-500">
                                                Sans quête liée
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                            +
                                            {session.xpFromTime +
                                                session.xpFromTask}{" "}
                                            XP
                                        </span>
                                        {session.xpFromTask > 0 && (
                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                {session.xpFromTime} focus +{" "}
                                                {session.xpFromTask} quête
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            ))}
        </div>
    );
}
