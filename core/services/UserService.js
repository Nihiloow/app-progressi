import { prisma } from "@/lib/prisma";
import { SelfTargetError } from "../errors/domainErrors";

// Orchestrateur métier de l'administration des comptes (exigence CDC).
// Reçoit son client DB par injection (testabilité), exposé en singleton.
//
// Deux leviers distincts sur un compte :
//   - setStatus : ACTIVE ↔ DISABLED, réversible, ne perd aucune donnée.
//   - deleteUser : hard-delete, cascade Prisma sur tasks/tags/xpEvents.
// Un admin ne peut jamais cibler son propre compte sur ces deux actions.
export class UserService {
    #db;

    constructor(db) {
        this.#db = db;
    }

    // Liste tous les comptes pour le tableau d'administration.
    // Jamais le hash du mot de passe : on sélectionne explicitement.
    async listUsers() {
        return this.#db.user.findMany({
            select: {
                id: true,
                email: true,
                pseudo: true,
                role: true,
                status: true,
                xp: true,
                level: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    // Bascule ACTIVE ↔ DISABLED. adminId sert à interdire le self-target.
    async setStatus(targetUserId, adminId, status) {
        if (targetUserId === adminId) {
            throw new SelfTargetError();
        }

        return this.#db.user.update({
            where: { id: targetUserId },
            data: { status },
            select: { id: true, status: true },
        });
    }

    // Hard-delete : cascade sur tasks, tags, xpEvents (onDelete: Cascade).
    // Irréversible : l'UI exige une confirmation explicite côté front.
    async deleteUser(targetUserId, adminId) {
        if (targetUserId === adminId) {
            throw new SelfTargetError();
        }

        await this.#db.user.delete({ where: { id: targetUserId } });
    }

    // Statistiques globales (CDC) : agrégées en base, jamais en mémoire
    // côté Node. Plusieurs requêtes parallélisées via Promise.all.
    async getGlobalStats() {
        const [
            totalUsers,
            activeUsers,
            levelAggregate,
            completedTasks,
            xpAggregate,
            topTasks,
        ] = await Promise.all([
            this.#db.user.count(),
            this.#db.user.count({ where: { status: "ACTIVE" } }),
            this.#db.user.aggregate({ _avg: { level: true } }),
            this.#db.task.count({ where: { status: "DONE" } }),
            // XP réellement distribué = somme des GAIN du ledger.
            this.#db.xpEvent.aggregate({
                where: { type: "GAIN" },
                _sum: { amount: true },
            }),
            // Top des titres de quêtes les plus fréquents (CDC). Métrique
            // faible par nature : les titres sont du texte libre par user.
            this.#db.task.groupBy({
                by: ["title"],
                _count: { title: true },
                orderBy: { _count: { title: "desc" } },
                take: 5,
            }),
        ]);

        return {
            totalUsers,
            activeUsers,
            disabledUsers: totalUsers - activeUsers,
            averageLevel:
                Math.round((levelAggregate._avg.level ?? 1) * 10) / 10,
            completedTasks,
            distributedXp: xpAggregate._sum.amount ?? 0,
            topTasks: topTasks.map((row) => ({
                title: row.title,
                count: row._count.title,
            })),
        };
    }

    // Série XP des 30 derniers jours pour le graphe d'évolution (CDC).
    // Agrégation par jour faite en base via $queryRaw (date_trunc) : on
    // renvoie une série déjà prête, le front ne fait que dessiner.
    //
    // COALESCE + génération de la grille de 30 jours garantit un point par
    // jour même sans activité (sinon le graphe aurait des trous).
    async getXpTimeline() {
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
            GROUP BY days.day
            ORDER BY days.day ASC
        `;

        // $queryRaw renvoie les Date en objets : on normalise en ISO court
        // (YYYY-MM-DD) pour un axe X stable et sérialisable en JSON.
        return rows.map((row) => ({
            date: row.date.toISOString().slice(0, 10),
            xp: row.xp,
        }));
    }
}

export const userService = new UserService(prisma);
