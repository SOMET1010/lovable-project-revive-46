/**
 * Hooks personnalisés pour la gestion des candidatures
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';
import type {
  Application,
  ApplicationFormData,
  Document,
  DocumentType,
  ApplicationFilters,
  ApplicationPagination,
  PaginatedApplications,
  ApplicationStats,
  UseApplicationsOptions,
  UseApplicationsReturn,
} from '@/types/application';
import { 
  getApplications,
  getApplication,
  createApplication as createApplicationService,
  updateApplication as updateApplicationService,
  updateApplicationStatus as updateStatusService,
  updateCurrentStep as updateStepService,
  deleteApplication as deleteApplicationService,
  uploadDocument as uploadDocumentService,
  uploadDocuments as uploadDocumentsService,
  deleteDocument as deleteDocumentService,
  calculateAndUpdateScore,
  getApplicationStats,
} from '@/services/applicationService';

// ============================================================================
// HOOK PRINCIPAL: useApplications
// ============================================================================

/**
 * Hook principal pour gérer les candidatures avec filtres et pagination
 * Avec cleanup functions robustes
 */
export function useApplications(options: UseApplicationsOptions = {}): UseApplicationsReturn {
  const queryClient = useQueryClient();
  const cleanup = useCleanupRegistry('useApplications');
  const [filters, setFilters] = useState<ApplicationFilters>(options.filters || {});
  const [pagination, setPagination] = useState<ApplicationPagination>(
    options.pagination || { 
      page: 1, 
      pageSize: 10, 
      sortBy: 'created_at', 
      sortOrder: 'desc' 
    }
  );

  // Query pour récupérer les candidatures
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['applications', filters, pagination],
    queryFn: () => getApplications(filters, pagination),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !options.autoRefresh,
  });

  // Auto-refresh si activé avec cleanup automatique
  useEffect(() => {
    if (!options.autoRefresh || !options.refreshInterval) return;

    const intervalId = cleanup.createInterval(
      `applications-autorefresh-${Date.now()}`,
      () => {
        refetch();
      },
      options.refreshInterval,
      'Auto-refresh interval for applications',
      'useApplications'
    );

    return () => {
      // Le cleanup automatique s'occupera de l'interval
    };
  }, [options.autoRefresh, options.refreshInterval, refetch, cleanup]);

  // Mutations
  const createApplicationMutation = useMutation({
    mutationFn: (data: { propertyId: string; applicantId: string; formData: ApplicationFormData }) =>
      createApplicationService(data.propertyId, data.applicantId, data.formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Application> }) =>
      updateApplicationService(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: ApplicationStatus; adminNotes?: string }) =>
      updateStatusService(data.id, data.status, data.adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (data: { applicationId: string; file: File; type: DocumentType }) =>
      uploadDocumentService(data.applicationId, data.file, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-details'] });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: (id: string) => deleteApplicationService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
    },
  });

  const calculateScoreMutation = useMutation({
    mutationFn: (applicationId: string) => calculateAndUpdateScore(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-details'] });
    },
  });

  // Fonctions utilitaires
  const createApplication = useCallback(async (
    propertyId: string,
    applicantId: string,
    formData: ApplicationFormData
  ): Promise<Application> => {
    const result = await createApplicationMutation.mutateAsync({ 
      propertyId, 
      applicantId, 
      formData 
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data!;
  }, [createApplicationMutation]);

  const updateApplication = useCallback(async (
    id: string,
    updates: Partial<Application>
  ): Promise<Application> => {
    const result = await updateApplicationMutation.mutateAsync({ id, updates });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data!;
  }, [updateApplicationMutation]);

  const updateApplicationStatus = useCallback(async (
    id: string,
    status: ApplicationStatus,
    adminNotes?: string
  ): Promise<Application> => {
    const result = await updateStatusMutation.mutateAsync({ id, status, adminNotes });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data!;
  }, [updateStatusMutation]);

  const uploadDocument = useCallback(async (
    applicationId: string,
    file: File,
    type: DocumentType
  ): Promise<Document> => {
    const result = await uploadDocumentMutation.mutateAsync({ applicationId, file, type });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data!;
  }, [uploadDocumentMutation]);

  const calculateScore = useCallback(async (applicationId: string): Promise<ApplicationScore> => {
    return await calculateScoreMutation.mutateAsync(applicationId);
  }, [calculateScoreMutation]);

  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    await deleteApplicationMutation.mutateAsync(id);
  }, [deleteApplicationMutation]);

  // Gestion des filtres
  const updateFilters = useCallback((newFilters: Partial<ApplicationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Gestion de la pagination
  const updatePagination = useCallback((newPagination: Partial<ApplicationPagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters]);

  // Memoized values
  const applications = useMemo(() => data?.data?.data || [], [data]);
  const totalCount = useMemo(() => data?.data?.totalCount || 0, [data]);
  const totalPages = useMemo(() => data?.data?.totalPages || 0, [data]);
  const hasNext = useMemo(() => data?.data?.hasNext || false, [data]);
  const hasPrevious = useMemo(() => data?.data?.hasPrevious || false, [data]);

  return {
    applications,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    
    // Actions
    createApplication,
    updateApplication,
    updateApplicationStatus,
    uploadDocument,
    calculateScore,
    deleteApplication,
    
    // Filtres et pagination
    filters,
    pagination,
    totalCount,
    totalPages,
    hasNext,
    hasPrevious,
    updateFilters,
    updatePagination,
  };
}

// ============================================================================
// HOOKS SPÉCIALISÉS
// ============================================================================

/**
 * Hook pour gérer une candidature spécifique
 */
export function useApplication(applicationId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data: application,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplication(applicationId!),
    enabled: !!applicationId,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Application>) =>
      updateApplicationService(applicationId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplicationService(applicationId!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (data: { file: File; type: DocumentType }) =>
      uploadDocumentService(applicationId!, data.file, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  return {
    application: application?.data,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    
    updateApplication: updateMutation.mutateAsync,
    deleteApplication: deleteMutation.mutateAsync,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    
    // États des mutations
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploading: uploadDocumentMutation.isPending,
  };
}

/**
 * Hook pour gérer les statistiques des candidatures
 */
export function useApplicationStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['application-stats'],
    queryFn: getApplicationStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    stats: stats?.data,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook pour gérer l'upload de documents
 */
export function useDocumentUpload() {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: { applicationId: string; file: File; type: DocumentType }) =>
      uploadDocumentService(data.applicationId, data.file, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-details'] });
    },
  });

  const uploadMultipleMutation = useMutation({
    mutationFn: (data: { applicationId: string; files: File[] }) =>
      uploadDocumentsService(data.applicationId, data.files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-details'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => deleteDocumentService(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-details'] });
    },
  });

  return {
    uploadDocument: uploadMutation.mutateAsync,
    uploadDocuments: uploadMultipleMutation.mutateAsync,
    deleteDocument: deleteMutation.mutateAsync,
    
    // États
    isUploading: uploadMutation.isPending || uploadMultipleMutation.isPending,
    isDeleting: deleteMutation.isPending,
    uploadError: uploadMutation.error?.message || uploadMultipleMutation.error?.message,
    deleteError: deleteMutation.error?.message,
  };
}

