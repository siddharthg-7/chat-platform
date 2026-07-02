import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Loader({ className, size = 24 }) {
  return (
    <div className={cn("flex items-center justify-center h-full w-full", className)}>
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  );
}
