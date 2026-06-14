import { useMutation, useQueryClient } from "@tanstack/react-query";

// Bascule ACTIVE ↔ DISABLED. Le statut impacte la liste admin ET le
// compteur ACTIVE/DISABLED du dashboard : on invalide les deux.
export function useSetUserStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, status }) => {
            const response = await fetch(`/api/admin/users/${userId}`, {
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
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });
}
