import { COLS, type Board, type Player, type Position } from '@connect4/shared';
import type { CSSProperties } from 'react';
import { Disc } from './Disc';

interface GameBoardProps {
  board: Board;
  /** Player whose turn it is - used for the hover preview disc. */
  current: Player;
  lastMove: Position | null;
  winningCells: readonly Position[];
  /** False while it's not your turn, the game is over, etc. */
  interactive: boolean;
  onDrop: (column: number) => void;
}

const cellKey = (row: number, col: number): string => `${row}:${col}`;

/**
 * The 7x6 grid. Each column is one big button (so it works with mouse, touch and
 * keyboard); the disc that was just played falls in with a CSS animation.
 */
export function GameBoard({ board, current, lastMove, winningCells, interactive, onDrop }: GameBoardProps) {
  const winning = new Set(winningCells.map((cell) => cellKey(cell.row, cell.col)));

  return (
    <div
      role="group"
      aria-label="Connect 4 board"
      className="grid w-[min(92vw,34rem)] grid-cols-7 select-none"
    >
      {Array.from({ length: COLS }, (_, col) => {
        const full = board[0][col] !== 0;

        return (
          <button
            key={col}
            type="button"
            disabled={!interactive || full}
            onClick={() => onDrop(col)}
            aria-label={full ? `Column ${col + 1} (full)` : `Drop disc in column ${col + 1}`}
            className="group flex flex-col outline-none enabled:cursor-pointer disabled:cursor-default"
          >
            {/* Ghost disc that previews where your piece will go */}
            <span className="block aspect-square p-1.5 sm:p-2">
              <Disc
                player={current}
                className="size-full opacity-0 transition-opacity duration-150 group-enabled:group-hover:opacity-60 group-enabled:group-focus-visible:opacity-60"
              />
            </span>

            <span
              className={
                'flex flex-1 flex-col gap-3 bg-board p-1.5 transition-colors sm:gap-4 sm:p-2 ' +
                'group-first:rounded-l-3xl group-last:rounded-r-3xl ' +
                'group-enabled:group-hover:bg-board-hover group-enabled:group-focus-visible:bg-board-hover'
              }
            >
              {board.map((cells, row) => {
                const value = cells[col];
                const isLastMove = lastMove?.row === row && lastMove.col === col;
                const isWinning = winning.has(cellKey(row, col));

                return (
                  <span
                    key={row}
                    className={
                      'relative block aspect-square rounded-full bg-ink-950 shadow-[inset_0_4px_8px_rgb(0_0_0/0.65)] ' +
                      (isWinning ? 'z-10 motion-safe:animate-win motion-reduce:ring-4 motion-reduce:ring-white' : '')
                    }
                  >
                    {value !== 0 && (
                      <Disc
                        player={value}
                        className={`absolute inset-0 size-full ${isLastMove ? 'motion-safe:animate-drop' : ''}`}
                        style={
                          isLastMove
                            ? ({
                                '--drop-rows': row + 1,
                                '--drop-ms': `${380 + row * 70}ms`,
                              } as CSSProperties)
                            : undefined
                        }
                      />
                    )}
                  </span>
                );
              })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
