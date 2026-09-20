import http from 'node:http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@connect4/shared';
import { createApp } from './app.js';
import { config } from './config.js';
import { RoomManager } from './rooms.js';
import { registerSocketHandlers, type SocketData } from './socket.js';

const httpServer = http.createServer(createApp());

const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(
  httpServer,
  { cors: { origin: config.clientOrigins } },
);

const rooms = new RoomManager();
registerSocketHandlers(io, rooms);

// Housekeeping: forget rooms that everyone has abandoned.
const sweeper = setInterval(() => {
  const removed = rooms.pruneIdle(config.roomIdleTimeoutMs);
  if (removed.length > 0) console.log(`[rooms] pruned ${removed.length} idle room(s)`);
}, config.roomSweepIntervalMs);
sweeper.unref();

httpServer.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port} (${config.nodeEnv})`);
});

function shutdown(signal: string): void {
  console.log(`[server] ${signal} received, shutting down`);
  clearInterval(sweeper);
  void io.close(() => process.exit(0));
  // Don't hang forever if a connection refuses to close.
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
