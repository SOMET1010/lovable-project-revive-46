import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import FormPageLayout from '@/shared/components/FormPageLayout';
import type { MaintenanceLeaseQueryResult } from '../types/supabase-mappers.types';

export default function MaintenanceRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeLease, setActiveLease] = useState<MaintenanceLeaseQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    issue_type: 'plumbing',
    urgency: 'medium',
    description: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    loadActiveLease();
  }, [user, navigate]);

  const loadActiveLease = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lease_contracts')
        .select('*, properties(*)')
        .eq('tenant_id', user.id)
        .eq('status', 'actif')
        .maybeSingle();

      if (error) throw error;

      setActiveLease(data);
    } catch (err) {
      console.error('Error loading lease:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeLease) return;

    setSubmitting(true);

    try {
      const imageUrls: string[] = [];

      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `maintenance/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .insert({
          tenant_id: user.id,
          property_id: activeLease.property_id,
          contract_id: activeLease.id,
          issue_type: formData.issue_type,
          priority: formData.urgency,
          description: formData.description,
          images: imageUrls
        });

      if (error) throw error;

      setSuccess(true);
      setFormData({ issue_type: 'plumbing', urgency: 'medium', description: '' });
      setImages([]);
      setImagePreviews([]);

      setTimeout(() => {
        navigate('/maintenance/locataire');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error submitting request:', err);
      const message = err instanceof Error ? err.message : 'Erreur lors de la soumission';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F16522]"></div>
      </div>
    );
  }

  if (!activeLease) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#A69B95] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2C1810] mb-2">Aucun bail actif</h2>
          <p className="text-[#6B5A4E]">Vous devez avoir un bail actif pour soumettre une demande de maintenance</p>
        </div>
      </div>
    );
  }

  return (
    <FormPageLayout
      title="Demande de maintenance"
      subtitle="Signalez un problème dans votre logement"
      icon={Wrench}
    >
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-bold">Demande envoyée avec succès !</p>
            <p className="text-sm text-green-700">Le propriétaire a été notifié. Redirection...</p>
          </div>
        </div>
      )}

      {/* Propriété concernée */}
      <div className="bg-[#FAF7F4] rounded-xl p-4 border border-[#EFEBE9]">
        <h3 className="text-sm font-medium text-[#6B5A4E] mb-2">Propriété concernée</h3>
        <p className="font-bold text-[#2C1810]">{activeLease.properties?.title}</p>
        <p className="text-sm text-[#6B5A4E]">{activeLease.properties?.address}, {activeLease.properties?.city}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de problème et urgence en grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2C1810] mb-2">
              Type de problème <span className="text-[#F16522]">*</span>
            </label>
            <select
              value={formData.issue_type}
              onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
              required
              className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] bg-white text-[#2C1810]"
            >
              <option value="plumbing">Plomberie</option>
              <option value="electrical">Électricité</option>
              <option value="heating">Chauffage / Climatisation</option>
              <option value="appliance">Électroménager</option>
              <option value="structural">Structure / Bâtiment</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C1810] mb-2">
              Urgence <span className="text-[#F16522]">*</span>
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              required
              className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] bg-white text-[#2C1810]"
            >
              <option value="low">Faible - Peut attendre plusieurs jours</option>
              <option value="medium">Moyenne - À traiter sous quelques jours</option>
              <option value="high">Élevée - À traiter rapidement</option>
              <option value="urgent">Urgente - Intervention immédiate requise</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#2C1810] mb-2">
            Description détaillée <span className="text-[#F16522]">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={6}
            className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] bg-white text-[#2C1810] resize-none"
            placeholder="Décrivez le problème en détail (localisation, symptômes, etc.)"
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-[#2C1810] mb-2">
            Photos (optionnel)
          </label>
          <div className="border-2 border-dashed border-[#EFEBE9] rounded-xl p-6 text-center hover:border-[#F16522]/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Camera className="w-12 h-12 text-[#A69B95] mx-auto mb-3" />
              <p className="text-[#6B5A4E] font-medium">Cliquez pour ajouter des photos</p>
              <p className="text-sm text-[#A69B95]">Jusqu'à 5 photos</p>
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#EFEBE9]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-[#EFEBE9] text-[#2C1810] font-semibold rounded-xl hover:bg-[#FAF7F4] transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#F16522] hover:bg-[#d9571d] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? 'Envoi...' : 'Soumettre la demande'}
          </button>
        </div>
      </form>
    </FormPageLayout>
  );
}
