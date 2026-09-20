import type { StatusInfo } from '../lib/status';
import { Disc } from './Disc';

/** Big headline above the board: whose turn it is, who won, or a draw. */
export function StatusBanner({ status }: { status: StatusInfo }) {
  const isResult = status.tone !== 'turn';

  return (
    <div
      role="status"
      aria-live="polite"
      // Re-keying on the text replays the entrance animation each time it changes.
      key={status.text}
      className={
        'flex min-h-12 items-center justify-center gap-3 rounded-full px-5 py-2 motion-safe:animate-rise ' +
        (isResult ? 'bg-white/10 text-xl font-bold ring-1 ring-white/20' : 'text-lg font-semibold')
      }
    >
      {status.player && <Disc player={status.player} className="size-6 shrink-0" />}
      <span>{status.text}</span>
    </div>
  );
}
