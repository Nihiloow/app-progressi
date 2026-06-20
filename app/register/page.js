"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        pseudo: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/login");
            } else {
                const data = await res.json();
                setError(data.error || "Une erreur est survenue.");
            }
        } catch {
            setError("Le serveur ne répond pas. Réessaie plus tard.");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-blue-900/20">
                <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Créer un Héros
                </h1>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/50 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Adresse Email"
                        required
                        className="rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Pseudo"
                        required
                        className="rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        onChange={(e) =>
                            setFormData({ ...formData, pseudo: e.target.value })
                        }
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        required
                        className="rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                    />
                    <button
                        type="submit"
                        className="mt-4 rounded-lg bg-blue-600 p-3 font-semibold text-white transition-colors hover:bg-blue-500"
                    >
                        Rejoindre l'Aventure
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Déjà inscrit ?{" "}
                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Se connecter
                    </Link>
                </p>
            </div>
        </main>
    );
}
