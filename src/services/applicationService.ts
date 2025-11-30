/**
 * Service pour la gestion des candidatures
 * API et logique métier avec gestion d'erreur robuste
 */

import { supabase } from '@/lib/supabase';
import { ErrorHandler } from '@/lib/errorHandler';
import type {
  Application,
  ApplicationFormData,
  ApplicationStatus,
  ApplicationStep,
  Document,
  DocumentType,
  ApplicationFilters,
  ApplicationPagination,
  PaginatedApplications,
  ApplicationScore,
  CreateApplicationResponse,
  UpdateApplicationResponse,
  UploadDocumentResponse,
  ApplicationStats
} from '@/types/application';
import { APPLICATION_STATUSES, STATUS_TRANSITIONS } from '@/constants/applicationStatuses';
import { calculateApplicationScore, validateApplicationForm } from '@/utils/applicationHelpers';

// Configuration de retry pour Supabase
const SUPABASE_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  timeout: 30000,
  retryCondition: ErrorHandler.createSupabaseRetryCondition(),
};

// Context pour le logging
const SERVICE_CONTEXT = { service: 'ApplicationService', context: { module: 'applications' } };

// ============================================================================
// UTILITAIRES AVEC RETRY
// ============================================================================

/**
 * Upload de documents avec retry automatique
 */
async function uploadDocumentsWithRetry(
  applicationId: string,
  files: File[]
): Promise<void> {
  await ErrorHandler.executeWithRetry(
    async () => {
      await uploadDocuments(applicationId, files);
    },
    { ...SERVICE_CONTEXT, operation: 'uploadDocumentsWithRetry' },
    SUPABASE_RETRY_CONFIG
  );
}

/**
 * Mise à jour du score avec retry automatique
 */
async function updateApplicationScoreWithRetry(applicationId: string, score: ApplicationScore): Promise<void> {
  await ErrorHandler.executeWithRetry(
    async () => {
      await updateApplicationScore(applicationId, score);
    },
    { ...SERVICE_CONTEXT, operation: 'updateApplicationScoreWithRetry' },
    SUPABASE_RETRY_CONFIG
  );
}

/**
 * Envoi de notification avec retry automatique
 */
async function sendApplicationNotificationWithRetry(
  applicationId: string,
  type: string,
  data?: ApplicationNotificationData
): Promise<void> {
  await ErrorHandler.executeWithRetry(
    async () => {
      await sendApplicationNotification(applicationId, type, data);
    },
    { ...SERVICE_CONTEXT, operation: 'sendApplicationNotificationWithRetry' },
    { ...SUPABASE_RETRY_CONFIG, maxRetries: 2 } // Moins de retries pour les notifications
  );
}

/**
 * Récupération d'application avec retry
 */
async function getApplicationWithRetry(id: string): Promise<any> {
  return ErrorHandler.executeWithRetry(
    async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          property:properties(*),
          applicant:profiles(*),
          documents:application_documents(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    },
    { ...SERVICE_CONTEXT, operation: 'getApplicationWithRetry' },
    SUPABASE_RETRY_CONFIG
  );
}

/**
 * Mise à jour de statut avec retry
 */
async function updateApplicationStatusWithRetry(
  id: string,
  newStatus: ApplicationStatus,
  adminNotes?: string
): Promise<any> {
  return ErrorHandler.executeWithRetry(
    async () => {
      // Vérifier si la transition est autorisée
      const { data: currentApp } = await supabase
        .from('applications')
        .select('status')
        .eq('id', id)
        .single();

      if (!currentApp) {
        throw new Error('Candidature non trouvée');
      }

      const allowedTransitions = STATUS_TRANSITIONS[currentApp.status as ApplicationStatus] || [];
      if (!allowedTransitions.includes(newStatus)) {
        throw new Error(`Transition de statut non autorisée: ${currentApp.status} → ${newStatus}`);
      }

      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Ajouter les notes admin si fourni
      if (adminNotes) {
        updateData.metadata = {
          adminNotes,
          updatedAt: new Date().toISOString(),
        };
      }

      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    },
    { ...SERVICE_CONTEXT, operation: 'updateApplicationStatusWithRetry' },
    SUPABASE_RETRY_CONFIG
  );
}

