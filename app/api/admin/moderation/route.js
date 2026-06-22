import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { moderationService } from "@/core/services/ModerationService";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        await requireAdmin();

        const flags = await moderationService.listFlags();

        return NextResponse.json(flags, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération des signalements.",
        );
    }
}
