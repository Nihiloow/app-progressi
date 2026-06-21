"use client";

import { useXpToast } from "@/components/feedback/XpToastProvider";
import { LightningIcon, FlameIcon } from "@/components/ui/icons";

// Rendu pur du toast actif, lu depuis le Context. Monté une fois dans
// Providers.js, au-dessus de tout le reste de l'app — un seul point
// d'affichage, peu importe l'écran où le gain a eu lieu.
//
// Quatre variantes d'un même composant plutôt que quatre composants
// séparés (DRY) : la structure (icône + titre + détail) est identique,
// seules les couleurs et le texte changent selon le cas reçu du serveur.
export function XpToast() {
    const { toast } = useXpToast();

    if (!toast) return null;

    const { xpGained, hasLeveledUp, multiplier, newLevel, key } = toast;
    const isQuotaReached = xpGained === 0;
    const hasMultiplier = multiplier && multiplier > 1;

    // Détermine la palette : le level up prime sur tout le reste (c'est
    // l'événement le plus marquant), puis le gain normal, puis le cas
    // neutre du quota dépassé — qui ne doit PAS porter de couleur dorée,
    // pour rester honnête sur l'absence réelle de gain.
    const palette = hasLeveledUp
        ? "border-amber-400 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
        : isQuotaReached
          ? "border-slate-300 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900"
          : "border-indigo-400 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10";

    const iconColor = hasLeveledUp
        ? "text-amber-500"
        : isQuotaReached
          ? "text-slate-400 dark:text-zinc-500"
          : "text-indigo-500 dark:text-indigo-400";

    return (
        <div
            key={key}
            role="status"
            aria-live="polite"
            className={`pointer-events-none fixed left-1/2 top-6 z-[200] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border p-4 shadow-lg animate-in fade-in slide-in-from-top-2 ${palette}`}
        >
            <div className="flex items-center gap-3">
                <LightningIcon
                    className={`h-6 w-6 flex-shrink-0 ${iconColor}`}
                />

                <div className="flex-1">
                    {hasLeveledUp ? (
                        <>
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                                Niveau {newLevel} atteint !
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                +{xpGained} XP
                            </p>
                        </>
                    ) : isQuotaReached ? (
                        <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
                            Quête accomplie — quota journalier atteint (0 XP)
                        </p>
                    ) : (
                        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                            +{xpGained} XP
                        </p>
                    )}

                    {hasMultiplier && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <FlameIcon className="h-3.5 w-3.5" />
                            Streak ×{multiplier}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
