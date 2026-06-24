"use client";

import { useEditableField } from "@/hooks/useEditableField";

// Le titre comme pièce centrale du tiroir, gros et éditable directement —
// pas dans un <input> de formulaire discret comme avant, mais en élément
// visuellement dominant, exactement le rôle qu'il occupe dans la référence
// TickTick. Réutilise useEditableField (déjà partagé par TaskDetails et
// EditableTaskTitle) : même mécanique d'édition inline, juste un rendu
// plus grand adapté à ce contexte plein écran.
export function TaskDrawerTitle({ title, onSave }) {
    const {
        isEditing,
        draft,
        setDraft,
        fieldRef,
        startEditing,
        commit,
        handleKeyDown,
    } = useEditableField(title, {
        onSave: (value) => onSave({ title: value }),
        validate: (value) => value.length >= 3,
    });

    if (isEditing) {
        return (
            <textarea
                ref={fieldRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => handleKeyDown(e, { allowNewline: false })}
                rows={2}
                className="w-full resize-none bg-transparent text-2xl font-bold text-slate-900 focus:outline-none dark:text-slate-100"
            />
        );
    }

    return (
        <h2
            onClick={startEditing}
            className="cursor-text text-2xl font-bold text-slate-900 dark:text-slate-100"
        >
            {title}
        </h2>
    );
}
