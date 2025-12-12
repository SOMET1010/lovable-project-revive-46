/**
 * StatusBadge - Composant réutilisable pour les badges de statut
 * Palette Mon Toit Premium - remplace tous les badges bleus
 */

import { LucideIcon } from 'lucide-react';

export type StatusType = 
  | 'loue' | 'rented' | 'active' | 'paid' | 'completed' | 'closed' | 'resolved' | 'approved' | 'acceptee' | 'signed' | 'verified'
  | 'en_cours' | 'in_progress' | 'pending' | 'open' | 'validated' | 'assigned' | 'under_review' | 'mediation' | 'en_attente' | 'normale'
  | 'en_retard' | 'late' | 'cancelled' | 'rejected' | 'rejete' | 'error' | 'failed' | 'urgent' | 'critique'
  | 'disponible' | 'available' | 'en_verification' | 'warning' | 'info';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border?: string }> = {
  // Statuts "positifs" → Vert
  loue: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  rented: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  active: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  paid: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  completed: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  closed: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  resolved: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  approved: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  acceptee: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  signed: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  verified: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  disponible: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  available: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  
  // Statuts "en cours" → Orange (remplace bleu)
  en_cours: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  in_progress: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  pending: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  open: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  validated: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  assigned: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  under_review: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  mediation: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  en_attente: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  normale: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  en_verification: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  warning: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  info: { bg: 'bg-[#FFF3E0]', text: 'text-[#ED6C02]' },
  
  // Statuts "négatifs" → Rouge
  en_retard: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  late: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  cancelled: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  rejected: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  rejete: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  error: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  failed: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  urgent: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  critique: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
};

const DEFAULT_STYLE = { bg: 'bg-[#FAF7F4]', text: 'text-[#6B5A4E]' };

export function StatusBadge({ status, label, icon: Icon, size = 'md', className = '' }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/-/g, '_');
  const style = STATUS_STYLES[normalizedStatus] ?? DEFAULT_STYLE;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${style.bg} ${style.text} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {label ?? status}
    </span>
  );
}

export default StatusBadge;
