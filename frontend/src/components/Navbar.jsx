import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, User, Settings, LogOut } from "lucide-react";
import { cn } from "../lib/utils";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-panel">
      <div className="flex items-center gap-6">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-bold text-sm">
          R
        </div>
        <nav className="flex items-center gap-1">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors",
                  isActive ? "bg-accent/20 text-accent2 font-medium" : "text-muted hover:text-white hover:bg-panel2"
                )
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-white px-3 py-1.5 rounded-lg hover:bg-panel2"
      >
        <LogOut size={15} />
        Log out
      </button>
    </header>
  );
}
