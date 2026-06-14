import { useQuery } from "@tanstack/react-query";

export function useAdminStats() {
    return useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const response = await fetch("/api/admin/stats");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du chargement des statistiques.",
                );
            }

            return response.json();
        },
    });
}
