import { cn } from "../../lib/utils";

export default function Card({ children, className, title, subtitle }) {
  return (
    <div className={cn("bg-panel border border-border rounded-xl2 p-5", className)}>
      {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
      {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      {(title || subtitle) && <div className="mt-4">{children}</div>}
      {!title && !subtitle && children}
    </div>
  );
}