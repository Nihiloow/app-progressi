export default function XpBar({ currentXp, requiredXp, level }) {
    const safeRequiredXp = requiredXp > 0 ? requiredXp : 1;
    const rawPercentage = (currentXp / safeRequiredXp) * 100;
    const fillPercentage = Math.min(100, Math.max(0, rawPercentage));

    return (
        <div className="w-full max-w-md mx-auto my-4">
            <div className="flex justify-between items-end text-sm text-gray-500 mb-2 font-medium tracking-wide">
                {/* NOUVEAU : Affichage clair du Niveau et de l'XP */}
                <span className="text-gray-800 font-bold text-base">
                    Niveau {level}{" "}
                    <span className="text-gray-400 font-normal text-sm ml-2">
                        ({currentXp} XP)
                    </span>
                </span>
                <span>Palier : {requiredXp} XP</span>
            </div>

            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 transition-all duration-1000 ease-out"
                    style={{ width: `${fillPercentage}%` }}
                ></div>
            </div>
        </div>
    );
}
