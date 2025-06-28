
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

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-scriptoryum-dark-gray border-r border-scriptoryum-medium-gray h-full flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
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
          © 2024 Scriptoryum
          <br />
          Análise Inteligente de Documentos
        </div>
      </div>
    </aside>
  );
};
