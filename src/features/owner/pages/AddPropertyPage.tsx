import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Upload, X, Image as ImageIcon, Building2, Save, Check, RefreshCw, FileText } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { RESIDENTIAL_PROPERTY_TYPES, COMMERCIAL_PROPERTY_TYPES, CITIES, ABIDJAN_COMMUNES, STORAGE_KEYS } from '@/shared/lib/constants/app.constants';
import { ValidationService } from '@/services/validation';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { ValidatedInput } from '@/shared/ui/ValidatedInput';
import { ValidatedTextarea } from '@/shared/ui/ValidatedTextarea';
import type { Database } from '@/shared/lib/database.types';

type PropertyType = Database['public']['Tables']['properties']['Row']['property_type'];

interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  neighborhood: string;
  property_type: PropertyType;
  property_category: 'residential' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  surface_area: string;
  monthly_rent: string;
  deposit_amount: string;
  charges_amount: string;
  has_parking: boolean;
  has_garden: boolean;
  is_furnished: boolean;
  has_ac: boolean;
}

// Character limits
const TITLE_MIN = 10;
const TITLE_MAX = 100;
const DESC_MIN = 50;
const DESC_MAX = 1000;

// Initial form data
const INITIAL_FORM_DATA: PropertyFormData = {
  title: '',
  description: '',
  address: '',
  city: '',
  neighborhood: '',
  property_type: 'appartement' as PropertyType,
  property_category: 'residential',
  bedrooms: 1,
  bathrooms: 1,
  surface_area: '',
  monthly_rent: '',
  deposit_amount: '',
  charges_amount: '0',
  has_parking: false,
  has_garden: false,
  is_furnished: false,
  has_ac: false,
};

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraftData, setPendingDraftData] = useState<PropertyFormData | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hook de validation
  const { validateField, getFieldState, setFieldTouched } = useFormValidation<PropertyFormData>();

  const [formData, setFormData] = useState<PropertyFormData>(INITIAL_FORM_DATA);

  // Load draft from localStorage on mount - show confirmation modal
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEYS.PROPERTY_DRAFT);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Show modal if draft has significant data
        if (parsed.title || parsed.description || parsed.address) {
          setPendingDraftData(parsed);
          setShowDraftModal(true);
        }
      } catch {
        // Remove corrupted draft
        localStorage.removeItem(STORAGE_KEYS.PROPERTY_DRAFT);
      }
    }
  }, []);

  // Save draft to localStorage with debounce
  const saveDraft = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.PROPERTY_DRAFT, JSON.stringify(formData));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }, [formData]);

  // Auto-save draft on form changes (debounced)
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (formData.title || formData.description || formData.city) {
        saveDraft();
      }
    }, 3000); // Save after 3 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, saveDraft]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.PROPERTY_DRAFT);
    setFormData(INITIAL_FORM_DATA);
    setHasDraft(false);
    setImageFiles([]);
    setImagePreviews([]);
  }, []);

  // Handler for "Continue draft"
  const handleContinueDraft = () => {
    if (pendingDraftData) {
      setFormData(prev => ({ ...prev, ...pendingDraftData }));
      setHasDraft(true);
    }
    setShowDraftModal(false);
    setPendingDraftData(null);
  };

  // Handler for "Start fresh"
  const handleStartFresh = () => {
    localStorage.removeItem(STORAGE_KEYS.PROPERTY_DRAFT);
    setFormData(INITIAL_FORM_DATA);
    setHasDraft(false);
    setShowDraftModal(false);
    setPendingDraftData(null);
  };

  useEffect(() => {
    const category = formData.property_category;
    const currentType = formData.property_type;

    const validTypes: string[] = category === 'commercial'
      ? COMMERCIAL_PROPERTY_TYPES.map(pt => pt.value)
      : RESIDENTIAL_PROPERTY_TYPES.map(pt => pt.value);

    if (!validTypes.includes(currentType)) {
      setFormData(prev => ({
        ...prev,
        property_type: validTypes[0] as PropertyType
      }));
    }
  }, [formData.property_category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validation en temps réel pour les champs critiques
  const handleBlur = (field: keyof PropertyFormData) => {
    setFieldTouched(field);
    
    switch (field) {
      case 'title':
        validateField('title', () => ValidationService.validateMinLength(formData.title, 10, 'Le titre'));
        break;
      case 'address':
        validateField('address', () => ValidationService.validateRequired(formData.address, 'L\'adresse'));
        break;
      case 'city':
        validateField('city', () => ValidationService.validateRequired(formData.city, 'La ville'));
        break;
      case 'monthly_rent':
        validateField('monthly_rent', () => ValidationService.validatePositiveNumber(formData.monthly_rent, 'Le loyer'));
        break;
      case 'surface_area':
        if (formData.surface_area) {
          validateField('surface_area', () => ValidationService.validatePositiveNumber(formData.surface_area, 'La surface'));
        }
        break;
    }
  };

  const getPropertyTypesForCategory = () => {
    return formData.property_category === 'commercial'
      ? COMMERCIAL_PROPERTY_TYPES
      : RESIDENTIAL_PROPERTY_TYPES;
  };

  // Character count helpers
  const getTitleCharClass = () => {
    if (formData.title.length < TITLE_MIN) return 'text-amber-500';
    if (formData.title.length > TITLE_MAX) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getDescCharClass = () => {
    if (formData.description.length > 0 && formData.description.length < DESC_MIN) return 'text-amber-500';
    if (formData.description.length > DESC_MAX) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imageFiles.length + files.length > 10) {
      setError('Vous pouvez ajouter maximum 10 images');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    const previewToRevoke = imagePreviews[index];
    if (previewToRevoke) {
      URL.revokeObjectURL(previewToRevoke);
    }

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const uploadImages = async (propertyId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/connexion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: property, error: insertError } = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          title: formData.title,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          neighborhood: formData.neighborhood || null,
          property_type: formData.property_type,
          property_category: formData.property_category,
          bedrooms: parseInt(formData.bedrooms.toString()),
          bathrooms: parseInt(formData.bathrooms.toString()),
          surface_area: formData.surface_area ? parseFloat(formData.surface_area) : null,
          monthly_rent: parseFloat(formData.monthly_rent),
          deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
          charges_amount: parseFloat(formData.charges_amount),
          has_parking: formData.has_parking,
          has_garden: formData.has_garden,
          is_furnished: formData.is_furnished,
          has_ac: formData.has_ac,
          status: 'disponible',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!property) throw new Error('Erreur lors de la création de la propriété');

      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const imageUrls = await uploadImages(property.id);

        const { error: updateError } = await supabase
          .from('properties')
          .update({
            images: imageUrls,
            main_image: imageUrls[0],
          })
          .eq('id', property.id);

        if (updateError) throw updateError;
      }

      // Clear draft after successful submission
      localStorage.removeItem(STORAGE_KEYS.PROPERTY_DRAFT);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/proprietaire');
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la propriété';
      setError(message);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  if (success) {
    // Generate random confetti positions
    const confettiColors = ['hsl(var(--primary))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(217 91% 60%)'];
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-neutral-50 flex items-center justify-center p-4 z-50">
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%',
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)] 
                }} 
              />
            </div>
          ))}
        </div>

        <div className="relative bg-white rounded-3xl p-10 max-w-md text-center shadow-xl animate-fade-in">
          {/* Animated success icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
            <Check className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">
            🎉 Félicitations !
          </h2>
          <p className="text-xl text-neutral-700 mb-2">
            Propriété publiée avec succès
          </p>
          <p className="text-neutral-500 mb-6">
            Votre annonce est maintenant visible par tous les locataires sur Mon Toit.
          </p>
          
          {/* Animated redirect indicator */}
          <div className="flex items-center justify-center gap-2 text-primary-500">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-2 font-medium">Redirection vers votre dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-card">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-3 flex items-center gap-3">
              <Home className="h-8 w-8 text-primary-500" />
              <span>Ajouter une propriété</span>
            </h1>
            <p className="text-neutral-600 text-lg">Remplissez les informations de votre propriété pour la publier sur Mon Toit</p>
            
            {/* Draft indicator */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm">
                {draftSaved && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    Brouillon sauvegardé
                  </span>
                )}
                {hasDraft && !draftSaved && (
                  <span className="text-neutral-500">Brouillon restauré</span>
                )}
              </div>
              {(hasDraft || formData.title) && (
                <button
                  type="button"
                  onClick={clearDraft}
                  className="flex items-center gap-1 text-sm text-neutral-500 hover:text-red-500 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recommencer
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary-500" />
                <span>Photos de la propriété</span>
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer bg-white hover:bg-neutral-50 transition-colors"
                  >
                    <Upload className="h-12 w-12 text-neutral-400 mb-3" />
                    <span className="text-neutral-700 font-medium">Cliquez pour ajouter des photos</span>
                    <span className="text-sm text-neutral-500 mt-1">Maximum 10 images (JPG, PNG)</span>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border border-neutral-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Photo principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Informations générales</h2>

              <div className="space-y-4">
                <div>
                  <ValidatedInput
                    label="Titre de l'annonce"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={() => handleBlur('title')}
                    required
                    placeholder="Ex: Bel appartement 3 pièces à Cocody"
                    error={getFieldState('title').error}
                    touched={getFieldState('title').isInvalid || getFieldState('title').isValid}
                    isValid={getFieldState('title').isValid}
                    helperText={`Minimum ${TITLE_MIN} caractères`}
                    maxLength={TITLE_MAX}
                  />
                  <div className={`text-xs mt-1 text-right ${getTitleCharClass()}`}>
                    {formData.title.length}/{TITLE_MAX} caractères
                  </div>
                </div>

                <div>
                  <ValidatedTextarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Décrivez votre propriété en détail..."
                    maxLength={DESC_MAX}
                  />
                  <div className={`text-xs mt-1 text-right ${getDescCharClass()}`}>
                    {formData.description.length}/{DESC_MAX} caractères
                    {formData.description.length > 0 && formData.description.length < DESC_MIN && (
                      <span className="ml-2">(min. recommandé: {DESC_MIN})</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Catégorie de bien <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, property_category: 'residential' }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                        formData.property_category === 'residential'
                          ? 'bg-primary-500 text-white shadow-md border border-primary-500'
                          : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <Home className="w-5 h-5" />
                      <span>Résidentiel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, property_category: 'commercial' }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                        formData.property_category === 'commercial'
                          ? 'bg-primary-500 text-white shadow-md border border-primary-500'
                          : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Commercial</span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">
                    {formData.property_category === 'residential'
                      ? 'Pour les logements : appartements, maisons, villas...'
                      : 'Pour les locaux professionnels : bureaux, commerces...'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">
                      Type de bien <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    >
                      {getPropertyTypesForCategory().map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      name="surface_area"
                      value={formData.surface_area}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="Ex: 75"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">
                      Chambres <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">
                      Salles de bain <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Localisation</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Adresse complète
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ex: Rue des Jardins, Résidence Les Palmiers"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={(e) => {
                        handleChange(e);
                        // Reset neighborhood when city changes
                        if (e.target.value !== 'Abidjan') {
                          setFormData(prev => ({ ...prev, neighborhood: '' }));
                        }
                      }}
                      onBlur={() => handleBlur('city')}
                      required
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    >
                      <option value="">Sélectionnez une ville</option>
                      {CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">
                      Quartier {formData.city === 'Abidjan' && <span className="text-neutral-500">(commune)</span>}
                    </label>
                    {formData.city === 'Abidjan' ? (
                      <select
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                      >
                        <option value="">Sélectionnez une commune</option>
                        {ABIDJAN_COMMUNES.map(commune => (
                          <option key={commune} value={commune}>{commune}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleChange}
                        placeholder="Ex: Centre-ville"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Tarification</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Loyer mensuel (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="monthly_rent"
                    value={formData.monthly_rent}
                    onChange={handleChange}
                    onBlur={() => handleBlur('monthly_rent')}
                    required
                    min="0"
                    placeholder="Ex: 150000"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Dépôt de garantie (FCFA)
                  </label>
                  <input
                    type="number"
                    name="deposit_amount"
                    value={formData.deposit_amount}
                    onChange={handleChange}
                    min="0"
                    placeholder="Ex: 300000"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Charges mensuelles (FCFA)
                  </label>
                  <input
                    type="number"
                    name="charges_amount"
                    value={formData.charges_amount}
                    onChange={handleChange}
                    min="0"
                    placeholder="Ex: 25000"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Équipements</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-neutral-200 cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="checkbox"
                    name="is_furnished"
                    checked={formData.is_furnished}
                    onChange={handleChange}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="font-medium text-neutral-700">Meublé</span>
                </label>

                <label className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-neutral-200 cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="checkbox"
                    name="has_parking"
                    checked={formData.has_parking}
                    onChange={handleChange}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="font-medium text-neutral-700">Parking</span>
                </label>

                <label className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-neutral-200 cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="checkbox"
                    name="has_garden"
                    checked={formData.has_garden}
                    onChange={handleChange}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="font-medium text-neutral-700">Jardin</span>
                </label>

                <label className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-neutral-200 cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="checkbox"
                    name="has_ac"
                    checked={formData.has_ac}
                    onChange={handleChange}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="font-medium text-neutral-700">Climatisation</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading || uploadingImages ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{uploadingImages ? 'Upload des images...' : 'Publication...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Publier la propriété</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Draft confirmation modal */}
      <Modal
        isOpen={showDraftModal}
        onClose={() => {}}
        title=""
        size="sm"
        closeOnOverlayClick={false}
        showCloseButton={false}
      >
        <div className="text-center py-4">
          {/* File icon with animation */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="h-12 w-12 text-primary-600 animate-pulse" />
          </div>
          
          <h3 className="text-xl font-bold text-neutral-900 mb-2">
            📝 Brouillon trouvé !
          </h3>
          
          <p className="text-neutral-600 mb-4">
            Vous avez un brouillon non terminé pour cette propriété.
          </p>
          
          {pendingDraftData?.title && (
            <div className="bg-neutral-50 p-4 rounded-xl mb-6 text-left">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Titre sauvegardé</p>
              <p className="text-neutral-800 font-medium truncate">{pendingDraftData.title}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartFresh}
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors font-medium"
            >
              Recommencer à zéro
            </button>
            <button
              onClick={handleContinueDraft}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              Continuer le brouillon
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
