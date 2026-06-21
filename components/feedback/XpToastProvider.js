"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
} from "react";

const XpToastContext = createContext(null);

// Durée d'affichage avant disparition automatique. Volontairement plus
// long qu'un toast de confirmation générique : le joueur doit avoir le
// temps de lire le montant ET le multiplicateur, pas juste percevoir un
// flash.
const TOAST_DURATION_MS = 3500;

// Provider unique, monté une fois dans Providers.js. Pas de queue : un
// nouveau toast remplace l'actif s'il y en a déjà un (cf. rationale dans
// la conversation — deux gains à la même milliseconde n'arrivent pas en
// usage réel, une queue serait de la complexité non justifiée — YAGNI).
export function XpToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const timerRef = useRef(null);

    const showXpToast = useCallback((payload) => {
        clearTimeout(timerRef.current);
        // Une clé change à chaque appel : permet au composant visuel de
        // rejouer son animation d'entrée même si le contenu est identique
        // à l'appel précédent (ex: deux quotas dépassés à la suite).
        setToast({ ...payload, key: Date.now() });

        timerRef.current = setTimeout(() => {
            setToast(null);
        }, TOAST_DURATION_MS);
    }, []);

    return (
        <XpToastContext.Provider value={{ toast, showXpToast }}>
            {children}
        </XpToastContext.Provider>
    );
}

// Hook de consommation. Throw explicite si utilisé hors Provider : mieux
// vaut un crash net au développement qu'un toast qui ne s'affiche jamais
// silencieusement.
export function useXpToast() {
    const context = useContext(XpToastContext);

    if (!context) {
        throw new Error(
            "useXpToast doit être utilisé dans un XpToastProvider.",
        );
    }

    return context;
}
