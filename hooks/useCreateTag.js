import { useMutation, useQueryClient } from "@tanstack/react-query";

// Crée un tag standalone (sans l'attacher à une tâche). Alimente la liste
// du panneau ; l'application à une tâche se fait ensuite au clic.
export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await fetch("/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec de la création du tag.",
                );
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
        },
    });
}
