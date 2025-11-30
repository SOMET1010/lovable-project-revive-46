/**
 * ApplicationForm - Formulaire principal multi-étapes pour candidature
 */

import { HTMLAttributes, useState, useEffect, useCallback, useRef } from 'react';
import { ApplicationProgress } from './ApplicationProgress';
import { ApplicationStep1, type ApplicationData } from './ApplicationStep1';
import { ApplicationStep2, type DocumentFile } from './ApplicationStep2';
import { ApplicationStep3 } from './ApplicationStep3';
import { useHttp } from '@/hooks/useHttp';
import type { ErrorInfo } from '@/lib/errorHandler';

export interface ApplicationFormProps extends HTMLAttributes<HTMLDivElement> {
  propertyId?: string;
  propertyTitle?: string;
  onSubmit?: (data: ApplicationData, documents: DocumentFile[]) => Promise<void>;
  onSave?: (data: Partial<ApplicationData>) => Promise<void>;
  initialData?: Partial<ApplicationData>;
  autoSave?: boolean;
  autoSaveInterval?: number; // en millisecondes
}

const STORAGE_KEY = 'montoit_application_data';
const DOCUMENTS_STORAGE_KEY = 'montoit_application_documents';

export function ApplicationForm({
  propertyId,
  propertyTitle,
  onSubmit,
  onSave,
  initialData = {},
  autoSave = true,
  autoSaveInterval = 30000, // 30 secondes
  className = '',
  ...props
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Ref pour AbortController
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Hook pour les opérations HTTP sécurisées
  const { request, cancel: cancelHttp } = useHttp();

  const totalSteps = 3;

  // Données du formulaire
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    // Informations personnelles par défaut
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    
    // Adresse par défaut
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    
    // Situation professionnelle par défaut
    employmentStatus: 'employed',
    employerName: '',
    jobTitle: '',
    monthlyIncome: undefined,
    employmentDuration: '',
    
    // Garant par défaut
    hasGuarantor: false,
    guarantorFirstName: '',
    guarantorLastName: '',
    guarantorEmail: '',
    guarantorPhone: '',
    
    ...initialData,
  });

  // Documents
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    loadSavedData();
  }, []);

  // Auto-sauvegarde avec AbortController
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, autoSaveInterval);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [applicationData, documents, autoSave, autoSaveInterval, handleAutoSave]);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (cancelHttp) {
        cancelHttp();
      }
    };
  }, [cancelHttp]);

  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedDocuments = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setApplicationData(prev => ({ ...prev, ...parsed }));
      }
      
      if (savedDocuments) {
        const parsed = JSON.parse(savedDocuments);
        // Convertir les dates de string vers Date
        const documentsWithDates = parsed.map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
        }));
        setDocuments(documentsWithDates);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données sauvegardées:', error);
    }
  };

  const handleAutoSave = useCallback(async () => {
    if (!autoSave || saving) return;
    
    try {
      await saveData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      setGlobalError('Erreur lors de la sauvegarde automatique');
    }
  }, [applicationData, documents, autoSave, saving]);

  const saveData = useCallback(async () => {
    if (saving) return; // Éviter les sauvegardes concurrentes
    
    setSaving(true);
    setGlobalError(null);

    try {
      // Annuler la sauvegarde précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController
      abortControllerRef.current = new AbortController();

      // Sauvegarder dans localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applicationData));
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
      
      // Appeler le callback de sauvegarde si fourni avec timeout
      if (onSave) {
        const savePromise = onSave(applicationData);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout de sauvegarde')), 10000);
        });
        
        await Promise.race([savePromise, timeoutPromise]);
      }
      
      setLastSaved(new Date());
      setIsSaved(true);
      setGlobalError(null);
      
      // Réinitialiser le statut "sauvegardé" après 2 secondes
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // Ignorer les erreurs d'annulation
      if (error.name === 'AbortError') {
        return;
      }

      setGlobalError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }, [applicationData, documents, onSave, saving]);

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
    setErrors(prev => {
      const newErrors = { ...prev };
      // Supprimer les erreurs pour les champs modifiés
      Object.keys(data).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'employmentStatus'];
      const newErrors: Record<string, string> = {};
      
      required.forEach(field => {
        const value = applicationData[field as keyof ApplicationData];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field] = 'Ce champ est requis';
        }
      });
      
      // Validation email
      if (applicationData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
      
      // Validation téléphone
      if (applicationData.phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(applicationData.phone)) {
        newErrors.phone = 'Format de téléphone invalide';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    
    if (currentStep === 2) {
      // Vérifier que les documents requis sont téléchargés
      const requiredCategories = ['identity', 'income', 'employment'];
      const missingDocuments = requiredCategories.filter(category => {
        return !documents.some(doc => doc.id.startsWith(category));
      });
      
      if (missingDocuments.length > 0) {
        setErrors({ documents: 'Tous les documents requis doivent être téléchargés' });
        return false;
      }
      
      setErrors({});
      return true;
    }
    
    return true;
  };

  const handleNext = async () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        await saveData(); // Sauvegarder avant de passer à l'étape suivante
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep() || submitting) return;
    
    setSubmitting(true);
    setGlobalError(null);
    setSubmitSuccess(false);
    
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController();

    try {
      if (onSubmit) {
        // Timeout pour éviter les soumissions infinies
        const submitPromise = onSubmit(applicationData, documents);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout de soumission')), 30000);
        });
        
        await Promise.race([submitPromise, timeoutPromise]);
      }
      
      setSubmitSuccess(true);
      
      // Nettoyer les données sauvegardées
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
      
      // Redirection ou message de succès après un délai
      setTimeout(() => {
        // Ici, vous pourriez rediriger vers une page de confirmation
        console.log('Soumission réussie, redirection vers confirmation...');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      
      // Ignorer les erreurs d'annulation
      if (error.name === 'AbortError') {
        return;
      }
      
      setGlobalError('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }, [applicationData, documents, onSubmit, submitting]);

  const resetForm = useCallback(() => {
    // Annuler toute opération en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setCurrentStep(1);
    setApplicationData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'France',
      employmentStatus: 'employed',
      employerName: '',
      jobTitle: '',
      monthlyIncome: undefined,
      employmentDuration: '',
      hasGuarantor: false,
      guarantorFirstName: '',
      guarantorLastName: '',
      guarantorEmail: '',
      guarantorPhone: '',
    });
    setDocuments([]);
    setErrors({});
    setGlobalError(null);
    setIsSaved(false);
    setLastSaved(null);
    setSubmitSuccess(false);
    setSaving(false);
    setSubmitting(false);
    setLoading(false);
    
    // Nettoyer le localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
  }, []);
    
    // Nettoyer le localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
  };

  const baseClasses = [
    'w-full',
    'max-w-4xl',
    'mx-auto',
    'bg-background-page',
  ].join(' ');

  const containerClasses = [
    'min-h-screen',
    'py-8',
    'px-4',
    'md:px-6',
    'lg:px-8',
  ].join(' ');

  return (
    <div className={containerClasses}>
      <div className={baseClasses} {...props}>
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Candidature de location
          </h1>
          {propertyTitle && (
            <p className="text-lg text-neutral-600 mb-2">
              Pour: <span className="font-medium text-neutral-900">{propertyTitle}</span>
            </p>
          )}
          <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500">
            {isSaved && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-semantic-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-semantic-success">Sauvegardé</span>
              </div>
            )}
            {lastSaved && (
              <span>Dernière sauvegarde: {lastSaved.toLocaleTimeString('fr-FR')}</span>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <ApplicationProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            variant="detailed"
          />
        </div>

        {/* Contenu du formulaire */}
        <div className="bg-background-elevated rounded-lg shadow-base p-8">
          {currentStep === 1 && (
            <ApplicationStep1
              data={applicationData}
              onChange={updateApplicationData}
              onNext={handleNext}
              errors={errors}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <ApplicationStep2
              documents={documents}
              onDocumentsChange={setDocuments}
              onNext={handleNext}
              onPrevious={handlePrevious}
              loading={loading}
            />
          )}

          {currentStep === 3 && (
            <ApplicationStep3
              applicationData={applicationData}
              documents={documents}
              onSubmit={handleSubmit}
              onPrevious={handlePrevious}
              loading={loading}
            />
          )}
        </div>

        {/* Pied de page avec actions globales */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={saveData}
              disabled={loading}
              className={[
                'px-4 py-2',
                'text-sm',
                'text-neutral-600',
                'hover:text-neutral-900',
                'border border-neutral-200',
                'rounded-lg',
                'transition-colors',
                'disabled:opacity-50',
              ].join(' ')}
            >
              Sauvegarder
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className={[
                'px-4 py-2',
                'text-sm',
                'text-semantic-error',
                'hover:text-semantic-error',
                'border border-semantic-error/20',
                'rounded-lg',
                'transition-colors',
                'disabled:opacity-50',
              ].join(' ')}
            >
              Réinitialiser
            </button>
          </div>

          <div className="text-sm text-neutral-500">
            Étape {currentStep} sur {totalSteps}
          </div>
        </div>

        {/* Message d'erreur global */}
        {(globalError || errors.submit) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-semantic-error" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-semantic-error">{globalError || errors.submit}</p>
            </div>
          </div>
        )}

        {/* Message de succès de soumission */}
        {submitSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700">Candidature soumise avec succès !</p>
            </div>
          </div>
        )}

        {/* Indicateur de sauvegarde */}
        {saving && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-sm text-blue-700">Sauvegarde en cours...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}