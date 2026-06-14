// Source unique des couleurs de tags. Sert aux pastilles de l'éditeur
// ET de repli pour les tags sans couleur (color === null en base).
// Valeurs hex maîtrisées : lisibles en clair comme en sombre.
export const TAG_COLORS = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // rose
    "#ef4444", // rouge
    "#f59e0b", // ambre
    "#10b981", // émeraude
    "#06b6d4", // cyan
    "#64748b", // ardoise
];

export const DEFAULT_TAG_COLOR = TAG_COLORS[0];

// Repli déterministe : un tag sans couleur reçoit toujours la même
// couleur de la palette (basée sur son nom), pas une couleur aléatoire
// qui changerait à chaque rendu.
export function resolveTagColor(tag) {
    if (tag.color) return