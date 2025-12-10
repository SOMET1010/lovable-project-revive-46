/**
 * PropertyBadges - Badges visuels pour les annonces
 * Affiche: Vérifié, Réponse rapide, Visite virtuelle, Nouveau
 */

import { ShieldCheck, Zap, Video, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PropertyBadgesProps {
  ownerIsVerified?: boolean;
  avgResponseTimeHours?: number | null;
  hasVirtualTour?: boolean;
  createdAt?: string;
  size?: 'sm' | 'md';
  className?: string;
}

interface BadgeConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  show: boolean;
}

export function PropertyBadges({
  ownerIsVerified = false,
  avgResponseTimeHours,
  hasVirtualTour = false,
  createdAt,
  size = 'sm',
  className
}: PropertyBadgesProps) {
  // Calculer si l'annonce est nouvelle (< 7 jours)
  const isNew = createdAt 
    ? (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 
    : false;

  // Réponse rapide = moins de 2h en moyenne
  const isQuickResponse = avgResponseTimeHours !== null && avgResponseTimeHours !== undefined && avgResponseTimeHours < 2;

  const badges: BadgeConfig[] = [
    {
      label: 'Vérifié',
      icon: ShieldCheck,
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      show: ownerIsVerified
    },
    {
      label: 'Réponse rapide',
      icon: Zap,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      show: isQuickResponse
    },
    {
      label: 'Visite virtuelle',
      icon: Video,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      show: hasVirtualTour
    },
    {
      label: 'Nouveau',
      icon: Sparkles,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      show: isNew
    }
  ];

  const visibleBadges = badges.filter(badge => badge.show);

  if (visibleBadges.length === 0) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-1 gap-1'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5'
  };

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {visibleBadges.map((badge) => (
        <span
          key={badge.label}
          className={cn(
            'inline-flex items-center rounded-full font-medium',
            badge.bgColor,
            badge.textColor,
            sizeClasses[size]
          )}
        >
          <badge.icon className={iconSizes[size]} />
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export type { PropertyBadgesProps };
