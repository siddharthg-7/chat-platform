import Loader from "./ui/Loader";
import { cn } from "../lib/utils";

export default function LoadingSpinner({ size = 20, className, label }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-muted", className)}>
      <Loader size={size} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