/**
 * Hook pour gérer le formulaire de candidature
 */
export function useApplicationForm() {
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    'informations_personnelles',
    'situation_financiere',
    'garanties',
    'documents',
    'validation',
  ];

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const updatePersonalInfo = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, personalInfo: data }));
  }, []);

  const updateFinancialInfo = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, financialInfo: data }));
  }, []);

  const updateGuarantees = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, guarantees: data }));
  }, []);

  const addDocuments = useCallback((files: File[]) => {
    setFormData(prev => ({ 
      ...prev, 
      documents: [...(prev.documents || []), ...files] 
    }));
  }, []);

  const removeDocument = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const resetForm = useCallback(() => {
    setFormData({});
    setCurrentStep(0);
    setErrors({});
  }, []);

  const isStepValid = useCallback((stepIndex: number): boolean => {
    // Logique de validation par étape
    // TODO: Implémenter la validation réelle
    return true;
  }, []);

  const getStepProgress = useCallback((): number => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  }, [currentStep, steps.length]);

  const isFormValid = useCallback((): boolean => {
    return Object.keys(errors).length === 0 && formData.personalInfo && formData.financialInfo;
  }, [errors, formData]);

  return {
    formData,
    currentStep,
    steps,
    errors,
    
    // Actions sur le formulaire
    updateField,
    updatePersonalInfo,
    updateFinancialInfo,
    updateGuarantees,
    addDocuments,
    removeDocument,
    setFieldError,
    clearErrors,
    
    // Navigation
    nextStep,
    previousStep,
    goToStep,
    resetForm,
    
    // État
    isStepValid,
    getStepProgress,
    isFormValid,
    canGoNext: currentStep < steps.length - 1,
    canGoPrevious: currentStep > 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
}

// ============================================================================
// HOOKS DE LISTE ET SÉLECTION
// ============================================================================

/**
 * Hook pour sélectionner des candidatures
 */
export function useApplicationSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectApplication = useCallback((id: string) => {
    setSelectedIds(prev => [...prev, id]);
  }, []);

  const deselectApplication = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  const selectedCount = selectedIds.length;

  return {
    selectedIds,
    selectedCount,
    selectApplication,
    deselectApplication,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}