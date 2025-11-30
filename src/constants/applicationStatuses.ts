/**
 * Constantes pour les statuts de candidature
 */

import type { ApplicationStatus } from '@/types/application';

// Mapping des statuts avec leurs informations
export const APPLICATION_STATUSES: Record<ApplicationStatus, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  nextStatus?: ApplicationStatus[];
  canEdit: boolean;
  canDelete: boolean;
}> = {
  en_attente: {
    label: 'En attente',
    description: 'La candidature est en attente de traitement',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    nextStatus: ['en_cours', 'refusee'],
    canEdit: true,
    canDelete: true,
  },
  en_cours: {
    label: 'En cours',
    description: 'La candidature est en cours d\'examen',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    nextStatus: ['acceptee', 'refusee'],
    canEdit: false,
    canDelete: false,
  },
  acceptee: {
    label: 'Acceptée',
    description: 'La candidature a été acceptée',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    canEdit: false,
    canDelete: false,
  },
  refusee: {
    label: 'Refusée',
    description: 'La candidature a été refusée',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    canEdit: false,
    canDelete: true,
  },
  annulee: {
    label: 'Annulée',
    description: 'La candidature a été annulée par le candidat',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    canEdit: false,
    canDelete: true,
  },
};

// Ordre d'affichage des statuts
export const STATUS_ORDER: ApplicationStatus[] = [
  'en_attente',
  'en_cours',
  'acceptee',
  'refusee',
  'annulee',
];

// Statuts actifs (qui peuvent être modifiés)
export const ACTIVE_STATUSES: ApplicationStatus[] = ['en_attente', 'en_cours'];

// Statuts terminés
export const COMPLETED_STATUSES: ApplicationStatus[] = ['acceptee', 'refusee', 'annulee'];

// Statuts pour lesquels on peut uploader des documents
export const DOCUMENT_UPLOAD_STATUSES: ApplicationStatus[] = ['en_attente', 'en_cours'];

// Icônes pour les statuts (utiliser les icônes de votre système d'icônes)
export const STATUS_ICONS: Record<ApplicationStatus, string> = {
  en_attente: 'ClockIcon',
  en_cours: 'DocumentTextIcon',
  acceptee: 'CheckCircleIcon',
  refusee: 'XCircleIcon',
  annulee: 'TrashIcon',
};

// Messages d'état pour les notifications
export const STATUS_MESSAGES: Record<ApplicationStatus, {
  statusChanged: string;
  created: string;
}> = {
  en_attente: {
    statusChanged: 'Votre candidature est maintenant en attente de traitement.',
    created: 'Votre candidature a été soumise avec succès.',
  },
  en_cours: {
    statusChanged: 'Votre candidature est maintenant en cours d\'examen.',
    created: 'Votre candidature est maintenant en cours d\'examen.',
  },
  acceptee: {
    statusChanged: 'Félicitations ! Votre candidature a été acceptée.',
    created: 'Votre candidature a été acceptée.',
  },
  refusee: {
    statusChanged: 'Nous vous informons que votre candidature a été refusée.',
    created: 'Votre candidature a été refusée.',
  },
  annulee: {
    statusChanged: 'Votre candidature a été annulée.',
    created: 'Votre candidature a été annulée.',
  },
};

// Règles de transition des statuts
export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  en_attente: ['en_cours', 'refusee', 'annulee'],
  en_cours: ['acceptee', 'refusee', 'annulee'],
  acceptee: ['annulee'],
  refusee: [],
  annulee: [],
};

// Statuts autorisant l'édition
export const EDITABLE_STATUSES: ApplicationStatus[] = ['en_attente'];

// Statuts supprimables
export const DELETABLE_STATUSES: ApplicationStatus[] = ['en_attente', 'refusee', 'annulee'];

// Durée par défaut de chaque statut (en jours)
export const STATUS_DURATION: Partial<Record<ApplicationStatus, number>> = {
  en_attente: 3,
  en_cours: 7,
};

// Couleurs pour les graphiques et dashboards
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  en_attente: '#F59E0B', // amber-500
  en_cours: '#3B82F6',   // blue-500
  acceptee: '#10B981',   // emerald-500
  refusee: '#EF4444',    // red-500
  annulee: '#6B7280',    // gray-500
};

// Configuration des notifications par statut
export const STATUS_NOTIFICATIONS: Record<ApplicationStatus, {
  notifyApplicant: boolean;
  notifyOwner: boolean;
  emailTemplate?: string;
}> = {
  en_attente: {
    notifyApplicant: true,
    notifyOwner: true,
    emailTemplate: 'application_received',
  },
  en_cours: {
    notifyApplicant: true,
    notifyOwner: false,
    emailTemplate: 'application_under_review',
  },
  acceptee: {
    notifyApplicant: true,
    notifyOwner: false,
    emailTemplate: 'application_accepted',
  },
  refusee: {
    notifyApplicant: true,
    notifyOwner: false,
    emailTemplate: 'application_rejected',
  },
  annulee: {
    notifyApplicant: true,
    notifyOwner: false,
    emailTemplate: 'application_cancelled',
  },
};

// Métriques par statut
export const STATUS_METRICS: Record<ApplicationStatus, {
  weight: number;
  priority: number;
}> = {
  en_attente: { weight: 1, priority: 2 },
  en_cours: { weight: 3, priority: 3 },
  acceptee: { weight: 5, priority: 1 },
  refusee: { weight: 0, priority: 0 },
  annulee: { weight: 0, priority: 0 },
};