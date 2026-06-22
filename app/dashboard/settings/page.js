"use client";

import { useState } from "react";
import { useChangePassword } from "@/hooks/useChangePassword";

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const changePassword = useChangePassword();

    // La confirmation (retype) est une vérification PUREMENT front, jamais
    // envoyée au serveur (cf. changePasswordSchema) : elle ne protège que
    // contre une faute de frappe, pas contre une attaque — le serveur n'a
    // besoin que de la valeur finale.
    const passwordsMatch = newPassword === confirmPassword;
    const canSubmit =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        passwordsMatch &&
        !changePassword.isPending;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSuccessMessage("");
        changePassword.mutate(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setSuccessMessage("Mot de passe mis à jour avec succès.");
                },
            },
        );
    };

    return (
        <main className="flex-1 overflow-y-auto p-6">
            <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
                Paramètres
            </h1>

            <section className="max-w-md rounded-xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    Changer le mot de passe
                </h2>
                <p className="mb-4 text-xs text-slate-400 dark:text-zinc-500">
                    Le mot de passe actuel est requis pour confirmer le
                    changement.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="mb-1 block text-xs font-medium text-slate-600 dark:text-zinc-400"
                        >
                            Mot de passe actuel
                        </label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="newPassword"
                            className="mb-1 block text-xs font-medium text-slate-600 dark:text-zinc-400"
                        >
                            Nouveau mot de passe
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                        />
                        {newPassword.length > 0 && newPassword.length < 8 && (
                            <p className="mt-1 text-xs text-amber-500">
                                8 caractères minimum.
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-1 block text-xs font-medium text-slate-600 dark:text-zinc-400"
                        >
                            Confirmer le nouveau mot de passe
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                        />
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="mt-1 text-xs text-red-500">
                                Les deux mots de passe ne correspondent pas.
                            </p>
                        )}
                    </div>

                    {changePassword.isError && (
                        <p className="text-sm text-red-500">
                            {changePassword.error.message}
                        </p>
                    )}
                    {successMessage && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            {successMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`mt-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                            canSubmit
                                ? "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                : "cursor-not-allowed bg-slate-300 dark:bg-zinc-700"
                        }`}
                    >
                        {changePassword.isPending
                            ? "Mise à jour…"
                            : "Mettre à jour le mot de passe"}
                    </button>
                </form>
            </section>
        </main>
    );
}
