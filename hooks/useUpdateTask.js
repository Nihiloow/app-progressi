// ─────────────────────────────────────────────────────────────────────────
// Destination : hooks/useUpdateTask.js (REMPLACE l'existant)
// ─────────────────────────────────────────────────────────────────────────

import { useMutation, useQueryClient } from "@tanstack/react-query";

// Mise à jour des métadonnées uniquement (titre, priorité, type, échéance).
// Le statut a son propre hook : useChangeTaskStatus.
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(`/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de la mise à jour.");
            }

            return response.json();
        },
        onSuccess: () => {
            // Les métadonnées ne touchent ni l'XP ni le niveau :
            // inutile d'invalider le profil utilisateur
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}
