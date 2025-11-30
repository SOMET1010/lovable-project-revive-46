import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from './useDebounce';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

// ============================================================================
// HOOK POUR L'AUTO-SAVE DE FORMULAIRES DE PROPRIÉTÉS
// ============================================================================

/**
 * Interface pour les données de formulaire de propriété
 */
export interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  city: string;
  neighborhood?: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  furnished: boolean;
  parking: boolean;
  air_conditioning: boolean;
  available_from: string;
  lease_duration?: string;
  deposit?: number;
  images?: string[];
  features?: string[];
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

/**
 * Hook pour l'auto-save de formulaires de propriétés avec debouncing
 * @param initialData - Données initiales du formulaire
 * @param propertyId - ID de la propriété (null pour création)
 * @param saveFunction - Fonction de sauvegarde
 * @param autoSaveDelay - Délai d'auto-save (défaut: 2000ms)
 * @returns État et méthodes de gestion du formulaire
 */
export function usePropertyFormAutoSave(
  initialData: PropertyFormData,
  propertyId: string | null,
  saveFunction: (data: PropertyFormData, propertyId: string | null) => Promise<{ data?: Property; error?: any }>,
  autoSaveDelay: number = DEBOUNCE_DELAYS.AUTOSAVE
) {
  const [data, setData] = useState<PropertyFormData>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Refs pour la gestion des timeouts
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);

  // Débouncer les changements de données
  const debouncedData = useDebounce(data, autoSaveDelay);

  // Fonction de validation du formulaire
  const validateForm = useCallback((formData: PropertyFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      errors.title = 'Le titre est obligatoire';
    }

    if (!formData.description?.trim()) {
      errors.description = 'La description est obligatoire';
    }

    if (!formData.property_type) {
      errors.property_type = 'Le type de propriété est obligatoire';
    }

    if (!formData.city?.trim()) {
      errors.city = 'La ville est obligatoire';
    }

    if (!formData.address?.trim()) {
      errors.address = 'L\'adresse est obligatoire';
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'Le prix doit être supérieur à 0';
    }

    if (!formData.bedrooms || formData.bedrooms < 0) {
      errors.bedrooms = 'Le nombre de chambres doit être positif';
    }

    if (!formData.bathrooms || formData.bathrooms < 0) {
      errors.bathrooms = 'Le nombre de salles de bain doit être positif';
    }

    if (!formData.surface || formData.surface <= 0) {
      errors.surface = 'La surface doit être supérieure à 0';
    }

    if (!formData.available_from) {
      errors.available_from = 'La date de disponibilité est obligatoire';
    }

    return errors;
  }, []);

  // Fonction de sauvegarde avec debouncing et annulation
  const debouncedSave = useCallback(async (saveData: PropertyFormData) => {
    // Éviter les sauvegardes en cours
    if (saveInProgressRef.current) {
      return;
    }

    // Valider les données
    const errors = validateForm(saveData);
    setValidationErrors(errors);

    // S'il y a des erreurs de validation, ne pas sauvegarder
    if (Object.keys(errors).length > 0) {
      setError('Veuillez corriger les erreurs avant la sauvegarde');
      return;
    }

    setIsSaving(true);
    setError(null);
    saveInProgressRef.current = true;

    try {
      const response = await saveFunction(saveData, propertyId);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      setIsDirty(false);
      setIsSaved(true);
      setLastSaved(new Date());
      setValidationErrors({});

      // Réinitialiser l'état "saved" après 3 secondes
      setTimeout(() => setIsSaved(false), 3000);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde automatique');
      setIsSaved(false);
    } finally {
      setIsSaving(false);
      saveInProgressRef.current = false;
    }
  }, [propertyId, saveFunction, validateForm]);

  // Déclencher l'auto-save avec debouncing
  useEffect(() => {
    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Si les données ont changé, programmer une sauvegarde
    if (isDirty && JSON.stringify(debouncedData) !== JSON.stringify(initialData)) {
      saveTimeoutRef.current = setTimeout(() => {
        debouncedSave(debouncedData);
      }, autoSaveDelay);
    }

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [debouncedData, isDirty, initialData, autoSaveDelay, debouncedSave]);

  // Fonction de mise à jour des données
  const updateData = useCallback((updates: Partial<PropertyFormData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setError(null);
    setIsSaved(false);
  }, []);

  // Fonction de sauvegarde manuelle
  const manualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await debouncedSave(data);
  }, [data, debouncedSave]);

  // Fonction de réinitialisation
  const resetData = useCallback(() => {
    setData(initialData);
    setIsDirty(false);
    setError(null);
    setValidationErrors({});
    setIsSaved(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, [initialData]);

  // Fonction pour marquer le formulaire comme propre (après sauvegarde serveur)
  const markAsClean = useCallback(() => {
    setIsDirty(false);
    setData(prev => ({ ...prev }));
  }, []);

  // Cleanup lors du démontage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isDirty,
    isSaving,
    isSaved,
    lastSaved,
    error,
    validationErrors,
    updateData,
    manualSave,
    resetData,
    markAsClean,
    validateForm: () => validateForm(data),
  };
}

