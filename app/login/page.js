"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthBackdrop } from "@/components/ui/AuthBackdrop";

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsPending(true);

        const result = await signIn("credentials", {
            redirect: false,
            email: formData.email,
            password: formData.password,
        });

        setIsPending(false);

        if (result?.error) {
            setError(result.error);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 dark:bg-zinc-950">
            <AuthBackdrop />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        Progressi
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-xs font-medium text-slate-600 dark:text-zinc-400"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1 block text-xs font-medium text-slate-600 dark:text-zinc-400"
                        >
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="mt-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                        {isPending ? "Connexion…" : "Se connecter"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                    Pas encore de compte ?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        Créer un compte
                    </Link>
                </p>
            </div>
        </main>
    );
}
