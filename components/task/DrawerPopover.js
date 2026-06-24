"use client";

// Bloc en flux qui accueille le contenu d'un champ déployé (priorité,
// type, tags, date). Padding interne porté à p-4 (contre p-2) après
// retour utilisateur sur le manque d'air général dans ces blocs — chaque
// champ enfant (TaskDrawerTagsField, etc.) garde ses propres marges
// internes pour ses éléments spécifiques, mais le conteneur lui-même a
// maintenant assez de respiration pour ne pas coller le contenu aux bords.
export function DrawerPopover({ isOpen, children }) {
    if (!isOpen) return null;

    return (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 animate-in fade-in slide-in-from-top-1 dark:border-zinc-800 dark:bg-zinc-950">
            {children}
        </div>
    );
}
