import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import IconSidebar from '@/components/IconSidebar';
import wsService from '@/services/websocket';

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { activeConversation } = useSelector((state) => state.chat) || {};
  
  const isChatActive = location.pathname === '/chat' && Boolean(activeConversation);

  useEffect(() => {
    if (isAuthenticated) {
      wsService.connect();
    }
    return () => {
      wsService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full bg-[var(--bg-surface)] overflow-hidden overflow-x-hidden text-[var(--text)] selection:bg-[var(--accent-dim)] selection:text-[var(--text)]">
      
      {/* Hide bottom navigation on mobile when viewing an active chat */}
      <div className={isChatActive ? 'hidden md:block' : 'block md:contents'}>
        <IconSidebar />
      </div>

      <main className={`flex-1 overflow-hidden flex min-w-0 md:pb-0 ${isChatActive ? 'pb-0' : 'pb-[64px]'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;


