import { useMutation, useQueryClient } from "@tanstack/react-query";

// Renomme et/ou recolore un tag. Touche potentiellement plusieurs tâches
// (le tag est partagé), donc on invalide tasks ET tags.
export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(`/api/tags/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec de la mise à jour du tag.",
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
