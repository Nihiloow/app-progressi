export function RippleRing({ delay = "0s" }) {
    return (
        <circle
            cx="100"
            cy="100"
            r="40"
            stroke="currentColor"
            fill="transparent"
            className="motion-reduce:hidden animate-auth-ripple"
            style={{
                transformOrigin: "100px 100px",
                animationDelay: delay,
            }}
        />
    );
}
