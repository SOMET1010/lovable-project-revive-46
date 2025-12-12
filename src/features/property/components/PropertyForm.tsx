import React, { useState, useEffect } from 'react';
import { usePropertyForm } from '../hooks/usePropertyForm';
import DraftModal from './DraftModal';
import SuccessScreen from './SuccessScreen';
import PropertyFormHeader from './PropertyFormHeader';
import { useNotifications, NotificationContainer } from '../../../shared/components/Notification';
import { PropertyData } from '../services/propertyService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import NeofaceVerification from '@/shared/ui/NeofaceVerification';
import Modal from '@/shared/ui/Modal';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react';

// Import des composants Step refactorisés
import {
  PropertyFormStep1General,
  PropertyFormStep2Location,
  PropertyFormStep3Photos,
  PropertyFormStep4Pricing,
  PropertyFormStep5Validation
} from './PropertyFormSteps';

const STORAGE_KEY = 'property_form_draft_v2';

const PropertyForm: React.FC = () => {
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
    validateCurrentStep,
    submitForm,
    canProceedToNextStep,
    addImages,
    removeImage,
    setMainImage,
    reorderImages
  } = usePropertyForm();

  const { success, error: showError, notifications, removeNotification } = useNotifications();
  const { user } = useAuth();

  // États pour la gestion du brouillon et du succès
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraftData, setPendingDraftData] = useState<Partial<PropertyData> | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | undefined>();
  const [subNeighborhood, setSubNeighborhood] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // États pour la vérification CNI biométrique
  const [cniFile, setCniFile] = useState<File | null>(null);
  const [cniPreviewUrl, setCniPreviewUrl] = useState<string | null>(null);
  const [cniUploadedUrl, setCniUploadedUrl] = useState<string | null>(null);
  const [cniUploading, setCniUploading] = useState(false);
  const [showNeofaceModal, setShowNeofaceModal] = useState(false);
  const [cniVerificationStatus, setCniVerificationStatus] = useState<'pending' | 'verifying' | 'verified' | 'failed'>('pending');
  const [cniMatchingScore, setCniMatchingScore] = useState<number | null>(null);

  // Vérifier s'il y a un brouillon au chargement
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title || parsed.city || parsed.price > 0) {
          setPendingDraftData(parsed);
          setShowDraftModal(true);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Sauvegarde automatique du brouillon
  useEffect(() => {
    if (showDraftModal || showSuccess || isLoading) return;

    const timer = setTimeout(() => {
      setIsAutoSaving(true);
      const dataToSave = { 
        ...formData, 
        images: [], // Les images ne sont pas sérialisables
        subNeighborhood,
        latitude,
        longitude
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setHasDraft(true);
      setTimeout(() => setIsAutoSaving(false), 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, subNeighborhood, latitude, longitude, showDraftModal, showSuccess, isLoading]);

  const handleContinueDraft = () => {
    if (pendingDraftData) {
      // Restaurer les données du brouillon
      Object.entries(pendingDraftData).forEach(([key, value]) => {
        if (key === 'subNeighborhood') {
          setSubNeighborhood(value as string || '');
        } else if (key === 'latitude') {
          setLatitude(value as number | null);
        } else if (key === 'longitude') {
          setLongitude(value as number | null);
        } else if (key !== 'images') {
          updateField(key as keyof PropertyData, value);
        }
      });
      setHasDraft(true);
      success('Brouillon restauré', 'Vos données ont été récupérées.');
    }
    setShowDraftModal(false);
    setPendingDraftData(null);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
    setShowDraftModal(false);
    setPendingDraftData(null);
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    updateField('coordinates', { lat, lng });
  };

  const handleSubmit = async () => {
    // Vérifier que la CNI est vérifiée
    if (cniVerificationStatus !== 'verified') {
      showError('Vérification requise', 'Veuillez vérifier votre identité avec votre pièce d\'identité avant de publier');
      return;
    }

    try {
      // Mettre à jour l'adresse avec le sous-quartier
      if (subNeighborhood) {
        const fullAddress = `${subNeighborhood}, ${formData.district}, ${formData.city}`;
        updateField('address', fullAddress);
      }

      const result = await submitForm();
      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);
        setCreatedPropertyId(result.propertyId);
        setShowSuccess(true);
      } else {
        showError('Erreur lors de la soumission', result.error || 'Une erreur inattendue s\'est produite');
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la soumission:', err);
      showError('Erreur technique', 'Une erreur technique s\'est produite. Veuillez réessayer.');
    }
  };

  // ========== Handlers CNI ==========

  const handleCniUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      showError('Fichier invalide', 'Veuillez sélectionner une image (JPG, PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Fichier trop volumineux', 'La taille maximale est de 5 Mo');
      return;
    }

    setCniFile(file);
    setCniPreviewUrl(URL.createObjectURL(file));
    setCniVerificationStatus('pending');
    setCniMatchingScore(null);

    // Upload vers Supabase Storage
    setCniUploading(true);
    try {
      const fileName = `cni_${user?.id}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('verifications')
        .getPublicUrl(data.path);

      setCniUploadedUrl(urlData.publicUrl);
      success('CNI uploadée', 'Vous pouvez maintenant vérifier votre identité');
      
      // Déclencher automatiquement la vérification biométrique
      setShowNeofaceModal(true);
      setCniVerificationStatus('verifying');
    } catch (err) {
      console.error('Erreur upload CNI:', err);
      showError('Erreur', 'Impossible d\'uploader la CNI. Réessayez.');
    } finally {
      setCniUploading(false);
    }
  };

  const handleNeofaceVerified = (verificationData: unknown) => {
    const data = verificationData as { matching_score?: number };
    setCniVerificationStatus('verified');
    setCniMatchingScore(data.matching_score ? data.matching_score * 100 : null);
    setShowNeofaceModal(false);
    success('Identité vérifiée !', 'Votre identité a été confirmée avec succès');
  };

  const handleNeofaceFailed = (errorMessage: string) => {
    setCniVerificationStatus('failed');
    setShowNeofaceModal(false);
    showError('Vérification échouée', errorMessage);
  };

  const handleRetryCniVerification = () => {
    if (cniUploadedUrl) {
      setCniVerificationStatus('verifying');
      setShowNeofaceModal(true);
    }
  };

  const handleRemoveCni = () => {
    setCniFile(null);
    setCniPreviewUrl(null);
    setCniUploadedUrl(null);
    setCniVerificationStatus('pending');
    setCniMatchingScore(null);
  };

  // ========== Rendu conditionnel ==========

  // Écran de succès
  if (showSuccess) {
    return <SuccessScreen propertyTitle={formData.title} propertyId={createdPropertyId} />;
  }

  // Loader initial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#FAF7F4]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F16522]/20 border-t-[#F16522] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B5A4E] font-medium">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  const stepTitles = [
    { title: "Informations générales", subtitle: "Décrivez votre bien" },
    { title: "Localisation précise", subtitle: "Où se trouve le bien ?" },
    { title: "Photos du bien", subtitle: "Montrez votre propriété" },
    { title: "Prix & Contact", subtitle: "Définissez votre offre" },
    { title: "Validation finale", subtitle: "Vérifiez et publiez" }
  ];

  // ========== Rendu des étapes via composants modulaires ==========
  const renderStepContent = () => {
    const baseStepProps = {
      formData,
      errors,
      updateField,
      isSubmitting
    };

    switch (currentStep) {
      case 0: 
        return <PropertyFormStep1General {...baseStepProps} />;
      case 1: 
        return (
          <PropertyFormStep2Location 
            {...baseStepProps}
            subNeighborhood={subNeighborhood}
            setSubNeighborhood={setSubNeighborhood}
            latitude={latitude}
            longitude={longitude}
            onCoordinatesChange={handleCoordinatesChange}
          />
        );
      case 2: 
        return (
          <PropertyFormStep3Photos 
            {...baseStepProps}
            addImages={addImages}
            removeImage={removeImage}
            setMainImage={setMainImage}
            reorderImages={reorderImages}
          />
        );
      case 3: 
        return (
          <PropertyFormStep4Pricing 
            {...baseStepProps}
            cniFile={cniFile}
            cniPreviewUrl={cniPreviewUrl}
            cniUploadedUrl={cniUploadedUrl}
            cniUploading={cniUploading}
            cniVerificationStatus={cniVerificationStatus}
            cniMatchingScore={cniMatchingScore}
            onCniUpload={handleCniUpload}
            onRemoveCni={handleRemoveCni}
            onStartVerification={() => {
              setShowNeofaceModal(true);
              setCniVerificationStatus('verifying');
            }}
            onRetryVerification={handleRetryCniVerification}
          />
        );
      case 4: 
        return (
          <PropertyFormStep5Validation 
            formData={formData}
            subNeighborhood={subNeighborhood}
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
          />
        );
      default: 
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] pb-20">
      {/* Modal Brouillon */}
      <DraftModal
        isOpen={showDraftModal}
        draftTitle={pendingDraftData?.title}
        onContinue={handleContinueDraft}
        onStartFresh={handleStartFresh}
      />

      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification}
      />

      {/* Modal de vérification NeoFace */}
      <Modal
        isOpen={showNeofaceModal}
        onClose={() => {
          setShowNeofaceModal(false);
          if (cniVerificationStatus === 'verifying') {
            setCniVerificationStatus('pending');
          }
        }}
        title="Vérification d'identité"
        size="lg"
      >
        {cniUploadedUrl && user && (
          <NeofaceVerification
            userId={user.id}
            cniPhotoUrl={cniUploadedUrl}
            onVerified={handleNeofaceVerified}
            onFailed={handleNeofaceFailed}
          />
        )}
      </Modal>

      {/* Header avec progress */}
      <PropertyFormHeader
        currentStep={currentStep}
        totalSteps={5}
        onBack={prevStep}
        isAutoSaving={isAutoSaving}
        hasDraft={hasDraft}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Titre de l'étape */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#2C1810] mb-2">
            {stepTitles[currentStep]?.title}
          </h1>
          <p className="text-[#6B5A4E]">
            Étape {currentStep + 1} sur 5 — {stepTitles[currentStep]?.subtitle}
          </p>
        </div>

        {/* Contenu de l'étape */}
        <div className="animate-in slide-in-from-right duration-400">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[#EFEBE9]">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm
              transition-all duration-200
              ${currentStep === 0 
                ? 'text-[#C5BAB3] cursor-not-allowed' 
                : 'text-[#6B5A4E] hover:text-[#2C1810] hover:bg-[#EFEBE9]'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedToNextStep || isSubmitting}
              className={`
                flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm
                transition-all duration-200 transform
                ${canProceedToNextStep
                  ? 'bg-[#2C1810] text-white hover:bg-black hover:scale-[1.02] shadow-lg shadow-[#2C1810]/20'
                  : 'bg-[#EFEBE9] text-[#A69B95] cursor-not-allowed'
                }
              `}
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm
                transition-all duration-200 transform
                ${isSubmitting
                  ? 'bg-[#F16522]/50 text-white cursor-wait'
                  : 'bg-[#F16522] text-white hover:bg-[#D55A1B] hover:scale-[1.02] shadow-lg shadow-[#F16522]/30'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publication...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Publier la propriété
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
