import { describe, expect, it } from 'vitest';
import {
  COLS,
  ROWS,
  applyMove,
  createGame,
  getAiMove,
  getValidColumns,
  type GameState,
  type Player,
} from './index.js';

/** Plays a list of columns in order, failing loudly if any move is rejected. */
function play(columns: number[], first: Player = 1): GameState {
  let state = createGame(first);
  for (const col of columns) {
    const result = applyMove(state, col);
    if (!result.ok) throw new Error(`Move in column ${col} rejected: ${result.error}`);
    state = result.state;
  }
  return state;
}

describe('applyMove', () => {
  it('drops discs to the bottom and alternates players', () => {
    const state = play([3, 3]);
    expect(state.board[ROWS - 1][3]).toBe(1);
    expect(state.board[ROWS - 2][3]).toBe(2);
    expect(state.current).toBe(1);
    expect(state.moves).toEqual([3, 3]);
  });

  it('does not mutate the previous state', () => {
    const before = createGame();
    applyMove(before, 0);
    expect(before.board.flat().every((cell) => cell === 0)).toBe(true);
  });

  it('rejects out-of-range and non-integer columns', () => {
    const state = createGame();
    for (const col of [-1, COLS, 1.5, Number.NaN]) {
      expect(applyMove(state, col).ok).toBe(false);
    }
  });

  it('rejects a move in a full column', () => {
    const state = play([0, 0, 0, 0, 0, 0]);
    const result = applyMove(state, 0);
    expect(result).toEqual({ ok: false, error: 'That column is full.' });
  });
});

describe('win detection', () => {
  it('detects a horizontal win', () => {
    const state = play([0, 0, 1, 1, 2, 2, 3]);
    expect(state.status).toBe('won');
    expect(state.winner).toBe(1);
    expect(state.winningCells).toHaveLength(4);
  });

  it('detects a vertical win', () => {
    const state = play([0, 1, 0, 1, 0, 1, 0]);
    expect(state.status).toBe('won');
    expect(state.winner).toBe(1);
  });

  it('detects a rising diagonal win', () => {
    // Player 1 ends up on (0,bottom) (1,bottom-1) (2,bottom-2) (3,bottom-3)
    const state = play([0, 1, 1, 2, 3, 2, 2, 3, 3, 6, 3]);
    expect(state.status).toBe('won');
    expect(state.winner).toBe(1);
  });

  it('detects a falling diagonal win', () => {
    const state = play([6, 5, 5, 4, 3, 4, 4, 3, 3, 0, 3]);
    expect(state.status).toBe('won');
    expect(state.winner).toBe(1);
  });

  it('lets player 2 win and stops accepting moves afterwards', () => {
    const state = play([6, 0, 6, 1, 5, 2, 5, 3]);
    expect(state.winner).toBe(2);
    expect(applyMove(state, 4).ok).toBe(false);
  });

  it('declares a draw when the board fills with no winner', () => {
    // Two rows at a time are filled column by column; the middle block uses a
    // swapped column order so colours never line up four in a row.
    const straight = [0, 1, 2, 3, 4, 5, 6];
    const swapped = [1, 0, 3, 2, 5, 4, 6];
    const order = [straight, swapped, straight].flatMap((cols) => [...cols, ...cols]);

    const state = play(order);
    expect(order).toHaveLength(ROWS * COLS);
    expect(state.status).toBe('draw');
    expect(state.winner).toBeNull();
    expect(getValidColumns(state.board)).toHaveLength(0);
  });
});

describe('getAiMove', () => {
  it('takes an immediate win', () => {
    // Player 2 (yellow) has three in column 4 and it is their move.
    const state = play([0, 4, 0, 4, 1, 4, 1]);
    expect(state.current).toBe(2);
    expect(getAiMove(state.board, 2, 'medium')).toBe(4);
  });

  it('blocks a vertical threat', () => {
    // Red has three stacked in column 0; yellow (two discs in column 1) must cap it.
    const state = play([0, 1, 0, 1, 0]);
    expect(state.current).toBe(2);
    expect(getAiMove(state.board, 2, 'hard')).toBe(0);
  });

  it('blocks a horizontal threat', () => {
    // Red has 0-1-2 on the bottom row against the wall, so column 3 is the only block.
    const state = play([0, 6, 1, 6, 2]);
    expect(state.current).toBe(2);
    expect(getAiMove(state.board, 2, 'hard')).toBe(3);
  });

  it('prefers winning to blocking', () => {
    // Both sides have three stacked; it is yellow's move so yellow should win at column 1.
    const state = play([0, 1, 0, 1, 0, 1, 6]);
    expect(state.current).toBe(2);
    expect(getAiMove(state.board, 2, 'medium')).toBe(1);
  });

  it('only ever returns legal columns, even on easy', () => {
    let state = createGame();
    let seed = 42;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    while (state.status === 'playing') {
      const col = getAiMove(state.board, state.current, 'easy', rng);
      const result = applyMove(state, col);
      expect(result.ok).toBe(true);
      if (result.ok) state = result.state;
    }
    expect(['won', 'draw']).toContain(state.status);
  });
});
