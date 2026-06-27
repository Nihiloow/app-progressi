"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { usePomodoroTimerContext } from "@/components/pomodoro/PomodoroTimerProvider";
import { PomodoroRing } from "@/components/pomodoro/PomodoroRing";
import { PomodoroControls } from "@/components/pomodoro/PomodoroControls";
import { PomodoroSettings } from "@/components/pomodoro/PomodoroSettings";
import { PomodoroTaskSheet } from "@/components/pomodoro/PomodoroTaskSheet";
import { getPriorityConfig } from "@/components/ui/taskAppearance";
import { ListIcon, ChevronRightIcon } from "@/components/ui/icons";

// Page chrono, intégrée au layout dashboard (nav toujours visible autour)
// — plus un overlay plein écran. Le timer lui-même vit dans
// PomodoroTimerProvider
export function PomodoroTimerView() {
    const timer = usePomodoroTimerContext();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { data: tasks } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });
    const selectedTask = tasks?.find((t) => t.id === timer.taskId);

    const totalSeconds =
        timer.phase === "BREAK"
            ? timer.settings.breakMinutes * 60
            : timer.settings.workMinutes * 60;
    const progress =
        totalSeconds === 0
            ? 0
            : ((totalSeconds - timer.secondsLeft) / totalSeconds) * 100;

    const minutes = String(Math.floor(timer.secondsLeft / 60)).padStart(2, "0");
    const seconds = String(timer.secondsLeft % 60).padStart(2, "0");

    const handleSelectTask = (id) => {
        timer.setTaskId(id);
        setIsSheetOpen(false);
    };

    // "En pause" sous le label de phase uniquement si le décompte est
    // arrêté pendant un cycle actif (WORK ou BREAK en pause) — rien en
    // phase WORK qui tourne, rien en IDLE
    const statusLabel =
        timer.phase !== "IDLE" && !timer.isRunning ? "En pause" : null;

    return (
        <main className="relative flex flex-1 flex-col overflow-hidden">
            <header className="flex items-center justify-end p-4">
                <Link
                    href="/dashboard/pomodoro/history"
                    aria-label="Voir l'historique des séances"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:text-zinc-500 dark:hover:bg-zinc-800"
                >
                    <ListIcon className="h-5 w-5" />
                </Link>
            </header>

            <div className="flex justify-center px-6 pb-2">
                <button
                    type="button"
                    onClick={() => setIsSheetOpen(true)}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                    {selectedTask ? (
                        <>
                            <span
                                className={`h-2.5 w-2.5 rounded-full border-2 ${getPriorityConfig(selectedTask.priority).ring}`}
                            />
                            <span className="max-w-[200px] truncate text-slate-700 dark:text-slate-200">
                                {selectedTask.title}
                            </span>
                        </>
                    ) : (
                        "Sur quelle tâche travailles-tu ?"
                    )}
                    <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-8">
                {timer.phase === "IDLE" ? (
                    <PomodoroSettings
                        settings={timer.settings}
                        onChange={timer.setSettings}
                    >
                        <PomodoroRing
                            phase="WORK"
                            progress={0}
                            label={`${minutes}:${seconds}`}
                            statusLabel={null}
                        />
                    </PomodoroSettings>
                ) : (
                    <PomodoroRing
                        phase={timer.phase}
                        progress={progress}
                        label={`${minutes}:${seconds}`}
                        statusLabel={statusLabel}
                    />
                )}

                {timer.saveError && (
                    <p className="mt-4 text-sm text-red-500">
                        {timer.saveError.message}
                    </p>
                )}
            </div>

            <footer className="flex flex-col items-center gap-3 pb-40">
                <PomodoroControls
                    phase={timer.phase}
                    isRunning={timer.isRunning}
                    onStart={timer.start}
                    onPause={timer.pause}
                    onSkip={timer.skipPhase}
                    onStop={timer.stop}
                />
                {timer.isSaving && (
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                        Enregistrement…
                    </p>
                )}
            </footer>

            <PomodoroTaskSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                taskId={timer.taskId}
                onSelect={handleSelectTask}
            />
        </main>
    );
}
