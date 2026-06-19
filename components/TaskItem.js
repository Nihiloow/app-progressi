"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChangeTaskStatus } from "@/hooks/useChangeTaskStatus";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import {
    getPriorityConfig,
    getTypeConfig,
    PRIORITY_OPTIONS,
    TYPE_OPTIONS,
    formatShortDate,
} from "@/components/ui/taskAppearance";
import { resolveTagColor } from "@/core/config/tagColors";
import {
    LightningIcon,
    CalendarIcon,
    TagIcon,
    ChevronRightIcon,
    BanIcon,
    CheckIcon,
    CloseIcon,
    TrashIcon,
} from "@/components/ui/icons";
import { OptionMenu } from "@/components/ui/OptionMenu";
import { TagPanel } from "@/components/ui/TagPanel";
import { DatePicker } from "@/components/ui/DatePicker";

// Classe de couleur de la date selon son rapport au jour courant.
// Dépassée → rouge, aujourd'hui → indigo, future → ardoise.
const dueDateColor = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) return "text-red-500 dark:text-red-400";
    if (due.getTime() === today.getTime())
        return "text-indigo-500 dark:text-indigo-400";
    return "text-slate-400 dark:text-zinc-500";
};

// Durée du longpress mobile avant ouverture du menu contextuel (ms)
const LONGPRESS_DELAY = 500;

