import { useMutation } from "@tanstack/react-query";

// Pas d'invalidation de queryClient ici : changer son mot de passe n'a
// d'impact sur aucune donnée affichée ailleurs dans l'app (contrairement
// à useUpdateTask par exemple) — la mutation se contente de réussir ou
// d'échouer, le formulaire appelant gère le feedback.
export function useChangePassword() {
    return useMutation({
        mutationFn: async (data) => {
            const response = await fetch("/api/user/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du changement de mot de passe.",
                );
            }

            return response.json();
        },
    });
}
