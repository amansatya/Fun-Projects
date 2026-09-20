import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

const column = (n: number) => screen.getByRole('button', { name: new RegExp(`column ${n}`, 'i') });

describe('home page', () => {
  it('links to every game mode', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /local game/i })).toHaveAttribute('href', '/local');
    expect(screen.getByRole('link', { name: /vs computer/i })).toHaveAttribute('href', '/computer');
    expect(screen.getByRole('link', { name: /play online/i })).toHaveAttribute('href', '/online');
  });

  it('shows a friendly page for unknown routes', () => {
    renderAt('/nope');
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });
});

describe('local game', () => {
  it('alternates turns and lets a player win, then start again', async () => {
    const user = userEvent.setup();
    renderAt('/local');
    expect(screen.getByRole('status')).toHaveTextContent("Red's turn");

    // Red builds 1-2-3-4 along the bottom while Yellow stacks on top.
    for (const col of [1, 1, 2, 2, 3, 3]) await user.click(column(col));
    expect(screen.getByRole('status')).toHaveTextContent("Red's turn");
    await user.click(column(4));

    expect(screen.getByRole('status')).toHaveTextContent('Red wins!');
    // Board is locked once the game is over.
    expect(column(5)).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /play again/i }));
    expect(screen.getByRole('status')).toHaveTextContent("Yellow's turn"); // starter alternates
    expect(column(5)).toBeEnabled();
  });

  it('undo takes back the last move', async () => {
    const user = userEvent.setup();
    renderAt('/local');
    const undo = screen.getByRole('button', { name: /undo/i });
    expect(undo).toBeDisabled();

    await user.click(column(4));
    expect(screen.getByRole('status')).toHaveTextContent("Yellow's turn");
    await user.click(undo);
    expect(screen.getByRole('status')).toHaveTextContent("Red's turn");
    expect(undo).toBeDisabled();
  });

  it('supports the 1-7 keyboard shortcuts', async () => {
    const user = userEvent.setup();
    renderAt('/local');
    await user.keyboard('4');
    expect(screen.getByRole('status')).toHaveTextContent("Yellow's turn");
  });

  it('disables a column once it is full', async () => {
    const user = userEvent.setup();
    renderAt('/local');
    // 6 discs alternating in column 1 -> no line of four is possible in one column of mixed colours.
    for (let i = 0; i < 6; i++) await user.click(column(1));
    expect(screen.getByRole('button', { name: /column 1 \(full\)/i })).toBeDisabled();
  });
});

describe('vs computer', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('replies after the human moves and hands the turn back', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderAt('/computer');
    expect(screen.getByRole('status')).toHaveTextContent('Your turn');

    await user.click(column(4));
    expect(screen.getByRole('status')).toHaveTextContent('Computer is thinking');
    // The board rejects clicks while the computer is thinking.
    expect(column(1)).toBeDisabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Your turn');
    expect(column(1)).toBeEnabled();
  });

  it('undo rolls back both the human move and the computer reply', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderAt('/computer');
    const undo = screen.getByRole('button', { name: /undo/i });

    await user.click(column(4));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(undo).toBeEnabled();

    await user.click(undo);
    expect(screen.getByRole('status')).toHaveTextContent('Your turn');
    expect(undo).toBeDisabled(); // back at the very start
  });
});
