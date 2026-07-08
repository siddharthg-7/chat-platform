import { cn, initials, stringToHue } from "../../lib/utils";

const SIZES = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

export default function Avatar({ name = "", src, size = "md", className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", SIZES[size], className)}
      />
    );
  }

  const hue = stringToHue(name);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        SIZES[size],
        className
      )}
      style={{ backgroundColor: `hsl(${hue}, 55%, 40%)` }}
    >
      {initials(name)}
    </div>
  );
}
