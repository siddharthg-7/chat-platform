import React from 'react';
import { clsx } from 'clsx';

export const Input = React.forwardRef(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={clsx(
        'flex w-full rounded-lg px-3 py-2 text-sm',
        'bg-[var(--bg-glass)] text-[var(--text)]',
        'border border-[var(--border)]',
        'placeholder:text-[var(--text-muted)]',
        'transition-all duration-200',
        'focus:outline-none focus:border-[var(--border-active)] focus:ring-1 focus:ring-[var(--accent)] focus:shadow-[0_0_10px_var(--accent-glow)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
