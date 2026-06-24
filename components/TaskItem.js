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
import { TaskActionDrawer } from "@/components/task/TaskActionDrawer";
import { EditableTaskTitle } from "@/components/task/EditableTaskTitle";

// Durée du longpress mobile avant ouverture du tiroir d'action (ms)
const LONGPRESS_DELAY = 500;

export default function TaskItem({ task, isSelected, onSelect }) {
    const changeStatusMutation = useChangeTaskStatus();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const isPending = changeStatusMutation.isPending;

    // Deux surfaces d'action distinctes selon le type d'interaction :
    //   - contextMenu { x, y } : clic droit SOURIS (desktop), menu flottant
    //     positionné au curseur.
    //   - isDrawerOpen : longpress TACTILE (mobile), tiroir bas pleine
    //     largeur — ne déborde jamais de l'écran, contrairement au menu
    //     flottant qui sortait du cadre près des bords.
    // Le choix se fait sur le type d'interaction, pas sur la taille
    // d'écran (window.innerWidth) : plus robuste sur les appareils hybrides
    // tactile + souris, où une détection par largeur se tromperait.
    const [contextMenu, setContextMenu] = useState(null); // { x, y } | null
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const longPressTimer = useRef(null);
    const cardRef = useRef(null);

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

    // Clic droit desktop → menu contextuel flottant au curseur
    const handleContextMenu = (e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY);
    };

    // Longpress mobile → tiroir d'action (PAS le menu flottant). On démarre
    // le timer au touchstart et on l'annule si le doigt bouge ou se lève
    // avant LONGPRESS_DELAY.
    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            setIsDrawerOpen(true);
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

    // Carte sélectionnable au clavier : Entrée/Espace ouvrent les détails.
    // La touche "Menu" (ou Shift+F10, équivalent clavier du clic droit)
    // ouvre le menu contextuel, centré sur la carte plutôt qu'à la position
    // du curseur (qui n'a pas de sens au clavier).
    const handleCardKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(task.id);
            return;
        }
        if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
            e.preventDefault();
            const rect = cardRef.current?.getBoundingClientRect();
            if (rect) openContextMenu(rect.left, rect.bottom);
        }
    };

    return (
        <>
            <div
                ref={cardRef}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Quête : ${task.title}. ${
                    isDone ? "Validée" : isAbandoned ? "Abandonnée" : "En cours"
                }. Appuyez sur Entrée pour voir les détails, restez appuyé pour les options.`}
                onClick={() => onSelect(task.id)}
                onKeyDown={handleCardKeyDown}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
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

            {/* Desktop : menu contextuel flottant au curseur (clic droit) */}
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

            {/* Mobile : tiroir bas (longpress). Rendu uniquement à
                l'ouverture pour ne pas multiplier les popovers TagPanel
                montés dans le DOM tant qu'aucune carte n'est en édition. */}
            {isDrawerOpen && (
                <TaskActionDrawer
                    task={task}
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onUpdateTask={handleUpdate}
                    onToggleStatus={handleStatusFromMenu}
                    onDeleteTask={() => deleteTaskMutation.mutate(task.id)}
                />
            )}
        </>
    );
}
