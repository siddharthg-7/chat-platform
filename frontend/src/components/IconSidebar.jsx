import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Zap,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: MessageSquare,   label: 'Chat',      to: '/chat' },
  { icon: Users,           label: 'Contacts',  to: '/contacts' },
  { icon: Settings,        label: 'Settings',  to: '/settings' },
];

const Tooltip = ({ label, children, disabled }) => {
  if (disabled) return children;
  
  return (
    <div className="relative group flex items-center w-full justify-center">
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
};

const IconSidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      style={{ width: expanded ? '240px' : '64px' }}
      className="
        flex-shrink-0 h-full
        flex flex-col items-center
        py-4 gap-1
        bg-[var(--bg-panel)]
        border-r border-[var(--border)]
        z-20 transition-all duration-300 ease-in-out
      "
    >
      {/* Logo */}
      <div className={`mb-4 flex items-center ${expanded ? 'px-4 w-full justify-start gap-3' : 'justify-center w-10 h-10 rounded-xl'} transition-all cursor-pointer`}>
        <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-[var(--accent)]">
          <Zap className="h-5 w-5 text-white" fill="white" />
        </div>
        {expanded && (
          <span className="font-bold tracking-tight text-[var(--text)] text-lg whitespace-nowrap overflow-hidden">
            ChatPlatform
          </span>
        )}
      </div>

      {/* Divider */}
      <div className={`${expanded ? 'w-[calc(100%-2rem)]' : 'w-8'} h-px bg-[var(--border)] mb-2 transition-all`} />

      {/* Nav Items */}
      <nav className={`flex-1 flex flex-col items-center gap-1 w-full ${expanded ? 'px-3' : 'px-2'}`}>
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
          const active = isActive(to);
          return (
            <Tooltip key={to} label={label} disabled={expanded}>
              <Link
                to={to}
                className={`
                  relative flex items-center
                  h-10 rounded-xl
                  transition-all duration-200 group overflow-hidden shrink-0
                  ${expanded ? 'w-full justify-start px-3' : 'w-10 justify-center px-0'}
                  ${active
                    ? 'bg-[var(--accent)] text-white shadow-[0_0_16px_var(--accent-glow)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-glass-hover)]'
                  }
                `}
              >
                {/* Active left pill (only visible when collapsed) */}
                {active && !expanded && (
                  <span className="absolute -left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[var(--accent)]" />
                )}
                
                <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
                
                {expanded && (
                  <span className="ml-3 font-medium text-sm whitespace-nowrap">
                    {label}
                  </span>
                )}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* Expand/Collapse Toggle */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-colors mb-2"
      >
        {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Divider */}
      <div className={`${expanded ? 'w-[calc(100%-2rem)]' : 'w-8'} h-px bg-[var(--border)] mb-2 transition-all`} />

      {/* User Avatar */}
      <Link to="/profile" className={`w-full flex items-center ${expanded ? 'justify-start px-4 gap-3' : 'justify-center'} cursor-pointer hover:opacity-80 transition-opacity`}>
        <Tooltip label="Profile" disabled={expanded}>
          <div className="relative shrink-0 flex items-center">
            <Avatar
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              fallback="JD"
              className="h-9 w-9 ring-2 ring-transparent hover:ring-[var(--accent)] transition-all duration-200"
            />
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg-panel)]" />
          </div>
        </Tooltip>
        {expanded && (
          <div className="flex flex-col whitespace-nowrap overflow-hidden">
            <span className="text-sm font-semibold text-[var(--text)]">John Doe</span>
            <span className="text-xs text-[var(--text-muted)]">Online</span>
          </div>
        )}
      </Link>
    </aside>
  );
};

export default IconSidebar;
