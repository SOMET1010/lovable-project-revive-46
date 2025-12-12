/**
 * CreateAlertPage - Page de création d'alertes personnalisées
 * Accessible depuis /alertes/creer
 */

import { useState, useEffect } from 'react';
import { Bell, MapPin, Home, Coins, BedDouble, Clock, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';
import { CITIES } from '@/shared/data/cities';
import { PROPERTY_TYPES } from '@/shared/data/propertyTypes';
import FormPageLayout from '@/shared/components/FormPageLayout';

interface PropertyAlert {
  id: string;
  name: string | null;
  city: string | null;
  property_type: string | null;
  min_price: number | null;
  max_price: number | null;
  min_bedrooms: number | null;
  max_bedrooms: number | null;
  frequency: string | null;
  is_active: boolean | null;
  last_results_count: number | null;
  created_at: string | null;
}

export default function CreateAlertPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    frequency: 'daily' as 'instant' | 'daily' | 'weekly'
  });

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('property_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch {
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const activeCount = alerts.filter(a => a.is_active).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error('Veuillez donner un nom à votre alerte');
      return;
    }

    if (activeCount >= 5) {
      toast.error('Maximum 5 alertes actives');
      return;
    }

    setCreating(true);
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

      toast.success('Alerte créée !');
      setFormData({
        name: '', city: '', propertyType: '', minPrice: '', maxPrice: '',
        minBedrooms: '', maxBedrooms: '', frequency: 'daily'
      });
      setShowForm(false);
      loadAlerts();
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const toggleAlert = async (alertId: string, currentState: boolean | null) => {
    if (!currentState && activeCount >= 5) {
      toast.error('Maximum 5 alertes actives');
      return;
    }

    try {
      const { error } = await supabase
        .from('property_alerts')
        .update({ is_active: !currentState })
        .eq('id', alertId);

      if (error) throw error;
      loadAlerts();
      toast.success(currentState ? 'Alerte désactivée' : 'Alerte activée');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Supprimer cette alerte ?')) return;

    try {
      const { error } = await supabase
        .from('property_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      loadAlerts();
      toast.success('Alerte supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getFrequencyLabel = (freq: string | null) => {
    switch (freq) {
      case 'instant': return 'Instantané';
      case 'daily': return 'Quotidien';
      case 'weekly': return 'Hebdomadaire';
      default: return 'Quotidien';
    }
  };

  return (
    <FormPageLayout
      title="Mes alertes"
      subtitle={`${activeCount}/5 alertes actives`}
      icon={Bell}
      backPath="/recherche"
    >
      {/* Bouton créer */}
      {!showForm && activeCount < 5 && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 border-2 border-dashed border-[#F16522]/30 rounded-xl text-[#F16522] font-medium hover:bg-[#F16522]/5 transition-colors"
        >
          + Créer une nouvelle alerte
        </button>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-[#FAF7F4] rounded-xl border border-[#EFEBE9] p-6">
          <h2 className="text-lg font-semibold text-[#2C1810] mb-4">Nouvelle alerte</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-[#2C1810] mb-2">
                Nom de l'alerte <span className="text-[#F16522]">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Appartement Cocody"
                className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />Ville
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl bg-white"
                >
                  <option value="">Toutes</option>
                  {CITIES.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-2">
                  <Home className="w-4 h-4 inline mr-1" />Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData(p => ({ ...p, propertyType: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl bg-white"
                >
                  <option value="">Tous</option>
                  {PROPERTY_TYPES.map((t: { value: string; label: string }) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-[#2C1810] mb-2">
                <Coins className="w-4 h-4 inline mr-1" />Budget (FCFA)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={formData.minPrice}
                  onChange={(e) => setFormData(p => ({ ...p, minPrice: e.target.value }))}
                  placeholder="Min"
                  className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl bg-white"
                />
                <input
                  type="number"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData(p => ({ ...p, maxPrice: e.target.value }))}
                  placeholder="Max"
                  className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Chambres */}
            <div>
              <label className="block text-sm font-medium text-[#2C1810] mb-2">
                <BedDouble className="w-4 h-4 inline mr-1" />Chambres
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min="0"
                  value={formData.minBedrooms}
                  onChange={(e) => setFormData(p => ({ ...p, minBedrooms: e.target.value }))}
                  placeholder="Min"
                  className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl bg-white"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.maxBedrooms}
                  onChange={(e) => setFormData(p => ({ ...p, maxBedrooms: e.target.value }))}
                  placeholder="Max"
                  className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Fréquence */}
            <div>
              <label className="block text-sm font-medium text-[#2C1810] mb-2">
                <Clock className="w-4 h-4 inline mr-1" />Fréquence
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['instant', 'daily', 'weekly'] as const).map(freq => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, frequency: freq }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                      formData.frequency === freq
                        ? 'bg-[#F16522] text-white'
                        : 'bg-white border border-[#EFEBE9] text-[#2C1810] hover:bg-[#FAF7F4]'
                    }`}
                  >
                    {getFrequencyLabel(freq)}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-[#EFEBE9] text-[#2C1810] rounded-xl hover:bg-[#FAF7F4] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-3 bg-[#F16522] text-white rounded-xl hover:bg-[#d9571d] disabled:opacity-50 transition-colors"
              >
                {creating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des alertes */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#FAF7F4] rounded-xl border border-[#EFEBE9] p-4 animate-pulse">
              <div className="h-5 bg-[#EFEBE9] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[#EFEBE9] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-[#A69B95] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#2C1810] mb-2">Aucune alerte</h3>
          <p className="text-[#6B5A4E]">
            Créez une alerte pour être notifié des nouvelles annonces
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-4 transition-opacity ${
                alert.is_active ? 'border-[#F16522]/30' : 'border-[#EFEBE9] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#2C1810]">
                      {alert.name || 'Alerte sans nom'}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      alert.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-[#FAF7F4] text-[#A69B95]'
                    }`}>
                      {alert.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-[#6B5A4E]">
                    {alert.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{alert.city}
                      </span>
                    )}
                    {alert.property_type && (
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" />{alert.property_type}
                      </span>
                    )}
                    {(alert.min_price || alert.max_price) && (
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {alert.min_price ? `${(alert.min_price/1000).toFixed(0)}k` : '0'} - 
                        {alert.max_price ? ` ${(alert.max_price/1000).toFixed(0)}k` : ' ∞'}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{getFrequencyLabel(alert.frequency)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id, alert.is_active)}
                    className="p-2 hover:bg-[#FAF7F4] rounded-lg transition-colors"
                    title={alert.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {alert.is_active ? (
                      <ToggleRight className="w-5 h-5 text-[#F16522]" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-[#A69B95]" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormPageLayout>
  );
}
