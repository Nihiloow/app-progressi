import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hard-delete (cascade). Supprime tâches, tags et ledger XP du compte :
// le total d'utilisateurs et l'XP distribué du dashboard bougent.
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId) => {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de la suppression.");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });
}
