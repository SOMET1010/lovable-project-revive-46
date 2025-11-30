/**
 * Constantes pour les étapes du formulaire de candidature
 */

import type { ApplicationStep } from '@/types/application';

// Configuration des étapes du formulaire
export const APPLICATION_STEPS: Record<ApplicationStep, {
  label: string;
  description: string;
  icon: string;
  order: number;
  required: boolean;
  estimatedTime: number; // en minutes
  fields: string[];
}> = {
  informations_personnelles: {
    label: 'Informations personnelles',
    description: 'Vos informations de base et contact',
    icon: 'UserIcon',
    order: 1,
    required: true,
    estimatedTime: 10,
    fields: [
      'firstName',
      'lastName', 
      'email',
      'phone',
      'dateOfBirth',
      'nationality',
      'address',
      'emergencyContact'
    ],
  },
  situation_financiere: {
    label: 'Situation financière',
    description: 'Vos revenus et situation professionnelle',
    icon: 'CurrencyEuroIcon',
    order: 2,
    required: true,
    estimatedTime: 15,
    fields: [
      'monthlyIncome',
      'employmentType',
      'employer',
      'employmentStartDate',
      'monthlyExpenses',
      'existingCredits',
      'savings',
      'coApplicant'
    ],
  },
  garanties: {
    label: 'Garanties',
    description: 'Type de garantie fournie',
    icon: 'ShieldCheckIcon',
    order: 3,
    required: true,
    estimatedTime: 5,
    fields: [
      'guaranteeType',
      'guaranteeAmount',
      'guaranteeProvider',
      'guaranteeValidityDate'
    ],
  },
  documents: {
    label: 'Documents',
    description: 'Téléchargement de vos documents justificatifs',
    icon: 'DocumentIcon',
    order: 4,
    required: true,
    estimatedTime: 20,
    fields: [
      'pieceIdentite',
      'bulletinSalaire',
      'avisImposition',
      'attestationEmployeur',
      'garantieBancaire',
      'autre'
    ],
  },
  validation: {
    label: 'Validation',
    description: 'Révision et soumission de votre candidature',
    icon: 'CheckCircleIcon',
    order: 5,
    required: true,
    estimatedTime: 3,
    fields: [
      'acceptTerms',
      'acceptPrivacy',
      'signature'
    ],
  },
};

// Ordre des étapes
export const STEP_ORDER: ApplicationStep[] = [
  'informations_personnelles',
  'situation_financiere', 
  'garanties',
  'documents',
  'validation',
];

// Étapes principales (sans la validation finale)
export const MAIN_STEPS: ApplicationStep[] = [
  'informations_personnelles',
  'situation_financiere',
  'garanties',
  'documents',
];

// Étapes optionnelles
export const OPTIONAL_STEPS: ApplicationStep[] = [
  // Toutes les étapes sont obligatoires pour l'instant
];

// Navigation entre étapes
export const STEP_NAVIGATION: Record<ApplicationStep, {
  next?: ApplicationStep;
  previous?: ApplicationStep;
  canSkip: boolean;
}> = {
  informations_personnelles: {
    next: 'situation_financiere',
    canSkip: false,
  },
  situation_financiere: {
    next: 'garanties',
    previous: 'informations_personnelles',
    canSkip: false,
  },
  garanties: {
    next: 'documents',
    previous: 'situation_financiere',
    canSkip: false,
  },
  documents: {
    next: 'validation',
    previous: 'garanties',
    canSkip: false,
  },
  validation: {
    previous: 'documents',
    canSkip: false,
  },
};

// Validation par étape
export const STEP_VALIDATION: Record<ApplicationStep, {
  requiredFields: string[];
  customValidators: string[];
}> = {
  informations_personnelles: {
    requiredFields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'],
    customValidators: ['email', 'phone', 'age', 'emergencyContact'],
  },
  situation_financiere: {
    requiredFields: ['monthlyIncome', 'employmentType', 'monthlyExpenses'],
    customValidators: ['incomeRatio', 'employmentStability'],
  },
  garanties: {
    requiredFields: ['guaranteeType'],
    customValidators: ['guaranteeAmount', 'guaranteeValidity'],
  },
  documents: {
    requiredFields: ['pieceIdentite', 'bulletinSalaire'],
    customValidators: ['documentSize', 'documentFormat'],
  },
  validation: {
    requiredFields: ['acceptTerms', 'acceptPrivacy'],
    customValidators: ['formCompleteness'],
  },
};

