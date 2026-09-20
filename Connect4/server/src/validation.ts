import { COLS, MAX_NAME_LENGTH, ROOM_CODE_LENGTH, normalizeRoomCode } from '@connect4/shared';
import { z } from 'zod';

const name = z.string().trim().min(1, 'Please enter a name.').max(MAX_NAME_LENGTH);

const roomCode = z
  .string()
  .max(32)
  .transform(normalizeRoomCode)
  .pipe(z.string().length(ROOM_CODE_LENGTH, 'That is not a valid room code.'));

export const createRoomSchema = z.object({ name });
export const joinRoomSchema = z.object({ code: roomCode, name });
export const rejoinRoomSchema = z.object({ code: roomCode, token: z.string().min(1).max(100) });
export const moveSchema = z.object({ column: z.number().int().min(0).max(COLS - 1) });

/** First human-readable message from a failed parse. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid request.';
}
