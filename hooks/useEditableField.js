import { useState, useEffect, useRef } from "react";

// Logique partagée d'un champ éditable inline (titre de tâche, description) :
// bascule en édition, sauvegarde onBlur si la valeur a changé et passe la
// validation, abandon sur Échap. Le rendu (span vs h2, simple vs double-clic)
// reste à la charge du composant appelant — seule la mécanique d'état est ici.
//
// validate reçoit la valeur trimée et renvoie true si elle est sauvegardable
// (ex: longueur minimale). Si absent, toute valeur différente est acceptée.
export function useEditableField(
    value,
    { onSave, validate, focusOnEdit = "select" } = {},
) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const fieldRef = useRef(null);

    // Resynchronise si la valeur source change (changement de tâche, refetch)
    useEffect(() => {
        setDraft(value);
        setIsEditing(false);
    }, [value]);

    useEffect(() => {
        if (!isEditing) return;
        if (focusOnEdit === "select") fieldRef.current?.select();
        if (focusOnEdit === "focus") fieldRef.current?.focus();
    }, [isEditing, focusOnEdit]);

    const startEditing = () => setIsEditing(true);

    const commit = () => {
        const trimmed = draft.trim();
        const original = value ?? "";
        const isValid = validate ? validate(trimmed) : true;

        if (trimmed !== original && isValid) {
            onSave(trimmed);
        } else {
            setDraft(value);
        }
        setIsEditing(false);
    };

    const cancel = () => {
        setDraft(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e, { allowNewline = false } = {}) => {
        if (e.key === "Enter" && !allowNewline) fieldRef.current?.blur();
        if (e.key === "Escape") cancel();
    };

    return {
        isEditing,
        draft,
        setDraft,
        fieldRef,
        startEditing,
        commit,
        handleKeyDown,
    };
}
