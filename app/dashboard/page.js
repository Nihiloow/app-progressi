import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateRequiredXP } from "@/utils/xpLogic";
import TaskManager from "@/components/TaskManager";

export default async function Dashboard() {
    // CORRECTION : On attend la lecture du cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get("levelup_session")?.value;

    if (!userId) {
        redirect("/login");
    }

    // 2. Récupération des statistiques du Héros
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    const tasks = await prisma.task.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    if (!user) {
        redirect("/login");
    }

    // 3. Calcul de la barre de progression
    const xpRequired = calculateRequiredXP(user.level);
    // On s'assure que le pourcentage reste entre 0 et 100
    const progressPercentage = Math.min(
        100,
        Math.max(0, (user.xp / xpRequired) * 100),
    );

    return (
        <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* EN-TÊTE : PROFIL HÉROS */}
                <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-blue-900/10 md:flex-row">
                    <div className="flex items-center gap-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-800 bg-blue-600 shadow-inner">
                            <span className="text-3xl font-bold uppercase">
                                {user.pseudo.charAt(0)}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {user.pseudo}
                            </h1>
                            <p className="font-medium text-slate-400">
                                Héros de Niveau {user.level}
                            </p>
                        </div>
                    </div>

                    {/* JAUGE D'XP */}
                    <div className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 md:w-1/2">
                        <div className="mb-2 flex justify-between text-sm font-semibold">
                            <span className="text-blue-400">Progression</span>
                            <span className="text-slate-300">
                                {user.xp} / {xpRequired} XP
                            </span>
                        </div>
                        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </section>

                {/* GESTIONNAIRE DE QUÊTES INTERACTIF */}
                <TaskManager initialTasks={tasks} />
            </div>
        </main>
    );
}
