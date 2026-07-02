import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const Avatar = React.forwardRef(({ className, src, alt, fallback, size = 'default', ...props }, ref) => {
  const sizes = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    xxl: 'h-24 w-24'
  };

  return (
    <div
      ref={ref}
      className={cn("relative flex shrink-0 overflow-hidden rounded-full bg-secondary", sizes[size], className)}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          {fallback ? (
            <span className="text-sm font-medium uppercase">{fallback}</span>
          ) : (
            <User className="h-1/2 w-1/2" />
          )}
        </div>
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";

export { Avatar };
