import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { DomainError } from "@/core/errors/domainErrors";

export function handleApiError(error, fallbackMessage = "Erreur serveur.") {
    if (error instanceof DomainError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.httpStatus },
        );
    }

    if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    ) {
        return NextResponse.json(
            { error: "Cette ressource existe déjà." },
            { status: 409 },
        );
    }

    console.error(fallbackMessage, error);
    return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
