import { CheckCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ScoreBadge } from './ScoreBadge';

export interface OwnerBadgeProps {
  name?: string | null;
  avatarUrl?: string | null;
  trustScore?: number | null;
  isVerified?: boolean;
  variant?: 'inline' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showName?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    avatar: 'w-6 h-6',
    verifiedBadge: 'w-3 h-3 -bottom-0.5 -right-0.5',
    verifiedIcon: 'h-2 w-2',
    name: 'text-xs',
    gap: 'gap-1.5',
  },
  md: {
    avatar: 'w-10 h-10',
    verifiedBadge: 'w-4 h-4 -bottom-0.5 -right-0.5',
    verifiedIcon: 'h-2.5 w-2.5',
    name: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    avatar: 'w-14 h-14',
    verifiedBadge: 'w-5 h-5 -bottom-1 -right-1',
    verifiedIcon: 'h-3 w-3',
    name: 'text-base',
    gap: 'gap-3',
  },
};

const getDefaultAvatar = (name?: string | null) => {
  const displayName = name || 'P';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF6C2F&color=fff&size=128`;
};

export function OwnerBadge({
  name,
  avatarUrl,
  trustScore,
  isVerified = false,
  variant = 'inline',
  size = 'md',
  showScore = true,
  showName = true,
  className,
}: OwnerBadgeProps) {
  const sizes = sizeConfig[size];

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-md border border-neutral-100',
          sizes.gap,
          className
        )}
      >
        {/* Avatar avec badge vérifié */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl || getDefaultAvatar(name)}
            alt={name || 'Propriétaire'}
            className={cn(sizes.avatar, 'rounded-full object-cover border border-white')}
          />
          {isVerified && (
            <div
              className={cn(
                'absolute bg-green-500 rounded-full flex items-center justify-center border-2 border-white',
                sizes.verifiedBadge
              )}
            >
              <CheckCircle className={cn(sizes.verifiedIcon, 'text-white')} />
            </div>
          )}
        </div>

        {/* Nom (optionnel) */}
        {showName && name && (
          <span className={cn(sizes.name, 'font-medium text-neutral-800 truncate max-w-24')}>
            {name.split(' ')[0]}
          </span>
        )}

        {/* ScoreBadge (optionnel) */}
        {showScore && trustScore != null && (
          <ScoreBadge score={trustScore} variant="minimal" size={size === 'lg' ? 'md' : 'sm'} />
        )}
      </div>
    );
  }

  // Variante card (pour sidebar, détails)
  return (
    <div className={cn('bg-white rounded-2xl shadow-lg p-4 border border-neutral-100', className)}>
      <div className={cn('flex items-center', sizes.gap)}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl || getDefaultAvatar(name)}
            alt={name || 'Propriétaire'}
            className={cn(sizes.avatar, 'rounded-full object-cover border-2 border-neutral-100')}
          />
          {isVerified && (
            <div
              className={cn(
                'absolute bg-green-500 rounded-full flex items-center justify-center border-2 border-white',
                sizes.verifiedBadge
              )}
            >
              <CheckCircle className={cn(sizes.verifiedIcon, 'text-white')} />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          {showName && (
            <div className={cn(sizes.name, 'font-semibold text-neutral-900 truncate')}>
              {name || 'Propriétaire'}
            </div>
          )}

          {showScore && trustScore != null && (
            <div className="mt-1">
              <ScoreBadge
                score={trustScore}
                variant="detailed"
                size={size === 'sm' ? 'sm' : 'md'}
                showVerified={isVerified}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerBadge;
