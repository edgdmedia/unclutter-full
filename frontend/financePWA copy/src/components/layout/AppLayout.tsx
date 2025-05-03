
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-[calc(100vh-64px)]">
        {!isMobile && <Sidebar />}
        <main className="flex-grow pt-2 pb-20 px-4 md:pb-8 md:px-8">
          <Outlet />
        </main>
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
};

export default AppLayout;
