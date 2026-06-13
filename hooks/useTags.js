import { useQuery } from "@tanstack/react-query";

// Liste les tags de l'utilisateur. Sert à l'autocomplétion de la saisie
// libre : on suggère les tags existants pendant la frappe, mais l'utilisateur
// reste libre d'en taper un nouveau (créé à la volée côté serveur).
export function useTags() {
    return useQuery({
        queryKey: ["tags"],
        queryFn: async () => {
            const response = await fetch("/api/tags");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du chargement des tags.",
                );
            }

            return response.json();
        },
    });
}
