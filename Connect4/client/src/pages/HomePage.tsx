import type { Player } from '@connect4/shared';
import { Link } from 'react-router';
import { Disc } from '../components/Disc';

interface ModeCard {
  to: string;
  title: string;
  description: string;
  discs: Player[];
}

const MODES: ModeCard[] = [
  {
    to: '/local',
    title: 'Local game',
    description: 'Two players, one screen. Pass the mouse and trash-talk in person.',
    discs: [1, 2],
  },
  {
    to: '/computer',
    title: 'Vs computer',
    description: 'Pick a difficulty, from a relaxed warm-up to a ruthless minimax brain.',
    discs: [1],
  },
  {
    to: '/online',
    title: 'Play online',
    description: 'Create a room and send the link to a friend. Live, in real time.',
    discs: [2, 1],
  },
];

export function HomePage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-10 mt-4 text-center">
        <h1 className="bg-gradient-to-r from-red-disc via-white to-yellow-disc bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          Connect 4
        </h1>
        <p className="mt-3 text-slate-400">Drop a disc. Line up four. Ruin a friendship.</p>
      </div>

      <ul className="grid gap-3">
        {MODES.map((mode) => (
          <li key={mode.to}>
            <Link
              to={mode.to}
              className="group flex items-center gap-4 rounded-2xl bg-ink-800/80 p-5 ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:bg-ink-700 hover:ring-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              <span className="flex w-12 shrink-0 -space-x-3">
                {mode.discs.map((player, index) => (
                  <Disc key={index} player={player} className="size-8 ring-2 ring-ink-800 transition group-hover:scale-110" />
                ))}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-semibold">{mode.title}</span>
                <span className="block text-sm text-slate-400">{mode.description}</span>
              </span>
              <span aria-hidden="true" className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