// Messages d'erreur par étape
export const STEP_ERROR_MESSAGES: Record<ApplicationStep, Record<string, string>> = {
  informations_personnelles: {
    firstName: 'Le prénom est requis',
    lastName: 'Le nom est requis',
    email: 'Un email valide est requis',
    phone: 'Un numéro de téléphone valide est requis',
    dateOfBirth: 'La date de naissance est requise',
    age: 'Vous devez avoir au moins 18 ans',
    emergencyContact: 'Un contact d\'urgence est requis',
  },
  situation_financiere: {
    monthlyIncome: 'Le revenu mensuel est requis',
    employmentType: 'Le type d\'emploi est requis',
    monthlyExpenses: 'Les dépenses mensuelles sont requises',
    incomeRatio: 'Le ratio revenus/dépenses doit être suffisant',
    employmentStability: 'La stabilité professionnelle doit être démontrée',
  },
  garanties: {
    guaranteeType: 'Le type de garantie est requis',
    guaranteeAmount: 'Le montant de la garantie est requis',
    guaranteeValidity: 'La garantie doit être valide',
  },
  documents: {
    pieceIdentite: 'Une pièce d\'identité est requise',
    bulletinSalaire: 'Un bulletin de salaire est requis',
    documentSize: 'Le fichier ne doit pas dépasser 5MB',
    documentFormat: 'Format de fichier non supporté',
  },
  validation: {
    acceptTerms: 'Vous devez accepter les conditions',
    acceptPrivacy: 'Vous devez accepter la politique de confidentialité',
    formCompleteness: 'Le formulaire doit être complet',
  },
};

// Configuration de progression
export const PROGRESS_CONFIG = {
  // Percentage de progression par étape
  stepProgress: {
    informations_personnelles: 20,
    situation_financiere: 25,
    garanties: 15,
    documents: 25,
    validation: 15,
  },
  // Délai maximum par étape (en minutes)
  maxStepTime: {
    informations_personnelles: 30,
    situation_financiere: 45,
    garanties: 15,
    documents: 60,
    validation: 10,
  },
  // Sauvegarde automatique (en secondes)
  autoSaveInterval: 30,
  // Timeout de session (en minutes)
  sessionTimeout: 60,
};

// Étapes avec documents requis
export const STEPS_WITH_DOCUMENTS: ApplicationStep[] = ['documents'];

// Types de documents requis par étape
export const REQUIRED_DOCUMENTS_BY_STEP: Record<ApplicationStep, string[]> = {
  informations_personnelles: [],
  situation_financiere: ['bulletinSalaire', 'avisImposition'],
  garanties: ['garantieBancaire'],
  documents: ['pieceIdentite'],
  validation: [],
};

// Configuration d'affichage
export const STEP_DISPLAY_CONFIG = {
  // Nombre d'étapes à afficher dans la navigation
  visibleSteps: 5,
  // Si la navigation compacte doit être utilisée
  compactNavigation: false,
  // Si les icônes doivent être affichées
  showIcons: true,
  // Si les descriptions doivent être affichées
  showDescriptions: true,
};

// États d'étape
export const STEP_STATES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed',
  ERROR: 'error',
  SKIPPED: 'skipped',
} as const;

// Messages d'aide par étape
export const STEP_HELP_MESSAGES: Record<ApplicationStep, string> = {
  informations_personnelles: 'Assurez-vous que toutes vos informations sont à jour.',
  situation_financiere: 'Precisez tous vos revenus et charges pour une évaluation précise.',
  garanties: 'Choisissez le type de garantie qui vous convient le mieux.',
  documents: 'Téléchargez des fichiers nets et lisibles.',
  validation: 'Vérifiez vos informations avant de soumettre votre candidature.',
};