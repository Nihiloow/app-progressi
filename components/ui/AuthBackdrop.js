import { RippleRing } from "@/components/ui/RippleRing";

// Signature visuelle des pages d'authentification : trois ondes
// concentriques qui naissent au centre et se propagent vers l'extérieur

export function AuthBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
            <svg
                className="h-[950px] w-[950px] text-indigo-500 dark:text-indigo-400"
                viewBox="0 0 200 200"
            >
                <RippleRing delay="0s" />
                <RippleRing delay="3s" />
                <RippleRing delay="6s" />

                {/* Repli statique pour prefers-reduced-motion : un seul
                    anneau fixe et discret plutôt que rien du tout, pour
                    garder une cohérence visuelle même sans animation. */}
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="transparent"
                    opacity="0.08"
                    className="hidden motion-reduce:block"
                />
            </svg>
        </div>
    );
}
