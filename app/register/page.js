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

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            router.push("/login"); // Redirection vers la connexion si succès
        } else {
            const data = await res.json();
            setError(data.error || "Une erreur est survenue.");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-blue-900/20">
                <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-white">
                    Créer un Héros
                </h1>

                {error && (
                    <div className="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-400 border border-red-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Adresse Email"
                        required
                        className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Pseudo"
                        required
                        className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onChange={(e) =>
                            setFormData({ ...formData, pseudo: e.target.value })
                        }
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        required
                        className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

                <p className="mt-6 text-center text-sm text-slate-400">
                    Déjà inscrit ?{" "}
                    <Link
                        href="/login"
                        className="text-blue-400 hover:underline"
                    >
                        Se connecter
                    </Link>
                </p>
            </div>
        </main>
    );
}
