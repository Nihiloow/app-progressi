"use client";

import { useEditableField } from "@/hooks/useEditableField";

// Titre éditable au double-clic dans la liste de tâches.
// Premier clic → sélectionne la tâche (géré par le parent TaskItem).
// Double-clic → bascule en <input>, sauvegarde onBlur / Entrée, abandon Échap.
//
// Pendant du titre éditable de TaskDetails (simple clic, rendu <h2>) : la
// mécanique d'édition est partagée via useEditableField, seul le
// déclencheur et le rendu diffèrent — fusionner les deux composants
// forcerait une API conditionnelle pour économiser peu de lignes.
export function EditableTaskTitle({ task, onSave }) {
    const {
        isEditing,
        draft,
        setDraft,
        fieldRef,
        startEditing,
        commit,
        handleKeyDown,
    } = useEditableField(task.title, {
        onSave: (value) => onSave({ title: value }),
        validate: (value) => value.length >= 3,
    });

    const isInactive = task.status === "DONE" || task.status === "WONT_DO";

    if (isEditing) {
        return (
            <input
                ref={fieldRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
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
                startEditing();
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
