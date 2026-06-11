"use client";

import { useEffect } from "react";

export default function DashboardError({ error, reset }) {
    useEffect(() => {
        // Trace serveur/console pour le débogage : l'utilisateur, lui,
        // ne voit que le message générique ci-dessous
        console.error("Crash intercepté par l'error boundary :", error);
    }, [error]);

    return (
        <div className="flex h-full flex-1 flex-col items-center justify-center space-y-6 p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <svg
                    className="h-10 w-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Aïe, une anomalie spatio-temporelle !
                </h2>
                <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-zinc-400">
                    L'interface a rencontré un problème inattendu lors du
                    chargement de tes données.
                </p>
            </div>
            <button
                onClick={() => reset()}
                className="rounded-md bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
            >
                Tenter une reconnexion
            </button>
        </div>
    );
}
