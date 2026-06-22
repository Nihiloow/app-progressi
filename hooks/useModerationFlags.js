import { useQuery } from "@tanstack/react-query";

export function useModerationFlags() {
    return useQuery({
        queryKey: ["moderation-flags"],
        queryFn: async () => {
            const response = await fetch("/api/admin/moderation");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du chargement des signalements.",
                );
            }

            return response.json();
        },
    });
}
