import type { Player } from '@connect4/shared';

/** Proof of ownership of a seat, so a refresh or dropped connection doesn't lose your place. */
export interface RoomSession {
  token: string;
  player: Player;
}

const NAME_KEY = 'connect4:name';
const roomKey = (code: string): string => `connect4:room:${code}`;

/** Storage can throw (private mode, quota, disabled) - the game must still work without it. */
function attempt<T>(action: () => T, fallback: T): T {
  try {
    return action();
  } catch {
    return fallback;
  }
}

function isRoomSession(value: unknown): value is RoomSession {
  if (typeof value !== 'object' || value === null) return false;
  const { token, player } = value as Record<string, unknown>;
  return typeof token === 'string' && (player === 1 || player === 2);
}

/** The display name is remembered across visits. */
export const loadPlayerName = (): string =>
  attempt(() => localStorage.getItem(NAME_KEY) ?? '', '');

export const savePlayerName = (name: string): void =>
  attempt(() => localStorage.setItem(NAME_KEY, name), undefined);

/** Seats are remembered per browser tab (sessionStorage), so two tabs can play each other. */
export function loadRoomSession(code: string): RoomSession | null {
  return attempt(() => {
    const raw = sessionStorage.getItem(roomKey(code));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRoomSession(parsed) ? parsed : null;
  }, null);
}

export const saveRoomSession = (code: string, session: RoomSession): void =>
  attempt(() => sessionStorage.setItem(roomKey(code), JSON.stringify(session)), undefined);

export const clearRoomSession = (code: string): void =>
  attempt(() => sessionStorage.removeItem(roomKey(code)), undefined);
