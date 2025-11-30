/**
 * Service pour la gestion des candidatures
 * API et logique métier
 */

import { supabase } from '@/lib/supabase';
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
  try {
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

    // Créer l'application dans Supabase
    const { data, error } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) {
      return {
        error: {
          message: 'Erreur lors de la création de la candidature',
          details: error.message,
        },
      };
    }

    // Traiter les documents uploadés si présents
    if (formData.documents.length > 0) {
      await uploadDocuments(data.id, formData.documents);
    }

    // Calculer le score initial
    const application = mapFromDatabase(data);
    const score = calculateApplicationScore(application);
    
    await updateApplicationScore(data.id, score);

    // Envoyer notification
    await sendApplicationNotification(data.id, 'application_created');

    return { data: { ...application, score } };

  } catch (error) {
    return {
      error: {
        message: 'Erreur lors de la création de la candidature',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
    };
  }
}

/**
 * Récupérer une candidature par ID
 */
export async function getApplication(id: string): Promise<{ data?: Application; error?: string }> {
  try {
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
      return { error: error.message };
    }

    return { data: mapFromDatabase(data) };

  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération',
    };
  }
}

/**
 * Récupérer les candidatures avec filtres et pagination
 */
export async function getApplications(
  filters: ApplicationFilters = {},
  pagination: ApplicationPagination = { page: 1, pageSize: 10, sortBy: 'created_at', sortOrder: 'desc' }
): Promise<{ data?: PaginatedApplications; error?: string }> {
  try {
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
      return { error: error.message };
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

  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération',
    };
  }
}

/**
 * Mettre à jour le statut d'une candidature
 */
export async function updateApplicationStatus(
  id: string,
  newStatus: ApplicationStatus,
  adminNotes?: string
): Promise<UpdateApplicationResponse> {
  try {
    // Vérifier si la transition est autorisée
    const { data: currentApp } = await supabase
      .from('applications')
      .select('status')
      .eq('id', id)
      .single();

    if (!currentApp) {
      return { error: { message: 'Candidature non trouvée' } };
    }

    const allowedTransitions = STATUS_TRANSITIONS[currentApp.status as ApplicationStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return {
        error: {
          message: `Transition de statut non autorisée: ${currentApp.status} → ${newStatus}`,
        },
      };
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
      return {
        error: {
          message: 'Erreur lors de la mise à jour du statut',
          details: error.message,
        },
      };
    }

    // Envoyer notification
    await sendApplicationNotification(id, 'status_changed', { newStatus });

    return { data: mapFromDatabase(data) };

  } catch (error) {
    return {
      error: {
        message: 'Erreur lors de la mise à jour du statut',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
    };
  }
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
 * Envoyer une notification de candidature
 */
async function sendApplicationNotification(
  applicationId: string,
  type: string,
  data?: any
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
 * Mapper les données de la base vers l'interface Application
 */
function mapFromDatabase(data: any): Application {
  return {
    id: data.id,
    propertyId: data.property_id,
    applicantId: data.applicant_id,
    status: data.status,
    steps: data.steps || [],
    currentStep: data.current_step,
    documents: data.documents?.map(mapDocumentFromDatabase) || [],
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
function mapDocumentFromDatabase(data: any): Document {
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
 */
function determineDocumentType(fileName: string): DocumentType {
  const name = fileName.toLowerCase();
  
  if (name.includes('cni') || name.includes('passport') || name.includes('identite')) {
    return 'piece_identite';
  }
  
  if (name.includes('salaire') || name.includes('bulletin') || name.includes('pay')) {
    return 'bulletin_salaire';
  }
  
  if (name.includes('impot') || name.includes('tax') || name.includes('avis')) {
    return 'avis_imposition';
  }
  
  if (name.includes('employeur') || name.includes('work') || name.includes('employment')) {
    return 'attestation_employeur';
  }
  
  if (name.includes('banque') || name.includes('bank') || name.includes('garantie')) {
    return 'garantie_bancaire';
  }
  
  return 'autre';
}