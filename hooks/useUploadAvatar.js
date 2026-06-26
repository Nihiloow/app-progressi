import { useMutation, useQueryClient } from "@tanstack/react-query";

// L'avatar impacte l'affichage partout où AvatarRing est rendu (Sidebar,
// MobileHeader, page Profil) — tous lisent via useUser, donc invalider
// "user" suffit à propager le changement sans logique spécifique par écran.
export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/user/avatar", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Échec du téléversement de l'avatar.",
                );
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}
