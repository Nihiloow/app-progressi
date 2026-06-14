"use client";

import { useChangeTaskStatus } from "@/hooks/useChangeTaskStatus";
import {
    getPriorityConfig,
    getTypeConfig,
} from "@/components/ui/taskAppearance";
import { resolveTagColor } from "@/core/config/tagColors";

export default function TaskItem({ task, isSelected, onSelect }) {
    const changeStatusMutation = useChangeTaskStatus();
    const isPending = changeStatusMutation.isPending;

    const isDone = task.status === "DONE";
    const isAbandoned = task.status === "WONT_DO";
    const isInactive = isDone || isAbandoned;

    const priorityConfig = getPriorityConfig(task.priority);
    const TypeIcon = getTypeConfig(task.taskType).icon;

    const handleToggleStatus = (e) => {
        e.stopPropagation();

        // TO DO → DONE (gain d'XP) ; DONE → TODO (remboursement) ;
        // WONT_DO → TODO (réactivation, neutre). Le serveur arbitre tout.
        const nextStatus = task.status === "TODO" ? "DONE" : "TODO";
        changeStatusMutation.mutate({ taskId: task.id, status: nextStatus });
    };

    return (
        <div
            onClick={() => onSelect(task.id)}
            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-all duration-200 ${
                isSelected
                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-500/10"
                    : "border-slate-200 bg-white shadow-sm hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            } ${isInactive ? "bg-slate-50 opacity-60 dark:bg-zinc-950" : ""}`}
        >
            <button
                onClick={handleToggleStatus}
                disabled={isPending}
                aria-label={
                    isDone ? "Annuler la validation" : "Valider la quête"
                }
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                    isDone
                        ? "border-indigo-500 bg-indigo-500 text-white dark:border-indigo-600 dark:bg-indigo-600"
                        : isAbandoned
                          ? "border-slate-400 text-slate-400 dark:border-zinc-500 dark:text-zinc-500"
                          : "border-slate-300 hover:border-indigo-400 dark:border-zinc-600 dark:hover:border-indigo-500"
                } ${isPending ? "cursor-wait opacity-50" : ""}`}
            >
                {isDone && (
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
                {isAbandoned && (
                    <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                )}
            </button>

            <div className="flex flex-1 flex-col overflow-hidden">
                <span
                    className={`truncate text-sm font-medium transition-all ${
                        isInactive
                            ? "text-slate-400 line-through dark:text-zinc-600"
                            : "text-slate-800 dark:text-slate-200"
                    }`}
                >
                    {task.title}
                </span>

                <div className="mt-1 flex items-center gap-2">
                    {task.priority !== "NONE" && (
                        <span
                            className={`text-[10px] font-bold uppercase ${priorityConfig.color}`}
                        >
                            {priorityConfig.label}
                        </span>
                    )}
                    {task.taskType !== "NONE" && (
                        <TypeIcon
                            className={`h-3.5 w-3.5 ${getTypeConfig(task.taskType).color}`}
                        />
                    )}
                    {task.tags?.length > 0 &&
                        task.tags.map((tag) => {
                            const color = resolveTagColor(tag);
                            return (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                    style={{
                                        backgroundColor: `${color}1a`,
                                        color,
                                    }}
                                >
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    {tag.name}
                                </span>
                            );
                        })}
                    {isAbandoned && (
                        <span className="text-[10px] font-medium uppercase text-slate-400 dark:text-zinc-500">
                            Ne sera pas faite
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
