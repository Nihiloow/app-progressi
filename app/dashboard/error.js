"use client";

import { useEffect } from "react";

export default function DashboardError({ error, reset }) {
    useEffect(() => {
        // envoie l'erreur dans la console pour que tu puisses la déboguer
        console.error("Crash intercepté par le blindage :", error);
    }, [error]);

    return (
        <div className="flex h-full flex-1 flex-col items-center justify-center space-y-6 p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <span className="text-3xl">⚠️</span>
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
                onClick={() => reset()} // tente de recharger le composant qui a planté
                className="rounded-md bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
            >
                Tenter une reconnexion
            </button>
        </div>
    );
}
