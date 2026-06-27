import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
    "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])";

export function useFocusTrap(isActive) {
    const containerRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!isActive) return;

        previousFocusRef.current = document.activeElement;

        const focusables =
            containerRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
        focusables?.[0]?.focus();

        const handleKeyDown = (e) => {
            if (e.key !== "Tab" || !containerRef.current) return;

            const focusable = Array.from(
                containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR),
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocusRef.current?.focus?.();
        };
    }, [isActive]);

    return containerRef;
}
