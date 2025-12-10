/**
 * CreateAlertPage - Page de création d'alertes personnalisées
 * Accessible depuis /alertes/creer
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, MapPin, Home, Coins, BedDouble, Clock, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';
import { CITIES } from '@/shared/data/cities';
import { PROPERTY_TYPES } from '@/shared/data/propertyTypes';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/recherche" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la recherche
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mes alertes</h1>
              <p className="text-muted-foreground">
                {activeCount}/5 alertes actives
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton créer */}
        {!showForm && activeCount < 5 && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-medium hover:bg-primary/5 transition-colors mb-6"
          >
            + Créer une nouvelle alerte
          </button>
        )}

        {/* Formulaire de création */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Nouvelle alerte</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-1">Nom de l'alerte *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Appartement Cocody"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />Ville
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  >
                    <option value="">Toutes</option>
                    {CITIES.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Home className="w-4 h-4 inline mr-1" />Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData(p => ({ ...p, propertyType: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg"
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
                <label className="block text-sm font-medium mb-1">
                  <Coins className="w-4 h-4 inline mr-1" />Budget (FCFA)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => setFormData(p => ({ ...p, minPrice: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-border rounded-lg"
                  />
                  <input
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData(p => ({ ...p, maxPrice: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-border rounded-lg"
                  />
                </div>
              </div>

              {/* Chambres */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <BedDouble className="w-4 h-4 inline mr-1" />Chambres
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.minBedrooms}
                    onChange={(e) => setFormData(p => ({ ...p, minBedrooms: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-border rounded-lg"
                  />
                  <input
                    type="number"
                    min="0"
                    value={formData.maxBedrooms}
                    onChange={(e) => setFormData(p => ({ ...p, maxBedrooms: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-border rounded-lg"
                  />
                </div>
              </div>

              {/* Fréquence */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />Fréquence
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['instant', 'daily', 'weekly'] as const).map(freq => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, frequency: freq }))}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.frequency === freq
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {getFrequencyLabel(freq)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
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
              <div key={i} className="bg-white rounded-2xl border border-border p-4 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune alerte</h3>
            <p className="text-muted-foreground">
              Créez une alerte pour être notifié des nouvelles annonces
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border p-4 transition-opacity ${
                  alert.is_active ? 'border-primary/30' : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {alert.name || 'Alerte sans nom'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        alert.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
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
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title={alert.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {alert.is_active ? (
                        <ToggleRight className="w-5 h-5 text-primary" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
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
      </div>
    </div>
  );
}
