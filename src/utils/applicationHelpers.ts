/**
 * Utilitaires et fonctions helpers pour le système de candidature
 */

import type {
  Application,
  ApplicationFormData,
  ApplicationScore,
  ScoreFactor,
  Document,
  ValidationErrors,
  PersonalInfo,
  FinancialInfo,
  Address,
  ApplicationStep,
  ApplicationStatus,
  DocumentType
} from '@/types/application';
import { APPLICATION_STATUSES } from '@/constants/applicationStatuses';
import { APPLICATION_STEPS, STEP_ORDER, STEP_STATES } from '@/constants/applicationSteps';
import { formatCurrency, formatDate } from '@/lib/formatters';

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Valide les données du formulaire de candidature
 */
export function validateApplicationForm(data: ApplicationFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validation informations personnelles
  if (!data.personalInfo.firstName?.trim()) {
    errors.personalInfo = { ...errors.personalInfo, firstName: 'Le prénom est requis' };
  }
  
  if (!data.personalInfo.lastName?.trim()) {
    errors.personalInfo = { ...errors.personalInfo, lastName: 'Le nom est requis' };
  }

  if (!data.personalInfo.email?.trim()) {
    errors.personalInfo = { ...errors.personalInfo, email: 'L\'email est requis' };
  } else if (!isValidEmail(data.personalInfo.email)) {
    errors.personalInfo = { ...errors.personalInfo, email: 'Email invalide' };
  }

  if (!data.personalInfo.phone?.trim()) {
    errors.personalInfo = { ...errors.personalInfo, phone: 'Le téléphone est requis' };
  }

  if (!data.personalInfo.dateOfBirth) {
    errors.personalInfo = { ...errors.personalInfo, dateOfBirth: 'La date de naissance est requise' };
  } else {
    const age = calculateAge(data.personalInfo.dateOfBirth);
    if (age < 18) {
      errors.personalInfo = { ...errors.personalInfo, dateOfBirth: 'Vous devez avoir au moins 18 ans' };
    }
  }

  // Validation situation financière
  if (!data.financialInfo.monthlyIncome || data.financialInfo.monthlyIncome <= 0) {
    errors.financialInfo = { ...errors.financialInfo, monthlyIncome: 'Le revenu mensuel est requis' };
  }

  if (!data.financialInfo.employmentType) {
    errors.financialInfo = { ...errors.financialInfo, employmentType: 'Le type d\'emploi est requis' };
  }

  // Validation garanties
  if (!data.guarantees.type) {
    errors.guarantees = { ...errors.guarantees, type: 'Le type de garantie est requis' };
  }

  // Validation des documents
  if (!data.documents || data.documents.length === 0) {
    errors.documents = 'Au moins un document est requis';
  }

  // Validation acceptation des conditions
  if (!data.acceptTerms) {
    errors.acceptTerms = 'Vous devez accepter les conditions';
  }

  if (!data.acceptPrivacy) {
    errors.acceptPrivacy = 'Vous devez accepter la politique de confidentialité';
  }

  return errors;
}

/**
 * Valide une adresse
 */
export function validateAddress(address: Address): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!address.street?.trim()) {
    errors.street = 'L\'adresse est requise';
  }

  if (!address.city?.trim()) {
    errors.city = 'La ville est requise';
  }

  if (!address.postalCode?.trim()) {
    errors.postalCode = 'Le code postal est requis';
  }

  if (!address.country?.trim()) {
    errors.country = 'Le pays est requis';
  }

  return errors;
}

/**
 * Valide un document uploadé
 */
export function validateDocument(file: File, type: DocumentType): ValidationErrors {
  const errors: ValidationErrors = {};

  // Taille max 5MB
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.file = 'Le fichier ne doit pas dépasser 5MB';
  }

  // Formats autorisés
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    errors.file = 'Format non supporté. Utilisez JPG, PNG, WEBP ou PDF';
  }

  return errors;
}

/**
 * Vérifie si un email est valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Vérifie si un téléphone est valide
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
  return phoneRegex.test(phone);
}

/**
 * Calcule l'âge à partir d'une date de naissance
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// ============================================================================
// CALCULS ET SCORING
// ============================================================================

/**
 * Calcule le score d'une candidature
 */
