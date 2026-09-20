import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Loads server/.env if it exists (silently does nothing otherwise).
dotenv.config({ quiet: true });

const here = path.dirname(fileURLToPath(import.meta.url));

const nodeEnv = process.env.NODE_ENV ?? 'development';

function parsePort(value: string | undefined, fallback: number): number {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : fallback;
}

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: parsePort(process.env.PORT, 3001),
  /** Browser origins allowed to talk to the API / WebSocket (comma separated env var). */
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  /** Where `npm run build -w client` puts the compiled React app. */
  clientDistDir: path.resolve(here, '../../client/dist'),
  /** Rooms with nobody connected are deleted after this long. */
  roomIdleTimeoutMs: 10 * 60 * 1000,
  /** How often idle rooms are swept. */
  roomSweepIntervalMs: 60 * 1000,
} as const;
