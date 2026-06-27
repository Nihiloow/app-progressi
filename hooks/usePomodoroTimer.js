"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useCompletePomodoroSession } from "@/hooks/useCompletePomodoroSession";

const TICK_MS = 1000;

// État et logique du minuteur Pomodoro — entièrement CLIENT, jamais
// persisté tant que la session tourne. Un cycle WORK+BREAK = une
// PomodoroSession en base : la fin naturelle de la phase WORK (avant de
// basculer en BREAK) ET un arrêt manuel en cours de WORK déclenchent tous
// les deux l'écriture, avec le temps réellement travaillé. La phase
// BREAK elle-même n'enregistre jamais rien. phase démarre à "IDLE" (pas
// "WORK") : c'est start() qui fait la transition explicite IDLE → WORK,
// ce qui permet à l'UI (PomodoroControls) de distinguer "jamais démarré"
// de "cycle WORK en cours" sur le seul critère phase === "IDLE".
export function usePomodoroTimer(defaultSettings) {
    const [settings, setSettings] = useState(defaultSettings);
    const [phase, setPhase] = useState("IDLE"); // "IDLE" | "WORK" | "BREAK"
    const [secondsLeft, setSecondsLeft] = useState(
        defaultSettings.workMinutes * 60,
    );
    const [taskId, setTaskId] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const workedSecondsRef = useRef(0);
    const startedAtRef = useRef(null);
    const intervalRef = useRef(null);
    const taskIdRef = useRef(null);
    useEffect(() => {
        taskIdRef.current = taskId;
    }, [taskId]);

    const completeSession = useCompletePomodoroSession();

    const stopTicking = useCallback(() => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
    }, []);

    useEffect(() => stopTicking, [stopTicking]);

    useEffect(() => {
        if (phase === "IDLE") {
            setSecondsLeft(settings.workMinutes * 60);
        }
    }, [phase, settings.workMinutes]);

    const persistWorkCycle = useCallback(() => {
        if (workedSecondsRef.current === 0 || !startedAtRef.current) return;

        completeSession.mutate({
            workMinutes: settings.workMinutes,
            breakMinutes: settings.breakMinutes,
            autoChainBreak: settings.autoChainBreak,
            actualWorkSeconds: workedSecondsRef.current,
            startedAt: startedAtRef.current,
            taskId: taskIdRef.current,
        });

        workedSecondsRef.current = 0;
        startedAtRef.current = null;
    }, [completeSession, settings]);

    const tick = useCallback(() => {
        setSecondsLeft((prev) => {
            if (prev <= 1) {
                handlePhaseEnd();
                return 0;
            }
            if (phase === "WORK") workedSecondsRef.current += 1;
            return prev - 1;
        });
    }, [phase]);

    // Démarre un NOUVEAU cycle (depuis IDLE) ou reprend un cycle en pause
    // (WORK ou BREAK déjà engagé). La transition IDLE → WORK est explicite
    // ici : c'est elle qui fait passer PomodoroControls de "Démarrer" aux
    // boutons Pause/Fin empilés.
    const start = useCallback(() => {
        if (phase === "IDLE") {
            setPhase("WORK");
            setSecondsLeft(settings.workMinutes * 60);
        }
        if (!startedAtRef.current) {
            startedAtRef.current = new Date().toISOString();
        }
        setIsRunning(true);
        intervalRef.current = setInterval(tick, TICK_MS);
    }, [phase, tick, settings.workMinutes]);

    const pause = useCallback(() => {
        stopTicking();
    }, [stopTicking]);

    const handlePhaseEnd = useCallback(() => {
        stopTicking();

        if (phase === "WORK") {
            persistWorkCycle();
            setPhase("BREAK");
            setSecondsLeft(settings.breakMinutes * 60);
            if (settings.autoChainBreak) setTimeout(start, 0);
            return;
        }

        if (settings.autoChainBreak) {
            setPhase("WORK");
            setSecondsLeft(settings.workMinutes * 60);
            setTimeout(start, 0);
        } else {
            setPhase("IDLE");
        }
    }, [phase, settings, start, persistWorkCycle]);

    const skipPhase = useCallback(() => {
        handlePhaseEnd();
    }, [handlePhaseEnd]);

    const stop = useCallback(() => {
        stopTicking();
        if (phase === "WORK") persistWorkCycle();
        setPhase("IDLE");
    }, [phase, stopTicking, persistWorkCycle]);

    const reset = useCallback(() => {
        stopTicking();
        setPhase("IDLE");
        setSecondsLeft(settings.workMinutes * 60);
        workedSecondsRef.current = 0;
        startedAtRef.current = null;
    }, [settings.workMinutes, stopTicking]);

    return {
        settings,
        setSettings,
        phase,
        secondsLeft,
        isRunning,
        taskId,
        setTaskId,
        start,
        pause,
        skipPhase,
        stop,
        reset,
        isSaving: completeSession.isPending,
        saveError: completeSession.error,
    };
}
