export const BanIcon = ({ className = "h-5 w-5", ...props }) => (
    <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636"
        />
    </svg>
);
