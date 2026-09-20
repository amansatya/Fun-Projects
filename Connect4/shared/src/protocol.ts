/**
 * Socket.IO contract between the client and the server.
 * Both sides import these types, so a change here is a compile error on
 * whichever side forgot to update.
 */
import type { GameState, Player } from './game.js';

export const ROOM_CODE_LENGTH = 5;
/** No 0/O or 1/I/L - codes get read out loud and typed on phones. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const MAX_NAME_LENGTH = 20;

/** Upper-cases and strips everything that can't be part of a room code. */
export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export interface Scores {
  1: number;
  2: number;
  draws: number;
}

export interface PlayerInfo {
  player: Player;
  name: string;
  connected: boolean;
}

/** Full snapshot of a room. The server broadcasts this after every change. */
export interface RoomState {
  code: string;
  players: PlayerInfo[];
  game: GameState;
  scores: Scores;
  /** Players who have asked for a rematch after the current game ended. */
  rematchVotes: Player[];
}

export type AckResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

export interface JoinedPayload {
  code: string;
  /** Secret that lets this browser reclaim its seat after a reconnect. */
  token: string;
  player: Player;
}

export interface ClientToServerEvents {
  'room:create': (payload: { name: string }, ack: (res: AckResult<JoinedPayload>) => void) => void;
  'room:join': (
    payload: { code: string; name: string },
    ack: (res: AckResult<JoinedPayload>) => void,
  ) => void;
  'room:rejoin': (
    payload: { code: string; token: string },
    ack: (res: AckResult<JoinedPayload>) => void,
  ) => void;
  'room:leave': () => void;
  'game:move': (payload: { column: number }, ack: (res: AckResult) => void) => void;
  'game:rematch': () => void;
}

export interface ServerToClientEvents {
  'room:state': (state: RoomState) => void;
}
