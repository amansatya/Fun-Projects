export default function Footer() {
    return (
        <footer
            className="relative z-10 mt-20 py-8 px-6 text-center"
            style={{ borderTop: "1px solid var(--color-mist)" }}
        >
            <p className="font-display italic text-sm" style={{ color: "var(--color-warm-gray)" }}>
                "The scariest moment is always just before you start."
            </p>
            <p className="text-xs mt-3 tracking-widest uppercase" style={{ color: "var(--color-warm-gray)", opacity: 0.4 }}>
                Inkwell · Built with React + Node.js
            </p>
        </footer>
    );
}