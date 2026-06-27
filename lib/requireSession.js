import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
    UnauthenticatedError,
    AccountDisabledError,
} from "@/core/errors/domainErrors";

// Garde de session : vérifie qu'un utilisateur authentifié existe ET que
// son compte est toujours actif. Le JWT est figé à la connexion (pas de
// xp/level/status à jour dedans, voir lib/auth.js) — si un admin désactive
// un compte en cours de session, son token reste valide jusqu'à expiration
// sans cette re-vérification : une désactivation n'aurait alors aucun
// effet réel tant que le token n'a pas expiré.
//
// Même pattern que requireAdmin (qui re-vérifie role ET status) : ici on
// ne vérifie que status, puisqu'aucun privilège particulier n'est requis
// pour les routes utilisateur standard.
//
// Lève UnauthenticatedError (401) si la session est absente, ou
// AccountDisabledError (403) si le compte existe mais est désactivé —
// traduites par handleApiError, même canal que requireAdmin.

export async function requireSession() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new UnauthenticatedError();
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, pseudo: true, role: true, status: true },
    });

    if (!user) {
        throw new UnauthenticatedError();
    }

    if (user.status === "DISABLED") {
        throw new AccountDisabledError();
    }

    return user;
}
