
import React from 'react';
import { Button } from '@/components/ui/button';
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

export const Header: React.FC = () => {
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
    <header className="h-16 bg-scriptoryum-dark-gray border-b border-scriptoryum-medium-gray flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center">
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
                <AvatarFallback className="bg-scriptoryum-deep-purple text-scriptoryum-soft-white font-medium">
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
