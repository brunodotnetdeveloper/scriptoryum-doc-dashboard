
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isMobile, isSidebarOpen }) => {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 border-b border-scriptoryum-gray bg-scriptoryum-dark-gray">
      <div className="flex items-center">
        {(!isSidebarOpen || isMobile) && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-scriptoryum-soft-white hover:bg-scriptoryum-medium-gray/50"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <h1 className="text-2xl font-bold text-scriptoryum-soft-white font-inter">
          Scriptoryum
        </h1>
        <div className="ml-3 px-2 py-1 bg-scriptoryum-deep-purple/20 rounded-md">
          <span className="text-xs text-scriptoryum-soft-blue font-medium">AI Document Analysis</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-scriptoryum-medium-gray/50">
              <Avatar className="h-10 w-10 border-2 border-scriptoryum-medium-gray">
                <AvatarImage src="/placeholder-avatar.jpg" alt={user?.userName} />
                <AvatarFallback className={cn(
                  "bg-scriptoryum-deep-purple text-scriptoryum-soft-white font-medium",
                  !user?.userName && "bg-scriptoryum-medium-gray"
                )}>
                  {getInitials(user?.userName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-scriptoryum-dark-gray border-scriptoryum-medium-gray" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-scriptoryum-soft-white">
                  {user?.userName}
                </p>
                <p className="text-xs leading-none text-scriptoryum-soft-white/70">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-scriptoryum-medium-gray" />
            <DropdownMenuItem className="text-scriptoryum-soft-white hover:bg-scriptoryum-medium-gray/50 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-scriptoryum-medium-gray" />
            <DropdownMenuItem 
              className="text-scriptoryum-soft-red hover:bg-scriptoryum-soft-red/10 cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
