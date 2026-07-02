import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground text-foreground">
      <main className="flex-1 overflow-hidden bg-background flex">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
