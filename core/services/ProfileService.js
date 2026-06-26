import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { extensionFromMimeType } from "@/core/validation/avatarSchema";

const AVATAR_BUCKET = "avatars";

// Orchestrateur des données affichées sur la page Profil d'un utilisateur
// sur SES PROPRES données. Distinct de UserService, qui reste scopé à
// l'administration des comptes (gérer les AUTRES utilisateurs) — mélanger
// les deux violerait la SRP que UserService porte déjà dans son
// commentaire de classe. Toute méthode ici prend un userId et ne renvoie
// jamais que les données de CET utilisateur, jamais d'agrégat global.
export class ProfileService {
    #db;

    constructor(db) {
        this.#db = db;
    }

    // Série XP des 30 derniers jours, SCOPÉE à un utilisateur — version
    // paramétrée de UserService.getXpTimeline (qui reste l'agrégat tous
    // utilisateurs pour le dashboard admin). Même requête, même structure
    // de retour : la query a juste un filtre WHERE userId en plus. Pas de
    // duplication de logique : un seul endroit connaît la mécanique
    // generate_series + COALESCE, déjà éprouvée côté admin.
    async getXpTimeline(userId) {
        const rows = await this.#db.$queryRaw`
            WITH days AS (
                SELECT generate_series(
                    date_trunc('day', now()) - interval '29 days',
                    date_trunc('day', now()),
                    interval '1 day'
                )::date AS day
            )
            SELECT
                days.day AS date,
                COALESCE(SUM(e.amount), 0)::int AS xp
            FROM days
            LEFT JOIN "XpEvent" e
                ON date_trunc('day', e."createdAt")::date = days.day
                AND e.type = 'GAIN'
                AND e."userId" = ${userId}
            GROUP BY days.day
            ORDER BY days.day ASC
        `;

        return rows.map((row) => ({
            date: row.date.toISOString().slice(0, 10),
            xp: row.xp,
        }));
    }

    // Statistiques de productivité (CDC : "tableau de bord personnalisé").
    // Périmètre volontairement simple et justifiable à l'oral : total de
    // quêtes complétées, taux de complétion, répartition par priorité.
    // Tout est calculé en base (agrégations Prisma), jamais en mémoire
    // côté Node — même discipline que UserService.getGlobalStats.
    async getProductivityStats(userId) {
        const [totalTasks, completedTasks, priorityBreakdown] =
            await Promise.all([
                this.#db.task.count({ where: { userId } }),
                this.#db.task.count({ where: { userId, status: "DONE" } }),
                this.#db.task.groupBy({
                    by: ["priority"],
                    where: { userId, status: "DONE" },
                    _count: { priority: true },
                }),
            ]);

        // Taux de complétion sur l'ENSEMBLE des quêtes créées (DONE +
        // WONT_DO + TODO), pas seulement DONE/WONT_DO : une tâche encore
        // TODO de longue date doit faire baisser le taux affiché, pas
        // disparaître du calcul — sinon le taux serait artificiellement
        // optimiste pour quelqu'un qui laisse traîner beaucoup de TODO.
        const completionRate =
            totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);

        return {
            totalTasks,
            completedTasks,
            completionRate,
            priorityBreakdown: priorityBreakdown.map((row) => ({
                priority: row.priority,
                count: row._count.priority,
            })),
        };
    }

    // Historique des meilleures séries (CDC). bestStreak existe déjà par
    // habitude (cache maintenu par HabitService.completeToday) : pas de
    // nouvelle table, juste un tri par bestStreak décroissant. isArchived
    // exclu : une habitude archivée n'a plus sa place dans un "historique
    // des meilleures séries" actif, même si son record reste en base.
    async getBestStreaks(userId) {
        return this.#db.habit.findMany({
            where: { userId, isArchived: false },
            orderBy: { bestStreak: "desc" },
            select: {
                id: true,
                title: true,
                bestStreak: true,
                currentStreak: true,
            },
        });
    }

    // Remplace l'avatar de l'utilisateur. Stratégie "purge puis pose"
    // plutôt qu'un upsert sur un chemin fixe : on liste et supprime
    // D'ABORD tout fichier existant sous le préfixe userId/, puis on
    // uploade le nouveau. Ça évite les fichiers orphelins si l'extension
    // change entre deux uploads (ex: un .jpg remplacé par un .png).
    //
    // Le détail réel d'une erreur Supabase est désormais loggé ici
    // (console.error), visible dans le terminal serveur — le client ne
    // reçoit toujours qu'un message générique via handleApiError, cohérent
    // avec le traitement des autres erreurs d'infrastructure du projet
    // (ex: P2002 Prisma) : on ne change pas la politique de sécurité,
    // on rend juste le diagnostic possible côté développeur.
    async uploadAvatar(userId, buffer, mimeType) {
        await this.#clearExistingAvatarFiles(userId);

        const extension = extensionFromMimeType(mimeType);
        const path = `${userId}/avatar.${extension}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from(AVATAR_BUCKET)
            .upload(path, buffer, { contentType: mimeType, upsert: true });

        if (uploadError) {
            console.error(
                "[ProfileService.uploadAvatar] Échec Supabase Storage :",
                uploadError,
            );
            throw new Error(
                `Échec du téléversement de l'avatar : ${uploadError.message}`,
            );
        }

        const { data: publicUrlData } = supabaseAdmin.storage
            .from(AVATAR_BUCKET)
            .getPublicUrl(path);

        // Cache-busting : le chemin peut rester identique entre deux
        // uploads (même extension réutilisée) — un navigateur garderait
        // alors l'ancienne image en cache sous la même URL. Le timestamp
        // en query string force un rechargement réel à chaque changement.
        const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

        return this.#db.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: { avatarUrl: true },
        });
    }

    // Supprime l'avatar et revient à l'initiale par défaut (avatarUrl:
    // null) — symétrique à uploadAvatar, même nettoyage de stockage.
    async removeAvatar(userId) {
        await this.#clearExistingAvatarFiles(userId);

        return this.#db.user.update({
            where: { id: userId },
            data: { avatarUrl: null },
            select: { avatarUrl: true },
        });
    }

    // ─── Méthode privée ───────────────────────────────────────────────────

    // Liste et supprime tout fichier existant sous le préfixe userId/ dans
    // le bucket — appelé avant un nouvel upload ET avant une suppression,
    // pour ne jamais laisser de fichier orphelin dans Supabase Storage.
    // Reste "best-effort" volontairement : si lister/supprimer échoue (ex:
    // bucket inexistant), on logge et on continue plutôt que de bloquer —
    // l'upload qui suit échouera de toute façon avec un message clair si
    // le bucket n'existe vraiment pas, pas besoin de dupliquer l'erreur ici.
    async #clearExistingAvatarFiles(userId) {
        const { data: existingFiles, error: listError } =
            await supabaseAdmin.storage.from(AVATAR_BUCKET).list(userId);

        if (listError) {
            console.error(
                "[ProfileService.#clearExistingAvatarFiles] Échec du listing :",
                listError,
            );
            return;
        }

        if (!existingFiles || existingFiles.length === 0) return;

        const paths = existingFiles.map((file) => `${userId}/${file.name}`);
        const { error: removeError } = await supabaseAdmin.storage
            .from(AVATAR_BUCKET)
            .remove(paths);

        if (removeError) {
            console.error(
                "[ProfileService.#clearExistingAvatarFiles] Échec de la suppression :",
                removeError,
            );
        }
    }
}

export const profileService = new ProfileService(prisma);
