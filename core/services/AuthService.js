import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { EmailAlreadyUsedError } from "../errors/domainErrors";

// Orchestrateur métier de l'authentification. Pour l'instant une seule
// méthode (register) : la connexion elle-même est déléguée au provider
// NextAuth (lib/auth.js), qui porte sa propre logique d'authorize() et n'a
// pas besoin de passer par ce service.
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
