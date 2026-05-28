"use client";

import { useQuery } from "@tanstack/react-query";
import XpBar from "@/components/ui/XpBar";
import TaskItem from "@/components/TaskItem";

export default function Dashboard() {
    // On récup les datas du joueurs
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch("/api/user");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

    // On récup les tasks du joueurs
    const { data: tasks, isLoading: isTasksLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });

    // Écran de chargement
    if (isUserLoading || isTasksLoading) {
        return (
            <div className="text-center mt-20 text-gray-500">
                Chargement de ta progression...
            </div>
        );
    }

    // Calcul du palier d'XP pour la barre
    const requiredXp = user.level * 100;

    return (
        <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Bon retour, {user.pseudo} !
            </h1>

            <XpBar currentXp={user.xp} requiredXp={requiredXp} />

            <div className="mt-10 mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Quêtes du jour
                </h2>
                <p className="text-sm text-gray-500">
                    Accomplis tes tâches pour monter en niveau.
                </p>
            </div>

            <div className="space-y-4">
                {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}
