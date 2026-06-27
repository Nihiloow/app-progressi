import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useXpToast } from "@/components/feedback/XpToastProvider";

// Invalide l'historique Pomodoro ET les données utilisateur (xp/level
// changent) — même double invalidation que useChangeTaskStatus/
// useCompleteHabit pour rester cohérent avec le reste du projet : aucune
// vue affichant xp/level ne doit rester périmée après un gain.
export function useCompletePomodoroSession() {
    const queryClient = useQueryClient();
    const { showXpToast } = useXpToast();

    return useMutation({
        mutationFn: async (sessionData) => {
            const res = await fetch("/api/pomodoro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sessionData),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Erreur réseau");
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["pomodoroSessions"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
            showXpToast({
                xpGained: data.xpGained,
                hasLeveledUp: data.hasLeveledUp,
                newLevel: data.user?.level,
            });
        },
    });
}
