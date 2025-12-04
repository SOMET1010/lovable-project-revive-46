import { useState, useEffect } from 'react';
import { ArrowLeft, Home, Save, Upload, X, Image as ImageIcon, Building2 } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { RESIDENTIAL_PROPERTY_TYPES, COMMERCIAL_PROPERTY_TYPES } from '@/shared/lib/constants/app.constants';
import type { Database } from '@/shared/lib/database.types';

type PropertyType = Database['public']['Tables']['properties']['Row']['property_type'];

export default function AddProperty() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
  });

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

  const getPropertyTypesForCategory = () => {
    return formData.property_category === 'commercial'
      ? COMMERCIAL_PROPERTY_TYPES
      : RESIDENTIAL_PROPERTY_TYPES;
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
      window.location.href = '/connexion';
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

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard/proprietaire';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout de la propriété');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-card">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
            <Home className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">Propriété ajoutée!</h2>
          <p className="text-neutral-600 mb-6 text-lg">
            Votre propriété a été publiée avec succès et est maintenant visible par les locataires.
          </p>
          <p className="text-sm text-primary-500 font-medium">Redirection en cours...</p>
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
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Titre de l'annonce <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Bel appartement 3 pièces à Cocody"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Décrivez votre propriété en détail..."
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Catégorie de bien <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, property_category: 'residentiel' }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                        formData.property_category === 'residentiel'
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
                    {formData.property_category === 'residentiel'
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
                    Adresse complète <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Rue 12, Lot 34"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Abidjan"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">
                      Quartier
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      placeholder="Ex: Cocody"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Informations financières</h2>

              <div className="space-y-4">
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
                      required
                      min="0"
                      step="1000"
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
                      step="1000"
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
                      step="1000"
                      placeholder="Ex: 10000"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Équipements</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                  <input
                    type="checkbox"
                    name="is_furnished"
                    checked={formData.is_furnished}
                    onChange={handleChange}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 w-5 h-5"
                  />
                  <span className="text-sm font-medium text-neutral-800">Meublé</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                  <input
                    type="checkbox"
                    name="has_parking"
                    checked={formData.has_parking}
                    onChange={handleChange}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 w-5 h-5"
                  />
                  <span className="text-sm font-medium text-neutral-800">Parking</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                  <input
                    type="checkbox"
                    name="has_ac"
                    checked={formData.has_ac}
                    onChange={handleChange}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 w-5 h-5"
                  />
                  <span className="text-sm font-medium text-neutral-800">Climatisation</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                  <input
                    type="checkbox"
                    name="has_garden"
                    checked={formData.has_garden}
                    onChange={handleChange}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 w-5 h-5"
                  />
                  <span className="text-sm font-medium text-neutral-800">Jardin</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="border border-neutral-200 hover:border-primary-200 text-neutral-700 font-medium py-3 px-8 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                <span>
                  {loading && !uploadingImages && 'Création...'}
                  {uploadingImages && 'Upload des images...'}
                  {!loading && !uploadingImages && 'Publier la propriété'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
