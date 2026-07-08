import { MessageSquare, Users, Clock } from "lucide-react";
import Card from "../components/ui/Card";
import { mockConversations } from "../lib/mockData";

const STATS = [
  { label: "Open conversations", value: mockConversations.filter((c) => c.status === "open").length, icon: MessageSquare },
  { label: "Contacts", value: mockConversations.length, icon: Users },
  { label: "Avg. response time", value: "2m", icon: Clock },
];

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-semibold text-white mb-1">Dashboard</h1>
      <p className="text-sm text-muted mb-6">Overview of your chat activity</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/20 text-accent2 flex items-center justify-center">
              <Icon size={16} />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Recent conversations">
        <div className="divide-y divide-border">
          {mockConversations.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-white/90">{c.contactName}</span>
              <span className="text-muted truncate max-w-[16rem]">{c.lastMessage}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
