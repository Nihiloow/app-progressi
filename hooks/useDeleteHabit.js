import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (habitId) => {
            const response = await fetch(`/api/habits/${habitId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de la suppression.");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["habits"] });
        },
    });
}
