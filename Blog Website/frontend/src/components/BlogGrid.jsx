import BlogCard from "./BlogCard";

function SkeletonCard() {
  return (
    <div className="bg-white/60 border border-mist rounded-2xl overflow-hidden">
      <div className="h-52 bg-linear-to-r from-mist via-cream to-mist
        animate-[shimmer_1.8s_infinite] bg-size-[200%_100%]" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-mist rounded-full w-full animate-pulse" />
        <div className="h-3 bg-mist rounded-full w-5/6 animate-pulse" />
        <div className="h-3 bg-mist rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-mist rounded-full w-1/2 animate-pulse" />
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
        <div className="bg-rust/10 border border-rust/20 rounded-2xl p-8">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-rust font-medium">{error}</p>
          <p className="text-warm-gray text-sm mt-1">Make sure the backend is running.</p>
        </div>
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="relative z-10 max-w-md mx-auto px-4 text-center py-12">
        <div className="bg-white/60 border border-mist rounded-2xl p-10">
          <p className="font-display text-4xl mb-3 text-mist">✦</p>
          <p className="font-display text-xl text-charcoal">The page is blank</p>
          <p className="text-warm-gray text-sm mt-2">
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
        <h2 className="font-display text-2xl text-charcoal">Latest Posts</h2>
        <span className="flex-1 h-px bg-mist" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog, i) => (
          <BlogCard key={blog.id} blog={blog} onDelete={onDelete} index={i} />
        ))}
      </div>
    </div>
  );
}
