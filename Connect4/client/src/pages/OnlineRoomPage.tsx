import { MAX_NAME_LENGTH, normalizeRoomCode, type Player } from '@connect4/shared';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button, buttonStyles } from '../components/Button';
import { GameView } from '../components/GameView';
import { PageHeading } from '../components/PageHeading';
import { useOnlineRoom } from '../hooks/useOnlineRoom';

function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('');

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmit(name);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 rounded-2xl bg-ink-800/80 p-6 ring-1 ring-white/5">
      <h2 className="text-xl font-bold">You've been invited to play</h2>
      <label htmlFor="join-name" className="block text-sm text-slate-300">
        What should we call you?
      </label>
      <input
        id="join-name"
        autoFocus
        value={name}
        maxLength={MAX_NAME_LENGTH}
        onChange={(event) => setName(event.target.value)}
        placeholder="Your name"
        className="w-full rounded-xl bg-ink-900 px-4 py-2.5 ring-1 ring-white/10 focus:outline-2 focus:outline-sky-300"
      />
      <Button type="submit" variant="primary" className="w-full" disabled={!name.trim()}>
        Join game
      </Button>
    </form>
  );
}

function InviteCard({ code }: { code: string }) {
  const link = `${window.location.origin}/online/${code}`;
  const [copied, setCopied] = useState(false);

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions) - the link is still visible to copy by hand.
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl bg-ink-800/80 p-6 text-center ring-1 ring-white/5">
      <p className="text-slate-400">Share this code or link with a friend to start playing:</p>
      <p className="font-mono text-5xl font-bold tracking-[0.25em] text-white" aria-label={`Room code ${code.split('').join(' ')}`}>
        {code}
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          aria-label="Invite link"
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-xl bg-ink-900 px-3 py-2 text-sm text-slate-300 ring-1 ring-white/10"
        />
        <Button onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</Button>
      </div>
      <p className="flex items-center justify-center gap-2 text-sm text-slate-400">
        <span className="size-2 animate-pulse rounded-full bg-yellow-disc" />
        Waiting for your opponent to join…
      </p>
    </div>
  );
}

/** A live game (or the waiting room) for one room code. */
export function OnlineRoomPage() {
  const { code: rawCode = '' } = useParams();
  const code = normalizeRoomCode(rawCode);
  const navigate = useNavigate();
  const online = useOnlineRoom(code);

  const { room, you } = online;

  function leave(): void {
    online.leaveRoom();
    navigate('/online');
  }

  if (online.phase === 'failed') {
    return (
      <div className="mx-auto max-w-sm space-y-4 text-center">
        <PageHeading title="Can't join this room" subtitle={online.error ?? 'Something went wrong.'} />
        <Link to="/online" className={buttonStyles('primary')}>
          Back to lobby
        </Link>
      </div>
    );
  }

  if (online.phase === 'needs-name') return <NamePrompt onSubmit={online.submitName} />;

  if (online.phase === 'connecting' || !room || you === null) {
    return <p className="text-center text-slate-400">Connecting to the game server…</p>;
  }

  const seat = (player: Player) => room.players.find((p) => p.player === player);
  const names: Record<Player, string> = {
    1: seat(1)?.name ?? 'Waiting…',
    2: seat(2)?.name ?? 'Waiting…',
  };
  const opponent = seat(you === 1 ? 2 : 1);
  const opponentNeedsToJoin = !opponent;
  const gameOver = room.game.status !== 'playing';

  const canPlay =
    online.connected && !!opponent && room.game.status === 'playing' && room.game.current === you;

  const youVoted = room.rematchVotes.includes(you);
  const opponentVoted = opponent ? room.rematchVotes.includes(opponent.player) : false;

  const banners = (
    <>
      {!online.connected && (
        <p role="alert" className="rounded-lg bg-yellow-disc/10 px-3 py-2 text-sm text-yellow-disc">
          Connection lost. Trying to reconnect…
        </p>
      )}
      {online.connected && opponent && !opponent.connected && (
        <p role="alert" className="rounded-lg bg-yellow-disc/10 px-3 py-2 text-sm text-yellow-disc">
          {opponent.name} disconnected. Waiting for them to come back…
        </p>
      )}
      {online.notice && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {online.notice}
        </p>
      )}
    </>
  );

  return (
    <>
      <PageHeading
        title={opponentNeedsToJoin ? 'Waiting room' : `${names[1]} vs ${names[2]}`}
        subtitle={`Room ${room.code}`}
      />

      {opponentNeedsToJoin ? (
        <div className="space-y-6">
          {banners}
          <InviteCard code={room.code} />
          <div className="text-center">
            <Button variant="ghost" onClick={leave}>
              Cancel and leave
            </Button>
          </div>
        </div>
      ) : (
        <GameView
          game={room.game}
          scores={room.scores}
          names={names}
          youAre={you}
          canPlay={canPlay}
          onDrop={online.dropDisc}
          banner={banners}
          actions={
            <>
              {gameOver && (
                <Button variant="primary" onClick={online.requestRematch} disabled={youVoted}>
                  {youVoted
                    ? `Waiting for ${opponent.name}…`
                    : opponentVoted
                      ? 'Accept rematch'
                      : 'Rematch'}
                </Button>
              )}
              <Button variant="ghost" onClick={leave}>
                Leave room
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
