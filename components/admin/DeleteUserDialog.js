"use client";

import { useState, useEffect } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

// Confirmation forte du hard-delete : l'admin doit retaper le pseudo
// exact. Garde-fou contre la suppression accidentelle d'un compte (et
// de tout son historique XP en cascade).
export function DeleteUserDialog({ user, onConfirm, onCancel, isPending }) {
    const [confirmText, setConfirmText] = useState("");
    const panelRef = useFocusTrap(true);

    // Cette modale n'a pas de prop isOpen — elle n'est montée par le
    // parent (AdminUsersPage) que lorsqu'un utilisateur est sélectionné
    // pour suppression. isActive est donc toujours true tant qu'elle
    // existe dans le DOM (cf. useFocusTrap(true) ci-dessus).
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onCancel();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onCancel]);

    const canDelete = confirmText === user.pseudo;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                ref={panelRef}
                role="alertdialog"
                aria-modal="true"
                aria-label="Supprimer définitivement le compte"
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Supprimer définitivement
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                    Cette action est irréversible. Toutes les quêtes, tags et
                    l&apos;historique d&apos;XP de{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {user.pseudo}
                    </span>{" "}
                    seront effacés. Tapez le pseudo pour confirmer.
                </p>

                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={user.pseudo}
                    className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                />

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => onConfirm(user.id)}
                        disabled={!canDelete || isPending}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isPending ? "Suppression…" : "Supprimer"}
                    </button>
                </div>
            </div>
        </div>
    );
}
