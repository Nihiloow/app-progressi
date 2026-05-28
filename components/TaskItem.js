"use client";
import { useCompleteTask } from "@/hooks/useCompleteTask";

export default function TaskItem({ task }) {
    // Charge le Hook
    const completeTaskMutation = useCompleteTask();

    const handleComplete = () => {
        completeTaskMutation.mutate(task.id);
    };

    return (
        <div className="flex justify-between items-center p-4 border rounded">
            <span>
                {task.title} - Difficulté: {task.difficulty}
            </span>
            <button
                onClick={handleComplete}
                // React Query dit si la requête est en cours d'envoi
                disabled={completeTaskMutation.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {completeTaskMutation.isPending ? "Validation..." : "Valider"}
            </button>
        </div>
    );
}
