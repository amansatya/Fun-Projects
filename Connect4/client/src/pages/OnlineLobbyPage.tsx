import { MAX_NAME_LENGTH, ROOM_CODE_LENGTH, normalizeRoomCode } from '@connect4/shared';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { PageHeading } from '../components/PageHeading';
import { loadPlayerName, saveRoomSession, savePlayerName } from '../lib/session';
import { connectSocket, socket } from '../lib/socket';

const inputStyles =
  'w-full rounded-xl bg-ink-800 px-4 py-2.5 text-slate-100 ring-1 ring-white/10 placeholder:text-slate-500 ' +
  'focus:outline-2 focus:outline-sky-300';

/** Pick a name, then either create a room or join one by code. */
export function OnlineLobbyPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(loadPlayerName);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();

  async function createRoom(): Promise<void> {
    if (!trimmedName) return setError('Pick a name first.');

    setBusy(true);
    setError(null);
    savePlayerName(trimmedName);

    try {
      await connectSocket();
    } catch {
      setBusy(false);
      return setError("Couldn't reach the game server. Make sure it's running and try again.");
    }

    socket.emit('room:create', { name: trimmedName }, (res) => {
      setBusy(false);
      if (!res.ok) return setError(res.error);
      saveRoomSession(res.code, { token: res.token, player: res.player });
      navigate(`/online/${res.code}`);
    });
  }

  function joinRoom(event: FormEvent): void {
    event.preventDefault();
    if (!trimmedName) return setError('Pick a name first.');

    const normalized = normalizeRoomCode(code);
    if (normalized.length !== ROOM_CODE_LENGTH) {
      return setError(`Room codes are ${ROOM_CODE_LENGTH} characters long.`);
    }

    savePlayerName(trimmedName);
    navigate(`/online/${normalized}`);
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeading title="Play online" subtitle="Create a room and share the link, or join a friend's." />

      <div className="space-y-6 rounded-2xl bg-ink-800/80 p-6 ring-1 ring-white/5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
            Your name
          </label>
          <input
            id="name"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="nickname"
            placeholder="e.g. Satya"
            onChange={(event) => setName(event.target.value)}
            className={inputStyles}
          />
        </div>

        <Button variant="primary" className="w-full" disabled={busy} onClick={createRoom}>
          {busy ? 'Creating room…' : 'Create a room'}
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
          <span className="h-px flex-1 bg-white/10" />
          or join
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={joinRoom} className="flex gap-2">
          <input
            aria-label="Room code"
            value={code}
            maxLength={ROOM_CODE_LENGTH + 2}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder="ROOM CODE"
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            className={`${inputStyles} text-center font-mono tracking-[0.3em]`}
          />
          <Button type="submit" disabled={busy}>
            Join
          </Button>
        </form>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
