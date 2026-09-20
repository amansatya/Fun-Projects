import type { GameState, Player } from '@connect4/shared';

export interface StatusInfo {
  text: string;
  /** Player whose colour to show next to the text (null for a draw). */
  player: Player | null;
  tone: 'turn' | 'win' | 'draw';
}

interface StatusOptions {
  /** Which player the person at this screen is, or null when two people share it. */
  youAre: Player | null;
  opponentIsComputer?: boolean;
}

/** Turns a game state into the headline shown above the board. */
export function getStatus(
  game: GameState,
  names: Record<Player, string>,
  { youAre, opponentIsComputer = false }: StatusOptions,
): StatusInfo {
  if (game.status === 'won' && game.winner) {
    return {
      text: game.winner === youAre ? 'You win! 🎉' : `${names[game.winner]} wins!`,
      player: game.winner,
      tone: 'win',
    };
  }

  if (game.status === 'draw') {
    return { text: "It's a draw!", player: null, tone: 'draw' };
  }

  const { current } = game;
  let text: string;
  if (youAre === null) text = `${names[current]}'s turn`;
  else if (current === youAre) text = 'Your turn';
  else if (opponentIsComputer) text = `${names[current]} is thinking…`;
  else text = `Waiting for ${names[current]}…`;

  return { text, player: current, tone: 'turn' };
}
