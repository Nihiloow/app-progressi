"use client";

import { useQuery } from "@tanstack/react-query";
import TaskItem from "@/components/TaskItem";
import TaskForm from "@/components/TaskForm";
import AvatarProgress from "@/components/AvatarProgress";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    // Récupération des données du joueur
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch("/api/user");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

    // Récupération des quêtes
    const { data: tasks, isLoading: isTasksLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

    const router = useRouter();

    // Écran de chargement
    if (isUserLoading || isTasksLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-zinc-950 dark:text-zinc-400">
                Chargement de ta progression...
            </div>
        );
    }

    // Redirection si non connecté
    if (user?.error || !user) {
        router.push("/login");
        return null;
    }

    return (
        // Le Conteneur Parent (Gère le mode clair et le mode sombre)
        <div className="flex h-screen w-full bg-white text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-slate-100">
            {/* Colonne 1 : La Sidebar (Fixe) */}
            <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-[#18181b]">
                {/* L'Avatar Circulaire avec Jauge d'XP */}
                <div className="mb-8">
                    <AvatarProgress user={user} />
                </div>

                {/* Navigation (Mockup) */}
                <nav className="flex flex-col gap-2">
                    <button className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        Aujourd'hui
                    </button>
                    <button className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50">
                        Boîte de réception
                    </button>
                </nav>
            </aside>

            {/* Colonne 2 : La Liste Principale (Fluide) */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* En-tête / Formulaire d'ajout rapide */}
                <header className="border-b border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <h1 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Quêtes du jour
                    </h1>
                    <TaskForm />
                </header>

                {/* Zone de défilement des quêtes */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-3xl space-y-3">
                        {tasks.length === 0 ? (
                            <p className="mt-10 text-center text-sm text-slate-400">
                                Ta liste est vide. Ajoute une quête pour
                                commencer.
                            </p>
                        ) : (
                            tasks.map((task) => (
                                <TaskItem key={task.id} task={task} />
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Colonne 3 : Les Détails (Fixe et masquée sur petits écrans) */}
            <aside className="hidden w-80 border-l border-slate-200 bg-slate-50 p-6 lg:block dark:border-zinc-800 dark:bg-[#18181b]">
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 dark:text-zinc-500">
                    <p className="text-sm">
                        Clique sur une quête pour voir ses détails.
                    </p>
                </div>
            </aside>
        </div>
    );
}
