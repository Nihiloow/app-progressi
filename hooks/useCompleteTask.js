import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCompleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId) => {
            const response = await fetch(`/api/tasks/${taskId}/complete`, {
                method: "PUT",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de la validation");
            }

            return await response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });

            console.log(data.message);
            if (data.hasLeveledUp) {
                console.log("LEVEL UP ! Niveau " + data.user.level);
            }
        },
    });
}
