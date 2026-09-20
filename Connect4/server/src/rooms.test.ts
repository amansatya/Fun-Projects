import { describe, expect, it } from 'vitest';
import type { JoinedPayload } from '@connect4/shared';
import { RoomManager } from './rooms.js';

/** Creates a room with two seated players and returns their join details. */
function setup() {
  const now = { value: 1_000 };
  const rooms = new RoomManager(() => now.value);

  const created = rooms.createRoom('Ada', 'socket-a');
  if (!created.ok) throw new Error('create failed');
  const joined = rooms.joinRoom(created.code, 'Grace', 'socket-b');
  if (!joined.ok) throw new Error('join failed');

  return { rooms, now, code: created.code, a: created, b: joined };
}

const asPayload = (res: { ok: boolean }) => res as { ok: true } & JoinedPayload;

describe('RoomManager: joining', () => {
  it('seats the creator as player 1 and the joiner as player 2', () => {
    const { a, b, rooms, code } = setup();
    expect(a.player).toBe(1);
    expect(b.player).toBe(2);
    expect(rooms.getState(code)?.players.map((p) => p.name)).toEqual(['Ada', 'Grace']);
  });

  it('refuses a third player, unknown rooms, and wrong tokens', () => {
    const { rooms, code } = setup();
    expect(rooms.joinRoom(code, 'Linus', 'socket-c')).toEqual({
      ok: false,
      error: 'This room is already full.',
    });
    expect(rooms.joinRoom('ZZZZZ', 'Linus', 'socket-c').ok).toBe(false);
    expect(rooms.rejoin(code, 'not-a-real-token', 'socket-c').ok).toBe(false);
  });

  it('generates codes that only use the unambiguous alphabet', () => {
    const rooms = new RoomManager();
    for (let i = 0; i < 50; i++) {
      const res = asPayload(rooms.createRoom('x', `s${i}`));
      expect(res.code).toMatch(/^[A-HJKMNP-Z2-9]{5}$/);
    }
  });
});

describe('RoomManager: playing', () => {
  it('enforces turn order and waits for an opponent', () => {
    const rooms = new RoomManager();
    const solo = asPayload(rooms.createRoom('Ada', 'socket-a'));
    expect(rooms.move(solo.code, 1, 3)).toEqual({
      ok: false,
      error: 'Waiting for an opponent to join.',
    });

    rooms.joinRoom(solo.code, 'Grace', 'socket-b');
    expect(rooms.move(solo.code, 2, 3)).toEqual({ ok: false, error: "It's not your turn." });
    expect(rooms.move(solo.code, 1, 3).ok).toBe(true);
    expect(rooms.getState(solo.code)?.game.current).toBe(2);
  });

  it('records a win, then alternates the starter on rematch (both must agree)', () => {
    const { rooms, code } = setup();
    // Player 1 stacks column 0; player 2 stacks column 1.
    for (const [player, col] of [
      [1, 0],
      [2, 1],
      [1, 0],
      [2, 1],
      [1, 0],
      [2, 1],
      [1, 0],
    ] as const) {
      expect(rooms.move(code, player, col).ok).toBe(true);
    }

    let state = rooms.getState(code)!;
    expect(state.game.status).toBe('won');
    expect(state.scores).toEqual({ 1: 1, 2: 0, draws: 0 });
    expect(rooms.move(code, 2, 4).ok).toBe(false);

    rooms.requestRematch(code, 1);
    state = rooms.getState(code)!;
    expect(state.game.status).toBe('won'); // still waiting for player 2
    expect(state.rematchVotes).toEqual([1]);

    rooms.requestRematch(code, 2);
    state = rooms.getState(code)!;
    expect(state.game.status).toBe('playing');
    expect(state.game.current).toBe(2); // starter alternated
    expect(state.game.moves).toEqual([]);
    expect(state.scores[1]).toBe(1); // scores survive a rematch
  });

  it('rejects rematch requests while a game is in progress', () => {
    const { rooms, code } = setup();
    expect(rooms.requestRematch(code, 1).ok).toBe(false);
  });
});

describe('RoomManager: connection lifecycle', () => {
  it('lets a player reclaim their seat with their token', () => {
    const { rooms, code, a } = setup();
    expect(rooms.markDisconnected(code, 1, 'socket-a')).toBe(true);
    expect(rooms.getState(code)?.players[0].connected).toBe(false);

    const back = rooms.rejoin(code, a.token, 'socket-a2');
    expect(back).toMatchObject({ ok: true, player: 1 });
    expect(rooms.getState(code)?.players[0].connected).toBe(true);

    // A late "disconnect" from the stale socket must not knock the player offline again.
    expect(rooms.markDisconnected(code, 1, 'socket-a')).toBe(false);
    expect(rooms.getState(code)?.players[0].connected).toBe(true);
  });

  it('resets the game when a player leaves and frees the seat', () => {
    const { rooms, code } = setup();
    rooms.move(code, 1, 3);
    rooms.leave(code, 2);

    const state = rooms.getState(code)!;
    expect(state.players).toHaveLength(1);
    expect(state.game.moves).toEqual([]);

    const newcomer = rooms.joinRoom(code, 'Linus', 'socket-c');
    expect(newcomer).toMatchObject({ ok: true, player: 2 });
  });

  it('deletes the room when the last player leaves', () => {
    const { rooms, code } = setup();
    rooms.leave(code, 1);
    rooms.leave(code, 2);
    expect(rooms.getState(code)).toBeUndefined();
    expect(rooms.size).toBe(0);
  });

  it('prunes only rooms that are empty of connections and idle long enough', () => {
    const { rooms, now, code } = setup();
    now.value += 60_000;
    expect(rooms.pruneIdle(30_000)).toEqual([]); // both still online

    rooms.markDisconnected(code, 1, 'socket-a');
    rooms.markDisconnected(code, 2, 'socket-b');
    now.value += 10_000;
    expect(rooms.pruneIdle(30_000)).toEqual([]); // offline, but not idle long enough

    now.value += 60_000;
    expect(rooms.pruneIdle(30_000)).toEqual([code]);
    expect(rooms.size).toBe(0);
  });
});
