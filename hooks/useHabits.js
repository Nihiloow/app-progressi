import { useQuery } from "@tanstack/react-query";

export function useHabits() {
    return useQuery({
        queryKey: ["habits"],
        queryFn: async () => {
            const response = await fetch("/api/habits");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du chargement des habitudes.",
                );
            }

            return response.json();
        },
    });
}
