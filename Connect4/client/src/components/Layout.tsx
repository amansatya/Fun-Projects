import { Link, Outlet, useLocation } from 'react-router';
import { Disc } from './Disc';

/** App chrome shared by every page: header + centred content column. */
export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="page-bg min-h-dvh">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5 rounded-lg text-lg font-bold tracking-tight">
          <span className="flex -space-x-2">
            <Disc player={1} className="size-6 ring-2 ring-ink-900" />
            <Disc player={2} className="size-6 ring-2 ring-ink-900" />
          </span>
          Connect 4
        </Link>
        {pathname !== '/' && (
          <Link to="/" className="text-sm text-slate-400 transition hover:text-white">
            ← Menu
          </Link>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
