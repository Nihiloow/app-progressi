"use client";

// à remplacer par des icônes SVG légères (comme Lucide React ou Heroicons).
export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white pb-safe dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex h-16 items-center justify-around px-2 sm:px-4">
                {/* Bouton Quêtes (Actif) */}
                <button className="flex flex-col items-center justify-center gap-1 text-indigo-500 transition-transform active:scale-95 dark:text-indigo-400">
                    <span className="text-xl">📋</span>
                    <span className="text-[10px] font-semibold">Tâches</span>
                </button>

                {/* Bouton Calendrier */}
                <button className="flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300">
                    <span className="text-xl">📅</span>
                    <span className="text-[10px] font-medium">Icône 2</span>
                </button>

                {/* Espace vide central pour laisser respirer l'interface (et préparer le futur bouton + flottant) */}
                <div className="w-12"></div>

                {/* Bouton Focus (Deep Work) */}
                <button className="flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300">
                    <span className="text-xl">🎯</span>
                    <span className="text-[10px] font-medium">Icône 3</span>
                </button>

                {/* Bouton Matrice/Étiquettes */}
                <button className="flex flex-col items-center justify-center gap-1 text-slate-400 transition-transform hover:text-slate-600 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300">
                    <span className="text-xl">🏷️</span>
                    <span className="text-[10px] font-medium">Icône 4</span>
                </button>
            </div>
        </nav>
    );
}
