import { cn } from "../../lib/utils";

const VARIANTS = {
  primary: "bg-accent hover:bg-accent2 text-white",
  secondary: "bg-panel2 hover:bg-border text-white border border-border",
  ghost: "hover:bg-panel2 text-muted hover:text-white",
  danger: "bg-red-500/90 hover:bg-red-500 text-white",
};

export default function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
