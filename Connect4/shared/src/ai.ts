/**
 * Computer opponent: negamax search with alpha-beta pruning and a simple
 * heuristic for non-terminal positions.
 */
import {
  CONNECT,
  COLS,
  ROWS,
  getDropRow,
  getValidColumns,
  makesLine,
  otherPlayer,
  type Board,
  type Cell,
  type Player,
} from './game.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

interface DifficultySettings {
  /** How many plies ahead the search looks. */
  depth: number;
  /** Probability of playing a random legal move instead of the searched one. */
  blunderChance: number;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: { depth: 2, blunderChance: 0.3 },
  medium: { depth: 4, blunderChance: 0 },
  hard: { depth: 7, blunderChance: 0 },
};

const WIN_SCORE = 1_000_000;

/** Search the centre columns first - it makes alpha-beta prune far more. */
const COLUMN_ORDER: readonly number[] = Array.from({ length: COLS }, (_, col) => col).sort(
  (a, b) => Math.abs(a - (COLS - 1) / 2) - Math.abs(b - (COLS - 1) / 2),
);

const DIRECTIONS: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

type MutableBoard = Cell[][];

function scoreWindow(mine: number, theirs: number): number {
  if (mine > 0 && theirs > 0) return 0; // blocked for both sides
  if (mine === 3) return 6;
  if (mine === 2) return 2;
  if (theirs === 3) return -5;
  if (theirs === 2) return -1;
  return 0;
}

/** Static evaluation of the board from `player`'s point of view. */
function evaluate(board: Board, player: Player): number {
  const opponent = otherPlayer(player);
  let score = 0;

  // The centre column is part of the most possible lines.
  const centre = Math.floor(COLS / 2);
  for (let row = 0; row < ROWS; row++) {
    if (board[row][centre] === player) score += 3;
    else if (board[row][centre] === opponent) score -= 3;
  }

  // Every possible window of four cells.
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      for (const [dRow, dCol] of DIRECTIONS) {
        const endRow = row + dRow * (CONNECT - 1);
        const endCol = col + dCol * (CONNECT - 1);
        if (endRow < 0 || endRow >= ROWS || endCol < 0 || endCol >= COLS) continue;

        let mine = 0;
        let theirs = 0;
        for (let step = 0; step < CONNECT; step++) {
          const cell = board[row + dRow * step][col + dCol * step];
          if (cell === player) mine++;
          else if (cell === opponent) theirs++;
        }
        score += scoreWindow(mine, theirs);
      }
    }
  }
  return score;
}

/** Score of the position for `player`, who is about to move. */
function negamax(
  board: MutableBoard,
  depth: number,
  alpha: number,
  beta: number,
  player: Player,
): number {
  if (getValidColumns(board).length === 0) return 0; // draw
  if (depth === 0) return evaluate(board, player);

  const opponent = otherPlayer(player);
  let best = -Infinity;

  for (const col of COLUMN_ORDER) {
    const row = getDropRow(board, col);
    if (row === -1) continue;

    board[row][col] = player;
    const score = makesLine(board, row, col)
      ? WIN_SCORE + depth // sooner wins are worth more
      : -negamax(board, depth - 1, -beta, -alpha, opponent);
    board[row][col] = 0;

    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

/**
 * Picks a column for `player`. Equally good moves are chosen at random so
 * games don't play out identically every time.
 */
export function getAiMove(
  board: Board,
  player: Player,
  difficulty: Difficulty,
  rng: () => number = Math.random,
): number {
  const valid = getValidColumns(board);
  if (valid.length === 0) throw new Error('No legal moves available.');
  if (valid.length === 1) return valid[0];

  const { depth, blunderChance } = DIFFICULTY_SETTINGS[difficulty];
  if (blunderChance > 0 && rng() < blunderChance) {
    return valid[Math.floor(rng() * valid.length)];
  }

  const work: MutableBoard = board.map((row) => [...row]);
  const opponent = otherPlayer(player);

  let bestScore = -Infinity;
  let bestColumns: number[] = [];

  for (const col of COLUMN_ORDER) {
    const row = getDropRow(work, col);
    if (row === -1) continue;

    work[row][col] = player;
    // Window of (bestScore - 1, +inf): anything that ties the best score is
    // still returned exactly, everything worse is cut off early.
    const score = makesLine(work, row, col)
      ? WIN_SCORE + depth
      : -negamax(work, depth - 1, -Infinity, -(bestScore - 1), opponent);
    work[row][col] = 0;

    if (score > bestScore) {
      bestScore = score;
      bestColumns = [col];
    } else if (score === bestScore) {
      bestColumns.push(col);
    }
  }

  return bestColumns[Math.floor(rng() * bestColumns.length)];
}
