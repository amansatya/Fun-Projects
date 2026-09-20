/**
 * Pure, framework-free Connect 4 engine.
 *
 * Board coordinates: board[row][col], where row 0 is the TOP row and
 * row ROWS - 1 is the BOTTOM row (so it maps 1:1 to how the board is drawn).
 * Everything here is immutable: functions return new objects and never mutate.
 */

export const ROWS = 6;
export const COLS = 7;
export const CONNECT = 4;

export type Player = 1 | 2;
export type Cell = 0 | Player;
export type Board = readonly (readonly Cell[])[];

export interface Position {
  row: number;
  col: number;
}

export type GameStatus = 'playing' | 'won' | 'draw';

export interface GameState {
  board: Board;
  /** Player whose turn it is (or the winner once the game is won). */
  current: Player;
  status: GameStatus;
  winner: Player | null;
  winningCells: Position[];
  lastMove: Position | null;
  /** Column index of every move played so far, in order. */
  moves: number[];
}

export type MoveResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string };

/** The four line directions worth checking: horizontal, vertical, and both diagonals. */
const DIRECTIONS: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export const otherPlayer = (player: Player): Player => (player === 1 ? 2 : 1);

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
}

export function createGame(first: Player = 1): GameState {
  return {
    board: createBoard(),
    current: first,
    status: 'playing',
    winner: null,
    winningCells: [],
    lastMove: null,
    moves: [],
  };
}

export function isValidColumn(col: unknown): col is number {
  return typeof col === 'number' && Number.isInteger(col) && col >= 0 && col < COLS;
}

/** Row a disc dropped in `col` would land on, or -1 if the column is full. */
export function getDropRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row;
  }
  return -1;
}

export function getValidColumns(board: Board): number[] {
  const columns: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (board[0][col] === 0) columns.push(col);
  }
  return columns;
}

export function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== 0);
}

/** How many consecutive discs of `player` start next to (row, col) in one direction. */
function countInDirection(
  board: Board,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  player: Player,
): number {
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;
  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
    count++;
    r += dRow;
    c += dCol;
  }
  return count;
}

/**
 * Allocation-free check used in the AI's hot loop:
 * does the disc at (row, col) complete a line of four or more?
 */
export function makesLine(board: Board, row: number, col: number): boolean {
  const player = board[row][col];
  if (player === 0) return false;
  return DIRECTIONS.some(([dRow, dCol]) => {
    const total =
      1 +
      countInDirection(board, row, col, dRow, dCol, player) +
      countInDirection(board, row, col, -dRow, -dCol, player);
    return total >= CONNECT;
  });
}

/**
 * Returns every cell in the winning run passing through (row, col),
 * or an empty array if that disc did not complete a line.
 */
export function findWinningLine(board: Board, row: number, col: number): Position[] {
  const player = board[row][col];
  if (player === 0) return [];

  for (const [dRow, dCol] of DIRECTIONS) {
    const forward = countInDirection(board, row, col, dRow, dCol, player);
    const backward = countInDirection(board, row, col, -dRow, -dCol, player);
    if (1 + forward + backward >= CONNECT) {
      const line: Position[] = [];
      for (let step = -backward; step <= forward; step++) {
        line.push({ row: row + step * dRow, col: col + step * dCol });
      }
      return line;
    }
  }
  return [];
}

/** Applies the current player's move in `col` and returns the next state. */
export function applyMove(state: GameState, col: number): MoveResult {
  if (state.status !== 'playing') {
    return { ok: false, error: 'The game is already over.' };
  }
  if (!isValidColumn(col)) {
    return { ok: false, error: 'Invalid column.' };
  }

  const row = getDropRow(state.board, col);
  if (row === -1) {
    return { ok: false, error: 'That column is full.' };
  }

  const board: Board = state.board.map((cells, r) =>
    r === row ? cells.map((cell, c) => (c === col ? state.current : cell)) : cells,
  );

  const winningCells = findWinningLine(board, row, col);
  const won = winningCells.length >= CONNECT;
  const draw = !won && isBoardFull(board);

  return {
    ok: true,
    state: {
      board,
      current: won || draw ? state.current : otherPlayer(state.current),
      status: won ? 'won' : draw ? 'draw' : 'playing',
      winner: won ? state.current : null,
      winningCells: won ? winningCells : [],
      lastMove: { row, col },
      moves: [...state.moves, col],
    },
  };
}
