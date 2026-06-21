"use client";

// Confirmation légère du reset : contrairement à DeleteUserDialog (hard-
// delete, irréversible, retape du pseudo exigée), un reset de progression
// est une action moins grave — le ledger XpEvent survit intact, seul le
// cache xp/level repart à zéro. Une simple confirmation à deux clics
// suffit, pas besoin de retaper le pseudo.
export function ResetProgressionDialog({
    user,
    onConfirm,
    onCancel,
    isPending,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Réinitialiser la progression
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                    Le niveau et l&apos;XP de{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {user.pseudo}
                    </span>{" "}
                    repartiront à zéro (niveau 1, 0 XP). L&apos;historique de
                    ses quêtes et de ses gains passés reste conservé.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => onConfirm(user.id)}
                        disabled={isPending}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isPending ? "Réinitialisation…" : "Réinitialiser"}
                    </button>
                </div>
            </div>
        </div>
    );
}
