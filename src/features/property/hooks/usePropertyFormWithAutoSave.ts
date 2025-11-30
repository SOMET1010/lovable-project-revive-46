import { useCallback, useRef, useEffect } from 'react';
import { usePropertyForm } from './usePropertyForm';
import { usePropertyFormAutoSave, useFormDraft } from '../../../hooks/useAutoSave';
import { propertyService } from '../services/propertyService';
import type { PropertyData } from '../services/propertyService';

/**
 * Hook qui étend usePropertyForm avec l'auto-save débouncé
 * @param propertyId - ID de la propriété à éditer (null pour création)
 * @param enableAutoSave - Activer l'auto-save (défaut: true)
 * @param autoSaveDelay - Délai avant auto-save en ms (défaut: 2000ms)
 * @returns Objet avec les propriétés du formulaire et les fonctionnalités d'auto-save
 */
export function usePropertyFormWithAutoSave(
  propertyId: string | null = null,
  enableAutoSave: boolean = true,
  autoSaveDelay: number = 2000
) {
  // Hook de base pour le formulaire
  const {
    formData,
    errors,
    currentStep,
    isLoading,
    isSubmitting,
    uploadProgress,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
    submitForm,
    resetForm,
    addImages,
    removeImage,
    setMainImage,
    reorderImages,
    canProceedToNextStep,
    isStepValid,
    getStepProgress,
  } = usePropertyForm();

  // Données initiales pour l'auto-save
  const initialData: PropertyData = {
    title: '',
    description: '',
    propertyType: 'appartement',
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    price: 0,
    priceType: 'achat',
    city: '',
    district: '',
    address: '',
    coordinates: undefined,
    images: [],
    mainImageIndex: 0,
    amenities: [],
    furnished: false,
    parking: false,
    garden: false,
    terrace: false,
    elevator: false,
    security: false,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: ''
  };

  // Fonction de sauvegarde avec validation
  const saveFunction = useCallback(async (data: PropertyData) => {
    try {
      // Valider les données avant sauvegarde
      const validationErrors = propertyService.validatePropertyData(data);
      if (Object.keys(validationErrors).length > 0) {
        return { error: { message: 'Validation échouée', details: validationErrors } };
      }

      // Sauvegarder selon qu'il s'agit d'une création ou d'une mise à jour
      if (propertyId) {
        // Mise à jour d'une propriété existante
        const result = await propertyService.updateProperty(propertyId, data);
        if (!result.success) {
          return { error: { message: result.error || 'Erreur lors de la mise à jour' } };
        }
      } else {
        // Création d'une nouvelle propriété (brouillon)
        const result = await propertyService.createProperty(data);
        if (!result.success) {
          return { error: { message: result.error || 'Erreur lors de la création' } };
        }
      }

      return { data: {} };
    } catch (error) {
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde' 
        } 
      };
    }
  }, [propertyId]);

  // Hook d'auto-save (désactivé si enableAutoSave est false)
  const autoSaveResult = enableAutoSave 
    ? usePropertyFormAutoSave(formData, propertyId, saveFunction, autoSaveDelay)
    : {
        data: formData,
        isDirty: false,
        isSaving: false,
        isSaved: false,
        lastSaved: null,
        error: null,
        validationErrors: {},
        updateField,
        manualSave: async () => {},
        resetData: resetForm,
        markAsClean: () => {},
        validateForm: () => ({}),
      };

  // Synchroniser les changements de champ avec l'auto-save
  const updateFieldWithAutoSave = useCallback((field: keyof PropertyData, value: any) => {
    // Mettre à jour le formulaire
    updateField(field, value);
    
    // Marquer comme modifié pour l'auto-save
    if (enableAutoSave) {
      const updatedData = { ...formData, [field]: value };
      autoSaveResult.updateData(updatedData);
    }
  }, [formData, updateField, autoSaveResult, enableAutoSave]);

  // Fonction de sauvegarde manuelle
  const manualSave = useCallback(async () => {
    if (!enableAutoSave) return;
    
    try {
      await autoSaveResult.manualSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde manuelle:', error);
    }
  }, [autoSaveResult, enableAutoSave]);

  // Reset avec nettoyage de l'auto-save
  const resetFormWithAutoSave = useCallback(() => {
    resetForm();
    if (enableAutoSave) {
      autoSaveResult.resetData();
    }
  }, [resetForm, autoSaveResult, enableAutoSave]);

  // Validation avec état d'auto-save
  const validateCurrentStepWithAutoSave = useCallback((): boolean => {
    const isValid = validateCurrentStep();
    
    // Si la validation échoue, afficher les erreurs de l'auto-save
    if (!isValid && enableAutoSave) {
      // L'auto-save peut avoir détecté d'autres erreurs
      return false;
    }
    
    return isValid;
  }, [validateCurrentStep, enableAutoSave]);

  // Sauvegarder automatiquement lors du changement d'étape
  useEffect(() => {
    if (enableAutoSave && autoSaveResult.isDirty) {
      const timer = setTimeout(() => {
        manualSave();
      }, 500); // Attendre 500ms après le changement d'étape
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, enableAutoSave, autoSaveResult.isDirty, manualSave]);

  return {
    // État du formulaire
    formData,
    errors,
    currentStep,
    isLoading,
    isSubmitting,
    uploadProgress,
    
    // État de l'auto-save
    isDirty: autoSaveResult.isDirty,
    isSaving: autoSaveResult.isSaving,
    isSaved: autoSaveResult.isSaved,
    lastSaved: autoSaveResult.lastSaved,
    autoSaveError: autoSaveResult.error,
    validationErrors: autoSaveResult.validationErrors,
    
    // Actions avec auto-save
    updateField: updateFieldWithAutoSave,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep: validateCurrentStepWithAutoSave,
    submitForm,
    resetForm: resetFormWithAutoSave,
    manualSave,
    
    // Actions images (sans auto-save pour éviter les sauvegardes à chaque image)
    addImages,
    removeImage,
    setMainImage,
    reorderImages,
    
    // Helpers
    canProceedToNextStep,
    isStepValid,
    getStepProgress,
  };
}

