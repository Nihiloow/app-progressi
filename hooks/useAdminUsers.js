import { useQuery } from "@tanstack/react-query";

export function useAdminUsers() {
    return useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const response = await fetch("/api/admin/users");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du chargement des utilisateurs.",
                );
            }

            return response.json();
        },
    });
}
