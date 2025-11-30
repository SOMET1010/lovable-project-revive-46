import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

export function NotificationBell({ 
  className = '', 
  size = 'medium',
  showTooltip = true 
}: NotificationBellProps) {
  const { unreadCount, isSubscribed } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const previousCountRef = useRef(unreadCount);

  // Size configurations
  const sizeConfig = {
    small: {
      button: 'p-2',
      icon: 'w-4 h-4',
      badge: 'h-4 w-4 text-xs'
    },
    medium: {
      button: 'p-2.5',
      icon: 'w-5 h-5',
      badge: 'h-5 w-5 text-xs'
    },
    large: {
      button: 'p-3',
      icon: 'w-6 h-6',
      badge: 'h-5 w-5 text-sm'
    }
  };

  // Detect new notifications
  useEffect(() => {
    if (unreadCount > previousCountRef.current && isSubscribed) {
      setHasNewNotifications(true);
      setIsAnimating(true);
      
      // Remove animation class after animation completes
      setTimeout(() => {
        setIsAnimating(false);
        setHasNewNotifications(false);
      }, 2000);
    }
    previousCountRef.current = unreadCount;
  }, [unreadCount, isSubscribed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={bellRef}
        onClick={handleClick}
        className={[
          'relative inline-flex items-center justify-center',
          'text-neutral-600 hover:text-neutral-900',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'rounded-full hover:bg-neutral-100',
          config.button,
          hasNewNotifications && isAnimating ? 'animate-pulse' : ''
        ].join(' ')}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        title={showTooltip ? `Notifications (${unreadCount} non lues)` : undefined}
      >
        {/* Bell Icon */}
        {hasNewNotifications && isAnimating ? (
          <BellRing 
            className={`${config.icon} text-blue-600 transition-colors duration-200`}
            aria-hidden="true"
          />
        ) : (
          <Bell 
            className={`${config.icon} transition-colors duration-200 ${
              unreadCount > 0 ? 'text-blue-600' : 'text-neutral-600'
            }`}
            aria-hidden="true"
          />
        )}

        {/* Badge for unread count */}
        {unreadCount > 0 && (
          <Badge
            variant="error"
            size="small"
            className={[
              'absolute -top-1 -right-1',
              'animate-bounce-subtle',
              config.badge,
              'shadow-sm'
            ].join(' ')}
            aria-label={`${unreadCount} notifications non lues`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}

        {/* Pulse effect for new notifications */}
        {hasNewNotifications && isAnimating && (
          <div className={[
            'absolute inset-0 rounded-full',
            'bg-blue-200 animate-ping',
            'opacity-30'
          ].join(' ')} />
        )}
      </button>

      {/* Dropdown indicator */}
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-neutral-900" />
        </div>
      )}
    </div>
  );
}