export function calculateApplicationScore(application: Application): ApplicationScore {
  const factors: ScoreFactor[] = [];
  
  // Score financier (40% du score total)
  const financialScore = calculateFinancialScore(application);
  factors.push({
    name: 'Situation financière',
    weight: 0.4,
    value: financialScore,
    score: financialScore,
  });

  // Score de stabilité (30% du score total)
  const stabilityScore = calculateStabilityScore(application);
  factors.push({
    name: 'Stabilité professionnelle',
    weight: 0.3,
    value: stabilityScore,
    score: stabilityScore,
  });

  // Score garanties (20% du score total)
  const guaranteeScore = calculateGuaranteeScore(application);
  factors.push({
    name: 'Garanties',
    weight: 0.2,
    value: guaranteeScore,
    score: guaranteeScore,
  });

  // Score documents (10% du score total)
  const documentScore = calculateDocumentScore(application);
  factors.push({
    name: 'Complétude des documents',
    weight: 0.1,
    value: documentScore,
    score: documentScore,
  });

  // Score global
  const globalScore = factors.reduce((total, factor) => {
    return total + (factor.score * factor.weight);
  }, 0);

  return {
    globalScore: Math.round(globalScore),
    financialScore: Math.round(financialScore),
    stabilityScore: Math.round(stabilityScore),
    guaranteeScore: Math.round(guaranteeScore),
    documentScore: Math.round(documentScore),
    level: getScoreLevel(globalScore),
    factors,
    calculatedAt: new Date(),
  };
}

/**
 * Calcule le score financier
 */
function calculateFinancialScore(application: Application): number {
  const { financialInfo } = application.metadata as any;
  
  if (!financialInfo) return 0;

  // Ratio revenus/dépenses (plus c'est élevé, mieux c'est)
  const incomeExpenseRatio = financialInfo.monthlyIncome / financialInfo.monthlyExpenses;
  const ratioScore = Math.min((incomeExpenseRatio / 3) * 100, 100); // 3 = ratio cible

  // Montant de l'épargne (bonus)
  const savingsBonus = Math.min((financialInfo.savings / financialInfo.monthlyIncome) * 20, 20);

  // Pénalité pour crédits existants
  const creditPenalty = financialInfo.existingCredits?.reduce((total, credit) => {
    return total + (credit.monthlyPayment / financialInfo.monthlyIncome) * 30;
  }, 0) || 0;

  return Math.max(0, ratioScore + savingsBonus - creditPenalty);
}

/**
 * Calcule le score de stabilité
 */
function calculateStabilityScore(application: Application): number {
  const { financialInfo } = application.metadata as any;
  
  if (!financialInfo) return 0;

  let score = 0;

  // Type d'emploi
  switch (financialInfo.employmentType) {
    case 'cdi':
      score += 100;
      break;
    case 'cdd':
      score += 60;
      break;
    case 'freelance':
      score += 40;
      break;
    default:
      score += 20;
  }

  // Ancienneté dans l'emploi
  if (financialInfo.employmentStartDate) {
    const yearsInJob = (new Date().getTime() - new Date(financialInfo.employmentStartDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    score += Math.min(yearsInJob * 10, 50); // Max 50 points pour 5 ans
  }

  return Math.min(score, 100);
}

/**
 * Calcule le score des garanties
 */
function calculateGuaranteeScore(application: Application): number {
  const { guarantees } = application.metadata as any;
  
  if (!guarantees) return 0;

  let score = 0;

  switch (guarantees.type) {
    case 'garant_bancaire':
      score += 100;
      break;
    case 'visale':
      score += 80;
      break;
    case 'caution':
      score += 60;
      break;
    case 'garant_physique':
      score += 40;
      break;
    default:
      score += 0;
  }

  // Bonus si la garantie couvre plus de 3 mois de loyer
  if (guarantees.amount && guarantees.monthlyRent) {
    const coverageMonths = guarantees.amount / guarantees.monthlyRent;
    if (coverageMonths >= 3) {
      score += 20;
    }
  }

  return Math.min(score, 100);
}

/**
 * Calcule le score des documents
 */
function calculateDocumentScore(application: Application): number {
  if (!application.documents || application.documents.length === 0) {
    return 0;
  }

  const totalScore = application.documents.reduce((score, doc) => {
    // Score de base pour chaque document
    let docScore = 20;

    // Bonus si le document est vérifié
    if (doc.verified) {
      docScore += 10;
    }

    // Bonus pour les documents requis
    if (isRequiredDocument(doc.type)) {
      docScore += 10;
    }

    return score + docScore;
  }, 0);

  const maxScore = getRequiredDocuments().length * 40; // 20 + 10 + 10 par doc requis
  return Math.min((totalScore / maxScore) * 100, 100);
}

/**
 * Détermine le niveau de score
 */
function getScoreLevel(score: number): 'faible' | 'moyen' | 'bon' | 'excellent' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'bon';
  if (score >= 40) return 'moyen';
  return 'faible';
}

// ============================================================================
// PROGRESSION ET ÉTATS
// ============================================================================

/**
 * Calcule le pourcentage de progression du formulaire
 */
export function calculateProgress(application: Application): number {
  const totalSteps = STEP_ORDER.length;
  const completedSteps = application.steps.filter(step => 
    isStepCompleted(application, step)
  ).length;

  return Math.round((completedSteps / totalSteps) * 100);
}

/**
 * Vérifie si une étape est complétée
 */
export function isStepCompleted(application: Application, step: ApplicationStep): boolean {
  const stepIndex = STEP_ORDER.indexOf(step);
  return stepIndex <= STEP_ORDER.indexOf(application.currentStep);
}

/**
 * Vérifie si une étape est valide
 */
export function isStepValid(application: Application, step: ApplicationStep): boolean {
  switch (step) {
    case 'informations_personnelles':
      return isPersonalInfoValid(application.metadata?.personalInfo);
    case 'situation_financiere':
      return isFinancialInfoValid(application.metadata?.financialInfo);
    case 'garanties':
      return isGuaranteeValid(application.metadata?.guarantees);
    case 'documents':
      return areDocumentsValid(application.documents);
    case 'validation':
      return application.metadata?.acceptedTerms && application.metadata?.acceptedPrivacy;
    default:
      return false;
  }
}

/**
 * Obtient l'étape suivante
 */
export function getNextStep(currentStep: ApplicationStep): ApplicationStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : null;
}

