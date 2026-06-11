import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hook unique des trois transitions de statut (DONE, TODO, WONT_DO) :
// une seule route, un seul hook, le serveur décide de tout (XP, quotas).
export function useChangeTaskStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ taskId, status }) => {
            const response = await fetch(`/api/tasks/${taskId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du changement de statut.",
                );
            }

            return response.json();
        },
        onSuccess: () => {
            // Le statut impacte la liste ET le profil (XP, niveau)
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}
