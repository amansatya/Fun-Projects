import { COLS } from '@connect4/shared';
import { useEffect } from 'react';

/** Lets players drop a disc by pressing the number keys 1-7. */
export function useColumnHotkeys(enabled: boolean, onDrop: (column: number) => void): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      const number = Number(event.key);
      if (Number.isInteger(number) && number >= 1 && number <= COLS) {
        event.preventDefault();
        onDrop(number - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onDrop]);
}
