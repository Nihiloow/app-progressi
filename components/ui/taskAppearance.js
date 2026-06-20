// Source de vérité UNIQUE de l'apparence des priorités et des types,
// partagée par TaskForm (PC), MobileTaskForm et TaskItem/TaskDetails.
// Avant : deux copies locales qui avaient déjà divergé (labels d'un côté,
// variantes dark: de l'autre). Toute évolution se fait ici, une seule fois.

import {
    LightningIcon,
    FocusIcon,
    ListIcon,
    InboxIcon,
} from "@/components/ui/icons";

export const PRIORITY_CONFIG = {
    HIGH: {
        label: "Surcharge",
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-500/10",
        ring: "border-red-400 dark:border-red-500",
    },
    MEDIUM: {
        label: "Soutenu",
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        ring: "border-amber-400 dark:border-amber-500",
    },
    LOW: {
        label: "Calme",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        ring: "border-blue-400 dark:border-blue-500",
    },
    NONE: {
        label: "Énergie",
        color: "text-slate-400 dark:text-zinc-400",
        bg: "bg-transparent",
        ring: "border-slate-300 dark:border-zinc-600",
    },
};

export const TYPE_CONFIG = {
    DEEP_WORK: {
        label: "Deep Focus",
        icon: FocusIcon,
        color: "text-purple-500",
    },
    SHALLOW_WORK: {
        label: "Shallow Work",
        icon: ListIcon,
        color: "text-indigo-500",
    },
    ADMINISTRATIVE: {
        label: "Admin",
        icon: InboxIcon,
        color: "text-slate-500",
    },
    NONE: {
        label: "Type",
        icon: ListIcon,
        color: "text-slate-400 dark:text-zinc-400",
    },
};

// Accès tolérant : une valeur inattendue retombe sur NONE plutôt que de
// faire planter le rendu (le serveur, lui, refuse les valeurs inconnues)
export function getPriorityConfig(priority) {
    return PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.NONE;
}

export function getTypeConfig(taskType) {
    return TYPE_CONFIG[taskType] ?? TYPE_CONFIG.NONE;
}

// Options prêtes à l'emploi pour les menus déroulants (PC et mobile),
// dérivées des configs ci-dessus : impossible qu'elles divergent
export const PRIORITY_OPTIONS = ["HIGH", "MEDIUM", "LOW", "NONE"].map(
    (value) => ({
        value,
        label: PRIORITY_CONFIG[value].label,
        icon: LightningIcon,
        iconColor: PRIORITY_CONFIG[value].color,
    }),
);

export const TYPE_OPTIONS = ["DEEP_WORK", "SHALLOW_WORK", "ADMINISTRATIVE"].map(
    (value) => ({
        value,
        label: TYPE_CONFIG[value].label,
        icon: TYPE_CONFIG[value].icon,
        iconColor: TYPE_CONFIG[value].color,
    }),
);

export const STATUS_LABELS = {
    TODO: "En cours",
    DONE: "Validée",
    WONT_DO: "Abandonnée",
};

// Format court "11 juin" affiché sur les boutons de date des deux formulaires
export function formatShortDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
    });
}

// Couleur de la date d'échéance selon son rapport au jour courant.
// Dépassée → rouge, aujourd'hui → indigo, future → ardoise.
// Déplacé depuis TaskItem.js : c'est une règle de présentation pure,
// au même titre que les configs de priorité/type ci-dessus.
export function dueDateColor(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) return "text-red-500 dark:text-red-400";
    if (due.getTime() === today.getTime())
        return "text-indigo-500 dark:text-indigo-400";
    return "text-slate-400 dark:text-zinc-500";
}
