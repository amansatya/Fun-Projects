import { Button } from '../components/Button';
import { GameView } from '../components/GameView';
import { PageHeading } from '../components/PageHeading';
import { useLocalGame } from '../hooks/useLocalGame';

/** Two people taking turns on the same screen. */
export function LocalPage() {
  const local = useLocalGame({ mode: 'local' });
  const gameOver = local.game.status !== 'playing';

  return (
    <>
      <PageHeading title="Local game" subtitle="Red goes first. Take turns on the same screen." />
      <GameView
        game={local.game}
        scores={local.scores}
        names={local.names}
        youAre={local.youAre}
        canPlay={local.canPlay}
        onDrop={local.dropDisc}
        actions={
          <>
            <Button onClick={local.undo} disabled={!local.canUndo}>
              Undo
            </Button>
            <Button variant={gameOver ? 'primary' : 'secondary'} onClick={local.nextGame}>
              {gameOver ? 'Play again' : 'Restart'}
            </Button>
            <Button variant="ghost" onClick={local.resetAll}>
              Reset scores
            </Button>
          </>
        }
      />
    </>
  );
}
