
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Upload, FileText } from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Upload',
    path: '/upload',
    icon: Upload,
  },
  {
    name: 'Documentos',
    path: '/documentos',
    icon: FileText,
  },
];

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "bg-scriptoryum-dark-gray border-r border-scriptoryum-medium-gray h-full flex flex-col transition-all duration-300 ease-in-out",
        isMobile ? "fixed inset-y-0 left-0 z-40 w-64" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className={cn(
        'flex-1 px-4 py-6 space-y-2',
        isMobile && 'mt-[60px]'
      )}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                'hover:bg-scriptoryum-medium-gray/30 hover:text-scriptoryum-soft-white',
                isActive
                  ? 'bg-scriptoryum-deep-purple text-scriptoryum-soft-white shadow-lg'
                  : 'text-scriptoryum-soft-white/70'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Footer da sidebar */}
      <div className="p-4 border-t border-scriptoryum-medium-gray">
        <div className="text-xs text-scriptoryum-soft-white/50 text-center">
          © 2025 Scriptoryum
          <br />
          Análise Inteligente de Documentos
        </div>
      </div>
    </aside>
  );
};
