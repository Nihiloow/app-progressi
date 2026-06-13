import { prisma } from "@/lib/prisma";
import { TagNotFoundError } from "../errors/domainErrors";

// Orchestrateur métier des tags : find-or-create, liaison tâche↔tag,
// et CRUD autonome. Reçoit son client DB par injection (testabilité).
// Règle d'ownership : un tag n'est jamais accessible hors de son userId.
export class TagService {
    #db;

    constructor(db) {
        this.#db = db;
    }

    // Liste tous les tags de l'utilisateur, triés alphabétiquement.
    async list(userId) {
        return this.#db.tag.findMany({
            where: { userId },
            orderBy: { name: "asc" },
        });
    }

    // Crée un tag standalone (CRUD autonome depuis /api/tags).
    // La contrainte @@unique([name, userId]) en base rejette les doublons :
    // Prisma lève une P2002, traduite en 409 par handleApiError.
    async create(userId, data) {
        return this.#db.tag.create({
            data: { ...data, userId },
        });
    }

    // Met à jour nom et/ou couleur d'un tag autonome.
    async update(tagId, userId, data) {
        await this.#getOwnedTag(tagId, userId);

        return this.#db.tag.update({
            where: { id: tagId },
            data,
        });
    }

    // Supprime un tag : la table de jonction _TagToTask est en CASCADE,
    // donc le tag se détache proprement de toutes ses tâches sans les supprimer.
    async remove(tagId, userId) {
        await this.#getOwnedTag(tagId, userId);
        await this.#db.tag.delete({ where: { id: tagId } });
    }

    // Point d'entrée appelé par les routes POST/PATCH des tâches.
    // Reçoit une transaction active (tx) pour rester atomique avec
    // l'écriture de la tâche parente.
    //
    // Pour chaque nom : upsert sur (name, userId) → id récupéré.
    // Puis set() sur la tâche : remplace la liste complète des tags liés.
    // set([]) détache tout. Appelé uniquement si tags !== undefined.
    async syncTagsForTask(tx, userId, taskId, tagNames) {
        const tags = await Promise.all(
            tagNames.map((name) =>
                tx.tag.upsert({
                    where: { name_userId: { name, userId } },
                    create: { name, userId },
                    update: {},
                }),
            ),
        );

        await tx.task.update({
            where: { id: taskId },
            data: {
                tags: { set: tags.map((t) => ({ id: t.id })) },
            },
        });
    }

    // ─── Méthodes privées ─────────────────────────────────────────────────

    async #getOwnedTag(tagId, userId) {
        const tag = await this.#db.tag.findUnique({ where: { id: tagId } });

        if (!tag || tag.userId !== userId) {
            throw new TagNotFoundError();
        }

        return tag;
    }
}

export const tagService = new TagService(prisma);
