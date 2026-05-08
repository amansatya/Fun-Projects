import { useState } from "react";

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlogCard({ blog, onDelete, index }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    try {
      await onDelete(blog.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
      <article
          className="blog-card backdrop-blur-sm rounded-2xl overflow-hidden animate-fade-up flex flex-col"
          style={{
            background: "#ffffff",
            border: "1px solid var(--color-mist)",
            boxShadow: "0 2px 16px rgba(44, 35, 32, 0.07)",
            animationDelay: `${index * 80}ms`,
          }}
      >
        {/* Image */}
        {blog.imageURL ? (
            <div className="relative overflow-hidden shrink-0" style={{ height: "12rem", background: "var(--color-cream)" }}>
              {!imgLoaded && (
                  <div
                      className="absolute inset-0 animate-[shimmer_1.8s_infinite] bg-size-[200%_100%]"
                      style={{
                        background: "linear-gradient(90deg, var(--color-mist), var(--color-cream), var(--color-mist))",
                        backgroundSize: "200% 100%",
                      }}
                  />
              )}
              <img
                  src={blog.imageURL}
                  alt={blog.title || "Blog cover"}
                  onLoad={() => setImgLoaded(true)}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              />
            </div>
        ) : (
            /* Slim decorative top bar */
            <div
                className="shrink-0"
                style={{
                  height: "3px",
                  background: "linear-gradient(90deg, var(--color-amber), var(--color-amber-light), transparent)",
                }}
            />
        )}

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">

          {/* Title + timestamp */}
          <div className="mb-2">
            <h3
                className="font-display text-lg font-semibold leading-snug line-clamp-2"
                style={{ color: "var(--color-ink)" }}
            >
              {blog.title || "Untitled"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-warm-gray)", opacity: 0.8 }}>
              {timeAgo(blog.createdAt)}
            </p>
          </div>

          {/* Divider */}
          <div className="w-8 h-px mb-3" style={{ background: "var(--color-amber)", opacity: 0.5 }} />

          {/* Body text */}
          <p className="text-sm leading-relaxed line-clamp-3 flex-1" style={{ color: "var(--color-charcoal)" }}>
            {blog.text}
          </p>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-warm-gray)" }}>
              <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(184, 92, 56, 0.1)", border: "1px solid rgba(184, 92, 56, 0.2)" }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--color-amber)" }}>
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <span>Author</span>
            </div>

            <button
                onClick={handleDelete}
                disabled={deleting}
                onBlur={() => !deleting && setConfirming(false)}
                className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-50"
                style={
                  confirming
                      ? { background: "var(--color-rust)", color: "#fff" }
                      : {
                        background: "var(--color-mist)",
                        color: "var(--color-warm-gray)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!confirming) {
                    e.currentTarget.style.background = "rgba(192, 57, 43, 0.1)";
                    e.currentTarget.style.color = "var(--color-rust)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!confirming) {
                    e.currentTarget.style.background = "var(--color-mist)";
                    e.currentTarget.style.color = "var(--color-warm-gray)";
                  }
                }}
            >
              {deleting ? "Deleting…" : confirming ? "Confirm delete?" : "Delete"}
            </button>
          </div>
        </div>
      </article>
  );
}