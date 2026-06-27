"use client";

import { useEffect } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { STATUS_LABELS } from "@/components/ui/taskAppearance";
import { TaskDrawerHeader } from "@/components/task/TaskDrawerHeader";
import { TaskDrawerDateLine } from "@/components/task/TaskDrawerDateLine";
import { TaskDrawerTitle } from "@/components/task/TaskDrawerTitle";
import { TaskDrawerToolbar } from "@/components/task/TaskDrawerToolbar";

// Tiroir d'action mobile, v4 — retour à un tiroir UNIQUE qui s'agrandit
// pour accueillir ses popovers en flux (Priorité, Type, Tags, Date),
// plutôt qu'un second calque d'overlay séparé par-dessus (tentative
// précédente, plus complexe que nécessaire). max-h passe à 85vh (contre
// 70vh avant) pour laisser de la place aux popovers déployés, avec un
// scroll interne sur l'ensemble du tiroir si le contenu déployé dépasse
// même cette hauteur généreuse.
export function TaskActionDrawer({
    task,
    isOpen,
    onClose,
    onUpdateTask,
    onToggleStatus,
    onDeleteTask,
}) {
    const panelRef = useFocusTrap(isOpen);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const isAbandoned = task.status === "WONT_DO";
    const currentTags = task.tags?.map((t) => t.name) ?? [];

    const handleAddTag = (name) => {
        if (!currentTags.includes(name)) {
            onUpdateTask({ tags: [...currentTags, name] });
        }
    };

    const handleRemoveTag = (name) => {
        onUpdateTask({ tags: currentTags.filter((n) => n !== name) });
    };

    const handleToggleWontDo = () => {
        onToggleStatus(isAbandoned ? "TODO" : "WONT_DO");
        onClose();
    };

    const handleDelete = () => {
        onDeleteTask();
        onClose();
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 md:hidden ${
                    isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={`Options de la quête : ${task.title}`}
                className={`pb-safe fixed bottom-0 left-0 z-[95] flex max-h-[85vh] w-full transform flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden dark:bg-zinc-900 ${
                    isOpen ? "translate-y-0" : "translate-y-full"
                }`}
            >
                <div className="mx-auto mb-3 mt-3 h-1 w-10 flex-shrink-0 rounded-full bg-slate-300 dark:bg-zinc-700" />

                {/* Le contenu scrolle indépendamment de la poignée du haut,
                    qui reste fixe — utile quand un popover déployé (ex:
                    liste de 20 tags) dépasse la hauteur du tiroir. */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <TaskDrawerHeader
                        statusLabel={STATUS_LABELS[task.status] ?? task.status}
                        priority={task.priority}
                        onPriorityChange={(value) =>
                            onUpdateTask({ priority: value })
                        }
                        isAbandoned={isAbandoned}
                        onToggleWontDo={handleToggleWontDo}
                        onDelete={handleDelete}
                    />

                    <div className="mt-3">
                        <TaskDrawerDateLine
                            dueDate={task.dueDate}
                            onChange={(value) =>
                                onUpdateTask({ dueDate: value })
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <TaskDrawerTitle
                            title={task.title}
                            onSave={onUpdateTask}
                        />
                    </div>

                    <div className="mt-6">
                        <TaskDrawerToolbar
                            tags={currentTags}
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTag}
                            taskType={task.taskType}
                            onTypeChange={(value) =>
                                onUpdateTask({ taskType: value })
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
