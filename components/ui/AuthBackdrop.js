import { RippleRing } from "@/components/ui/RippleRing";

// Signature visuelle des pages d'authentification : trois ondes
// concentriques qui naissent au centre et se propagent vers l'extérieur
// en boucle, décalées dans le temps — comme l'impact d'une goutte d'eau,
// jamais une seule pulsation isolée. Évoque la progression XP comme un
// PROCESSUS continu plutôt qu'un état figé, dès le premier écran de
// l'application, avant même la connexion.
//
// Zone bornée en pixels fixes (800px, contre 200vmax dans une tentative
// précédente) : animer une surface dont la taille suit le viewport force
// le navigateur à recalculer un rendu énorme à chaque frame — constaté en
// usage réel, l'effet "jusqu'au bord de l'écran" faisait ramer
// l'animation et donnait un résultat visuellement écrasant plutôt que
// subtil. 800px reste nettement plus présent que la toute première
// version (560px) sans retomber dans ce problème : la taille est un
// curseur esthétique, la fluidité est une contrainte technique non
// négociable — celle-ci prime.
//
// RippleRing porte le SVG d'un seul anneau (composant atomique séparé,
// cf. RippleRing.js) — AuthBackdrop ne fait que composer trois instances
// avec des délais différents, jamais de balisage SVG dupliqué en inline.
//
// aria-hidden + prefers-reduced-motion respecté : purement décoratif,
// jamais nécessaire à la compréhension de la page.
export function AuthBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
            <style>{`
                @keyframes auth-ripple {
                    0% {
                        transform: scale(0.3);
                        opacity: 0.5;
                        stroke-width: 3;
                    }
                    100% {
                        transform: scale(2.2);
                        opacity: 0;
                        stroke-width: 0.4;
                    }
                }
            `}</style>

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
