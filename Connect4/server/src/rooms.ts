import { randomInt, randomUUID } from 'node:crypto';
import {
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  applyMove,
  createGame,
  otherPlayer,
  type AckResult,
  type GameState,
  type JoinedPayload,
  type Player,
  type RoomState,
  type Scores,
} from '@connect4/shared';

/** One of the two chairs at the table. `socketId === null` means the player is offline. */
interface Seat {
  name: string;
  token: string;
  socketId: string | null;
}

interface Room {
  code: string;
  seats: Partial<Record<Player, Seat>>;
  game: GameState;
  /** Who moves first in the current game; alternates on every rematch. */
  starter: Player;
  scores: Scores;
  rematchVotes: Set<Player>;
  lastActivity: number;
}

const PLAYERS: readonly Player[] = [1, 2];
const MAX_ROOMS = 1000;

const freshScores = (): Scores => ({ 1: 0, 2: 0, draws: 0 });

/**
 * All room/game rules live here, completely independent of Socket.IO,
 * which keeps them trivial to unit test. The server is the single source of
 * truth: clients only ever *request* moves.
 */
export class RoomManager {
  private readonly rooms = new Map<string, Room>();

  constructor(private readonly now: () => number = Date.now) {}

  get size(): number {
    return this.rooms.size;
  }

  createRoom(name: string, socketId: string): AckResult<JoinedPayload> {
    if (this.rooms.size >= MAX_ROOMS) {
      return { ok: false, error: 'The server is busy right now. Please try again in a moment.' };
    }

    const code = this.generateCode();
    const token = randomUUID();
    this.rooms.set(code, {
      code,
      seats: { 1: { name, token, socketId } },
      game: createGame(1),
      starter: 1,
      scores: freshScores(),
      rematchVotes: new Set(),
      lastActivity: this.now(),
    });
    return { ok: true, code, token, player: 1 };
  }

  joinRoom(code: string, name: string, socketId: string): AckResult<JoinedPayload> {
    const room = this.rooms.get(code);
    if (!room) return { ok: false, error: 'Room not found. Check the code and try again.' };

    const player = PLAYERS.find((p) => !room.seats[p]);
    if (!player) return { ok: false, error: 'This room is already full.' };

    const token = randomUUID();
    room.seats[player] = { name, token, socketId };
    this.touch(room);
    return { ok: true, code, token, player };
  }

  /** Lets a returning browser reclaim its seat using the secret token it was given. */
  rejoin(code: string, token: string, socketId: string): AckResult<JoinedPayload> {
    const room = this.rooms.get(code);
    if (!room) return { ok: false, error: 'Room not found. It may have expired.' };

    const player = PLAYERS.find((p) => room.seats[p]?.token === token);
    if (!player) return { ok: false, error: 'Your seat in this room is no longer available.' };

    room.seats[player]!.socketId = socketId;
    this.touch(room);
    return { ok: true, code, token, player };
  }

  /** Marks a seat offline. Ignored if the seat has already moved to a newer socket. */
  markDisconnected(code: string, player: Player, socketId: string): boolean {
    const room = this.rooms.get(code);
    const seat = room?.seats[player];
    if (!room || !seat || seat.socketId !== socketId) return false;

    seat.socketId = null;
    this.touch(room);
    return true;
  }

  /** Permanently gives up a seat. The remaining player waits for a new opponent. */
  leave(code: string, player: Player): void {
    const room = this.rooms.get(code);
    if (!room) return;

    delete room.seats[player];
    if (!PLAYERS.some((p) => room.seats[p])) {
      this.rooms.delete(code);
      return;
    }

    room.game = createGame(1);
    room.starter = 1;
    room.scores = freshScores();
    room.rematchVotes.clear();
    this.touch(room);
  }

  move(code: string, player: Player, column: number): AckResult {
    const room = this.rooms.get(code);
    if (!room) return { ok: false, error: 'Room not found.' };
    if (!room.seats[1] || !room.seats[2]) {
      return { ok: false, error: 'Waiting for an opponent to join.' };
    }
    if (room.game.status !== 'playing') return { ok: false, error: 'The game is already over.' };
    if (room.game.current !== player) return { ok: false, error: "It's not your turn." };

    const result = applyMove(room.game, column);
    if (!result.ok) return result;

    room.game = result.state;
    if (result.state.status === 'won' && result.state.winner) {
      room.scores[result.state.winner]++;
    } else if (result.state.status === 'draw') {
      room.scores.draws++;
    }
    this.touch(room);
    return { ok: true };
  }

  /** Records a rematch request; once both players agree a new game starts. */
  requestRematch(code: string, player: Player): AckResult {
    const room = this.rooms.get(code);
    if (!room) return { ok: false, error: 'Room not found.' };
    if (room.game.status === 'playing') {
      return { ok: false, error: 'The current game is still in progress.' };
    }

    room.rematchVotes.add(player);
    if (room.seats[1] && room.seats[2] && room.rematchVotes.size === 2) {
      room.starter = otherPlayer(room.starter);
      room.game = createGame(room.starter);
      room.rematchVotes.clear();
    }
    this.touch(room);
    return { ok: true };
  }

  getState(code: string): RoomState | undefined {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    return {
      code: room.code,
      players: PLAYERS.flatMap((player) => {
        const seat = room.seats[player];
        return seat ? [{ player, name: seat.name, connected: seat.socketId !== null }] : [];
      }),
      game: room.game,
      scores: { ...room.scores },
      rematchVotes: [...room.rematchVotes],
    };
  }

  /** Deletes rooms nobody is connected to any more. Returns the removed room codes. */
  pruneIdle(maxIdleMs: number): string[] {
    const cutoff = this.now() - maxIdleMs;
    const removed: string[] = [];

    for (const [code, room] of this.rooms) {
      const anyoneOnline = PLAYERS.some((p) => room.seats[p]?.socketId);
      if (!anyoneOnline && room.lastActivity < cutoff) {
        this.rooms.delete(code);
        removed.push(code);
      }
    }
    return removed;
  }

  private touch(room: Room): void {
    room.lastActivity = this.now();
  }

  private generateCode(): string {
    for (let attempt = 0; attempt < 50; attempt++) {
      const code = Array.from(
        { length: ROOM_CODE_LENGTH },
        () => ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)],
      ).join('');
      if (!this.rooms.has(code)) return code;
    }
    throw new Error('Could not allocate a unique room code.');
  }
}
