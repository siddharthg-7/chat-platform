import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'sonner';
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
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full bg-[var(--bg-surface)] overflow-hidden text-[var(--text)] selection:bg-[var(--accent-dim)] selection:text-[var(--text)]">
      <Toaster position="top-right" richColors theme="dark" />
      <IconSidebar />
      <main className="flex-1 overflow-hidden flex min-w-0 pb-[64px] md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;


