import React from 'react';
import { clsx } from 'clsx';

export const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      'rounded-xl border border-[var(--border)]',
      'bg-[var(--bg-glass)] backdrop-blur-sm',
      'shadow-sm',
      'transition-all duration-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex flex-col space-y-1 p-5 pb-3', className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx('text-[15px] font-semibold tracking-tight text-[var(--text)]', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx('text-xs text-[var(--text-muted)] leading-relaxed', className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('p-5 pt-2', className)}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex items-center p-5 pt-3', className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
