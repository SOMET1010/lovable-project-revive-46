import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import { Bookmark, Bell, BellOff, Search, Trash2, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SearchFilters {
  city?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  is_furnished?: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  notifications_enabled: boolean | null;
  created_at: string | null;
}

interface PropertyAlert {
  id: string;
  city: string | null;
  property_type: string | null;
  min_price: number | null;
  max_price: number | null;
  min_bedrooms: number | null;
  max_bedrooms: number | null;
  is_active: boolean | null;
  last_notified_at: string | null;
  created_at: string | null;
}

export default function SavedSearches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: searchesData } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const formattedSearches: SavedSearch[] = (searchesData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        filters: (s.filters as SearchFilters) || {},
        notifications_enabled: s.notifications_enabled,
        created_at: s.created_at
      }));

      setSearches(formattedSearches);

      const { data: alertsData } = await supabase
        .from('property_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      setAlerts((alertsData || []) as PropertyAlert[]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAlert = async (searchId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ notifications_enabled: !currentStatus })
        .eq('id', searchId);

      if (error) throw error;

      setSearches(prev =>
        prev.map(s => s.id === searchId ? { ...s, notifications_enabled: !currentStatus } : s)
      );
    } catch (err) {
      console.error('Error toggling alert:', err);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    if (!confirm('Supprimer cette recherche sauvegardée ?')) return;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;

      setSearches(prev => prev.filter(s => s.id !== searchId));
    } catch (err) {
      console.error('Error deleting search:', err);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('property_alerts')
        .update({ is_active: false })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  const handleExecuteSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    const filters = search.filters;
    
    if (filters.city) params.set('city', filters.city);
    if (filters.property_type) params.set('type', filters.property_type);
    if (filters.min_price) params.set('minPrice', filters.min_price.toString());
    if (filters.max_price) params.set('maxPrice', filters.max_price.toString());
    if (filters.min_bedrooms) params.set('bedrooms', filters.min_bedrooms.toString());
    if (filters.is_furnished !== undefined) params.set('furnished', filters.is_furnished.toString());

    navigate(`/recherche?${params.toString()}`);
  };

  const getSearchSummary = (search: SavedSearch) => {
    const parts: string[] = [];
    const filters = search.filters;

    if (filters.property_type) {
      const types: Record<string, string> = {
        'appartement': 'Appartement',
        'maison': 'Maison',
        'studio': 'Studio',
        'villa': 'Villa'
      };
      parts.push(types[filters.property_type] || filters.property_type);
    }

    if (filters.city) parts.push(filters.city);

    if (filters.min_bedrooms) parts.push(`${filters.min_bedrooms}+ chambres`);

    if (filters.min_price || filters.max_price) {
      if (filters.min_price && filters.max_price) {
        parts.push(`${filters.min_price.toLocaleString()} - ${filters.max_price.toLocaleString()} FCFA`);
      } else if (filters.min_price) {
        parts.push(`À partir de ${filters.min_price.toLocaleString()} FCFA`);
      } else if (filters.max_price) {
        parts.push(`Jusqu'à ${filters.max_price.toLocaleString()} FCFA`);
      }
    }

    if (filters.is_furnished) parts.push('Meublé');

    return parts.join(' • ') || 'Recherche personnalisée';
  };

  const getAlertSummary = (alert: PropertyAlert) => {
    const parts: string[] = [];
    
    if (alert.property_type) parts.push(alert.property_type);
    if (alert.city) parts.push(alert.city);
    if (alert.min_bedrooms) parts.push(`${alert.min_bedrooms}+ ch.`);
    if (alert.min_price || alert.max_price) {
      if (alert.min_price && alert.max_price) {
        parts.push(`${alert.min_price.toLocaleString()} - ${alert.max_price.toLocaleString()} FCFA`);
      } else if (alert.min_price) {
        parts.push(`Min ${alert.min_price.toLocaleString()} FCFA`);
      } else if (alert.max_price) {
        parts.push(`Max ${alert.max_price.toLocaleString()} FCFA`);
      }
    }

    return parts.join(' • ') || 'Alerte personnalisée';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 to-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
            <Bookmark className="w-10 h-10 text-terracotta-600" />
            <span>Recherches sauvegardées</span>
          </h1>
          <p className="text-xl text-gray-600">
            Gérez vos recherches et recevez des alertes pour les nouvelles propriétés
          </p>
        </div>

        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Bell className="w-6 h-6 text-terracotta-600" />
              <span>Alertes actives ({alerts.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map(alert => (
                <div key={alert.id} className="card-scrapbook p-4 relative">
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-gray-900">Alerte active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{getAlertSummary(alert)}</p>
                  {alert.last_notified_at && (
                    <p className="text-xs text-gray-500">
                      Dernière notification: {new Date(alert.last_notified_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Mes recherches ({searches.length})</h2>
          <Link to="/recherche" className="btn-secondary flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Nouvelle recherche</span>
          </Link>
        </div>

        <div className="space-y-4">
          {searches.map(search => (
            <div key={search.id} className="card-scrapbook p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{search.name}</h3>
                  <p className="text-gray-600 mb-2">{getSearchSummary(search)}</p>
                  {search.created_at && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Créée le {new Date(search.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleAlert(search.id, search.notifications_enabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      search.notifications_enabled
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={search.notifications_enabled ? 'Notifications activées' : 'Notifications désactivées'}
                  >
                    {search.notifications_enabled ? (
                      <Bell className="w-5 h-5" />
                    ) : (
                      <BellOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteSearch(search.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {search.notifications_enabled && (
                <div className="p-3 bg-green-50 rounded-lg mb-4 flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Notifications activées
                  </span>
                </div>
              )}

              <button
                onClick={() => handleExecuteSearch(search)}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Lancer la recherche</span>
              </button>
            </div>
          ))}

          {searches.length === 0 && (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">Aucune recherche sauvegardée</p>
              <p className="text-gray-500 mb-6">
                Sauvegardez vos recherches pour les retrouver facilement
              </p>
              <Link to="/recherche" className="btn-primary inline-flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Commencer une recherche</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}