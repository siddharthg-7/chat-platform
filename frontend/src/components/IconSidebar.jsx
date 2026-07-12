import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import logo from '@/assets/logo.svg';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: MessageSquare,   label: 'Chat',      to: '/chat' },
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
        bg-panel border border-border text-foreground
        opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0
        transition-all duration-200 shadow-xl
      ">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-panel" />
      </div>
    </div>
  );
};

const IconSidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
    : '';

  const getAvatarUrl = () => {
    if (user?.profile?.avatar) {
      return user.profile.avatar.startsWith('http')
        ? user.profile.avatar
        : `${import.meta.env.VITE_API_URL || ''}${user.profile.avatar}`;
    }
    return null;
  };

  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : '';

  return (
    <aside
      style={{ width: expanded ? '240px' : '64px' }}
      className="
        flex-shrink-0 h-full
        flex flex-col items-center
        py-4 gap-1
        bg-panel
        border-r border-border
        z-20 transition-all duration-300 ease-in-out
      "
    >
      {/* Logo */}
      <div className={`mb-4 flex items-center ${expanded ? 'px-4 w-full justify-start gap-3' : 'justify-center w-10 h-10 rounded-xl'} transition-all cursor-pointer`}>
        <img src={logo} alt="ChatPlatform" className="shrink-0 w-10 h-10" />
        {expanded && (
          <span className="font-bold tracking-tight text-foreground text-lg whitespace-nowrap overflow-hidden">
            ChatPlatform
          </span>
        )}
      </div>

      {/* Divider */}
      <div className={`${expanded ? 'w-[calc(100%-2rem)]' : 'w-8'} h-px bg-border mb-2 transition-all`} />

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
                    ? 'bg-accent text-white shadow-glow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-glass-hover'
                  }
                `}
              >
                {/* Active left pill (only visible when collapsed) */}
                {active && !expanded && (
                  <span className="absolute -left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent" />
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
        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover transition-colors mb-2"
      >
        {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Divider */}
      <div className={`${expanded ? 'w-[calc(100%-2rem)]' : 'w-8'} h-px bg-border mb-2 transition-all`} />

      {/* User Avatar */}
      <Link to="/profile" className={`w-full flex items-center ${expanded ? 'justify-start px-4 gap-3' : 'justify-center'} cursor-pointer hover:opacity-80 transition-opacity`}>
        <Tooltip label="Profile" disabled={expanded}>
          <div className="relative shrink-0 flex items-center">
            <Avatar
              src={getAvatarUrl()}
              fallback={initials}
              className="h-9 w-9 ring-2 ring-transparent hover:ring-accent transition-all duration-200 bg-accent text-white font-semibold"
            />
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-panel" />
          </div>
        </Tooltip>
        {expanded && (
          <div className="flex flex-col whitespace-nowrap overflow-hidden">
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        )}
      </Link>
    </aside>
  );
};

export default IconSidebar;
