import { z } from "zod";

// Zero Trust : la route PATCH de statut n'accepte que les deux valeurs
// de l'enum AccountStatus. Tout autre payload est rejeté en 400 avant
// d'atteindre le service.
export const updateUserStatusSchema = z.object({
    status: z.enum(["ACTIVE", "DISABLED"], {
        message: "Statut invalide.",
    }),
});
