// Types et constantes pour la gestion des statuts de candidatures
export type ApplicationStatus = 
  | 'en_attente'
  | 'en_cours'
  | 'acceptee'
  | 'refusee'
  | 'annulee';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
  transitionTo?: ApplicationStatus[];
}

export const STATUS_CONFIGS: Record<ApplicationStatus, StatusConfig> = {
  en_attente: {
    label: 'En attente',
    color: '#D97706', // --color-semantic-warning
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    icon: '⏳',
    description: 'Nouvelle candidature, en attente de traitement',
    transitionTo: ['en_cours', 'annulee']
  },
  en_cours: {
    label: 'En cours',
    color: '#2563EB', // --color-semantic-info
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
    icon: '🔄',
    description: 'En cours d\'examen par le propriétaire',
    transitionTo: ['acceptee', 'refusee']
  },
  acceptee: {
    label: 'Acceptée',
    color: '#059669', // --color-semantic-success
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    icon: '✅',
    description: 'Candidature acceptée, prête pour signature',
    transitionTo: []
  },
  refusee: {
    label: 'Refusée',
    color: '#DC2626', // --color-semantic-error
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    icon: '❌',
    description: 'Candidature refusée avec motif',
    transitionTo: []
  },
  annulee: {
    label: 'Annulée',
    color: '#6B7280', // --color-neutral-500
    bgColor: '#F3F4F6',
    borderColor: '#9CA3AF',
    icon: '🚫',
    description: 'Annulée par le candidat',
    transitionTo: []
  }
};

export interface StatusChange {
  id: string;
  status: ApplicationStatus;
  changedAt: Date;
  changedBy: string;
  reason?: string;
  comment?: string;
}

export interface Application {
  id: string;
  candidateId: string;
  propertyId: string;
  status: ApplicationStatus;
  statusHistory: StatusChange[];
  submittedAt: Date;
  updatedAt: Date;
  currentStep?: number;
  totalSteps?: number;
}

export type UserRole = 'proprietaire' | 'candidat' | 'admin';

export interface StatusAction {
  id: string;
  label: string;
  action: () => void;
  disabled?: boolean;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: string;
}

export const WORKFLOW_STEPS: ApplicationStatus[] = [
  'en_attente',
  'en_cours',
  'acceptee'
];