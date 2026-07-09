import React from "react";
import {
  MessageSquare,
  Users,
  Star,
  Settings,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "chat",
      label: "Chats",
      icon: MessageSquare,
      active: true,
    },
    {
      id: "groups",
      label: "Groups",
      icon: Users,
      active: false,
    },
    {
      id: "starred",
      label: "Starred",
      icon: Star,
      active: false,
    },
  ];

  return (
    <aside className="flex h-screen w-20 shrink-0 flex-col border-r border-slate-800 bg-slate-950">

      {/* Top Navigation */}
      <div className="flex flex-col items-center gap-3 py-5">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              title={item.label}
              className={`
                relative flex h-12 w-12 items-center justify-center
                rounded-2xl transition-all duration-200

                ${
                  item.active
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {/* Active Indicator */}
              {item.active && (
                <span className="absolute -left-4 h-8 w-1 rounded-r-full bg-emerald-400"></span>
              )}

              <Icon size={20} />
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col items-center gap-3 pb-5">

        {/* Settings */}
        <button
          title="Settings"
          onClick={() => navigate("/settings")}
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white"
        >
          <Settings size={20} />
        </button>

        {/* Profile */}
        <button
          title="Profile"
          onClick={() => navigate("/profile")}
          className="transition-transform duration-200 hover:scale-105"
        >
          <Avatar
            src="https://i.pravatar.cc/150?img=15"
            fallback="ME"
            className="h-12 w-12"
          />
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;