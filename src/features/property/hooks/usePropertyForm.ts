import { useState, useCallback, useRef, useEffect } from 'react';
import { PropertyData, PropertyFormErrors, propertyService } from '../services/propertyService';

interface UsePropertyFormReturn {
  // État du formulaire
  formData: PropertyData;
  errors: PropertyFormErrors;
  currentStep: number;
  isLoading: boolean;
  isSubmitting: boolean;
  uploadProgress: number;
  
  // Actions
  updateField: (field: keyof PropertyData, value: any) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: number) => void;
  validateCurrentStep: () => boolean;
  submitForm: () => Promise<{ success: boolean; propertyId?: string; error?: string }>;
  resetForm: () => void;
  
  // Upload images
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  setMainImage: (index: number) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  
  // Helpers
  canProceedToNextStep: boolean;
  isStepValid: (step: number) => boolean;
  getStepProgress: () => number;
}

const STEPS = [
  'informations', // 0 - Informations générales
  'localisation', // 1 - Localisation
  'photos',       // 2 - Photos
  'tarif',        // 3 - Tarif
  'validation'    // 4 - Validation finale
] as const;

const INITIAL_FORM_DATA: PropertyData = {
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

export const usePropertyForm = (): UsePropertyFormReturn => {
  const [formData, setFormData] = useState<PropertyData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<PropertyFormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup des intervals au démontage
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  // Mise à jour d'un champ du formulaire
  const updateField = useCallback((field: keyof PropertyData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer l'erreur du champ si elle existe
    setErrors(prev => {
      const fieldKey = field as keyof PropertyFormErrors;
      if (fieldKey in prev) {
        return {
          ...prev,
          [fieldKey]: undefined
        };
      }
      return prev;
    });
  }, []);

  // Navigation entre les étapes
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        return true;
      }
    }
    return false;
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  // Validation d'une étape spécifique
  const validateStep = useCallback((step: number, data: PropertyData = formData): PropertyFormErrors => {
    switch (step) {
      case 0: // Informations générales
        return {
          title: !data.title || data.title.trim().length < 5 ? 'Titre requis (min 5 caractères)' : undefined,
          description: !data.description || data.description.trim().length < 20 ? 'Description requise (min 20 caractères)' : undefined,
          propertyType: !data.propertyType ? 'Type de propriété requis' : undefined,
          bedrooms: data.bedrooms < 0 ? 'Nombre de chambres invalide' : undefined,
          bathrooms: data.bathrooms < 0 ? 'Nombre de salles de bain invalide' : undefined,
          area: !data.area || data.area <= 0 ? 'Surface requise et positive' : undefined
        };

      case 1: // Localisation
        return {
          city: !data.city ? 'Ville requise' : undefined,
          district: !data.district ? 'Quartier requis' : undefined,
          address: !data.address || data.address.trim().length < 5 ? 'Adresse requise (min 5 caractères)' : undefined
        };

      case 2: // Photos
        return {
          images: !data.images || data.images.length === 0 ? 'Au moins une photo requise' : undefined
        };

      case 3: // Tarif et contact
        return {
          price: !data.price || data.price <= 0 ? 'Prix requis et positif' : undefined,
          ownerName: !data.ownerName || data.ownerName.trim().length < 2 ? 'Nom requis (min 2 caractères)' : undefined,
          ownerEmail: !data.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail) ? 'Email valide requis' : undefined,
          ownerPhone: !data.ownerPhone ? 'Téléphone requis' : undefined
        };

      default:
        return {};
    }
  }, [formData]);

  // Validation de l'étape actuelle
  const validateCurrentStep = useCallback((): boolean => {
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    
    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(stepErrors).some(error => error !== undefined);
    return !hasErrors;
  }, [currentStep, validateStep]);

  // Vérifier si une étape est valide
  const isStepValid = useCallback((step: number): boolean => {
    const stepErrors = validateStep(step);
    return !Object.values(stepErrors).some(error => error !== undefined);
  }, [validateStep]);

  // Calculer le progrès global
  const getStepProgress = useCallback((): number => {
    return ((currentStep + 1) / STEPS.length) * 100;
  }, [currentStep]);

  // Gestion des images
  const addImages = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        return false;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    const newImages = [...formData.images, ...validFiles].slice(0, 20); // Max 20 images
    
    updateField('images', newImages);
  }, [formData.images, updateField]);

  const removeImage = useCallback((index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const currentMainIndex = formData.mainImageIndex ?? 0;
    let newMainIndex = currentMainIndex;
    
    // Ajuster l'index de l'image principale si nécessaire
    if (index === currentMainIndex && newImages.length > 0) {
      newMainIndex = 0;
    } else if (index < currentMainIndex) {
      newMainIndex = Math.max(0, (newMainIndex ?? 0) - 1);
    }
    
    updateField('images', newImages);
    updateField('mainImageIndex', newMainIndex);
  }, [formData.images, formData.mainImageIndex, updateField]);

  const setMainImage = useCallback((index: number) => {
    if (index >= 0 && index < formData.images.length) {
      updateField('mainImageIndex', index);
    }
  }, [formData.images.length, updateField]);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= formData.images.length || toIndex >= formData.images.length) {
      return;
    }

    const newImages = [...formData.images];
    const movedImage = newImages[fromIndex];
    if (!movedImage) return;
    
    newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Ajuster l'index de l'image principale
    const currentMainIndex = formData.mainImageIndex ?? 0;
    let newMainIndex = currentMainIndex;
    
    if (currentMainIndex === fromIndex) {
      newMainIndex = toIndex;
    } else if (fromIndex < currentMainIndex && toIndex >= currentMainIndex) {
      newMainIndex = Math.max(0, currentMainIndex - 1);
    } else if (fromIndex > currentMainIndex && toIndex <= currentMainIndex) {
      newMainIndex = currentMainIndex + 1;
    }

    updateField('images', newImages);
    updateField('mainImageIndex', newMainIndex);
  }, [formData.images, formData.mainImageIndex, updateField]);

  // Soumission du formulaire
  const submitForm = useCallback(async (): Promise<{ success: boolean; propertyId?: string; error?: string }> => {
    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      // Validation complète du formulaire
      const allErrors = propertyService.validatePropertyData(formData);
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        return { success: false, error: 'Veuillez corriger les erreurs avant de soumettre' };
      }

      // Simulation du progrès d'upload avec nettoyage automatique
      progressIntervalRef.current = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Création de la propriété
      const result = await propertyService.createProperty(formData);
      
      // Nettoyage de l'interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(100);

      if (result.success) {
        // Reset du formulaire en cas de succès avec délai
        setTimeout(() => {
          resetForm();
        }, 2000);
        
        return { success: true, propertyId: result.id };
      } else {
        return { success: false, error: 'Erreur lors de la création de la propriété' };
      }
    } catch (error) {
      // Nettoyage en cas d'erreur
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      console.error('Erreur lors de la soumission:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue'
      };
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }, [formData]);

  // Reset du formulaire
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setCurrentStep(0);
    setIsLoading(false);
    setIsSubmitting(false);
    setUploadProgress(0);
  }, []);

  // Calculer canProceedToNextStep comme une valeur dérivée
  const canProceedToNextStep = isStepValid(currentStep) && currentStep < STEPS.length - 1;

  return {
    // État
    formData,
    errors,
    currentStep,
    isLoading,
    isSubmitting,
    uploadProgress,
    
    // Actions
    updateField,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
    submitForm,
    resetForm,
    
    // Images
    addImages,
    removeImage,
    setMainImage,
    reorderImages,
    
    // Helpers
    canProceedToNextStep,
    isStepValid,
    getStepProgress
  };
};
