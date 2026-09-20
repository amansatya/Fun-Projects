import { DIFFICULTIES, type Difficulty } from '@connect4/shared';
import { useState } from 'react';
import { Button } from '../components/Button';
import { GameView } from '../components/GameView';
import { PageHeading } from '../components/PageHeading';
import { useLocalGame } from '../hooks/useLocalGame';

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

function DifficultyPicker({ value, onChange }: { value: Difficulty; onChange: (value: Difficulty) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Difficulty"
      className="mx-auto mb-6 flex w-fit rounded-xl bg-ink-800 p-1 ring-1 ring-white/10"
    >
      {DIFFICULTIES.map((difficulty) => (
        <button
          key={difficulty}
          type="button"
          role="radio"
          aria-checked={value === difficulty}
          onClick={() => onChange(difficulty)}
          className={
            'rounded-lg px-4 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-sky-300 ' +
            (value === difficulty ? 'bg-board text-white shadow' : 'text-slate-400 hover:text-white')
          }
        >
          {LABELS[difficulty]}
        </button>
      ))}
    </div>
  );
}

function ComputerGame({ difficulty }: { difficulty: Difficulty }) {
  const game = useLocalGame({ mode: 'computer', difficulty });
  const gameOver = game.game.status !== 'playing';

  return (
    <GameView
      game={game.game}
      scores={game.scores}
      names={game.names}
      youAre={game.youAre}
      canPlay={game.canPlay}
      opponentIsComputer
      onDrop={game.dropDisc}
      actions={
        <>
          <Button onClick={game.undo} disabled={!game.canUndo}>
            Undo
          </Button>
          <Button variant={gameOver ? 'primary' : 'secondary'} onClick={game.nextGame}>
            {gameOver ? 'Play again' : 'Restart'}
          </Button>
          <Button variant="ghost" onClick={game.resetAll}>
            Reset scores
          </Button>
        </>
      }
    />
  );
}

/** You (Red) against the minimax AI (Yellow). */
export function ComputerPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  return (
    <>
      <PageHeading title="Vs computer" subtitle="You are Red. Starting player alternates each game." />
      <DifficultyPicker value={difficulty} onChange={setDifficulty} />
      {/* Changing difficulty remounts the game, which starts a fresh match. */}
      <ComputerGame key={difficulty} difficulty={difficulty} />
    </>
  );
}
