import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

// Configuration NextAuth centralisée ici (et non dans la route
// [...nextauth]) : tout le code serveur peut l'importer sans dépendre
// d'un fichier route, ce qui clarifie l'architecture en couches.
export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase().trim() },
                });

                // Message identique pour "email inconnu" et "mot de passe
                // faux" : ne pas permettre d'énumérer les comptes existants
                if (!user) {
                    throw new Error("Identifiants incorrects.");
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password,
                );

                if (!passwordMatch) {
                    throw new Error("Identifiants incorrects.");
                }

                // Exigence du cahier des charges : un compte désactivé par
                // l'admin ne peut plus ouvrir de session
                if (user.status === "DISABLED") {
                    throw new Error("Ce compte a été désactivé.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    pseudo: user.pseudo,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            // 'user' n'existe qu'à la connexion : on fige l'identité dans
            // le token. Ni xp ni level ici : ce sont des données vivantes,
            // /api/user fait foi (un JWT ne se met pas à jour tout seul).
            if (user) {
                token.id = user.id;
                token.pseudo = user.pseudo;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.pseudo = token.pseudo;
                session.user.role = token.role;
            }
            return session;
        },
    },
};
