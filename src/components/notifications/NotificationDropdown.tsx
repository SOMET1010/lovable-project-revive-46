import React, { useState } from 'react';
import { NotificationBell } from './NotificationBell';
import { NotificationCenter } from './NotificationCenter';

/**
 * NotificationDropdown
 * Composant tout-en-un qui combine la cloche et le centre de notifications
 * pour une intégration simple dans l'application.
 */

interface NotificationDropdownProps {
  className?: string;
  bellSize?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showBadge?: boolean;
}

export function NotificationDropdown({
  className = '',
  bellSize = 'medium',
  position = 'bottom-right',
  showBadge = true
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'right-0 top-full',
    'bottom-left': 'left-0 top-full',
    'top-right': 'right-0 bottom-full',
    'top-left': 'left-0 bottom-full'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Notification Bell */}
      <NotificationBell
        size={bellSize}
        showTooltip={true}
      />

      {/* Overlay pour fermer en cliquant à l'extérieur */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Arrow indicator */}
          <div className={`absolute ${positionClasses[position]} z-50 mb-2`}>
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-neutral-900" />
          </div>

          {/* Notification Center */}
          <div className={`absolute ${positionClasses[position]} z-50 mt-2`}>
            <div className="w-96 h-96 bg-white rounded-lg shadow-xl border border-neutral-200 overflow-hidden">
              <NotificationCenter
                isOpen={true}
                onClose={() => setIsOpen(false)}
                className="relative"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * NotificationWidget
 * Widget compact pour intégration dans les headers/footers
 */

interface NotificationWidgetProps {
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function NotificationWidget({
  compact = false,
  showLabel = false,
  className = ''
}: NotificationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <NotificationBell size="small" showTooltip={false} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 z-50">
            <div className="w-80 h-96 bg-white rounded-lg shadow-xl border border-neutral-200">
              <NotificationCenter
                isOpen={true}
                onClose={() => setIsOpen(false)}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <NotificationBell size="medium" showTooltip={false} />
        {showLabel && <span className="text-sm font-medium">Notifications</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <div className="w-96 h-96 bg-white rounded-lg shadow-xl border border-neutral-200">
            <NotificationCenter
              isOpen={true}
              onClose={() => setIsOpen(false)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * FloatingNotificationButton
 * Bouton flottant pour les pages qui nécessitent un accès rapide
 */

interface FloatingNotificationButtonProps {
  position?: 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function FloatingNotificationButton({
  position = 'bottom-right',
  size = 'medium',
  className = ''
}: FloatingNotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={[
          'fixed z-40',
          'bg-blue-600 hover:bg-blue-700',
          'text-white rounded-full shadow-lg',
          'transition-all duration-200 ease-in-out',
          'hover:scale-110 active:scale-95',
          'flex items-center justify-center',
          sizeClasses[size],
          positionClasses[position],
          className
        ].join(' ')}
        aria-label="Ouvrir les notifications"
      >
        <NotificationBell size={size} showTooltip={false} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Notification Center */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md h-full max-h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden">
            <NotificationCenter
              isOpen={true}
              onClose={() => setIsOpen(false)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </>
  );
}