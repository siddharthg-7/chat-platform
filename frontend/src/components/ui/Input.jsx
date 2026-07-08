import { cn } from "../../lib/utils";

export default function Input({ label, error, className, id, ...rest }) {
  return (
    <label className="block">
      {label && <span className="block text-sm text-muted mb-1.5">{label}</span>}
      <input
        id={id}
        className={cn(
          "w-full bg-panel2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors",
          error && "border-red-400",
          className
        )}
        {...rest}
      />
      {error && <span className="block text-xs text-red-400 mt-1">{error}</span>}
    </label>
  );
}