// ============================================================================
// HOOK POUR L'AUTO-SAVE D'AUTRES FORMULAIRES
// ============================================================================

/**
 * Hook générique pour l'auto-save de formulaires avec debouncing
 * @param initialData - Données initiales
 * @param saveFunction - Fonction de sauvegarde
 * @param validateFunction - Fonction de validation (optionnelle)
 * @param autoSaveDelay - Délai d'auto-save
 * @returns État et méthodes de gestion du formulaire
 */
export function useAutoSaveForm<T extends Record<string, any>>(
  initialData: T,
  saveFunction: (data: T) => Promise<{ error?: any }>,
  validateFunction?: (data: T) => Record<string, string>,
  autoSaveDelay: number = DEBOUNCE_DELAYS.AUTOSAVE
) {
  const [data, setData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedData = useDebounce(data, autoSaveDelay);

  // Fonction de validation
  const validateForm = useCallback((formData: T) => {
    if (validateFunction) {
      return validateFunction(formData);
    }
    return {};
  }, [validateFunction]);

  // Fonction de sauvegarde
  const performSave = useCallback(async (saveData: T) => {
    const errors = validateForm(saveData);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Veuillez corriger les erreurs avant la sauvegarde');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await saveFunction(saveData);
      if (response.error) {
        throw new Error(response.error.message);
      }

      setIsDirty(false);
      setLastSaved(new Date());
      setValidationErrors({});

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction, validateForm]);

  // Auto-save avec debouncing
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (isDirty && JSON.stringify(debouncedData) !== JSON.stringify(initialData)) {
      saveTimeoutRef.current = setTimeout(() => {
        performSave(debouncedData);
      }, autoSaveDelay);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [debouncedData, isDirty, initialData, autoSaveDelay, performSave]);

  // Fonctions de gestion
  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setError(null);
  }, []);

  const manualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await performSave(data);
  }, [data, performSave]);

  const resetData = useCallback(() => {
    setData(initialData);
    setIsDirty(false);
    setError(null);
    setValidationErrors({});
  }, [initialData]);

  return {
    data,
    isDirty,
    isSaving,
    lastSaved,
    error,
    validationErrors,
    updateData,
    manualSave,
    resetData,
    validateForm: () => validateForm(data),
  };
}

// ============================================================================
// HOOK POUR LA SAUVEGARDE DE BROUILLONS
// ============================================================================

/**
 * Hook pour gérer les brouillons de formulaires avec debouncing
 * @param formKey - Clé unique pour identifier le formulaire
 * @param initialData - Données initiales
 * @param autoSaveDelay - Délai d'auto-save (défaut: 5000ms)
 * @returns État et méthodes de gestion des brouillons
 */
export function useFormDraft(
  formKey: string,
  initialData: Record<string, any>,
  autoSaveDelay: number = 5000
) {
  const [draftData, setDraftData] = useState<Record<string, any>>(initialData);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debouncedDraftData = useDebounce(draftData, autoSaveDelay);

  // Charger le brouillon depuis localStorage au démarrage
  useEffect(() => {
    const savedDraft = localStorage.getItem(`draft_${formKey}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setDraftData(parsed);
        setIsDraftDirty(false);
      } catch (error) {
        console.error('Erreur lors du chargement du brouillon:', error);
      }
    }
  }, [formKey]);

  // Sauvegarder automatiquement le brouillon
  useEffect(() => {
    if (isDraftDirty && JSON.stringify(debouncedDraftData) !== JSON.stringify(initialData)) {
      localStorage.setItem(`draft_${formKey}`, JSON.stringify(debouncedDraftData));
      setLastSaved(new Date());
      setIsDraftDirty(false);
    }
  }, [debouncedDraftData, isDraftDirty, initialData, formKey]);

  const updateDraft = useCallback((updates: Record<string, any>) => {
    setDraftData(prev => ({ ...prev, ...updates }));
    setIsDraftDirty(true);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`draft_${formKey}`);
    setDraftData(initialData);
    setIsDraftDirty(false);
    setLastSaved(null);
  }, [formKey, initialData]);

  const loadDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(`draft_${formKey}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setDraftData(parsed);
        setIsDraftDirty(false);
        return parsed;
      } catch (error) {
        console.error('Erreur lors du chargement du brouillon:', error);
        return null;
      }
    }
    return null;
  }, [formKey]);

  return {
    draftData,
    isDraftDirty,
    lastSaved,
    updateDraft,
    clearDraft,
    loadDraft,
  };
}