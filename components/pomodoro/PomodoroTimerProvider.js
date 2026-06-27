"use client";

import { createContext, useContext, useEffect } from "react";
import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import { usePomodoroSettings } from "@/hooks/usePomodoroSettings";

const PomodoroTimerContext = createContext(null);

// Défaut générique utilisé UNIQUEMENT le temps que /api/pomodoro/settings
// réponde — jamais persisté tel quel, remplacé dès que les vraies
// préférences de l'utilisateur arrivent (cf. useEffect ci-dessous).
const FALLBACK_SETTINGS = {
    workMinutes: 25,
    breakMinutes: 5,
    autoChainBreak: true,
};

// Monte usePomodoroTimer UNE SEULE FOIS, au niveau racine — le minuteur
// doit survivre à la fermeture de l'écran plein écran. Les préférences
// persistées sont chargées au montage et appliquées au hook dès qu'elles
// arrivent, en phase IDLE uniquement (changer les durées en plein
// décompte n'a pas de sens métier, cf. usePomodoroTimer).
export function PomodoroTimerProvider({ children }) {
    const timer = usePomodoroTimer(FALLBACK_SETTINGS);
    const { data: persistedSettings } = usePomodoroSettings();

    useEffect(() => {
        if (persistedSettings && timer.phase === "IDLE") {
            timer.setSettings(persistedSettings);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [persistedSettings]);

    return (
        <PomodoroTimerContext.Provider value={timer}>
            {children}
        </PomodoroTimerContext.Provider>
    );
}

export function usePomodoroTimerContext() {
    const context = useContext(PomodoroTimerContext);

    if (!context) {
        throw new Error(
            "usePomodoroTimerContext doit être utilisé dans un PomodoroTimerProvider.",
        );
    }

    return context;
}
