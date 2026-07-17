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
      className={`
        flex-shrink-0 z-50 bg-panel border-border transition-all duration-300 ease-in-out
        /* Mobile: fixed bottom nav */
        fixed bottom-0 left-0 right-0 h-16 w-full flex flex-row items-center justify-around px-2 border-t
        /* Desktop: vertical sticky sidebar */
        md:relative md:h-screen md:top-0 md:flex-col md:items-center md:py-4 md:gap-1 md:border-r md:border-t-0
      `}
      style={window.innerWidth >= 768 ? { width: expanded ? '240px' : '64px' } : { width: '100%' }}
    >
      {/* Logo - Hidden on mobile */}
      <Link to="/" className={`hidden md:flex mb-4 items-center ${expanded ? 'px-4 w-full justify-start gap-3' : 'justify-center w-10 h-10 rounded-xl'} transition-all cursor-pointer`}>
        <img src={logo} alt="ChatPlatform" className="shrink-0 w-10 h-10" />
        {expanded && (
          <span className="font-bold tracking-tight text-foreground text-lg whitespace-nowrap overflow-hidden">
            ChatPlatform
          </span>
        )}
      </Link>

      {/* Divider - Hidden on mobile */}
      <div className={`hidden md:block ${expanded ? 'w-[calc(100%-2rem)]' : 'w-8'} h-px bg-border mb-2 transition-all`} />

      {/* Nav Items */}
      <nav className={`flex flex-row md:flex-col md:flex-1 items-center justify-around md:justify-start gap-1 w-full md:w-auto ${expanded ? 'md:px-3' : 'md:px-2'}`}>
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
          const active = isActive(to);
          return (
            <Tooltip key={to} label={label} disabled={expanded || window.innerWidth < 768}>
              <Link
                to={to}
                className={`
                  relative flex items-center justify-center
                  h-11 w-12 md:h-10 rounded-xl
                  transition-all duration-200 group overflow-hidden shrink-0
                  ${expanded ? 'md:w-full md:justify-start md:px-3' : 'md:w-10 md:px-0'}
                  ${active
                    ? 'bg-accent text-white shadow-glow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-glass-hover'
                  }
                `}
              >
                {active && !expanded && (
                  <span className="hidden md:block absolute -left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent" />
                )}
                <Icon className="h-5 w-5 md:h-4.5 md:w-4.5 shrink-0" size={18} />
                {expanded && (
                  <span className="hidden md:inline-block ml-3 font-medium text-sm whitespace-nowrap">
                    {label}
                  </span>
                )}
              </Link>
            </Tooltip>
          );
        })}

        {/* User Avatar - Mobile version (inside nav) */}
        <Link to="/profile" className={`flex md:hidden items-center justify-center h-11 w-12 rounded-xl transition-all ${isActive('/profile') ? 'bg-accent/20' : ''}`}>
          <div className="relative shrink-0 flex items-center">
            <Avatar
              src={getAvatarUrl()}
              fallback={initials}
              className="h-8 w-8 ring-2 ring-transparent transition-all duration-200 bg-accent text-white font-semibold text-xs"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-panel" />
          </div>
        </Link>
      </nav>

      {/* Divider - Hidden on mobile */}
      <div className={`hidden md:block ${expanded ? 'w-[calc(100%-2rem)]' : 'w-8'} h-px bg-border mb-2 transition-all`} />

      {/* User Avatar - Desktop version */}
      <Link to="/profile" className={`hidden md:flex w-full items-center ${expanded ? 'justify-start px-4 gap-3' : 'justify-center'} cursor-pointer hover:opacity-80 transition-opacity`}>
        <Tooltip label="Profile" disabled={expanded}>
          <div className="relative shrink-0 flex items-center">
            <Avatar
              src={getAvatarUrl()}
              fallback={initials}
              className="h-9 w-9 ring-2 ring-transparent hover:ring-accent transition-all duration-200 bg-accent text-white font-semibold"
            />
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

      {/* Expand/Collapse Toggle - Hidden on mobile */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="hidden md:flex w-8 h-8 mt-2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-hover transition-colors"
      >
        {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </aside>
  );
};

export default IconSidebar;
