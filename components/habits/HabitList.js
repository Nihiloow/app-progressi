"use client";

import { HabitItem } from "@/components/habits/HabitItem";

export function HabitList({ habits }) {
    if (!habits || habits.length === 0) {
        return (
            <p className="mt-10 text-center text-sm text-slate-400">
                Aucune habitude pour l&apos;instant. Crée-en une pour démarrer
                ta première série.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {habits.map((habit) => (
                <HabitItem key={habit.id} habit={habit} />
            ))}
        </div>
    );
}
