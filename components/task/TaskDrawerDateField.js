"use client";

import { useState } from "react";
import { toDateInputValue } from "@/lib/date";
import {
    CalendarIcon,
    CloseIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@/components/ui/icons";

const DAY_LABELS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
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

const buildGrid = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
};

// Version INLINE du calendrier, même logique que DatePicker (grille de
// jours, navigation mois, raccourcis Aujourd'hui/Demain/Effacer) mais SANS
// bouton déclencheur ni popover — le calendrier est affiché directement
// dans le flux du tiroir. DatePicker reste tel quel pour ses usages
// existants (TaskForm, TaskContextMenu desktop) ; celui-ci est dédié au
// contexte "déjà dans un panneau dédié", où un second niveau de popover
// n'a pas de sens.
export function TaskDrawerDateField({ value, onChange }) {
    const today = new Date();
    const todayValue = toDateInputValue(today);

    const [viewYear, setViewYear] = useState(
        value ? new Date(value).getFullYear() : today.getFullYear(),
    );
    const [viewMonth, setViewMonth] = useState(
        value ? new Date(value).getMonth() : today.getMonth(),
    );

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
        onChange(toDateInputValue(new Date(viewYear, viewMonth, day)));
    };

    const grid = buildGrid(viewYear, viewMonth);

    return (
        <section>
            <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Date d&apos;échéance
                </h3>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                    >
                        <CloseIcon className="h-3 w-3" />
                        Effacer
                    </button>
                )}
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={prevMonth}
                        aria-label="Mois précédent"
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-3">
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
                                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                        isSelected
                                            ? "bg-indigo-500 text-white"
                                            : isTodayCell
                                              ? "border border-indigo-400 text-indigo-500 dark:text-indigo-400"
                                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-zinc-800"
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-2 border-t border-slate-100 px-3 py-2 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => onChange(todayValue)}
                        className="flex-1 rounded-md py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Aujourd&apos;hui
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const tomorrow = new Date(today);
                            tomorrow.setDate(today.getDate() + 1);
                            onChange(toDateInputValue(tomorrow));
                        }}
                        className="flex-1 rounded-md py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Demain
                    </button>
                </div>
            </div>
        </section>
    );
}