// ============================================================================
// CRUD APPLICATIONS
// ============================================================================

/**
 * Créer une nouvelle candidature
 */
export async function createApplication(
  propertyId: string,
  applicantId: string,
  formData: ApplicationFormData
): Promise<CreateApplicationResponse> {
  return ErrorHandler.executeWithRetry(async () => {
    // Validation des données
    const validationErrors = validateApplicationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      return {
        error: {
          message: 'Données invalides',
          details: validationErrors,
        },
      };
    }

    // Préparer les données de l'application
    const applicationData = {
      property_id: propertyId,
      applicant_id: applicantId,
      status: 'en_attente' as ApplicationStatus,
      current_step: 'informations_personnelles' as ApplicationStep,
      steps: ['informations_personnelles'],
      metadata: {
        personalInfo: formData.personalInfo,
        financialInfo: formData.financialInfo,
        guarantees: formData.guarantees,
        acceptedTerms: formData.acceptTerms,
        acceptedPrivacy: formData.acceptPrivacy,
        submittedFrom: 'web' as const,
        priority: 'normale' as const,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Créer l'application dans Supabase avec retry
    const { data, error } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Traiter les documents uploadés si présents (avec retry)
    if (formData.documents.length > 0) {
      await uploadDocumentsWithRetry(data.id, formData.documents);
    }

    // Calculer le score initial (avec retry)
    const application = mapFromDatabase(data);
    const score = calculateApplicationScore(application);
    
    await updateApplicationScoreWithRetry(data.id, score);

    // Envoyer notification (avec retry)
    await sendApplicationNotificationWithRetry(data.id, 'application_created');

    return { data: { ...application, score } };
  }, { ...SERVICE_CONTEXT, operation: 'createApplication' }, SUPABASE_RETRY_CONFIG);
}

/**
 * Récupérer une candidature par ID
 */
export async function getApplication(id: string): Promise<{ data?: Application; error?: string }> {
  return ErrorHandler.executeWithRetry(
    async () => {
      const data = await getApplicationWithRetry(id);
      return { data: mapFromDatabase(data) };
    },
    { ...SERVICE_CONTEXT, operation: 'getApplication' },
    SUPABASE_RETRY_CONFIG
  );
}

/**
 * Récupérer les candidatures avec filtres et pagination
 */
export async function getApplications(
  filters: ApplicationFilters = {},
  pagination: ApplicationPagination = { page: 1, pageSize: 10, sortBy: 'created_at', sortOrder: 'desc' }
): Promise<{ data?: PaginatedApplications; error?: string }> {
  return ErrorHandler.executeWithRetry(async () => {
    let query = supabase
      .from('applications')
      .select(`
        *,
        property:properties(title, address, price),
        applicant:profiles(full_name, email),
        documents:application_documents(id, type, name, verified)
      `);

    // Appliquer les filtres
    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters.propertyId) {
      query = query.eq('property_id', filters.propertyId);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    if (filters.searchQuery) {
      query = query.or(`applicant.full_name.ilike.%${filters.searchQuery}%,applicant.email.ilike.%${filters.searchQuery}%`);
    }

    // Appliquer la pagination
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    query = query
      .order(pagination.sortBy, { ascending: pagination.sortOrder === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    const applications = data?.map(mapFromDatabase) || [];
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pagination.pageSize);

    return {
      data: {
        data: applications,
        totalCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrevious: pagination.page > 1,
      },
    };
  }, { ...SERVICE_CONTEXT, operation: 'getApplications' }, SUPABASE_RETRY_CONFIG);
}

/**
 * Mettre à jour le statut d'une candidature
 */
export async function updateApplicationStatus(
  id: string,
  newStatus: ApplicationStatus,
  adminNotes?: string
): Promise<UpdateApplicationResponse> {
  return ErrorHandler.executeWithRetry(async () => {
    const data = await updateApplicationStatusWithRetry(id, newStatus, adminNotes);
    
    // Envoyer notification avec retry
    await sendApplicationNotificationWithRetry(id, 'status_changed', { newStatus });

    return { data: mapFromDatabase(data) };
  }, { ...SERVICE_CONTEXT, operation: 'updateApplicationStatus' }, SUPABASE_RETRY_CONFIG);
}

/**
 * Mettre à jour l'étape actuelle du formulaire
 */
export async function updateCurrentStep(
  id: string,
  newStep: ApplicationStep
): Promise<UpdateApplicationResponse> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({
        current_step: newStep,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        error: {
          message: 'Erreur lors de la mise à jour de l\'étape',
          details: error.message,
        },
      };
    }

    return { data: mapFromDatabase(data) };

  } catch (error) {
    return {
      error: {
        message: 'Erreur lors de la mise à jour de l\'étape',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
    };
  }
}

/**
 * Supprimer une candidature
 */
export async function deleteApplication(id: string): Promise<{ error?: string }> {
  try {
    // Supprimer d'abord les documents associés
    const { error: docError } = await supabase
      .from('application_documents')
      .delete()
      .eq('application_id', id);

    if (docError) {
      return { error: 'Erreur lors de la suppression des documents' };
    }

    // Supprimer l'application
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: 'Erreur lors de la suppression de la candidature' };
    }

    return {};

  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
    };
  }
}

