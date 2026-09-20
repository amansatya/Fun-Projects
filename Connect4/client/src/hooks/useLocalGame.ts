import {
  applyMove,
  createGame,
  getAiMove,
  otherPlayer,
  type Difficulty,
  type GameState,
  type Player,
  type Scores,
} from '@connect4/shared';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

export type LocalMode = 'local' | 'computer';

/** In computer games the human is always Red and the computer always Yellow. */
export const HUMAN: Player = 1;
export const COMPUTER: Player = 2;

/** A short pause so the computer's reply doesn't feel instantaneous. */
const COMPUTER_DELAY_MS = 550;

interface State {
  game: GameState;
  /** Snapshots of every earlier position in the current game (for undo). */
  history: GameState[];
  scores: Scores;
  /** Who moved first in the current game; alternates each game. */
  starter: Player;
}

type Action =
  | { type: 'move'; column: number }
  | { type: 'undo'; until: Player | null }
  | { type: 'next-game' }
  | { type: 'reset' };

const initialState = (): State => ({
  game: createGame(1),
  history: [],
  scores: { 1: 0, 2: 0, draws: 0 },
  starter: 1,
});

/**
 * Index in `history` to roll back to, or -1 if undo isn't possible.
 * - Two humans: step back one move.
 * - Against the computer (`until` = the human): roll back to the last position
 *   where it was the human's turn, which also takes back the computer's reply.
 */
function findUndoIndex(state: State, until: Player | null): number {
  if (state.game.status !== 'playing' || state.history.length === 0) return -1;
  if (until === null) return state.history.length - 1;

  for (let index = state.history.length - 1; index >= 0; index--) {
    if (state.history[index].current === until) return index;
  }
  return -1;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'move': {
      const result = applyMove(state.game, action.column);
      if (!result.ok) return state;

      const { state: game } = result;
      const scores = { ...state.scores };
      if (game.status === 'won' && game.winner) scores[game.winner] += 1;
      if (game.status === 'draw') scores.draws += 1;

      return { ...state, game, scores, history: [...state.history, state.game] };
    }

    case 'undo': {
      const index = findUndoIndex(state, action.until);
      if (index < 0) return state;
      return { ...state, game: state.history[index], history: state.history.slice(0, index) };
    }

    case 'next-game': {
      const starter = otherPlayer(state.starter);
      return { ...state, starter, game: createGame(starter), history: [] };
    }

    case 'reset':
      return initialState();
  }
}

interface Options {
  mode: LocalMode;
  difficulty?: Difficulty;
}

/** Game state + controls for hot-seat and vs-computer play (no server involved). */
export function useLocalGame({ mode, difficulty = 'medium' }: Options) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const vsComputer = mode === 'computer';
  const { game } = state;

  const computerToMove = vsComputer && game.status === 'playing' && game.current === COMPUTER;

  // Let the computer answer whenever it is its turn.
  useEffect(() => {
    if (!computerToMove) return;

    const timer = window.setTimeout(() => {
      dispatch({ type: 'move', column: getAiMove(game.board, COMPUTER, difficulty) });
    }, COMPUTER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [computerToMove, game.board, difficulty]);

  const canPlay = game.status === 'playing' && !computerToMove;
  const undoUntil = vsComputer ? HUMAN : null;

  const dropDisc = useCallback(
    (column: number) => {
      if (canPlay) dispatch({ type: 'move', column });
    },
    [canPlay],
  );
  const undo = useCallback(() => dispatch({ type: 'undo', until: undoUntil }), [undoUntil]);
  const nextGame = useCallback(() => dispatch({ type: 'next-game' }), []);
  const resetAll = useCallback(() => dispatch({ type: 'reset' }), []);

  const names = useMemo<Record<Player, string>>(
    () => (vsComputer ? { 1: 'You', 2: 'Computer' } : { 1: 'Red', 2: 'Yellow' }),
    [vsComputer],
  );

  return {
    game,
    scores: state.scores,
    names,
    youAre: vsComputer ? HUMAN : null,
    canPlay,
    canUndo: findUndoIndex(state, undoUntil) >= 0,
    dropDisc,
    undo,
    nextGame,
    resetAll,
  };
}
