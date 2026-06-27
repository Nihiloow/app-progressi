"use client";

// Anneau de progression du minuteur. statusLabel ("En pause") s'affiche
// SOUS le label de phase (FOCUS/PAUSE) quand fourni, à l'intérieur du
// cercle — pas en bas de l'écran séparé des contrôles, pour rester une
// info qui accompagne visuellement le minuteur lui-même.
export function PomodoroRing({ phase, progress, label, statusLabel }) {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const strokeClass =
        phase === "BREAK"
            ? "text-amber-500 dark:text-amber-400"
            : "text-indigo-500 dark:text-indigo-400";

    return (
        <div className="relative flex h-72 w-72 items-center justify-center">
            <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 256 256"
            >
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-zinc-800"
                />
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-linear ${strokeClass}`}
                />
            </svg>

            <div className="z-10 flex flex-col items-center">
                <span className="text-5xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                    {label}
                </span>
                <span
                    className={`mt-2 text-xs font-semibold uppercase tracking-wider ${
                        phase === "BREAK"
                            ? "text-amber-500 dark:text-amber-400"
                            : "text-indigo-500 dark:text-indigo-400"
                    }`}
                >
                    {phase === "BREAK" ? "Pause" : "Focus"}
                </span>
                {statusLabel && (
                    <span className="mt-1 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                        {statusLabel}
                    </span>
                )}
            </div>
        </div>
    );
}
