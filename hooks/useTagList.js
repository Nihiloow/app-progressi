import { useState } from "react";

// Gestion d'une liste de noms de tags (chips), partagée par les formulaires
// de création (useTaskFormLogic) et la future modale d'édition. Ajout
// idempotent : on trim, pas de doublon, on ignore le vide. setTags est exposé
// pour le reset (création) et le préremplissage (édition).
export function useTagList(initialTags = []) {
    const [tags, setTags] = useState(initialTags);

    const addTag = (name) => {
        const clean = name.trim();
        if (!clean || tags.includes(clean)) return;
        setTags((prev) => [...prev, clean]);
    };

    const removeTag = (name) => {
        setTags((prev) => prev.filter((t) => t !== name));
    };

    return { tags, setTags, addTag, removeTag };
}
