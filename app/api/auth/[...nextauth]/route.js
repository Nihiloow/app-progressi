import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

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
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("Identifiants incorrects.");
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password,
                );

                if (!passwordMatch) {
                    throw new Error("Identifiants incorrects."); // On ne laisse aucun indice pour un potentiel pirate
                }

                return {
                    id: user.id,
                    email: user.email,
                    pseudo: user.pseudo,
                    level: user.level,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt", // JSON Web Tokens pour la session
    },
    pages: {
        signIn: "/login", // On indique à NextAuth d'utiliser la page de login custom
    },
};

const handler = NextAuth(authOptions);

// Next.js App Router demande d'exporter GET et POST
export { handler as GET, handler as POST };
