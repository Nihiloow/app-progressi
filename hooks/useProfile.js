import { useQuery } from "@tanstack/react-query";

export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await fetch("/api/user/profile");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du chargement du profil.",
                );
            }

            return response.json();
        },
    });
}
