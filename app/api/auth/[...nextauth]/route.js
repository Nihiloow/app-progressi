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
                    throw new Error("Identifiants incorrects.");
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
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    // ordonne à NextAuth de conserver nos données custom
    callbacks: {
        async jwt({ token, user }) {
            // si 'user' existe (juste après la connexion), on injecte ses données dans le Token
            if (user) {
                token.id = user.id;
                token.pseudo = user.pseudo;
                token.level = user.level;
            }
            return token;
        },
        async session({ session, token }) {
            // transfère les données du Token vers l'objet 'session' utilisé dans le code
            if (token) {
                session.user.id = token.id;
                session.user.pseudo = token.pseudo;
                session.user.level = token.level;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
