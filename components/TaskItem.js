"use client";
import { useCompleteTask } from "@/hooks/useCompleteTask";
import { useDeleteTask } from "@/hooks/useDeleteTask";

export default function TaskItem({ task }) {
    const completeTaskMutation = useCompleteTask();
    const deleteTaskMutation = useDeleteTask();

    const handleComplete = () => {
        if (task.isCompleted) return;
        completeTaskMutation.mutate(task.id);
    };

    const handleDelete = () => {
        if (window.confirm("Es-tu sûr de vouloir abandonner cette quête ?")) {
            deleteTaskMutation.mutate(task.id);
        }
    };

    return (
        <div
            className={`flex justify-between items-center p-4 border rounded-lg transition-all duration-300 ${
                task.isCompleted
                    ? "bg-slate-50 border-slate-200 opacity-60 dark:bg-zinc-950 dark:border-zinc-900"
                    : "bg-white border-slate-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
            }`}
        >
            <div className="flex flex-col">
                <span
                    className={`font-medium ${task.isCompleted ? "line-through text-slate-400 dark:text-zinc-600" : "text-slate-800 dark:text-slate-200"}`}
                >
                    {task.title}
                </span>
                <span className="text-xs text-slate-500 mt-1 font-medium tracking-wide dark:text-zinc-500">
                    {task.difficulty === 1
                        ? "FACILE (50 XP)"
                        : task.difficulty === 2
                          ? "MOYEN (100 XP)"
                          : "DIFFICILE (150 XP)"}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleComplete}
                    disabled={
                        completeTaskMutation.isPending || task.isCompleted
                    }
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        task.isCompleted
                            ? "bg-emerald-100 text-emerald-700 cursor-not-allowed dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-indigo-500 text-white hover:bg-indigo-600"
                    } ${completeTaskMutation.isPending ? "opacity-50 cursor-wait" : ""}`}
                >
                    {task.isCompleted
                        ? "✓ Validée"
                        : completeTaskMutation.isPending
                          ? "Validation..."
                          : "Valider"}
                </button>

                <button
                    onClick={handleDelete}
                    disabled={deleteTaskMutation.isPending}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"
                    title="Abandonner la quête"
                >
                    {deleteTaskMutation.isPending ? "..." : "✕"}
                </button>
            </div>
        </div>
    );
}
