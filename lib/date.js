// Source unique de conversion date → format "YYYY-MM-DD" en heure LOCALE.
// Un simple .toISOString().slice(0,10) décalerait d'un jour selon le fuseau
// (l'ISO est en UTC) : on reconstruit donc les composantes via les
// accesseurs locaux (getFullYear/getMonth/getDate).
//
// Accepte une Date, une chaîne ISO, ou null/undefined (renvoie "" dans ce
// dernier cas) : couvre aussi bien "convertir la due date d'une tâche"
// que "valeur par défaut = aujourd'hui".
export function toDateInputValue(value) {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

// Raccourci explicite pour la valeur par défaut "aujourd'hui" d'un champ
// date — plus lisible que toDateInputValue(new Date()) à chaque appel.
export function todayAsDateInput() {
    return toDateInputValue(new Date());
}
