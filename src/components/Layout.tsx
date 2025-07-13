
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileSidebarOverlay } from './MobileSidebarOverlay';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  React.useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans dark">
      <Header toggleSidebar={toggleSidebar} isMobile={isMobile} isSidebarOpen={isSidebarOpen} />
      <div className="flex h-screen pt-16">
        <Sidebar isOpen={isSidebarOpen} isMobile={isMobile} onClose={toggleSidebar} />
        {isMobile && isSidebarOpen && (
          <MobileSidebarOverlay isOpen={isSidebarOpen} onClick={toggleSidebar} />
        )}
        <main className={`flex-1 overflow-auto pt-16 transition-all duration-300 ease-in-out ${isMobile ? '' : (isSidebarOpen ? 'ml-0' : 'ml-0')}`}>
          <div className="p-6 h-full bg-background">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
