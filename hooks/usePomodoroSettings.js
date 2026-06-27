import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Lecture/écriture des préférences Pomodoro persistées. Distinct de
// useCompletePomodoroSession (qui gère les sessions terminées) — même
// séparation de responsabilité que côté service/route.
export function usePomodoroSettings() {
    return useQuery({
        queryKey: ["pomodoroSettings"],
        queryFn: async () => {
            const res = await fetch("/api/pomodoro/settings");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });
}

export function useUpdatePomodoroSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings) => {
            const res = await fetch("/api/pomodoro/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Erreur réseau");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pomodoroSettings"] });
        },
    });
}
