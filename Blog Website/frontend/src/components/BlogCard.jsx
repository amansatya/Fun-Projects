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
      className="blog-card bg-white/80 backdrop-blur-sm border border-mist rounded-2xl overflow-hidden
        shadow-sm hover:shadow-md animate-fade-up flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image — only if present */}
      {blog.imageURL ? (
        <div className="relative overflow-hidden bg-cream h-48 shrink-0">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-linear-to-r from-mist via-cream to-mist
              animate-[shimmer_1.8s_infinite] bg-size-[200%_100%]" />
          )}
          <img
            src={blog.imageURL}
            alt={blog.title || "Blog cover"}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500
              ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      ) : (
        /* No image — slim decorative top bar */
        <div className="h-2 bg-linear-to-r from-amber/40 via-amber/20 to-transparent shrink-0" />
      )}

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">

        {/* Title + timestamp */}
        <div className="mb-2">
          <h3 className="font-display text-lg font-semibold text-ink leading-snug line-clamp-2">
            {blog.title || "Untitled"}
          </h3>
          <p className="text-xs text-warm-gray/70 mt-0.5">{timeAgo(blog.createdAt)}</p>
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-amber/40 mb-3" />

        {/* Body text */}
        <p className="text-ink/80 text-sm leading-relaxed line-clamp-3 flex-1">
          {blog.text}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-warm-gray text-xs">
            <div className="w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <span>Author</span>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            onBlur={() => !deleting && setConfirming(false)}
            className={`cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150
              active:scale-95 disabled:opacity-50
              ${confirming
                ? "bg-rust text-white"
                : "bg-mist text-warm-gray hover:bg-rust/10 hover:text-rust"
              }`}
          >
            {deleting ? "Deleting…" : confirming ? "Confirm delete?" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
