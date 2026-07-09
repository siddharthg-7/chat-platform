import React from 'react';
import { clsx } from 'clsx';

export const Avatar = React.forwardRef(
  ({ src, fallback, className, showOnline = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
          'bg-[var(--accent)]',
          'text-white font-semibold select-none',
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={fallback ?? 'avatar'}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <span className="text-[0.6em] tracking-wide">
            {fallback ?? '?'}
          </span>
        )}
        {showOnline && (
          <span className="absolute bottom-0 right-0 w-[28%] h-[28%] rounded-full bg-green-500 border-2 border-[var(--bg-panel)]" />
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
