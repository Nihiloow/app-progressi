import { useMutation, useQueryClient } from "@tanstack/react-query";

// Supprime un tag. La jonction _TagToTask étant en CASCADE, le tag se
// détache de toutes ses tâches sans les supprimer — d'où l'invalidation
// de tasks en plus de tags.
export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tagId) => {
            const response = await fetch(`/api/tags/${tagId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec de la suppression du tag.",
                );
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}