// ============================================================================
// DOCUMENTS
// ============================================================================

/**
 * Upload d'un document
 */
export async function uploadDocument(
  applicationId: string,
  file: File,
  type: DocumentType
): Promise<UploadDocumentResponse> {
  try {
    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        error: {
          message: 'Type de fichier non supporté',
          details: `Types autorisés: ${allowedTypes.join(', ')}`,
        },
      };
    }

    if (file.size > maxSize) {
      return {
        error: {
          message: 'Fichier trop volumineux',
          details: 'Taille maximum: 5MB',
        },
      };
    }

    // Upload vers Supabase Storage
    const fileName = `${applicationId}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('application-documents')
      .upload(fileName, file);

    if (uploadError) {
      return {
        error: {
          message: 'Erreur lors de l\'upload',
          details: uploadError.message,
        },
      };
    }

    // Créer l'enregistrement en base
    const { data: documentData, error: dbError } = await supabase
      .from('application_documents')
      .insert([{
        application_id: applicationId,
        type,
        name: fileName,
        original_name: file.name,
        url: uploadData.path,
        size: file.size,
        mime_type: file.type,
        verified: false,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (dbError) {
      // Nettoyer le fichier uploadé en cas d'erreur
      await supabase.storage.from('application-documents').remove([fileName]);
      
      return {
        error: {
          message: 'Erreur lors de l\'enregistrement du document',
          details: dbError.message,
        },
      };
    }

    // Recalculer le score si nécessaire
    await recalculateApplicationScore(applicationId);

    return { data: mapDocumentFromDatabase(documentData) };

  } catch (error) {
    return {
      error: {
        message: 'Erreur lors de l\'upload du document',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
    };
  }
}

/**
 * Upload multiple documents
 */
export async function uploadDocuments(
  applicationId: string,
  files: File[]
): Promise<UploadDocumentResponse[]> {
  const results: UploadDocumentResponse[] = [];

  for (const file of files) {
    // Déterminer le type de document basé sur le nom de fichier
    const type = determineDocumentType(file.name);
    const result = await uploadDocument(applicationId, file, type);
    results.push(result);
  }

  return results;
}

/**
 * Supprimer un document
 */
export async function deleteDocument(documentId: string): Promise<{ error?: string }> {
  try {
    // Récupérer les infos du document
    const { data: document, error: fetchError } = await supabase
      .from('application_documents')
      .select('url, application_id')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      return { error: 'Document non trouvé' };
    }

    // Supprimer de Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('application-documents')
      .remove([document.url]);

    if (storageError) {
      console.warn('Erreur lors de la suppression du fichier:', storageError);
    }

    // Supprimer de la base
    const { error: dbError } = await supabase
      .from('application_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      return { error: 'Erreur lors de la suppression du document' };
    }

    // Recalculer le score
    await recalculateApplicationScore(document.application_id);

    return {};

  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
    };
  }
}

// ============================================================================
// SCORING
// ============================================================================

/**
 * Calculer et mettre à jour le score d'une candidature
 */
export async function calculateAndUpdateScore(applicationId: string): Promise<ApplicationScore> {
  try {
    // Récupérer l'application complète
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        documents:application_documents(*)
      `)
      .eq('id', applicationId)
      .single();

    if (error || !application) {
      throw new Error('Application non trouvée');
    }

    // Calculer le score
    const app = mapFromDatabase(application);
    const score = calculateApplicationScore(app);

    // Sauvegarder le score
    await updateApplicationScore(applicationId, score);

    return score;

  } catch (error) {
    throw new Error('Erreur lors du calcul du score: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
  }
}

