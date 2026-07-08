import { cn } from "../../lib/utils";

const TONES = {
  neutral: "bg-panel2 text-muted",
  accent: "bg-accent/20 text-accent2",
  success: "bg-mint/20 text-mint",
  danger: "bg-red-500/20 text-red-400",
};

export default function Badge({ children, tone = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
