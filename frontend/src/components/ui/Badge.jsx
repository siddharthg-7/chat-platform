import React from 'react';
import { clsx } from 'clsx';

const variants = {
  default: 'bg-[var(--accent)] text-white border-transparent',
  outline: 'bg-transparent text-[var(--text-muted)] border-[var(--border)]',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  danger:  'bg-rose-500/15 text-rose-400 border-rose-500/20',
  info:    'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

export const Badge = React.forwardRef(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
        'text-[11px] font-semibold tracking-wide',
        'transition-colors duration-150',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
Badge.displayName = 'Badge';