// Menu contextuel façon TickTick : priorité, type, date, tags, actions.
// Positionné à la souris (desktop) ou centré sous la tâche (mobile).
function ContextMenu({
    task,
    position,
    onClose,
    onUpdateTask,
    onToggleStatus,
    onDeleteTask,
}) {
    const menuRef = useRef(null);
    const [subMenu, setSubMenu] = useState(null); // "priority" | "type" | "tags" | null
    // Timer partagé : onMouseLeave démarre la fermeture du sous-menu avec un
    // délai de 120ms. Si la souris entre dans l'OptionMenu avant l'expiration,
    // onMouseEnter l'annule — la souris peut traverser le micro-espace entre
    // le bouton et le panneau sans que rien ne se ferme.
    const closeTimer = useRef(null);

    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => setSubMenu(null), 120);
    };
    const cancelClose = () => clearTimeout(closeTimer.current);

    // Nettoyage au démontage
    useEffect(() => () => clearTimeout(closeTimer.current), []);

    // Fermeture au clic extérieur
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const id = setTimeout(
            () => document.addEventListener("pointerdown", handler),
            10,
        );
        return () => {
            clearTimeout(id);
            document.removeEventListener("pointerdown", handler);
        };
    }, [onClose]);

    const style = {
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 200,
    };

    const isAbandoned = task.status === "WONT_DO";

    const handlePriority = (value) => {
        onUpdateTask({ priority: value });
        onClose();
    };

    const handleType = (value) => {
        onUpdateTask({ taskType: value });
        onClose();
    };

    const handleWontDo = () => {
        const next = isAbandoned ? "TODO" : "WONT_DO";
        onToggleStatus(next);
        onClose();
    };

    // Entrée commune à chaque ligne avec sous-menu : ouvre immédiatement,
    // annule tout timer de fermeture en cours.
    const handleRowEnter = (name) => {
        cancelClose();
        setSubMenu(name);
    };

    return (
        <div
            ref={menuRef}
            style={style}
            className="min-w-[220px] rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        >
            {/* Priorité */}
            <div
                className="relative"
                onMouseEnter={() => handleRowEnter("priority")}
                onMouseLeave={scheduleClose}
            >
                <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-800"
                >
                    <LightningIcon
                        className={`h-4 w-4 ${getPriorityConfig(task.priority).color}`}
                    />
                    Priorité
                    <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-slate-400" />
                </button>
                {/* onMouseEnter sur l'OptionMenu annule le timer de fermeture :
                    la souris peut glisser du bouton au panneau sans interruption. */}
                <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                    <OptionMenu
                        isOpen={subMenu === "priority"}
                        onClose={() => setSubMenu(null)}
                        onSelect={handlePriority}
                        options={PRIORITY_OPTIONS}
                        direction="right"
                    />
                </div>
            </div>

            {/* Type */}
            <div
                className="relative"
                onMouseEnter={() => handleRowEnter("type")}
                onMouseLeave={scheduleClose}
            >
                <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-800"
                >
                    {(() => {
                        const cfg = getTypeConfig(task.taskType);
                        const Icon = cfg.icon;
                        return <Icon className={`h-4 w-4 ${cfg.color}`} />;
                    })()}
                    Type
                    <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-slate-400" />
                </button>
                <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                    <OptionMenu
                        isOpen={subMenu === "type"}
                        onClose={() => setSubMenu(null)}
                        onSelect={handleType}
                        options={TYPE_OPTIONS}
                        direction="right"
                    />
                </div>
            </div>

            {/* Tags */}
            <div
                className="relative"
                onMouseEnter={() => handleRowEnter("tags")}
                onMouseLeave={scheduleClose}
            >
                <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-800"
                >
                    <TagIcon className="h-4 w-4 text-slate-500" />
                    Étiquettes
                    <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-slate-400" />
                </button>
                <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                    <TagPanel
                        isOpen={subMenu === "tags"}
                        tags={task.tags?.map((t) => t.name) ?? []}
                        onAdd={(name) => {
                            const current = task.tags?.map((t) => t.name) ?? [];
                            if (!current.includes(name)) {
                                onUpdateTask({ tags: [...current, name] });
                            }
                        }}
                        onRemove={(name) => {
                            const updated = (
                                task.tags?.map((t) => t.name) ?? []
                            ).filter((n) => n !== name);
                            onUpdateTask({ tags: updated });
                        }}
                        direction="right"
                    />
                </div>
            </div>

            {/* Date — DatePicker inline dans le menu contextuel */}
            <div className="flex items-center gap-3 px-4 py-2.5">
                <CalendarIcon className="h-4 w-4 flex-shrink-0 text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                    Date
                </span>
                <div className="ml-auto">
                    <DatePicker
                        value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                        onChange={(val) =>
                            onUpdateTask({
                                dueDate: val
                                    ? new Date(val).toISOString()
                                    : null,
                            })
                        }
                        align="right"
                        direction="up"
                    />
                </div>
            </div>

            <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

            {/* Ne fera pas / Réactiver */}
            <button
                type="button"
                onClick={handleWontDo}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
                <BanIcon className="h-4 w-4 text-slate-500" />
                <span
                    className={
                        isAbandoned
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-700 dark:text-slate-200"
                    }
                >
                    {isAbandoned ? "Réactiver la quête" : "Ne fera pas"}
                </span>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

            {/* Supprimer — destructif, rouge pour signal visuel clair */}
            <button
                type="button"
                onClick={() => {
                    onDeleteTask();
                    onClose();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
                <TrashIcon className="h-4 w-4" />
                Supprimer la quête
            </button>
        </div>
    );
}

// Titre éditable au double-clic dans la liste.
// Premier clic → sélectionne la tâche (géré par le parent).
// Double-clic → bascule en <input>, sauvegarde onBlur / Entrée, abandon Échap.
function EditableTitleInline({ task, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.title);
    const inputRef = useRef(null);

    useEffect(() => {
        setValue(task.title);
        setIsEditing(false);
    }, [task.id, task.title]);

    useEffect(() => {
        if (isEditing) inputRef.current?.select();
    }, [isEditing]);

    const handleBlur = () => {
        const trimmed = value.trim();
        if (trimmed.length >= 3 && trimmed !== task.title) {
            onSave({ title: trimmed });
        } else {
            setValue(task.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") inputRef.current?.blur();
        if (e.key === "Escape") {
            setValue(task.title);
            setIsEditing(false);
        }
    };

    const isDone = task.status === "DONE";
    const isAbandoned = task.status === "WONT_DO";
    const isInactive = isDone || isAbandoned;

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                // stopPropagation : évite que le clic sur l'input déclenche
                // onSelect de la carte parente
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none dark:text-slate-200"
            />
        );
    }

    return (
        <span
            onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={`truncate text-sm font-medium transition-all ${
                isInactive
                    ? "text-slate-400 line-through dark:text-zinc-600"
                    : "text-slate-800 dark:text-slate-200"
            }`}
        >
            {task.title}
        </span>
    );
}

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
                    <EditableTitleInline task={task} onSave={handleUpdate} />

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
                <ContextMenu
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
