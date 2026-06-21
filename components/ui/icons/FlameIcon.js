export const FlameIcon = ({ className = "h-5 w-5", ...props }) => (
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
            d="M12 22c4.418 0 8-3.358 8-7.5 0-2.5-1.5-4.5-2.5-6-1 1.5-2 2-2 2 .5-3-1-6-3.5-8 .5 3-1 5-3 7-1.5 1.5-2.5 3-2.5 5C6.5 18.642 7.582 22 12 22z"
        />
    </svg>
);
