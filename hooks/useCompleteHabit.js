import { useMutation, useQueryClient } from "@tanstack/react-query";

// Valide une habitude pour aujourd'hui. Impacte habits (streak mis à jour)
// ET user (XP/niveau) — même logique d'invalidation croisée que
// useChangeTaskStatus pour les tâches.
export function useCompleteHabit() {
    const queryClient = useQueryClient();

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["habits"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}