/**
 * Obtient l'étape précédente
 */
export function getPreviousStep(currentStep: ApplicationStep): ApplicationStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null;
}

// ============================================================================
// FORMATAGE ET AFFICHAGE
// ============================================================================

/**
 * Formate le statut pour l'affichage
 */
export function formatStatus(status: ApplicationStatus): string {
  return APPLICATION_STATUSES[status]?.label || status;
}

/**
 * Formate une étape pour l'affichage
 */
export function formatStep(step: ApplicationStep): string {
  return APPLICATION_STEPS[step]?.label || step;
}

/**
 * Formate le score pour l'affichage
 */
export function formatScore(score: number): string {
  return `${score}/100`;
}

/**
 * Formate la date de création
 */
export function formatCreatedAt(date: Date): string {
  return formatDate(date, 'dd/MM/yyyy à HH:mm');
}

/**
 * Formate le temps de traitement estimé
 */
export function formatProcessingTime(days: number): string {
  if (days < 1) return 'Moins d\'1 jour';
  if (days === 1) return '1 jour';
  return `${days} jours`;
}

// ============================================================================
// EXPORT/IMPORT
// ============================================================================

/**
 * Exporte les données de candidature
 */
export function exportApplicationData(application: Application): string {
  const exportData = {
    application: {
      id: application.id,
      status: application.status,
      currentStep: application.currentStep,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    },
    personalInfo: application.metadata?.personalInfo,
    financialInfo: application.metadata?.financialInfo,
    guarantees: application.metadata?.guarantees,
    score: application.score,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Importe les données de candidature
 */
export function importApplicationData(jsonData: string): Partial<Application> {
  try {
    const data = JSON.parse(jsonData);
    
    return {
      id: data.application?.id,
      status: data.application?.status,
      currentStep: data.application?.currentStep,
      createdAt: new Date(data.application?.createdAt),
      updatedAt: new Date(data.application?.updatedAt),
      metadata: {
        ...data.application?.metadata,
        personalInfo: data.personalInfo,
        financialInfo: data.financialInfo,
        guarantees: data.guarantees,
      },
      score: data.score,
    };
  } catch (error) {
    throw new Error('Données d\'import invalides');
  }
}

// ============================================================================
// UTILITAIRES PRIVÉS
// ============================================================================

function isPersonalInfoValid(personalInfo: PersonalInfo): boolean {
  return !!(personalInfo?.firstName && personalInfo?.lastName && 
           personalInfo?.email && personalInfo?.phone && personalInfo?.dateOfBirth);
}

function isFinancialInfoValid(financialInfo: FinancialInfo): boolean {
  return !!(financialInfo?.monthlyIncome && financialInfo?.employmentType && 
           financialInfo?.monthlyExpenses);
}

function isGuaranteeValid(guarantees: any): boolean {
  return !!(guarantees?.type);
}

function areDocumentsValid(documents: Document[]): boolean {
  return !!(documents && documents.length > 0);
}

function isRequiredDocument(type: DocumentType): boolean {
  const requiredTypes: DocumentType[] = ['piece_identite', 'bulletin_salaire', 'avis_imposition'];
  return requiredTypes.includes(type);
}

function getRequiredDocuments(): DocumentType[] {
  return ['piece_identite', 'bulletin_salaire', 'avis_imposition'];
}

// ============================================================================
// CONSTANTES EXPORTÉES
// ============================================================================

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[0-9\s\-\(\)]{8,}$/,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  MIN_AGE: 18,
  MIN_INCOME_RATIO: 1.5, // Revenus/dépenses minimum
} as const;