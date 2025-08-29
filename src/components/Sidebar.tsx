
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Upload, FileText, Bot, Settings, Key, Building2, Briefcase, Users } from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Escriba',
    path: '/escriba',
    icon: Bot,
  },
  {
    name: 'Upload',
    path: '/upload',
    icon: Upload,
  },
  {
    name: 'Documentos',
    path: '/documents',
    icon: FileText,
  },
  {
    name: 'Usuários',
    path: '/users',
    icon: Users,
  },
  {
    name: 'Workspaces',
    path: '/workspaces',
    icon: Briefcase,
  },
  {
    name: 'Configurações',
    path: '/settings',
    icon: Settings,
  },
  {
    name: 'API Keys',
    path: '/service-api-keys',
    icon: Key,
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
        "bg-sidebar border-r border-sidebar-border h-full flex flex-col transition-all duration-300 ease-in-out shadow-lg",
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
                'hover:bg-gold-scriptoryum/10 hover:text-gold-scriptoryum',
                isActive
                  ? 'bg-gold-scriptoryum text-white shadow-lg ring-2 ring-gold-scriptoryum/20'
                  : 'text-sidebar-foreground/80'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Footer da sidebar */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60 text-center font-medium">
          © 2025 Scriptoryum
          <br />
          <span className="text-primary font-semibold">Análise Inteligente de Documentos</span>
        </div>
      </div>
    </aside>
  );
};
