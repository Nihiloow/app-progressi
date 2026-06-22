import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
    EmailAlreadyUsedError,
    InvalidCredentialsError,
} from "../errors/domainErrors";

// Orchestrateur métier de l'authentification. register() inscrit un nouveau
// compte ; changePassword() modifie le mot de passe d'un compte déjà
// authentifié. La connexion elle-même reste déléguée au provider NextAuth
// (lib/auth.js), qui porte sa propre logique d'authorize().
export class AuthService {
    #db;

    constructor(db) {
        this.#db = db;
    }

    // Inscrit un nouvel utilisateur. email/pseudo/password sont déjà
    // validés ET normalisés par registerSchema (email en minuscules, champs
    // trim) avant d'arriver ici — le service ne revalide rien, il applique
    // les règles métier (unicité, hash) sur des données de confiance.
    async register({ email, pseudo, password }) {
        const existingUser = await this.#db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new EmailAlreadyUsedError();
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.#db.user.create({
            data: { email, pseudo, password: hashedPassword },
        });
    }

    // Change le mot de passe d'un compte déjà authentifié. Exige et
    // vérifie le mot de passe ACTUEL avant d'accepter le nouveau — non
    // négociable : sans cette vérification, une session laissée ouverte
    // (poste partagé, appareil volé) permettrait à n'importe qui de
    // verrouiller le vrai propriétaire hors de son compte. C'est une
    // garde de sécurité, pas un choix de confort UX.
    async changePassword(userId, { currentPassword, newPassword }) {
        const user = await this.#db.user.findUnique({
            where: { id: userId },
        });

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password,
        );

        if (!passwordMatch) {
            throw new InvalidCredentialsError();
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.#db.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    // Filet anti-course : deux inscriptions simultanées avec le même email
    // passent toutes deux le check findUnique ci-dessus, mais la contrainte
    // @unique en base fait échouer la seconde (code Prisma P2002). La route
    // n'a pas à connaître ce détail Prisma : handleApiError traduit déjà
    // P2002 en 409 générique ("Cette ressource existe déjà."), donc aucun
    // traitement supplémentaire n'est nécessaire ici — ce commentaire
    // documente seulement pourquoi le check findUnique n'est pas une
    // garantie suffisante à lui seul.
}

export const authService = new AuthService(prisma);
