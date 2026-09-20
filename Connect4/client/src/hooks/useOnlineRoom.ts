import type { Player, RoomState } from '@connect4/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearRoomSession,
  loadPlayerName,
  loadRoomSession,
  saveRoomSession,
  savePlayerName,
} from '../lib/session';
import { socket } from '../lib/socket';

export type RoomPhase =
  /** Waiting for the socket / server to answer. */
  | 'connecting'
  /** Opened an invite link but haven't picked a display name yet. */
  | 'needs-name'
  | 'joined'
  /** The room doesn't exist, is full, etc. See `error`. */
  | 'failed';

const NOTICE_MS = 3000;

/**
 * Connects to a room and keeps a live copy of its state.
 * Handles the awkward parts: reclaiming your seat after a refresh/reconnect,
 * joining via an invite link, and surfacing server errors.
 */
export function useOnlineRoom(code: string) {
  const [phase, setPhase] = useState<RoomPhase>('connecting');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [you, setYou] = useState<Player | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  const flashNotice = useCallback((message: string) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  /** Join as a brand-new player using this display name. */
  const joinWithName = useCallback(
    (name: string) => {
      socket.emit('room:join', { code, name }, (res) => {
        if (res.ok) {
          saveRoomSession(code, { token: res.token, player: res.player });
          setYou(res.player);
          setError(null);
          setPhase('joined');
        } else {
          setError(res.error);
          setPhase('failed');
        }
      });
    },
    [code],
  );

  useEffect(() => {
    const joinAsNewPlayer = (): void => {
      const name = loadPlayerName();
      if (name) joinWithName(name);
      else setPhase('needs-name');
    };

    // Runs on the first connect *and* on every automatic reconnect.
    const enterRoom = (): void => {
      const session = loadRoomSession(code);
      if (!session) return joinAsNewPlayer();

      socket.emit('room:rejoin', { code, token: session.token }, (res) => {
        if (res.ok) {
          setYou(res.player);
          setError(null);
          setPhase('joined');
        } else {
          clearRoomSession(code);
          joinAsNewPlayer();
        }
      });
    };

    const onConnect = (): void => {
      setConnected(true);
      enterRoom();
    };
    const onDisconnect = (): void => setConnected(false);
    const onState = (state: RoomState): void => {
      if (state.code === code) setRoom(state);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onDisconnect);
    socket.on('room:state', onState);

    if (socket.connected) onConnect();
    else socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onDisconnect);
      socket.off('room:state', onState);
      // Closing the page/route just goes offline - the seat is kept for a while
      // so the player can come back. Use leaveRoom() to give the seat up.
      socket.disconnect();
      window.clearTimeout(noticeTimer.current);
    };
  }, [code, joinWithName]);

  const submitName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      savePlayerName(trimmed);
      joinWithName(trimmed);
    },
    [joinWithName],
  );

  const dropDisc = useCallback(
    (column: number) => {
      socket.emit('game:move', { column }, (res) => {
        if (!res.ok) flashNotice(res.error);
      });
    },
    [flashNotice],
  );

  const requestRematch = useCallback(() => socket.emit('game:rematch'), []);

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave');
    clearRoomSession(code);
    setRoom(null);
  }, [code]);

  return {
    phase,
    room,
    you,
    connected,
    error,
    notice,
    submitName,
    dropDisc,
    requestRematch,
    leaveRoom,
  };
}
