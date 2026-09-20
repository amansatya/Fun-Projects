import type { ClientToServerEvents, ServerToClientEvents } from '@connect4/shared';
import { io, type Socket } from 'socket.io-client';

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const serverUrl = import.meta.env.VITE_SERVER_URL || undefined;

/**
 * One shared connection for the whole app. It stays disconnected until an online
 * screen needs it, so local and computer games never touch the network.
 *
 * With no VITE_SERVER_URL it connects to the origin that served the page
 * (Vite's dev proxy forwards /socket.io to the Node server).
 */
export const socket: GameSocket = serverUrl
  ? io(serverUrl, { autoConnect: false })
  : io({ autoConnect: false });

/** Opens the connection and resolves once it is up (rejects after `timeoutMs`). */
export function connectSocket(timeoutMs = 5000): Promise<void> {
  if (socket.connected) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const cleanup = (): void => {
      window.clearTimeout(timer);
      socket.off('connect', onConnect);
    };
    const onConnect = (): void => {
      cleanup();
      resolve();
    };
    const timer = window.setTimeout(() => {
      cleanup();
      socket.disconnect(); // stop retrying in the background
      reject(new Error('Timed out connecting to the game server.'));
    }, timeoutMs);

    socket.on('connect', onConnect);
    socket.connect();
  });
}
