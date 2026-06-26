import { useQuery } from "@tanstack/react-query";

export function usePomodoroHistory() {
    return useQuery({
        queryKey: ["pomodoroSessions"],
        queryFn: async () => {
            const res = await fetch("/api/pomodoro");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });
}
