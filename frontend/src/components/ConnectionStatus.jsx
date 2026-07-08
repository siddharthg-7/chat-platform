import { cn } from "../lib/utils";

const STATUS_COPY = {
  connected: "Live",
  connecting: "Connecting",
  disconnected: "Offline",
  error: "Connection error",
};

const STATUS_DOT = {
  connected: "bg-mint",
  connecting: "bg-yellow-400",
  disconnected: "bg-muted",
  error: "bg-red-400",
};

export default function ConnectionStatus({ status = "connecting" }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full",
            STATUS_DOT[status],
            status === "connected" && "pulse-live"
          )}
        />
      </span>
      {STATUS_COPY[status] || "Unknown"}
    </div>
  );
}
