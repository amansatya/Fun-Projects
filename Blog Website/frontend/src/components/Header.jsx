export default function Header({ count }) {
  return (
    <header className="relative z-10 pt-14 pb-10 px-6 text-center">
      {/* Decorative rule */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="block h-px flex-1 max-w-16 bg-amber-600/30" />
        <span className="text-xs tracking-[0.35em] uppercase text-amber-700/70 font-medium">
          Est. 2024
        </span>
        <span className="block h-px flex-1 max-w-16 bg-amber-600/30" />
      </div>

      <h1 className="font-display text-6xl sm:text-7xl font-bold text-ink leading-none tracking-tight">
        Inkwell
      </h1>
      <p className="mt-3 text-warm-gray text-base tracking-wide">
        A place for stories, thoughts &amp; images
      </p>

      {count > 0 && (
        <div className="mt-5 inline-flex items-center gap-2 bg-amber-100/70 border border-amber-200 rounded-full px-4 py-1.5 text-sm text-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
          {count} {count === 1 ? "post" : "posts"} published
        </div>
      )}
    </header>
  );
}
