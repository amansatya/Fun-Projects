import type { Player } from '@connect4/shared';
import type { CSSProperties } from 'react';

const DISC_CLASS: Record<Player, string> = {
  1: 'disc-red',
  2: 'disc-yellow',
};

interface DiscProps {
  player: Player;
  className?: string;
  style?: CSSProperties;
}

/** A single glossy game piece. Size it from the outside with `className` (e.g. "size-6"). */
export function Disc({ player, className = '', style }: DiscProps) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-full ${DISC_CLASS[player]} ${className}`}
      style={style}
    />
  );
}
