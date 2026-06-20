import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UnauthenticatedError } from "@/core/errors/domainErrors";

// Garde de session minimale : vérifie qu'un utilisateur authentifié existe,
// sans re-checker de privilège particulier (c'est le rôle de requireAdmin
// pour les routes admin). Lève UnauthenticatedError (401), traduite par
// handleApiError — même pattern que requireAdmin, pour que toutes les
// routes authentifiées partagent une seule façon d'échouer.
//
// Renvoie { id, pseudo, role } tirés de la session (déjà posés dans le JWT
// par lib/auth.js) : pas de requête DB ici, contrairement à requireAdmin
// qui a besoin de fraîcheur sur role/status. Une route qui a besoin de
// données utilisateur à jour continue de les charger elle-même.
export async function requireSession() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new UnauthenticatedError();
    }

    return session.user;
}
