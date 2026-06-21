import { useMutation, useQueryClient } from "@tanstack/react-query";

// Reset xp/level uniquement (cf. UserService.resetProgression — le ledger
// XpEvent n'est pas touché). Impacte la liste admin (niveau affiché) ET
// les stats globales (niveau moyen) : on invalide les deux, même pattern
// que useSetUserStatus/useDeleteUser.
export function useResetProgression() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId) => {
            const response = await fetch(
                `/api/admin/users/${userId}/reset-progression`,
                { method: "POST" },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                        "Échec de la réinitialisation de la progression.",
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
