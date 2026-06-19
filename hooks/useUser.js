import { useQuery } from "@tanstack/react-query";

// Source unique du fetch de profil ("/api/user"), partagée par le dashboard,
// la Sidebar, le MobileHeader et le BottomNav. Avant : la même queryFn
// recopiée quatre fois — toute évolution du contrat (champ ajouté, gestion
// d'erreur) demandait quatre modifications synchronisées.
export function useUser() {
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch("/api/user");
            if (!res.ok) throw new Error("Erreur réseau");
            return res.json();
        },
    });
}
