import React, { useState, useEffect } from 'react';
import { usePropertyForm } from '../hooks/usePropertyForm';
import PropertyImageUpload from './PropertyImageUpload';
import CitySelector from './CitySelector';
import DraftModal from './DraftModal';
import SuccessScreen from './SuccessScreen';
import PropertyFormHeader from './PropertyFormHeader';
import { propertyService } from '../services/propertyService';
import { useNotifications, NotificationContainer } from '../../../shared/components/Notification';
import { PropertyData } from '../services/propertyService';
import { PropertyData } from '../services/propertyService';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Ruler,
  Bed,
  Bath,
  Car,
  Shield,
  Trees,
  Building2,
  ImageIcon,
  Sparkles
} from 'lucide-react';

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
    validateField,
    submitForm,
    canProceedToNextStep,
    addImages,
    removeImage,
    setMainImage,
    reorderImages
  } = usePropertyForm();

  const { success, error: showError, notifications, removeNotification } = useNotifications();

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

  const handleBlur = (field: keyof PropertyData) => {
    validateField(field);
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    updateField('coordinates', { lat, lng });
  };

  const handleSubmit = async () => {
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderInformationsStep();
      case 1: return renderLocalisationStep();
      case 2: return renderPhotosStep();
      case 3: return renderTarifStep();
      case 4: return renderValidationStep();
      default: return null;
    }
  };

  // Étape 1: Informations générales
  const renderInformationsStep = () => {
    const propertyTypes = propertyService.getPropertyTypes();

    return (
      <div className="space-y-8">
        {/* Catégorie */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
              <Building2 className="w-5 h-5 text-[#F16522]" />
            </div>
            <h3 className="font-bold text-[#2C1810]">Catégorie de bien</h3>
          </div>
          
          <div className="flex gap-4">
            {['residential', 'commercial'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => updateField('priceType', cat === 'residential' ? 'location' : 'achat')}
                className={`
                  flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                  ${formData.priceType === (cat === 'residential' ? 'location' : 'achat')
                    ? 'bg-[#F16522] text-white shadow-lg shadow-[#F16522]/30 scale-[1.02]'
                    : 'bg-[#FAF7F4] text-[#6B5A4E] hover:bg-[#EFEBE9] border-2 border-transparent hover:border-[#EFEBE9]'
                  }
                `}
              >
                {cat === 'residential' ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                <span className="capitalize">{cat === 'residential' ? 'Résidentiel' : 'Commercial'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Titre et Type */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-[#F16522]" />
            </div>
            <h3 className="font-bold text-[#2C1810]">Informations principales</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                placeholder="Ex: Villa duplex 5 pièces Riviera"
                maxLength={100}
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                  font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
                  ${errors.title 
                    ? 'border-red-400 bg-red-50/30' 
                    : formData.title.length >= 5 
                      ? 'border-green-400 bg-green-50/30' 
                      : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                  }
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
              <p className="text-xs text-[#A69B95] mt-1.5">{formData.title.length}/100 caractères</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                Type de propriété *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => updateField('propertyType', e.target.value)}
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                  font-medium text-[#2C1810] appearance-none bg-white cursor-pointer
                  ${errors.propertyType ? 'border-red-400' : 'border-[#EFEBE9] hover:border-[#F16522]/50'}
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.propertyType && <p className="text-red-500 text-xs mt-1.5">{errors.propertyType}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
              Description détaillée *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder="Décrivez les atouts de votre bien, son environnement..."
              rows={4}
              maxLength={2000}
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 resize-none
                font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
                ${errors.description 
                  ? 'border-red-400 bg-red-50/30' 
                  : formData.description.length >= 20 
                    ? 'border-green-400 bg-green-50/30' 
                    : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                }
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
              `}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>}
            <p className="text-xs text-[#A69B95] mt-1.5">{formData.description.length}/2000 caractères</p>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
              <Ruler className="w-5 h-5 text-[#F16522]" />
            </div>
            <h3 className="font-bold text-[#2C1810]">Caractéristiques</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                <Bed className="inline w-3.5 h-3.5 mr-1" /> Chambres *
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={formData.bedrooms}
                onChange={(e) => updateField('bedrooms', parseInt(e.target.value) || 0)}
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                  ${errors.bedrooms ? 'border-red-400' : 'border-[#EFEBE9]'}
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                <Bath className="inline w-3.5 h-3.5 mr-1" /> Salles de bain *
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.bathrooms}
                onChange={(e) => updateField('bathrooms', parseInt(e.target.value) || 0)}
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                  ${errors.bathrooms ? 'border-red-400' : 'border-[#EFEBE9]'}
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                <Ruler className="inline w-3.5 h-3.5 mr-1" /> Surface (m²) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.area}
                onChange={(e) => updateField('area', parseInt(e.target.value) || 0)}
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                  ${errors.area ? 'border-red-400' : 'border-[#EFEBE9]'}
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                Transaction
              </label>
              <select
                value={formData.priceType}
                onChange={(e) => updateField('priceType', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#EFEBE9] font-medium text-[#2C1810] focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none"
              >
                <option value="location">À louer</option>
                <option value="achat">À vendre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
              <Shield className="w-5 h-5 text-[#F16522]" />
            </div>
            <h3 className="font-bold text-[#2C1810]">Équipements</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'furnished', label: 'Meublé', icon: <Home className="w-4 h-4" /> },
              { key: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" /> },
              { key: 'garden', label: 'Jardin', icon: <Trees className="w-4 h-4" /> },
              { key: 'terrace', label: 'Terrasse', icon: <Home className="w-4 h-4" /> },
              { key: 'elevator', label: 'Ascenseur', icon: <Building2 className="w-4 h-4" /> },
              { key: 'security', label: 'Sécurité', icon: <Shield className="w-4 h-4" /> }
            ].map((amenity) => (
              <label
                key={amenity.key}
                className={`
                  flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${formData[amenity.key as keyof PropertyData]
                    ? 'border-[#F16522] bg-[#F16522]/5 text-[#F16522]'
                    : 'border-[#EFEBE9] hover:border-[#F16522]/30 text-[#6B5A4E]'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={formData[amenity.key as keyof PropertyData] as boolean}
                  onChange={(e) => updateField(amenity.key as keyof PropertyData, e.target.checked)}
                  className="sr-only"
                />
                <div className={`p-1.5 rounded-lg ${formData[amenity.key as keyof PropertyData] ? 'bg-[#F16522]/10' : 'bg-[#FAF7F4]'}`}>
                  {amenity.icon}
                </div>
                <span className="font-medium text-sm">{amenity.label}</span>
                {formData[amenity.key as keyof PropertyData] && (
                  <CheckCircle className="w-4 h-4 ml-auto text-[#F16522]" />
                )}
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Étape 2: Localisation
  const renderLocalisationStep = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
          <CitySelector
            selectedCity={formData.city}
            selectedDistrict={formData.district}
            subNeighborhood={subNeighborhood}
            latitude={latitude}
            longitude={longitude}
            onCitySelect={(city) => {
              updateField('city', city);
              updateField('district', '');
            }}
            onDistrictSelect={(district) => updateField('district', district)}
            onSubNeighborhoodChange={setSubNeighborhood}
            onCoordinatesChange={handleCoordinatesChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Adresse détaillée */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
          <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2.5 tracking-wide">
            <MapPin className="inline w-3.5 h-3.5 mr-1" /> Adresse détaillée (optionnel)
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Numéro, nom de rue, références supplémentaires..."
            className={`
              w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
              font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
              ${errors.address ? 'border-red-400' : 'border-[#EFEBE9] hover:border-[#F16522]/50'}
              focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
            `}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1.5">{errors.address}</p>}
        </div>
      </div>
    );
  };

  // Étape 3: Photos
  const renderPhotosStep = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
              <ImageIcon className="w-5 h-5 text-[#F16522]" />
            </div>
            <div>
              <h3 className="font-bold text-[#2C1810]">Photos du bien</h3>
              <p className="text-xs text-[#A69B95]">Ajoutez jusqu'à 20 photos (max 5MB/image)</p>
            </div>
          </div>

          <PropertyImageUpload
            images={formData.images}
            mainImageIndex={formData.mainImageIndex || 0}
            onImagesAdd={addImages}
            onImageRemove={removeImage}
            onMainImageSet={setMainImage}
            onImagesReorder={reorderImages}
            disabled={isSubmitting}
            maxImages={20}
          />
          
          {errors.images && (
            <div className="flex items-center gap-2 text-red-500 mt-4 p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{errors.images}</span>
            </div>
          )}
        </div>

        <div className="bg-[#F16522]/5 border border-[#F16522]/20 rounded-xl p-4">
          <p className="text-sm text-[#6B5A4E]">
            <strong className="text-[#2C1810]">💡 Conseil :</strong> Des photos de qualité multiplient par 5 vos chances de location/vente. Prenez vos photos en journée avec une bonne luminosité.
          </p>
        </div>
      </div>
    );
  };

  // Étape 4: Tarif et contact
  const renderTarifStep = () => {
    return (
      <div className="space-y-6">
        {/* Prix */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-[#F16522]" />
            </div>
            <h3 className="font-bold text-[#2C1810]">Prix</h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2.5 tracking-wide">
              Prix {formData.priceType === 'achat' ? '(FCFA)' : '(FCFA/mois)'} *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={formData.price || ''}
                onChange={(e) => updateField('price', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={`
                  w-full pl-16 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200
                  font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
                  ${errors.price ? 'border-red-400' : 'border-[#EFEBE9] hover:border-[#F16522]/50'}
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-[#A69B95] font-medium">FCFA</span>
              </div>
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1.5">{errors.price}</p>}
            {formData.price > 0 && (
              <p className="text-sm text-[#6B5A4E] mt-2 font-medium">
                Prix formaté: {formData.price.toLocaleString()} FCFA
                {formData.priceType === 'location' && ' / mois'}
              </p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFEBE9] shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
              <User className="w-5 h-5 text-[#F16522]" />
            </div>
            <h3 className="font-bold text-[#2C1810]">Vos informations de contact</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => updateField('ownerName', e.target.value)}
                placeholder="Votre nom et prénom"
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                  ${errors.ownerName ? 'border-red-400' : 'border-[#EFEBE9]'}
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              />
              {errors.ownerName && <p className="text-red-500 text-xs mt-1.5">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                <Mail className="inline w-3.5 h-3.5 mr-1" /> Email *
              </label>
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => updateField('ownerEmail', e.target.value)}
                placeholder="votre@email.com"
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                  ${errors.ownerEmail ? 'border-red-400' : 'border-[#EFEBE9]'}
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              />
              {errors.ownerEmail && <p className="text-red-500 text-xs mt-1.5">{errors.ownerEmail}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2 tracking-wide">
                <Phone className="inline w-3.5 h-3.5 mr-1" /> Téléphone *
              </label>
              <input
                type="tel"
                value={formData.ownerPhone}
                onChange={(e) => updateField('ownerPhone', e.target.value)}
                placeholder="+225 XX XX XX XX"
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-[#2C1810]
                  ${errors.ownerPhone ? 'border-red-400' : 'border-[#EFEBE9]'}
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                `}
              />
              {errors.ownerPhone && <p className="text-red-500 text-xs mt-1.5">{errors.ownerPhone}</p>}
              <p className="text-xs text-[#A69B95] mt-1.5">
                Format accepté: +225 XX XX XX XX ou 0X XX XX XX XX
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Étape 5: Validation
  const renderValidationStep = () => {
    const mainImageIndex = formData.mainImageIndex ?? 0;
    const mainImage = formData.images[mainImageIndex];
    
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F16522] to-[#D55A1B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#F16522]/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#2C1810] mb-2">Vérification finale</h3>
          <p className="text-[#6B5A4E]">Vérifiez les détails avant la publication</p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white border-2 border-[#EFEBE9] rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Infos */}
            <div className="p-6 space-y-4">
              <h4 className="font-bold text-[#2C1810] text-lg">{formData.title}</h4>
              <p className="text-sm text-[#6B5A4E] capitalize">{formData.propertyType}</p>
              
              <div className="flex flex-wrap gap-3 text-sm text-[#6B5A4E]">
                <span className="flex items-center gap-1">
                  <Bed className="w-4 h-4" /> {formData.bedrooms} ch.
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4" /> {formData.bathrooms} sdb
                </span>
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" /> {formData.area} m²
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-[#6B5A4E]">
                <MapPin className="w-4 h-4" />
                {subNeighborhood && `${subNeighborhood}, `}{formData.district}, {formData.city}
              </div>
              
              <div className="text-2xl font-bold text-[#F16522]">
                {formData.price.toLocaleString()} FCFA 
                {formData.priceType === 'location' && <span className="text-base font-normal"> / mois</span>}
              </div>
            </div>

            {/* Image */}
            {formData.images.length > 0 && mainImage && (
              <div className="aspect-video md:aspect-auto bg-[#FAF7F4]">
                <img
                  src={URL.createObjectURL(mainImage)}
                  alt="Image principale"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[#EFEBE9] bg-[#FAF7F4]">
            <p className="text-sm text-[#6B5A4E] line-clamp-3">{formData.description}</p>
          </div>
        </div>

        {/* Progression de soumission */}
        {isSubmitting && (
          <div className="bg-[#F16522]/5 border border-[#F16522]/20 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#F16522]/30 border-t-[#F16522] rounded-full animate-spin"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2C1810]">Publication en cours...</p>
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="bg-[#F16522]/20 rounded-full h-2">
                      <div 
                        className="bg-[#F16522] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#F16522] mt-1">{uploadProgress}% téléchargé</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
