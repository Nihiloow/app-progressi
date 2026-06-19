"use client";

import { useState, useEffect, useRef } from "react";
import { toDateInputValue } from "@/lib/date";
import {
    CalendarIcon,
    CloseIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@/components/ui/icons";

// Noms courts des jours (lundi en premier, norme française)
const DAY_LABELS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

// Noms des mois
const MONTH_NAMES = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
];

// Renvoie les jours à afficher dans la grille du mois (includes padding
// du mois précédent pour aligner lundi=col0).
const buildGrid = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=dim
    // Décalage : lundi=0, ..., dimanche=6
    const offset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
};

// Calendrier popover sur-mesure. Remplace l'<input type="date"> natif
// (hors-thème, dépendant du navigateur).
// Props :
//   value      — "YYYY-MM-DD" ou ""
//   onChange   — (value: string) => void
//   align      — "left" | "right" (alignement du popover)
//   direction  — "down" | "up" (sens d'ouverture vertical)
export function DatePicker({
    value,
    onChange,
    align = "left",
    direction = "down",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const today = new Date();
    const todayValue = toDateInputValue(today);

    // Mois affiché dans le calendrier (indépendant de la sélection)
    const [viewYear, setViewYear] = useState(
        value ? new Date(value).getFullYear() : today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = useState(
        value ? new Date(value).getMonth() : today.getMonth(),
    );

    const containerRef = useRef(null);

    // Fermeture au clic extérieur
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("pointerdown", handler);
        return () => document.removeEventListener("pointerdown", handler);
    }, [isOpen]);

    // Fermeture sur Échap
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => e.key === "Escape" && setIsOpen(false);
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen]);

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else setViewMonth((m) => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else setViewMonth((m) => m + 1);
    };

    const handleSelect = (day) => {
        const selected = toDateInputValue(new Date(viewYear, viewMonth, day));
        onChange(selected);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
    };

    const grid = buildGrid(viewYear, viewMonth);

    // Libellé du bouton déclencheur
    const label = value
        ? new Date(value).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
          })
        : "Date";

    // Couleur du bouton selon la date
    const isOverdue = value && value < todayValue;
    const isToday = value === todayValue;
    const buttonColor = isOverdue
        ? "text-red-500 dark:text-red-400"
        : isToday
          ? "text-indigo-500 dark:text-indigo-400"
          : value
            ? "text-slate-700 dark:text-slate-200"
            : "text-slate-500 dark:text-slate-400";

    const popoverPosition =
        direction === "up" ? "bottom-full mb-2" : "top-full mt-2";
    const popoverAlign = align === "right" ? "right-0" : "left-0";

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 ${buttonColor}`}
            >
                <CalendarIcon className="h-4 w-4" />
                {label}
                {value && (
                    <span
                        onClick={handleClear}
                        role="button"
                        aria-label="Effacer la date"
                        className="ml-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <CloseIcon className="h-3 w-3" />
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute ${popoverPosition} ${popoverAlign} z-[150] w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900`}
                >
                    {/* Navigation mois */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={prevMonth}
                            aria-label="Mois précédent"
                            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            aria-label="Mois suivant"
                            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Grille */}
                    <div className="p-3">
                        {/* En-têtes jours */}
                        <div className="mb-1 grid grid-cols-7 text-center">
                            {DAY_LABELS.map((d) => (
                                <span
                                    key={d}
                                    className="text-[10px] font-semibold uppercase text-slate-400 dark:text-zinc-500"
                                >
                                    {d}
                                </span>
                            ))}
                        </div>

                        {/* Cellules */}
                        <div className="grid grid-cols-7 gap-y-1 text-center">
                            {grid.map((day, i) => {
                                if (!day) return <span key={`empty-${i}`} />;
                                const cellValue = toDateInputValue(
                                    new Date(viewYear, viewMonth, day),
                                );
                                const isSelected = cellValue === value;
                                const isTodayCell = cellValue === todayValue;

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleSelect(day)}
                                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors
                                            ${
                                                isSelected
                                                    ? "bg-indigo-500 text-white"
                                                    : isTodayCell
                                                      ? "border border-indigo-400 text-indigo-500 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                                                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-zinc-800"
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Raccourcis */}
                    <div className="flex gap-2 border-t border-slate-100 px-3 py-2 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() => {
                                onChange(todayValue);
                                setIsOpen(false);
                            }}
                            className="flex-1 rounded-md py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            Aujourd'hui
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const tomorrow = new Date(today);
                                tomorrow.setDate(today.getDate() + 1);
                                onChange(toDateInputValue(tomorrow));
                                setIsOpen(false);
                            }}
                            className="flex-1 rounded-md py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            Demain
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("");
                                    setIsOpen(false);
                                }}
                                className="flex-1 rounded-md py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                                Effacer
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
