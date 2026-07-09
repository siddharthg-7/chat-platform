import { Inbox, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-14 shrink-0 flex-col items-center justify-between bg-panel border-r border-border py-4">
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-sm mb-3">
          R
        </div>
        <button
          title="Inbox"
          className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-accent/20 text-accent2"
        >
          <Inbox size={18} />
          <span className="absolute -top-1 -right-1 bg-accent text-[10px] leading-none px-1.5 py-1 rounded-full font-semibold">
            4
          </span>
        </button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          title="Settings"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-panel2"
        >
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-mint" />
      </div>
    </aside>
  );
}
