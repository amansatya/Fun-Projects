import type { Server, Socket } from 'socket.io';
import type {
  AckResult,
  ClientToServerEvents,
  JoinedPayload,
  Player,
  ServerToClientEvents,
} from '@connect4/shared';
import type { RoomManager } from './rooms.js';
import {
  createRoomSchema,
  firstError,
  joinRoomSchema,
  moveSchema,
  rejoinRoomSchema,
} from './validation.js';

/** What we remember about each connected socket. */
export interface SocketData {
  code?: string;
  player?: Player;
}

type InterServerEvents = Record<string, never>;

export type GameServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Wraps an event handler that answers via an acknowledgement callback.
 * - Clients are untrusted: the payload arrives as `unknown` and the ack may be missing.
 * - A thrown error becomes a friendly failure reply instead of crashing the process.
 */
function withAck<T extends object>(
  handler: (payload: unknown, reply: (res: AckResult<T>) => void) => void,
) {
  return (payload: unknown, ack?: unknown): void => {
    const reply =
      typeof ack === 'function' ? (ack as (res: AckResult<T>) => void) : () => undefined;
    try {
      handler(payload, reply);
    } catch (error) {
      console.error('[socket] handler failed:', error);
      reply({ ok: false, error: 'Something went wrong on the server.' });
    }
  };
}

export function registerSocketHandlers(io: GameServer, rooms: RoomManager): void {
  const broadcast = (code: string): void => {
    const state = rooms.getState(code);
    if (state) io.to(code).emit('room:state', state);
  };

  io.on('connection', (socket: GameSocket) => {
    /** Take this socket out of whatever room it is currently sitting in (seat stays reserved). */
    const detach = (): void => {
      const { code, player } = socket.data;
      if (!code || !player) return;

      void socket.leave(code);
      socket.data = {};
      if (rooms.markDisconnected(code, player, socket.id)) broadcast(code);
    };

    const attach = (joined: JoinedPayload): void => {
      if (socket.data.code && socket.data.code !== joined.code) detach();
      socket.data.code = joined.code;
      socket.data.player = joined.player;
      void socket.join(joined.code);
      broadcast(joined.code);
    };

    socket.on(
      'room:create',
      withAck<JoinedPayload>((payload, reply) => {
        const parsed = createRoomSchema.safeParse(payload);
        if (!parsed.success) return reply({ ok: false, error: firstError(parsed.error) });

        const result = rooms.createRoom(parsed.data.name, socket.id);
        if (!result.ok) return reply(result);

        attach(result);
        reply(result);
      }),
    );

    socket.on(
      'room:join',
      withAck<JoinedPayload>((payload, reply) => {
        const parsed = joinRoomSchema.safeParse(payload);
        if (!parsed.success) return reply({ ok: false, error: firstError(parsed.error) });

        const result = rooms.joinRoom(parsed.data.code, parsed.data.name, socket.id);
        if (!result.ok) return reply(result);

        attach(result);
        reply(result);
      }),
    );

    socket.on(
      'room:rejoin',
      withAck<JoinedPayload>((payload, reply) => {
        const parsed = rejoinRoomSchema.safeParse(payload);
        if (!parsed.success) return reply({ ok: false, error: firstError(parsed.error) });

        const result = rooms.rejoin(parsed.data.code, parsed.data.token, socket.id);
        if (!result.ok) return reply(result);

        attach(result);
        reply(result);
      }),
    );

    socket.on('room:leave', () => {
      const { code, player } = socket.data;
      if (!code || !player) return;

      void socket.leave(code);
      socket.data = {};
      rooms.leave(code, player);
      broadcast(code);
    });

    socket.on(
      'game:move',
      withAck<object>((payload, reply) => {
        const { code, player } = socket.data;
        if (!code || !player) return reply({ ok: false, error: 'You are not in a room.' });

        const parsed = moveSchema.safeParse(payload);
        if (!parsed.success) return reply({ ok: false, error: 'Invalid column.' });

        const result = rooms.move(code, player, parsed.data.column);
        if (!result.ok) return reply(result);

        broadcast(code);
        reply({ ok: true });
      }),
    );

    socket.on('game:rematch', () => {
      const { code, player } = socket.data;
      if (!code || !player) return;

      rooms.requestRematch(code, player);
      broadcast(code);
    });

    socket.on('disconnect', detach);
  });
}
