"use client";

import { calculateRequiredXP } from "@/core/engine/progression";

// Le cercle/anneau seul, EXPORTÉ SÉPARÉMENT : c'est lui qui sert de
// déclencheur au ProfileMenu (cf. Sidebar.js) et de base à AvatarEditor
// (page Profil) — un seul composant, plusieurs compositions autour de lui.
//
// Affiche la photo (user.avatarUrl) si elle existe, sinon retombe sur
// l'initiale du pseudo — AvatarRing ne sait rien de QUI peut éditer cette
// photo (cf. AvatarEditor, page Profil uniquement) ni d'où elle vient.
export function AvatarRing({ user }) {
    const requiredXp = calculateRequiredXP(user.level);
    const safeRequiredXp = requiredXp > 0 ? requiredXp : 1;
    const fillPercentage = Math.min(
        100,
        Math.max(0, (user.xp / safeRequiredXp) * 100),
    );

    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
        circumference - (fillPercentage / 100) * circumference;

    return (
        <div className="group relative flex h-24 w-24 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-200 dark:text-zinc-800"
                />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-indigo-500 transition-all duration-1000 ease-out"
                />
            </svg>

            <div className="z-10 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm dark:bg-zinc-800">
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt={`Avatar de ${user.pseudo}`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-2xl font-bold uppercase text-indigo-500">
                        {user.pseudo.charAt(0)}
                    </span>
                )}
            </div>

            <div className="absolute -bottom-2 z-20 rounded-full border-4 border-slate-50 bg-indigo-500 px-2 py-0.5 text-xs font-bold text-white transition-all dark:border-[#18181b]">
                Lvl {user.level}
            </div>

            <div className="pointer-events-none absolute top-28 z-30 mt-1 rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-700">
                Niveau {user.level} ({user.xp} / {requiredXp} XP)
            </div>
        </div>
    );
}

// Composition complète : anneau + pseudo affiché dessous. Le pseudo n'est
// PAS dans la zone cliquable du menu (cf. Sidebar.js, qui enveloppe
// uniquement <AvatarRing> dans le ProfileMenu, pas ce composant entier) —
// reste utilisable tel quel pour un usage futur sans édition ni menu.
export default function AvatarProgress({ user }) {
    return (
        <div className="flex flex-col items-center">
            <AvatarRing user={user} />
            <span className="mt-5 font-semibold text-slate-700 dark:text-slate-200">
                {user.pseudo}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                Récompense de tag à venir...
            </span>
        </div>
    );
}
