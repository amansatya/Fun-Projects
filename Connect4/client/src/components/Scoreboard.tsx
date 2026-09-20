import type { Player, Scores } from '@connect4/shared';
import { Disc } from './Disc';

interface ScoreboardProps {
  scores: Scores;
  names: Record<Player, string>;
  /** Highlights whoever's turn it is (null when the game is over). */
  activePlayer: Player | null;
  youAre: Player | null;
}

interface TileProps {
  player: Player;
  name: string;
  score: number;
  active: boolean;
  isYou: boolean;
}

function PlayerTile({ player, name, score, active, isYou }: TileProps) {
  return (
    <div
      className={
        'rounded-2xl bg-ink-800/80 px-3 py-2.5 ring-1 transition ' +
        (active ? 'ring-2 ring-white/50' : 'ring-white/5')
      }
    >
      <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
        <Disc player={player} className="size-3.5 shrink-0" />
        <span className="truncate">{name}</span>
        {isYou && (
          <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-slate-200">
            you
          </span>
        )}
      </div>
      <div className="mt-0.5 text-2xl font-bold tabular-nums">{score}</div>
    </div>
  );
}

export function Scoreboard({ scores, names, activePlayer, youAre }: ScoreboardProps) {
  return (
    <div className="grid w-[min(92vw,34rem)] grid-cols-[1fr_auto_1fr] items-stretch gap-2 text-center">
      <PlayerTile player={1} name={names[1]} score={scores[1]} active={activePlayer === 1} isYou={youAre === 1} />
      <div className="flex min-w-16 flex-col justify-center rounded-2xl px-2 text-sm text-slate-400">
        <span>Draws</span>
        <span className="text-lg font-semibold tabular-nums text-slate-200">{scores.draws}</span>
      </div>
      <PlayerTile player={2} name={names[2]} score={scores[2]} active={activePlayer === 2} isYou={youAre === 2} />
    </div>
  );
}
