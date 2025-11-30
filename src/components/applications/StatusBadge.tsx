import React from 'react';
import { ApplicationStatus, STATUS_CONFIGS } from './types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * Badge de statut avec couleurs respectueuses des contrastes WCAG AAA
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const config = STATUS_CONFIGS[status];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-2 font-medium rounded-full
        border border-solid transition-all duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.borderColor
      }}
    >
      {showIcon && (
        <span className={iconSizes[size]} aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span className="font-semibold">{config.label}</span>
    </span>
  );
};