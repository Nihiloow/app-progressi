import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId) => {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de la suppression");
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}
