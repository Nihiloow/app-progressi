import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useXpToast } from "@/components/feedback/XpToastProvider";

// Valide une habitude pour aujourd'hui. Impacte habits (streak mis à jour)
// ET user (XP/niveau) — même logique d'invalidation croisée que
// useChangeTaskStatus pour les tâches.
export function useCompleteHabit() {
    const queryClient = useQueryClient();
    const { showXpToast } = useXpToast();

    return useMutation({
        mutationFn: async (habitId) => {
            const response = await fetch(`/api/habits/${habitId}/complete`, {
                method: "POST",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec de la validation de l'habitude.",
                );
            }

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["habits"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });

            // completeToday renvoie toujours xpGained (même à 0 si jamais
            // applicable), contrairement aux tâches où le quota peut
            // ramener à 0 — ici le toast s'affiche systématiquement après
            // une validation réussie, multiplicateur inclus s'il y a lieu.
            showXpToast({
                xpGained: data.xpGained,
                hasLeveledUp: data.hasLeveledUp,
                newLevel: data.user?.level,
                multiplier: data.multiplier,
            });
        },
    });
}
