import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import IconSidebar from '@/components/IconSidebar';
import wsService from '@/services/websocket';

const MainLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      wsService.connect();
    }
    return () => {
      wsService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <div className="flex h-full w-full bg-[var(--bg-surface)] overflow-hidden text-[var(--text)] selection:bg-[var(--accent-dim)] selection:text-[var(--text)]">
      <IconSidebar />
      <main className="flex-1 overflow-hidden flex min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;


