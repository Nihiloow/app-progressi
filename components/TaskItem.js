"use client";
import { useCompleteTask } from "@/hooks/useCompleteTask";

export default function TaskItem({ task }) {
    const completeTaskMutation = useCompleteTask();

    const handleComplete = () => {
        // si la tâche est déjà complétée, on ne fait rien
        if (task.isCompleted) return;
        completeTaskMutation.mutate(task.id);
    };

    return (
        <div
            className={`flex justify-between items-center p-4 border rounded-lg transition-all duration-300 ${
                task.isCompleted
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : "bg-white border-gray-300 shadow-sm"
            }`}
        >
            <div className="flex flex-col">
                <span
                    className={`font-medium ${task.isCompleted ? "line-through text-gray-400" : "text-gray-800"}`}
                >
                    {task.title}
                </span>
                <span className="text-xs text-gray-500 mt-1 font-medium tracking-wide">
                    {task.difficulty === 1
                        ? "FACILE (50 XP)"
                        : task.difficulty === 2
                          ? "MOYEN (100 XP)"
                          : "DIFFICILE (150 XP)"}
                </span>
            </div>

            <button
                onClick={handleComplete}
                disabled={completeTaskMutation.isPending || task.isCompleted}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    task.isCompleted
                        ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                } ${completeTaskMutation.isPending ? "opacity-50 cursor-wait" : ""}`}
            >
                {task.isCompleted
                    ? "✓ Validée"
                    : completeTaskMutation.isPending
                      ? "Validation..."
                      : "Valider"}
            </button>
        </div>
    );
}
