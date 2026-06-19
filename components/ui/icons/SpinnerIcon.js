// Spinner CSS pur (border-spin), pas un SVG : conservé comme composant pour
// rester importable depuis le barrel au même titre que les icônes, et pour
// arrêter la duplication du même bloc de classes Tailwind (MobileTaskForm…).
export const SpinnerIcon = ({ className = "h-4 w-4", ...props }) => (
    <span
        className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
        role="status"
        aria-label="Chargement"
        {...props}
    />
);