/**
 * Hook spécialisé pour les formulaires avec sauvegarde de brouillon
 * @param formKey - Clé unique pour identifier le formulaire
 * @param enableDraft - Activer la sauvegarde de brouillon (défaut: true)
 * @returns Objet avec fonctionnalités de brouillon et formulaire
 */
export function usePropertyFormWithDraft(
  formKey: string = 'property-form',
  enableDraft: boolean = true
) {
  const formWithAutoSave = usePropertyFormWithAutoSave(null, enableDraft, 5000);
  const { draftData, isDraftDirty, lastSaved, updateDraft, clearDraft, loadDraft } = 
    enableDraft 
      ? useFormDraft(formKey, formWithAutoSave.formData, 10000)
      : {
          draftData: formWithAutoSave.formData,
          isDraftDirty: false,
          lastSaved: null,
          updateDraft: () => {},
          clearDraft: () => {},
          loadDraft: () => null,
        };

  // Synchroniser les changements avec le brouillon
  const syncWithDraft = useCallback(() => {
    const loadedDraft = loadDraft();
    if (loadedDraft) {
      // Charger les données du brouillon
      Object.keys(loadedDraft).forEach((key) => {
        formWithAutoSave.updateField(key as keyof PropertyData, loadedDraft[key]);
      });
    }
  }, [loadDraft, formWithAutoSave]);

  // Auto-save du brouillon
  useEffect(() => {
    if (enableDraft && formWithAutoSave.isDirty) {
      updateDraft(formWithAutoSave.formData);
    }
  }, [formWithAutoSave.formData, formWithAutoSave.isDirty, updateDraft, enableDraft]);

  return {
    ...formWithAutoSave,
    
    // État du brouillon
    draftData,
    isDraftDirty,
    draftLastSaved: lastSaved,
    
    // Actions du brouillon
    updateDraft,
    clearDraft,
    loadDraft: syncWithDraft,
    
    // Informations de statut
    hasUnsavedChanges: formWithAutoSave.isDirty || isDraftDirty,
    isReady: !formWithAutoSave.isSubmitting && !formWithAutoSave.isSaving,
  };
}