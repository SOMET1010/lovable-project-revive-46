/**
 * Page d'Édition de Propriété
 * Permet aux propriétaires de modifier leurs propriétés existantes
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, X, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { RESIDENTIAL_PROPERTY_TYPES, COMMERCIAL_PROPERTY_TYPES } from '@/shared/lib/constants/app.constants';
import type { Database } from '@/shared/lib/database.types';
import { Button } from '@/shared/ui/Button';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyType = Database['public']['Tables']['properties']['Row']['property_type'];

export default function EditPropertyPage() {
  const { user } = useAuth();
  const propertyId = window.location.pathname.split('/')[3];
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    neighborhood: '',
    property_type: 'appartement' as PropertyType,
    property_category: 'residentiel' as 'residentiel' | 'commercial',
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
    status: 'disponible' as 'disponible' | 'loue' | 'en_attente' | 'retire',
  });

  useEffect(() => {
    if (!user) {
      window.location.href = '/connexion';
      return;
    }
    loadProperty();
  }, [user, propertyId]);

  const loadProperty = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (fetchError) throw fetchError;

      if (data.owner_id !== user?.id) {
        alert('Vous n\'êtes pas autorisé à modifier cette propriété');
        window.location.href = '/dashboard/proprietaire';
        return;
      }

      setProperty(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood || '',
        property_type: data.property_type,
        property_category: data.property_category,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        surface_area: data.surface_area?.toString() || '',
        monthly_rent: data.monthly_rent.toString(),
        deposit_amount: data.deposit_amount?.toString() || '',
        charges_amount: data.charges_amount?.toString() || '0',
        has_parking: data.has_parking,
        has_garden: data.has_garden,
        is_furnished: data.is_furnished,
        has_ac: data.has_ac,
        status: data.status,
      });

      if (data.images && data.images.length > 0) {
        setExistingImages(data.images);
      }

    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement de la propriété');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getPropertyTypesForCategory = () => {
    return formData.property_category === 'commercial'
      ? COMMERCIAL_PROPERTY_TYPES
      : RESIDENTIAL_PROPERTY_TYPES;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = existingImages.length - imagesToDelete.length + imageFiles.length + files.length;
    if (totalImages > 10) {
      setError('Maximum 10 images au total');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setError('');
  };

  const removeNewImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const previewToRevoke = imagePreviews[index];
    if (previewToRevoke) {
      URL.revokeObjectURL(previewToRevoke);
    }
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (imageUrl: string) => {
    setImagesToDelete([...imagesToDelete, imageUrl]);
  };

  const restoreImage = (imageUrl: string) => {
    setImagesToDelete(imagesToDelete.filter(url => url !== imageUrl));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const uploadedUrls: string[] = [];
    setUploadingImages(true);

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Erreur upload:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }
    } catch (err) {
      console.error('Erreur upload images:', err);
      throw new Error('Erreur lors de l\'upload des images');
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const deleteRemovedImages = async () => {
    if (imagesToDelete.length === 0) return;

    for (const imageUrl of imagesToDelete) {
      try {
        const path = imageUrl.split('/property-images/')[1];
        if (path) {
          await supabase.storage
            .from('property-images')
            .remove([path]);
        }
      } catch (err) {
        console.error('Erreur suppression image:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      // Validation
      if (!formData.title || !formData.address || !formData.city || !formData.monthly_rent) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Upload nouvelles images
      const newImageUrls = await uploadNewImages();

      // Supprimer les images marquées
      await deleteRemovedImages();

      // Construire le tableau final des images
      const finalImages = [
        ...existingImages.filter(url => !imagesToDelete.includes(url)),
        ...newImageUrls,
      ];

      // Mettre à jour la propriété
      const updateData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        neighborhood: formData.neighborhood,
        property_type: formData.property_type,
        property_category: formData.property_category,
        bedrooms: parseInt(formData.bedrooms.toString()),
        bathrooms: parseInt(formData.bathrooms.toString()),
        surface_area: formData.surface_area ? parseFloat(formData.surface_area) : null,
        monthly_rent: parseFloat(formData.monthly_rent),
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        charges_amount: formData.charges_amount ? parseFloat(formData.charges_amount) : 0,
        has_parking: formData.has_parking,
        has_garden: formData.has_garden,
        is_furnished: formData.is_furnished,
        has_ac: formData.has_ac,
        status: formData.status,
        images: finalImages,
        main_image: finalImages[0] || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId);

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Réinitialiser les états
      setImageFiles([]);
      setImagePreviews([]);
      setImagesToDelete([]);
      setExistingImages(finalImages);

      setTimeout(() => {
        window.location.href = '/dashboard/proprietaire';
      }, 2000);

    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Propriété non trouvée</p>
          <Button onClick={() => window.location.href = '/dashboard/proprietaire'}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/dashboard/proprietaire'}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-neutral-600" />
              </button>
              <div>
                <h1 className="text-h2 font-bold text-neutral-900">
                  Modifier la propriété
                </h1>
                <p className="text-neutral-500">{property.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Propriété modifiée avec succès! Redirection...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-h4 font-semibold text-neutral-900 mb-4">
                Informations générales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    placeholder="Ex: Appartement 3 pièces Cocody"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="input w-full"
                    placeholder="Décrivez votre propriété..."
                  />
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    name="property_category"
                    value={formData.property_category}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  >
                    <option value="residentiel">Résidentiel</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Type de bien *
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  >
                    {getPropertyTypesForCategory().map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Statut *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="loue">Louée</option>
                    <option value="en_attente">En attente</option>
                    <option value="retire">Retirée</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-h4 font-semibold text-neutral-900 mb-4">
                Localisation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Quartier
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-h4 font-semibold text-neutral-900 mb-4">
                Caractéristiques
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Chambres
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Salles de bain
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    name="surface_area"
                    value={formData.surface_area}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_parking"
                    checked={formData.has_parking}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-primary-500 rounded"
                  />
                  <span className="text-small text-neutral-700">Parking</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_garden"
                    checked={formData.has_garden}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-primary-500 rounded"
                  />
                  <span className="text-small text-neutral-700">Jardin</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_furnished"
                    checked={formData.is_furnished}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-primary-500 rounded"
                  />
                  <span className="text-small text-neutral-700">Meublé</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_ac"
                    checked={formData.has_ac}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-primary-500 rounded"
                  />
                  <span className="text-small text-neutral-700">Climatisé</span>
                </label>
              </div>
            </div>

            {/* Prix */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-h4 font-semibold text-neutral-900 mb-4">
                Tarification
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Loyer mensuel (FCFA) *
                  </label>
                  <input
                    type="number"
                    name="monthly_rent"
                    value={formData.monthly_rent}
                    onChange={handleChange}
                    required
                    min="0"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Caution (FCFA)
                  </label>
                  <input
                    type="number"
                    name="deposit_amount"
                    value={formData.deposit_amount}
                    onChange={handleChange}
                    min="0"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-small font-semibold text-neutral-700 mb-2">
                    Charges (FCFA)
                  </label>
                  <input
                    type="number"
                    name="charges_amount"
                    value={formData.charges_amount}
                    onChange={handleChange}
                    min="0"
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-h4 font-semibold text-neutral-900 mb-4">
                Photos
              </h2>

              {/* Images existantes */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-small font-semibold text-neutral-700 mb-3">
                    Images actuelles
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((url, index) => (
                      <div key={url} className="relative group">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg ${
                            imagesToDelete.includes(url) ? 'opacity-30' : ''
                          }`}
                        />
                        {imagesToDelete.includes(url) ? (
                          <button
                            type="button"
                            onClick={() => restoreImage(url)}
                            className="absolute top-2 right-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeExistingImage(url)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {index === 0 && !imagesToDelete.includes(url) && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded">
                            Principale
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouvelles images */}
              {imagePreviews.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-small font-semibold text-neutral-700 mb-3">
                    Nouvelles images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Nouvelle ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload */}
              <div>
                <label className="btn-secondary inline-flex items-center cursor-pointer">
                  <Upload className="h-5 w-5 mr-2" />
                  Ajouter des photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-neutral-500 mt-2">
                  Maximum 10 images au total. Formats acceptés: JPG, PNG, WebP
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                loading={saving || uploadingImages}
                disabled={saving || uploadingImages}
                className="flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Enregistrement...' : uploadingImages ? 'Upload images...' : 'Enregistrer les modifications'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/dashboard/proprietaire'}
                disabled={saving || uploadingImages}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
