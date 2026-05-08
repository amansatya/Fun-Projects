export default function Header({ count }) {
    return (
        <header className="relative z-10 pt-14 pb-10 px-6 text-center">
            {/* Decorative rule */}
            <div className="flex items-center justify-center gap-4 mb-6">
                <span className="block h-px flex-1 max-w-16" style={{ background: "rgba(184,92,56,0.35)" }} />
                <span
                    className="text-xs tracking-[0.4em] uppercase font-medium"
                    style={{ fontFamily: "var(--font-body)", color: "rgba(184,92,56,0.75)" }}
                >
                    Est. 2024
                </span>
                <span className="block h-px flex-1 max-w-16" style={{ background: "rgba(184,92,56,0.35)" }} />
            </div>

            <h1
                className="font-display text-6xl sm:text-7xl font-bold leading-none tracking-tight"
                style={{ color: "var(--color-ink)" }}
            >
                Ink<span style={{ color: "var(--color-amber)", fontStyle: "italic" }}>well</span>
            </h1>
            <p className="mt-3 text-sm tracking-widest uppercase" style={{ color: "var(--color-warm-gray)" }}>
                A place for stories, thoughts &amp; images
            </p>

            {count > 0 && (
                <div
                    className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
                    style={{
                        background: "rgba(184, 92, 56, 0.08)",
                        border: "1px solid rgba(184, 92, 56, 0.2)",
                        color: "var(--color-amber)",
                    }}
                >
                    <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{
                            background: "var(--color-amber)",
                            animation: "pulse-glow 2s ease-in-out infinite",
                        }}
                    />
                    {count} {count === 1 ? "post" : "posts"} published
                </div>
            )}
        </header>
    );
}