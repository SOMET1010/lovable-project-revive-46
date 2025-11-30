/**
 * Configuration des types pour l'intégration des candidatures
 * 
 * Ce fichier centralise les types utilisés dans les composants de candidatures
 * pour faciliter la maintenabilité et la cohérence.
 */

// Types de rôles utilisateur
export type UserRole = 'tenant' | 'owner' | 'agency';

// Types de statuts de candidature
export type ApplicationStatus = 
  | 'en_attente' 
  | 'accepte' 
  | 'refuse' 
  | 'annule' 
  | 'en_cours';

// Types de statut des documents
export type DocumentsStatus = 
  | 'incomplet' 
  | 'complet' 
  | 'en_verification';

// Types de priorité
export type Priority = 'basse' | 'normale' | 'haute';

// Types de propriétés
export type PropertyType = 
  | 'appartement' 
  | 'villa' 
  | 'studio' 
  | 'maison' 
  | 'immeuble';

// Types de vue
export type ViewMode = 'grid' | 'list' | 'table';

// Types de période pour les statistiques
export type TimeFrame = 'week' | 'month' | 'quarter' | 'year';

// Types d'ordre de tri
export type SortOrder = 'asc' | 'desc';

// Interface pour les fichiers/documents
export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Interface complète pour une candidature
export interface Application {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyAddress: string;
  propertyType: PropertyType;
  propertyRent: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicationDate: string;
  status: ApplicationStatus;
  documentsStatus: DocumentsStatus;
  priority: Priority;
  lastUpdate: string;
  
  // Champs optionnels selon le contexte
  applicantAge?: number;
  applicantIncome?: number;
  visited?: boolean;
  creditScore?: number;
  employmentType?: string;
  references?: number;
  guarantor?: string;
  agent?: string;
  message?: string;
  notes?: string;
  files?: FileInfo[];
}

// Interface pour les options de filtrage
export interface FilterOptions {
  search: string;
  status: string;
  documentsStatus: string;
  priority: string;
  propertyType: string;
  propertyAddress: string;
  dateRange: {
    from: string;
    to: string;
  };
  priceRange: {
    min: string;
    max: string;
  };
  hasVisited: boolean | null;
  creditScoreRange: {
    min: string;
    max: string;
  };
  sortBy: string;
  sortOrder: SortOrder;
}

// Interface pour les statistiques
export interface ApplicationStats {
  total: number;
  pending: number;
  inProgress: number;
  accepted: number;
  rejected: number;
  cancelled?: number;
  withIncompleteDocs: number;
  withCompleteDocs: number;
  underReview: number;
  totalValue?: number;
  averageRent?: number;
  conversionRate?: number;
  responseTime?: number;
  topProperty?: {
    title: string;
    applications: number;
  };
  recentActivity?: {
    date: string;
    count: number;
    type: string;
  }[];
  priorityBreakdown?: {
    haute: number;
    normale: number;
    basse: number;
  };
  statusTrend?: {
    period: string;
    applications: number;
    change: number;
  }[];
  agentStats?: {
    agent: string;
    applications: number;
    conversionRate: number;
  }[];
}

// Props pour les composants shared
export interface ApplicationCardProps {
  application: Application;
  role: UserRole;
  onViewDetails?: (id: number) => void;
  onUpdateStatus?: (id: number, status: string) => void;
  onContact?: (id: number) => void;
  onDownload?: (id: number, fileId: string) => void;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  showBulkActions?: boolean;
}

export interface ApplicationFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  role: UserRole;
  onExport?: () => void;
  onImport?: () => void;
  onClearFilters?: () => void;
  showAdvancedFilters?: boolean;
  propertyOptions?: { value: string; label: string }[];
  agentOptions?: { value: string; label: string }[];
  totalResults?: number;
}

export interface ApplicationStatsProps {
  stats: ApplicationStats;
  role: UserRole;
  timeFrame?: TimeFrame;
  onTimeFrameChange?: (timeFrame: TimeFrame) => void;
  showTrends?: boolean;
  compact?: boolean;
}

// Props pour les sections spécifiques
export interface TenantApplicationsSectionProps {
  tenantId: number;
  tenantName: string;
}

export interface OwnerApplicationsSectionProps {
  ownerId: number;
  ownerName: string;
}

export interface AgencyApplicationsSectionProps {
  agencyId: number;
  agencyName: string;
}

// Props pour les dashboards
export interface TenantDashboardProps {
  tenantId: number;
  tenantName: string;
  onLogout?: () => void;
}

export interface OwnerDashboardProps {
  userName?: string;
  userAvatar?: string;
  ownerLevel?: 'particulier' | 'professionnel' | 'expert';
}

export interface AgencyDashboardProps {
  agencyName?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: 'director' | 'manager' | 'agent';
}

// Configuration des couleurs et styles
export const STATUS_COLORS = {
  en_attente: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    icon: 'text-amber-600'
  },
  accepte: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'text-green-600'
  },
  refuse: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'text-red-600'
  },
  annule: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-800',
    icon: 'text-neutral-600'
  },
  en_cours: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'text-blue-600'
  }
} as const;

export const DOCUMENTS_COLORS = {
  incomplet: {
    bg: 'bg-red-100',
    text: 'text-red-800'
  },
  complet: {
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  en_verification: {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  }
} as const;

export const PRIORITY_COLORS = {
  haute: {
    text: 'text-red-600',
    label: 'Haute'
  },
  normale: {
    text: 'text-amber-600',
    label: 'Normale'
  },
  basse: {
    text: 'text-green-600',
    label: 'Basse'
  }
} as const;

// Utilitaires
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getStatusLabel = (status: ApplicationStatus): string => {
  const labels = {
    en_attente: 'En attente',
    accepte: 'Accepté',
    refuse: 'Refusé',
    annule: 'Annulé',
    en_cours: 'En cours'
  };
  return labels[status];
};

export const getDocumentsLabel = (status: DocumentsStatus): string => {
  const labels = {
    incomplet: 'Incomplet',
    complet: 'Complet',
    en_verification: 'En vérification'
  };
  return labels[status];
};

export const getPriorityLabel = (priority: Priority): string => {
  return PRIORITY_COLORS[priority].label;
};