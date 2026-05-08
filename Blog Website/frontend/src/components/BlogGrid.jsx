import BlogCard from "./BlogCard";

function SkeletonCard() {
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#ffffff", border: "1px solid var(--color-mist)", boxShadow: "0 2px 12px rgba(44,35,32,0.05)" }}
        >
            <div
                className="h-52 animate-[shimmer_1.8s_infinite] bg-size-[200%_100%]"
                style={{ background: "linear-gradient(90deg, var(--color-mist), var(--color-cream), var(--color-mist))" }}
            />
            <div className="p-5 space-y-3">
                {[100, 83, 75, 50].map((w, i) => (
                    <div
                        key={i}
                        className="h-3 rounded-full animate-pulse"
                        style={{ width: `${w}%`, background: "var(--color-mist)" }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function BlogGrid({ blogs, loading, error, onDelete }) {
    if (loading) {
        return (
            <div className="relative z-10 max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative z-10 max-w-md mx-auto px-4 text-center py-12">
                <div
                    className="rounded-2xl p-8"
                    style={{ background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)" }}
                >
                    <p className="text-2xl mb-2">⚠️</p>
                    <p className="font-medium" style={{ color: "var(--color-rust)" }}>{error}</p>
                    <p className="text-sm mt-1" style={{ color: "var(--color-warm-gray)" }}>
                        Make sure the backend is running.
                    </p>
                </div>
            </div>
        );
    }

    if (!blogs.length) {
        return (
            <div className="relative z-10 max-w-md mx-auto px-4 text-center py-12">
                <div
                    className="rounded-2xl p-10"
                    style={{ background: "#ffffff", border: "1px solid var(--color-mist)", boxShadow: "0 2px 12px rgba(44,35,32,0.05)" }}
                >
                    <p className="font-display text-4xl mb-3" style={{ color: "var(--color-mist)" }}>✦</p>
                    <p className="font-display text-xl" style={{ color: "var(--color-charcoal)" }}>The page is blank</p>
                    <p className="text-sm mt-2" style={{ color: "var(--color-warm-gray)" }}>
                        Be the first to write something.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative z-10 max-w-5xl mx-auto px-4">
            {/* Section heading */}
            <div className="flex items-center gap-3 mb-6">
                <h2 className="font-display text-2xl" style={{ color: "var(--color-charcoal)" }}>Latest Posts</h2>
                <span className="flex-1 h-px" style={{ background: "var(--color-mist)" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog, i) => (
                    <BlogCard key={blog.id} blog={blog} onDelete={onDelete} index={i} />
                ))}
            </div>
        </div>
    );
}