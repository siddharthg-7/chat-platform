import { ChevronDown, ExternalLink, Plus } from "lucide-react";

function Field({ label, value, addable }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {value ? (
        <span className="text-white/90 truncate max-w-[9rem] text-right">{value}</span>
      ) : addable ? (
        <button className="text-accent2 text-xs font-medium flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      ) : (
        <span className="text-muted">—</span>
      )}
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  return (
    <div className="border-b border-border px-4 py-3">
      <button className="w-full flex items-center justify-between text-xs font-semibold tracking-wide text-muted uppercase mb-1">
        {title}
        <ChevronDown size={14} className={defaultOpen ? "" : "-rotate-90"} />
      </button>
      {defaultOpen && children}
    </div>
  );
}

export default function DetailsPanel({ conversation }) {
  if (!conversation) {
    return <aside className="hidden lg:block w-72 shrink-0 border-l border-border bg-panel" />;
  }

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-l border-border bg-panel overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="text-sm font-semibold text-white">Details</div>
        <ExternalLink size={13} className="text-muted" />
      </div>

      <Section title="Conversation">
        <Field label="Assignee" value={conversation.contactName} />
        <Field label="Team" value="Support" />
      </Section>

      <Section title="Links">
        <Field label="Tracker ticket" addable />
        <Field label="Back-office tickets" addable />
        <Field label="Side conversations" addable />
      </Section>

      <Section title="Conversation attributes">
        <Field label="Subject" addable />
        <Field label="ID" value={`#${conversation.id}`} />
        <Field label="Room" value={conversation.roomName} />
        <Field label="Status" value={conversation.status} />
      </Section>

      <Section title="Lead notes" defaultOpen={false} />
    </aside>
  );
}
