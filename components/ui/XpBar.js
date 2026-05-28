export default function XpBar({ currentXp, requiredXp }) {
    const safeRequiredXp = requiredXp > 0 ? requiredXp : 1; // Cas de la division par 0
    const rawPercentage = (currentXp / safeRequiredXp) * 100;
    const fillPercentage = Math.min(100, Math.max(0, rawPercentage)); // Prend le minimum entre les deux valeurs pour ne pas que la barre déborde

    return (
        <div className="w-full max-w-md mx-auto my-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium tracking-wide">
                <span>Niveau actuel : {currentXp} XP</span>
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
