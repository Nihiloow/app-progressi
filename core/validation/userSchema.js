import { z } from "zod";

// Zero Trust : toute donnée d'inscription est validée et normalisée ici,
// avant de toucher la base.
export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase() // évite les doublons Jean@mail.fr / jean@mail.fr
        .email("Adresse email invalide."),
    pseudo: z
        .string()
        .trim()
        .min(3, "Le pseudo doit faire au moins 3 caractères.")
        .max(20, "Le pseudo ne peut pas dépasser 20 caractères."),
    password: z
        .string()
        .min(8, "Le mot de passe doit faire au moins 8 caractères.")
        // bcrypt tronque silencieusement au-delà de 72 octets : on refuse
        // plutôt que de laisser croire que les caractères suivants comptent
        .max(72, "Le mot de passe ne peut pas dépasser 72 caractères."),
});

// .strict() : un champ hors schéma fait échouer la requête. La confirmation
// du nouveau mot de passe (retype) reste une responsabilité du FRONT (UX),
// le serveur n'a besoin que de la valeur finale.
export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "Le mot de passe actuel est requis."),
        newPassword: z
            .string()
            .min(8, "Le nouveau mot de passe doit faire au moins 8 caractères.")
            .max(
                72,
                "Le nouveau mot de passe ne peut pas dépasser 72 caractères.",
            ),
    })
    .strict()
    // Refus explicite si l'utilisateur retape le même mot de passe : un
    // changement qui ne change rien n'a aucun sens fonctionnel.
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Le nouveau mot de passe doit être différent de l'actuel.",
        path: ["newPassword"],
    });
