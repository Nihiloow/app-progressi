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
