import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bot, X } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { cn } from '@/lib/utils';

interface FloatingChatWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  variant?: 'dialog' | 'sheet';
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeText?: string;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  className,
  position = 'bottom-right',
  variant = 'dialog',
  size = 'md',
  showBadge = true,
  badgeText = 'Escriba'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-12 w-12';
      case 'md':
        return 'h-14 w-14';
      case 'lg':
        return 'h-16 w-16';
      default:
        return 'h-14 w-14';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-5 w-5';
      case 'md':
        return 'h-6 w-6';
      case 'lg':
        return 'h-7 w-7';
      default:
        return 'h-6 w-6';
    }
  };

  const getDialogSize = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      default:
        return 'max-w-lg';
    }
  };

  const FloatingButton = () => (
    <div className="relative">
      <Button
        className={cn(
          'rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          'border-2 border-primary-foreground/20',
          getSizeClasses()
        )}
        onClick={() => {
          setIsOpen(true);
          setHasNewMessage(false);
        }}
      >
        {isOpen ? (
          <X className={getIconSize()} />
        ) : (
          <>
            <MessageCircle className={getIconSize()} />
            {hasNewMessage && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </>
        )}
      </Button>
      
      {showBadge && !isOpen && (
        <Badge 
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          variant="secondary"
        >
          <Bot className="h-3 w-3 mr-1" />
          {badgeText}
        </Badge>
      )}
    </div>
  );

  if (variant === 'sheet') {
    return (
      <div className={cn('fixed z-50', getPositionClasses(), className)}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div>
              <FloatingButton />
            </div>
          </SheetTrigger>
          <SheetContent 
            side={position.includes('right') ? 'right' : 'left'}
            className="w-[400px] sm:w-[500px] p-0"
          >
            <div className="h-full">
              <ChatInterface 
                isCompact
                onClose={() => setIsOpen(false)}
                maxHeight="calc(100vh - 120px)"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className={cn('fixed z-50', getPositionClasses(), className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div>
            <FloatingButton />
          </div>
        </DialogTrigger>
        <DialogContent 
          className={cn(
            'p-0 gap-0 overflow-hidden',
            getDialogSize()
          )}
          style={{ height: '600px' }}
        >
          <ChatInterface 
            isCompact
            onClose={() => setIsOpen(false)}
            maxHeight="520px"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Hook para controlar o widget de chat globalmente
export const useChatWidget = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasNotification, setHasNotification] = useState(false);

  const showWidget = () => setIsVisible(true);
  const hideWidget = () => setIsVisible(false);
  const toggleWidget = () => setIsVisible(prev => !prev);
  
  const showNotification = () => setHasNotification(true);
  const clearNotification = () => setHasNotification(false);

  return {
    isVisible,
    hasNotification,
    showWidget,
    hideWidget,
    toggleWidget,
    showNotification,
    clearNotification
  };
};