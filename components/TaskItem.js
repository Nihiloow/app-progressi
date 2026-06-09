"use client";

import { useCompleteTask } from "@/hooks/useCompleteTask";
import { useUpdateTask } from "@/hooks/useUpdateTask"; // Nouveau hook

export default function TaskItem({ task, isSelected, onSelect }) {
    const completeTaskMutation = useCompleteTask();
    const updateTaskMutation = useUpdateTask();

    const isPending =
        completeTaskMutation.isPending || updateTaskMutation.isPending;

    const handleToggleComplete = (e) => {
        e.stopPropagation();

        if (!task.isCompleted) {
            completeTaskMutation.mutate(task.id);
        } else {
            updateTaskMutation.mutate({
                id: task.id,
                data: { isCompleted: false },
            });
        }
    };

    return (
        <div
            onClick={() => onSelect(task.id)}
            className={`flex items-center gap-4 p-3 border rounded-xl transition-all duration-200 cursor-pointer ${
                isSelected
                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-500/10"
                    : "bg-white border-slate-200 shadow-sm hover:border-slate-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
            } ${task.isCompleted ? "opacity-60 bg-slate-50 dark:bg-zinc-950" : ""}`}
        >
            <button
                onClick={handleToggleComplete}
                disabled={isPending}
                className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                    task.isCompleted
                        ? "border-indigo-500 bg-indigo-500 text-white dark:border-indigo-600 dark:bg-indigo-600"
                        : "border-slate-300 hover:border-indigo-400 dark:border-zinc-600 dark:hover:border-indigo-500"
                } ${isPending ? "opacity-50 cursor-wait" : ""}`}
            >
                {task.isCompleted && (
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </button>

            <div className="flex flex-col flex-1 overflow-hidden">
                <span
                    className={`truncate text-sm font-medium transition-all ${
                        task.isCompleted
                            ? "line-through text-slate-400 dark:text-zinc-600"
                            : "text-slate-800 dark:text-slate-200"
                    }`}
                >
                    {task.title}
                </span>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
                        {task.priority !== "NONE"
                            ? task.priority
                            : task.difficulty === 1
                              ? "Facile"
                              : task.difficulty === 2
                                ? "Moyen"
                                : "Difficile"}
                    </span>
                </div>
            </div>
        </div>
    );
}
