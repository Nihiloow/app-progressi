import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { userService } from "@/core/services/UserService";
import { handleApiError } from "@/lib/handleApiError";

export async function GET() {
    try {
        await requireAdmin();

        const users = await userService.listUsers();

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return handleApiError(
            error,
            "Erreur lors de la récupération des utilisateurs.",
        );
    }
}
