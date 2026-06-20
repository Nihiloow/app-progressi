"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChangeTaskStatus } from "@/hooks/useChangeTaskStatus";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import {
    getPriorityConfig,
    getTypeConfig,
    formatShortDate,
    dueDateColor,
} from "@/components/ui/taskAppearance";
import { resolveTagColor } from "@/core/config/tagColors";
import { CalendarIcon, CheckIcon, CloseIcon } from "@/components/ui/icons";
import { TaskContextMenu } from "@/components/task/TaskContextMenu";
import { EditableTaskTitle } from "@/components/task/EditableTaskTitle";

// Durée du longpress mobile avant ouverture du menu contextuel (ms)
const LONGPRESS_DELAY = 500;

export default function TaskItem({ task, isSelected, onSelect }) {
    const changeStatusMutation = useChangeTaskStatus();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const isPending = changeStatusMutation.isPending;

    const [contextMenu, setContextMenu] = useState(null); // { x, y } | null
    const longPressTimer = useRef(null);

    const isDone = task.status === "DONE";
    const isAbandoned = task.status === "WONT_DO";
    const isInactive = isDone || isAbandoned;

    const priorityConfig = getPriorityConfig(task.priority);
    const TypeIcon = getTypeConfig(task.taskType).icon;

    // Nettoyage du timer longpress si le composant est démonté
    useEffect(() => () => clearTimeout(longPressTimer.current), []);

    const openContextMenu = useCallback((x, y) => {
        setContextMenu({ x, y });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    // Clic droit desktop
    const handleContextMenu = (e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY);
    };

    // Longpress mobile : on démarre le timer au touchstart et on l'annule
    // si le doigt bouge ou se lève avant LONGPRESS_DELAY.
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        longPressTimer.current = setTimeout(() => {
            openContextMenu(touch.clientX, touch.clientY);
        }, LONGPRESS_DELAY);
    };

    const cancelLongPress = () => clearTimeout(longPressTimer.current);

    const handleToggleStatus = (e) => {
        e.stopPropagation();
        const nextStatus = task.status === "TODO" ? "DONE" : "TODO";
        changeStatusMutation.mutate({ taskId: task.id, status: nextStatus });
    };

    const handleUpdate = (patch) => {
        updateTaskMutation.mutate({ id: task.id, data: patch });
    };

    const handleStatusFromMenu = (status) => {
        changeStatusMutation.mutate({ taskId: task.id, status });
    };

    return (
        <>
            <div
                onClick={() => onSelect(task.id)}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-all duration-200 ${
                    isSelected
                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-500/10"
                        : "border-slate-200 bg-white shadow-sm hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                } ${isInactive ? "opacity-60" : ""}`}
            >
                <button
                    onClick={handleToggleStatus}
                    disabled={isPending}
                    aria-label={
                        isDone ? "Annuler la validation" : "Valider la quête"
                    }
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isDone
                            ? "border-indigo-500 bg-indigo-500 text-white dark:border-indigo-600 dark:bg-indigo-600"
                            : isAbandoned
                              ? "border-slate-400 text-slate-400 dark:border-zinc-500 dark:text-zinc-500"
                              : priorityConfig.ring
                    } ${isPending ? "cursor-wait opacity-50" : ""}`}
                >
                    {isDone && <CheckIcon className="h-3.5 w-3.5" />}
                    {isAbandoned && <CloseIcon className="h-3 w-3" />}
                </button>

                <div className="flex flex-1 flex-col overflow-hidden">
                    <EditableTaskTitle task={task} onSave={handleUpdate} />

                    <div className="mt-1 flex items-center gap-2">
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
                        {task.dueDate && (
                            <span
                                className={`ml-auto flex items-center gap-1 text-[10px] font-medium ${dueDateColor(task.dueDate)}`}
                            >
                                <CalendarIcon className="h-3 w-3" />
                                {formatShortDate(task.dueDate)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {contextMenu && (
                <TaskContextMenu
                    task={task}
                    position={contextMenu}
                    onClose={closeContextMenu}
                    onUpdateTask={handleUpdate}
                    onToggleStatus={handleStatusFromMenu}
                    onDeleteTask={() => deleteTaskMutation.mutate(task.id)}
                />
            )}
        </>
    );
}
