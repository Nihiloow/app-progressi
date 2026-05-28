import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTask) => {
            // newTask donne un objet type : { title: "Faire du sport", difficulty: 2 }

            const response = await fetch(`/api/tasks`, {
                method: "POST", // Erreur que j'ai faite : utiliser la méthode POST et non pas PUT
                headers: { "Content-Type": "application/json" }, // Erreur que j'ai faite : headers est au pluriel
                body: JSON.stringify(newTask),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de la création");
            }

            return await response.json();
        },
        onSuccess: () => {
            // Recharge la liste à chaque nouvelle quête
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}