/**
 * Obtenir les statistiques des candidatures
 */
export async function getApplicationStats(): Promise<{ data?: ApplicationStats; error?: string }> {
  try {
    // Requête pour obtenir les statistiques de base
    const { data, error } = await supabase.rpc('get_application_stats');

    if (error) {
      return { error: error.message };
    }

    // Calculer le taux de conversion
    const totalApplications = data.total || 0;
    const acceptedApplications = data.acceptee || 0;
    const conversionRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;

    const stats: ApplicationStats = {
      total: totalApplications,
      en_attente: data.en_attente || 0,
      en_cours: data.en_cours || 0,
      acceptee: acceptedApplications,
      refusee: data.refusee || 0,
      annulee: data.annulee || 0,
      averageScore: data.average_score || 0,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageProcessingTime: data.average_processing_time || 0,
    };

    return { data: stats };

  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération des statistiques',
    };
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Interface pour les données de notification de candidature
 */
interface ApplicationNotificationData {
  statusChange?: {
    from: ApplicationStatus;
    to: ApplicationStatus;
  };
  documentRequired?: {
    documentType: DocumentType;
    reason?: string;
  };
  interviewScheduled?: {
    date: Date;
    location?: string;
  };
  general?: {
    message: string;
    actionUrl?: string;
  };
}

/**
 * Envoyer une notification de candidature
 */
async function sendApplicationNotification(
  applicationId: string,
  type: string,
  data?: ApplicationNotificationData
): Promise<void> {
  try {
    // Créer la notification en base
    await supabase.from('application_notifications').insert([{
      application_id: applicationId,
      type,
      data: data || {},
      created_at: new Date().toISOString(),
    }]);

    // Envoyer notification par email (intégration future)
    // await emailService.sendApplicationNotification(applicationId, type, data);

  } catch (error) {
    console.warn('Erreur lors de l\'envoi de notification:', error);
  }
}

// ============================================================================
// UTILITAIRES PRIVÉS
// ============================================================================

/**
 * Mettre à jour le score d'une candidature en base
 */
async function updateApplicationScore(applicationId: string, score: ApplicationScore): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({
      score: score.globalScore,
      metadata: {
        scoreData: score,
        updatedAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId);

  if (error) {
    console.warn('Erreur lors de la sauvegarde du score:', error);
  }
}

/**
 * Recalculer le score d'une candidature
 */
async function recalculateApplicationScore(applicationId: string): Promise<void> {
  try {
    await calculateAndUpdateScore(applicationId);
  } catch (error) {
    console.warn('Erreur lors du recalcul du score:', error);
  }
}

/**
 * Interface pour les données de la base de données
 */
interface DatabaseApplicationData {
  id: string;
  property_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  steps?: ApplicationStep[];
  current_step: ApplicationStep;
  created_at: string;
  updated_at: string;
  metadata?: {
    personalInfo?: PersonalInfo;
    financialInfo?: FinancialInfo;
    guarantees?: Guarantees;
    scoreData?: ApplicationScore;
    [key: string]: unknown;
  };
  documents?: DatabaseDocumentData[];
}

interface DatabaseDocumentData {
  id: string;
  application_id: string;
  type: DocumentType;
  name: string;
  original_name: string;
  url: string;
  size: number;
  mime_type: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

/**
 * Mapper les données de la base vers l'interface Application
 */
function mapFromDatabase(data: DatabaseApplicationData): Application {
  // Validation des données d'entrée
  if (!data || typeof data !== 'object') {
    throw new Error('Données d\'application invalides');
  }

  // Validation des champs requis
  if (!data.id || !data.property_id || !data.applicant_id) {
    throw new Error('Champs requis manquants dans les données d\'application');
  }

  return {
    id: data.id,
    propertyId: data.property_id,
    applicantId: data.applicant_id,
    status: data.status,
    steps: Array.isArray(data.steps) ? data.steps : [],
    currentStep: data.current_step,
    documents: Array.isArray(data.documents) 
      ? data.documents.map(dbDoc => mapDocumentFromDatabase(dbDoc)) 
      : [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    metadata: {
      ...data.metadata,
      personalInfo: data.metadata?.personalInfo,
      financialInfo: data.metadata?.financialInfo,
      guarantees: data.metadata?.guarantees,
    },
    score: data.metadata?.scoreData ? {
      ...data.metadata.scoreData,
      calculatedAt: new Date(data.metadata.scoreData.calculatedAt),
    } : undefined,
  };
}

/**
 * Mapper les données de document de la base
 */
function mapDocumentFromDatabase(data: DatabaseDocumentData): Document {
  // Validation des données d'entrée
  if (!data || typeof data !== 'object') {
    throw new Error('Données de document invalides');
  }

  // Validation des champs requis
  if (!data.id || !data.application_id) {
    throw new Error('Champs requis manquants dans les données de document');
  }

  return {
    id: data.id,
    applicationId: data.application_id,
    type: data.type,
    name: data.name,
    originalName: data.original_name,
    url: data.url,
    size: data.size,
    mimeType: data.mime_type,
    uploadDate: new Date(data.created_at),
    verified: data.verified,
    verifiedBy: data.verified_by,
    verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
    rejectionReason: data.rejection_reason,
  };
}

/**
 * Déterminer le type de document basé sur le nom de fichier
 * @param fileName - Nom du fichier
 * @returns Type de document détecté
 */
function determineDocumentType(fileName: string): DocumentType {
  // Validation du paramètre
  if (!fileName || typeof fileName !== 'string') {
    console.warn('Nom de fichier invalide pour la détermination du type:', fileName);
    return 'autre';
  }

  const name = fileName.toLowerCase();
  
  // Patterns de détection avec priorité
  if (name.includes('cni') || name.includes('carte d\'identité') || name.includes('passport') || 
      name.includes('identite') || name.includes('passeport')) {
    return 'piece_identite';
  }
  
  if (name.includes('salaire') || name.includes('bulletin') || name.includes('pay') || 
      name.includes('paye') || name.includes('fiche de paie')) {
    return 'bulletin_salaire';
  }
  
  if (name.includes('impot') || name.includes('tax') || name.includes('avis') || 
      name.includes('d\'imposition') || name.includes('revenu')) {
    return 'avis_imposition';
  }
  
  if (name.includes('employeur') || name.includes('work') || name.includes('employment') || 
      name.includes('attestation de travail') || name.includes('salary certificate')) {
    return 'attestation_employeur';
  }
  
  if (name.includes('banque') || name.includes('bank') || name.includes('garantie') || 
      name.includes('releve bancaire') || name.includes('rib')) {
    return 'garantie_bancaire';
  }
  
  if (name.includes('releve') || name.includes('relevé') || name.includes('compte') || 
      name.includes('statement')) {
    return 'releve_bancaire';
  }
  
  // Type par défaut
  return 'autre';
}