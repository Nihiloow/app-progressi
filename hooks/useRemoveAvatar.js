import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await fetch("/api/user/avatar", {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec de la suppression de l'avatar.",
                );
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}
