import { cn } from "../../lib/utils";

export default function Loader({ size = 20, className }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border-2 border-border border-t-accent animate-spin",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

