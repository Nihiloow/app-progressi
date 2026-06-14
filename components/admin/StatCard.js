// Carte de statistique du dashboard admin. Composant de présentation pur :
// reçoit un libellé et une valeur, ne sait rien de la source des données.
export function StatCard({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {value}
            </p>
        </div>
    );
}
