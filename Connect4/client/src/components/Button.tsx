import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-board text-white shadow-lg shadow-board/30 enabled:hover:bg-board-hover',
  secondary: 'bg-ink-700 text-slate-100 ring-1 ring-white/10 enabled:hover:bg-ink-700/70',
  ghost: 'text-slate-300 enabled:hover:bg-white/5 enabled:hover:text-white',
};

/** Class string shared by <Button> and router <Link>s that should look like buttons. */
export function buttonStyles(variant: ButtonVariant = 'secondary', className = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'secondary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, className)} {...props} />;
}
