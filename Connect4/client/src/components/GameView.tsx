import type { GameState, Player, Scores } from '@connect4/shared';
import type { ReactNode } from 'react';
import { useColumnHotkeys } from '../hooks/useColumnHotkeys';
import { getStatus } from '../lib/status';
import { GameBoard } from './GameBoard';
import { Scoreboard } from './Scoreboard';
import { StatusBanner } from './StatusBanner';

interface GameViewProps {
  game: GameState;
  scores: Scores;
  names: Record<Player, string>;
  /** Which player this screen belongs to; null when two people share it. */
  youAre: Player | null;
  /** Whether a click on the board should do anything right now. */
  canPlay: boolean;
  opponentIsComputer?: boolean;
  onDrop: (column: number) => void;
  /** Buttons rendered under the board. */
  actions?: ReactNode;
  /** Optional extra message between the headline and the board (warnings, errors). */
  banner?: ReactNode;
}

/** Everything needed to play one game: scores, status, board and action buttons. */
export function GameView({
  game,
  scores,
  names,
  youAre,
  canPlay,
  opponentIsComputer,
  onDrop,
  actions,
  banner,
}: GameViewProps) {
  useColumnHotkeys(canPlay, onDrop);

  const status = getStatus(game, names, { youAre, opponentIsComputer });

  return (
    <div className="flex flex-col items-center gap-5">
      <Scoreboard
        scores={scores}
        names={names}
        activePlayer={game.status === 'playing' ? game.current : null}
        youAre={youAre}
      />
      <StatusBanner status={status} />
      {banner}
      <GameBoard
        board={game.board}
        current={game.current}
        lastMove={game.lastMove}
        winningCells={game.winningCells}
        interactive={canPlay}
        onDrop={onDrop}
      />
      {actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
      <p className="hidden text-xs text-slate-500 sm:block">Tip: press the number keys 1–7 to drop a disc.</p>
    </div>
  );
}
