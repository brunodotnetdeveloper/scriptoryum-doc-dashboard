import React from 'react';
import { cn } from '@/lib/utils';

interface MobileSidebarOverlayProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MobileSidebarOverlay: React.FC<MobileSidebarOverlayProps> = ({
  isOpen,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-30 bg-black/50 transition-opacity duration-300',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      onClick={onClick}
    />
  );
};