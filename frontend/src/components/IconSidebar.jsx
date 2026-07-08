import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Zap,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: MessageSquare,   label: 'Chat',      to: '/chat' },
  { icon: Users,           label: 'Contacts',  to: '/contacts' },
  { icon: Settings,        label: 'Settings',  to: '/settings' },
];

const Tooltip = ({ label, children }) => (
  <div className="relative group flex items-center">
    {children}
    <div className="
      pointer-events-none absolute left-full ml-3 z-50
      px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
      bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text)]
      opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0
      transition-all duration-200 shadow-xl
    ">
      {label}
      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--bg-panel)]" />
    </div>
  </div>
);

const IconSidebar = () => {
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      style={{ width: 'var(--sidebar-w)' }}
      className="
        flex-shrink-0 h-full
        flex flex-col items-center
        py-4 gap-1
        bg-[var(--bg-panel)]
        border-r border-[var(--border)]
        z-20
      "
    >
      {/* Logo */}
      <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent)] cursor-pointer">
        <Zap className="h-5 w-5 text-white" fill="white" />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-[var(--border)] mb-2" />

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
          const active = isActive(to);
          return (
            <Tooltip key={to} label={label}>
              <Link
                to={to}
                className={`
                  relative flex items-center justify-center
                  w-10 h-10 rounded-xl
                  transition-all duration-200 group
                  ${active
                    ? 'bg-[var(--accent)] text-white shadow-[0_0_16px_var(--accent-glow)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-glass-hover)]'
                  }
                `}
              >
                {/* Active left pill */}
                {active && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[var(--accent)]" />
                )}
                <Icon className="h-4.5 w-4.5" size={18} />
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="w-8 h-px bg-[var(--border)] mb-2" />

      {/* User Avatar */}
      <Tooltip label="Profile">
        <Link to="/profile" className="relative cursor-pointer">
          <Avatar
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            fallback="JD"
            className="h-9 w-9 ring-2 ring-transparent hover:ring-[var(--accent)] transition-all duration-200"
          />
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg-panel)]" />
        </Link>
      </Tooltip>
    </aside>
  );
};

export default IconSidebar;
