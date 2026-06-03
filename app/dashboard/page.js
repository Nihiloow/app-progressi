"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TaskItem from "@/components/TaskItem";
import TaskForm from "@/components/TaskForm";
import TaskDetails from "@/components/TaskDetails";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch("/api/user");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

    const { data: tasks, isLoading: isTasksLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

    const router = useRouter();

    if (isUserLoading || isTasksLoading) {
        return (
            <main className="flex flex-1 flex-col overflow-hidden p-6">
                <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-zinc-800"></div>
                <div className="mb-8 h-16 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800/50"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800/50"
                        ></div>
                    ))}
                </div>
            </main>
        );
    }

    if (user?.error || !user) {
        router.push("/login");
        return null;
    }

    // trouver la tâche complète à partir de l'ID sélectionné
    const selectedTask = tasks?.find((t) => t.id === selectedTaskId);

    return (
        <>
            <main className="flex flex-1 flex-col overflow-hidden">
                <header className="border-b border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <h1 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Quêtes du jour
                    </h1>
                    <TaskForm />
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-3xl space-y-3">
                        {tasks?.length === 0 ? (
                            <p className="mt-10 text-center text-sm text-slate-400">
                                Ta liste est vide. Ajoute une quête pour
                                commencer.
                            </p>
                        ) : (
                            tasks?.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    isSelected={task.id === selectedTaskId} // vérifie si c'est la tâche active
                                    onSelect={setSelectedTaskId} // passe la fonction de mise à jour
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>

            <TaskDetails task={selectedTask} />
        </>
    );
}
