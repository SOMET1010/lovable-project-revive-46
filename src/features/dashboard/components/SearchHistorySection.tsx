/**
 * Section Historique de Recherche
 * Affiche l'historique des recherches effectuées
 */

import { useState, useEffect } from 'react';
import { Clock, Search, Trash2, RefreshCw, MapPin, Home } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import {
  getSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
  type SearchHistoryItem,
} from '@/services/userDashboardService';

export function SearchHistorySection() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getSearchHistory(50);
      if (fetchError) throw fetchError;
      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await deleteSearchHistoryItem(id);
      if (error) throw error;
      
      setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Effacer tout l\'historique de recherche ?')) return;

    try {
      const { error } = await clearSearchHistory();
      if (error) throw error;
      
      setHistory([]);
      alert('Historique effacé avec succès');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'effacement');
    }
  };

  const handleRepeatSearch = (item: SearchHistoryItem) => {
    const params = new URLSearchParams();
    
    if (item.city) params.set('city', item.city);
    if (item.property_type) params.set('property_type', item.property_type);
    if (item.min_price) params.set('min_price', item.min_price.toString());
    if (item.max_price) params.set('max_price', item.max_price.toString());
    if (item.bedrooms) params.set('bedrooms', item.bedrooms.toString());
    
    window.location.href = `/recherche?${params.toString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatSearchCriteria = (item: SearchHistoryItem) => {
    const criteria: string[] = [];
    
    if (item.city) criteria.push(item.city);
    if (item.property_type) criteria.push(item.property_type);
    if (item.bedrooms) criteria.push(`${item.bedrooms} chambres`);
    if (item.min_price || item.max_price) {
      const priceRange = [];
      if (item.min_price) priceRange.push(`${(item.min_price / 1000).toFixed(0)}k`);
      if (item.max_price) priceRange.push(`${(item.max_price / 1000).toFixed(0)}k`);
      criteria.push(priceRange.join(' - ') + ' FCFA');
    }
    
    return criteria.length > 0 ? criteria.join(' • ') : 'Recherche sans filtre';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-neutral-500">Chargement de l'historique...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadHistory}>Réessayer</Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow-md text-center">
        <Clock className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-h4 font-semibold text-neutral-900 mb-2">
          Aucun historique de recherche
        </h3>
        <p className="text-neutral-500 mb-6">
          Vos recherches de propriétés apparaîtront ici
        </p>
        <Button onClick={() => (window.location.href = '/recherche')}>
          Commencer une recherche
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-h4 font-semibold text-neutral-900">
          Historique de recherche ({history.length})
        </h3>
        
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Tout effacer
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md divide-y divide-neutral-100">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="h-5 w-5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {formatSearchCriteria(item)}
                    </p>
                    <div className="flex items-center gap-3 text-small text-neutral-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </span>
                      <span>
                        {item.results_count} {item.results_count > 1 ? 'résultats' : 'résultat'}
                      </span>
                    </div>
                  </div>
                </div>

                {item.search_query && (
                  <p className="text-small text-neutral-600 mt-2 ml-8">
                    Requête: "{item.search_query}"
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRepeatSearch(item)}
                  title="Relancer cette recherche"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
