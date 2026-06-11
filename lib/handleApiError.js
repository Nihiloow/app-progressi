import { NextResponse } from "next/server";
import { DomainError } from "@/core/errors/domainErrors";

// Traducteur unique erreur → réponse HTTP, appelé dans le catch de chaque
// route. Les erreurs métier portent leur propre code ; tout le reste est un
// 500 anonyme : on logge le détail côté serveur mais on ne fuite jamais les
// entrailles de l'application au client.
export function handleApiError(error, fallbackMessage = "Erreur serveur.") {
    if (error instanceof DomainError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.httpStatus },
        );
    }

    console.error(fallbackMessage, error);
    return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
