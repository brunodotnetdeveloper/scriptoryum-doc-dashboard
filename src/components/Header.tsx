
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, BookOpen } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 border-b border-border bg-card shadow-sm">
      <div className="flex items-center">
        {(!isSidebarOpen || isMobile) && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <div className="flex items-center">
          <BookOpen className="h-7 w-7 text-amber-500 mr-2" />
          <h1 className="text-2xl font-bold font-sans">
            <span className="text-amber-500">Script</span>
            <span className="text-foreground">oryum</span>
          </h1>
        </div>
        <div className="ml-3 px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-xs text-primary font-semibold">Beta</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent hover:text-accent-foreground">
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src="/placeholder-avatar.jpg" alt={user?.userName} />
                <AvatarFallback className={cn(
                  "bg-primary text-primary-foreground font-medium",
                  !user?.userName && "bg-muted text-muted-foreground"
                )}>
                  {getInitials(user?.userName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover border-border" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-popover-foreground">
                  {user?.userName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
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
