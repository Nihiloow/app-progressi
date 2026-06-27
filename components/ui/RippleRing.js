export function RippleRing({ delay = "0s" }) {
    return (
        <circle
            cx="100"
            cy="100"
            r="40"
            stroke="currentColor"
            fill="transparent"
            className="motion-reduce:hidden"
            style={{
                transformOrigin: "100px 100px",
                animation: "auth-ripple 9s ease-out infinite",
                animationDelay: delay,
            }}
        />
    );
}
