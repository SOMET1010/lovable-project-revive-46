/**
 * AlertCreationModal - Modal de création d'alerte personnalisée
 * Permet de créer une alerte avec nom, critères et fréquence
 */

import { useState, useEffect } from 'react';
import { X, Bell, MapPin, Home, Coins, BedDouble, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';
import { CITIES } from '@/shared/data/cities';
import { PROPERTY_TYPES } from '@/shared/data/propertyTypes';

interface AlertCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
  };
  onSuccess?: () => void;
}

export function AlertCreationModal({ 
  isOpen, 
  onClose, 
  prefillData,
  onSuccess 
}: AlertCreationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    city: prefillData?.city || '',
    propertyType: prefillData?.propertyType || '',
    minPrice: prefillData?.minPrice?.toString() || '',
    maxPrice: prefillData?.maxPrice?.toString() || '',
    minBedrooms: prefillData?.minBedrooms?.toString() || '',
    maxBedrooms: prefillData?.maxBedrooms?.toString() || '',
    frequency: 'daily' as 'instant' | 'daily' | 'weekly'
  });

  // Charger le nombre d'alertes actives
  useEffect(() => {
    if (isOpen && user) {
      loadActiveAlertsCount();
    }
  }, [isOpen, user]);

  // Pré-remplir avec les données passées
  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        city: prefillData.city || prev.city,
        propertyType: prefillData.propertyType || prev.propertyType,
        minPrice: prefillData.minPrice?.toString() || prev.minPrice,
        maxPrice: prefillData.maxPrice?.toString() || prev.maxPrice,
        minBedrooms: prefillData.minBedrooms?.toString() || prev.minBedrooms,
        maxBedrooms: prefillData.maxBedrooms?.toString() || prev.maxBedrooms
      }));
    }
  }, [prefillData]);

  const loadActiveAlertsCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('property_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);
    setActiveAlertsCount(count || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Veuillez donner un nom à votre alerte');
      return;
    }

    if (activeAlertsCount >= 5) {
      toast.error('Maximum 5 alertes actives. Désactivez-en une pour en créer une nouvelle.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('property_alerts').insert({
        user_id: user.id,
        name: formData.name.trim(),
        city: formData.city || null,
        property_type: formData.propertyType || null,
        min_price: formData.minPrice ? parseFloat(formData.minPrice) : null,
        max_price: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        min_bedrooms: formData.minBedrooms ? parseInt(formData.minBedrooms) : null,
        max_bedrooms: formData.maxBedrooms ? parseInt(formData.maxBedrooms) : null,
        frequency: formData.frequency,
        is_active: true
      });

      if (error) throw error;

      toast.success('Alerte créée avec succès !');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        city: '',
        propertyType: '',
        minPrice: '',
        maxPrice: '',
        minBedrooms: '',
        maxBedrooms: '',
        frequency: 'daily'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      if (errorMessage.includes('Maximum 5')) {
        toast.error('Maximum 5 alertes actives atteint');
      } else {
        toast.error('Erreur lors de la création de l\'alerte');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Créer une alerte</h2>
              <p className="text-xs text-muted-foreground">
                {activeAlertsCount}/5 alertes actives
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nom de l'alerte */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nom de l'alerte *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Appartement Cocody"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Ville
            </label>
            <select
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Toutes les villes</option>
              {CITIES.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Type de bien */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <Home className="w-4 h-4 inline mr-1" />
              Type de bien
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Tous les types</option>
              {PROPERTY_TYPES.map((type: { value: string; label: string }) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <Coins className="w-4 h-4 inline mr-1" />
              Budget (FCFA)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.minPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, minPrice: e.target.value }))}
                placeholder="Min"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="Max"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Chambres */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <BedDouble className="w-4 h-4 inline mr-1" />
              Chambres
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={formData.minBedrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, minBedrooms: e.target.value }))}
                placeholder="Min"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                type="number"
                min="0"
                value={formData.maxBedrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, maxBedrooms: e.target.value }))}
                placeholder="Max"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Fréquence */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Fréquence des notifications
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'instant', label: 'Instantané' },
                { value: 'daily', label: 'Quotidien' },
                { value: 'weekly', label: 'Hebdo' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, frequency: option.value as 'instant' | 'daily' | 'weekly' }))}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    formData.frequency === option.value
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-foreground hover:bg-neutral-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || activeAlertsCount >= 5}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Création...' : 'Créer l\'alerte'}
          </button>

          {activeAlertsCount >= 5 && (
            <p className="text-center text-sm text-red-600">
              Vous avez atteint le maximum de 5 alertes actives
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default AlertCreationModal;
