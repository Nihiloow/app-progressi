import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ForbiddenError } from "@/core/errors/domainErrors";

// Garde d'autorisation admin : seule porte d'entrée des routes /api/admin.
// Le rôle transite dans le JWT, mais un token est figé à la connexion :
// on re-vérifie role ET status en base à chaque appel pour qu'une
// rétrogradation ou une désactivation prenne effet immédiatement, sans
// attendre l'expiration du token.
//
// Lève ForbiddenError (403) traduite par handleApiError. Renvoie l'admin
// chargé pour que la route dispose de son id (ex : exclusion self-target).

export async function requireAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new ForbiddenError();
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, status: true },
    });

    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
        throw new ForbiddenError();
    }

    return user;
}
