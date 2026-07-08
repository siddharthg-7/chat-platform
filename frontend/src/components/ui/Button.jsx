import React from 'react';
import { clsx } from 'clsx';

const variants = {
  default: `
    bg-[var(--accent)] text-white font-medium
    hover:bg-[var(--accent-hover)]
    shadow-[0_0_14px_var(--accent-glow)]
    hover:shadow-[0_0_22px_var(--accent-glow)]
    active:scale-[0.97]
  `,
  outline: `
    bg-transparent text-[var(--text)] font-medium
    border border-[var(--border)]
    hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-active)]
    active:scale-[0.97]
  `,
  ghost: `
    bg-transparent text-[var(--text-muted)]
    hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)]
    active:scale-[0.97]
  `,
  secondary: `
    bg-[var(--bg-glass)] text-[var(--text)] font-medium
    border border-[var(--border)]
    hover:bg-[var(--bg-glass-hover)]
    active:scale-[0.97]
  `,
  destructive: `
    bg-rose-600/90 text-white font-medium
    hover:bg-rose-600
    shadow-[0_0_14px_rgba(225,29,72,0.25)]
    active:scale-[0.97]
  `,
};

const sizes = {
  default: 'h-9 px-4 text-sm',
  sm:      'h-7 px-3 text-xs',
  lg:      'h-11 px-6 text-base',
  icon:    'h-9 w-9 p-0',
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]',
          'disabled:opacity-50 disabled:pointer-events-none',
          'select-none cursor-pointer',
          variants[variant] ?? variants.default,
          sizes[size] ?? sizes.default,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
