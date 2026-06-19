"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import TaskForm from "@/components/TaskForm";
import TaskDetails from "@/components/TaskDetails";
import MobileTaskForm from "@/components/MobileTaskForm";
import TaskList from "@/components/TaskList";
import { PlusIcon } from "@/components/ui/icons";

export default function DashboardPage() {
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
    const router = useRouter();

    const { data: user, isLoading: isUserLoading } = useUser();

    const { data: tasks, isLoading: isTasksLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

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
        return <RedirectToLogin />;
    }

    const selectedTask = tasks?.find((t) => t.id === selectedTaskId) ?? null;

    return (
        <>
            <main className="flex flex-1 flex-col overflow-hidden relative">
                <header className="hidden md:block border-b border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <h1 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Tasks du jour
                    </h1>
                    <TaskForm />
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-3xl">
                        <TaskList
                            tasks={tasks}
                            selectedTaskId={selectedTaskId}
                            onSelectTask={setSelectedTaskId}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setIsMobileFormOpen(true)}
                    className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 md:hidden"
                    aria-label="Nouvelle quête"
                >
                    <PlusIcon className="h-6 w-6" />
                </button>
            </main>

            <TaskDetails task={selectedTask} />

            <MobileTaskForm
                isOpen={isMobileFormOpen}
                onClose={() => setIsMobileFormOpen(false)}
            />
        </>
    );
}

// Redirection isolée dans un composant à part : le push vit dans un
// useEffect (effet de bord post-rendu), jamais pendant le rendu du
// dashboard. Évite le "setState while rendering" du Router.
function RedirectToLogin() {
    const router = useRouter();

    useEffect(() => {
        router.push("/login");
    }, [router]);

    return null;
}
