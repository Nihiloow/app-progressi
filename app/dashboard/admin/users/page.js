"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useSetUserStatus } from "@/hooks/useSetUserStatus";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";

export default function AdminUsersPage() {
    const { data: users, isLoading, error } = useAdminUsers();
    const setStatus = useSetUserStatus();
    const deleteUser = useDeleteUser();
    const [userToDelete, setUserToDelete] = useState(null);

    if (isLoading) {
        return (
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
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

    const handleToggleStatus = (user) => {
        const status = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
        setStatus.mutate({ userId: user.id, status });
    };

    const handleConfirmDelete = (userId) => {
        deleteUser.mutate(userId, {
            onSuccess: () => setUserToDelete(null),
        });
    };

    return (
        <main className="flex-1 overflow-y-auto p-6">
            <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
                Gestion des utilisateurs
            </h1>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
                        <tr>
                            <th className="px-4 py-3 font-medium">Pseudo</th>
                            <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                Email
                            </th>
                            <th className="px-4 py-3 font-medium">Niveau</th>
                            <th className="px-4 py-3 font-medium">Statut</th>
                            <th className="px-4 py-3 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="bg-white dark:bg-zinc-950"
                            >
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                    {user.pseudo}
                                    {user.role === "ADMIN" && (
                                        <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                            Admin
                                        </span>
                                    )}
                                </td>
                                <td className="hidden px-4 py-3 text-slate-500 dark:text-zinc-400 sm:table-cell">
                                    {user.email}
                                </td>
                                <td className="px-4 py-3 text-slate-700 dark:text-zinc-300">
                                    {user.level}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            user.status === "ACTIVE"
                                                ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                                        }
                                    >
                                        {user.status === "ACTIVE"
                                            ? "Actif"
                                            : "Désactivé"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() =>
                                                handleToggleStatus(user)
                                            }
                                            disabled={setStatus.isPending}
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                        >
                                            {user.status === "ACTIVE"
                                                ? "Désactiver"
                                                : "Réactiver"}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setUserToDelete(user)
                                            }
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {userToDelete && (
                <DeleteUserDialog
                    user={userToDelete}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setUserToDelete(null)}
                    isPending={deleteUser.isPending}
                />
            )}
        </main>
    );
}
