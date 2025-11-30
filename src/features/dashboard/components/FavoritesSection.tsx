/**
 * Section Favoris
 * Affiche et gère les propriétés favorites de l'utilisateur
 */

import { useState, useEffect } from 'react';
import { Heart, Trash2, Eye, MapPin, Bed, Bath, Square } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import {
  getFavorites,
  removeFromFavorites,
  type FavoriteProperty,
} from '@/services/userDashboardService';

export function FavoritesSection() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getFavorites();
      if (fetchError) throw fetchError;
      setFavorites(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    if (!confirm('Retirer cette propriété de vos favoris ?')) return;

    try {
      const { error } = await removeFromFavorites(propertyId);
      if (error) throw error;
      
      setFavorites(favorites.filter((f) => f.property_id !== propertyId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-neutral-500">Chargement de vos favoris...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadFavorites}>Réessayer</Button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow-md text-center">
        <Heart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-h4 font-semibold text-neutral-900 mb-2">
          Aucun favori pour le moment
        </h3>
        <p className="text-neutral-500 mb-6">
          Ajoutez des propriétés à vos favoris pour les retrouver facilement
        </p>
        <Button onClick={() => (window.location.href = '/recherche')}>
          Rechercher des propriétés
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-h4 font-semibold text-neutral-900">
          Mes Favoris ({favorites.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => {
          const property = favorite.property;
          if (!property) return null;

          return (
            <div
              key={favorite.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-neutral-200">
                {property.main_image ? (
                  <img
                    src={property.main_image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Square className="h-12 w-12 text-neutral-400" />
                  </div>
                )}
                
                <button
                  onClick={() => handleRemoveFavorite(property.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  title="Retirer des favoris"
                >
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
                  {property.title}
                </h4>
                
                <div className="flex items-center text-small text-neutral-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.neighborhood || property.city}
                </div>

                <div className="flex items-center gap-4 text-small text-neutral-600 mb-3">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms}
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                  {property.surface_area && (
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.surface_area}m²
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-h5 font-bold text-primary-500">
                    {formatPrice(property.monthly_rent)}
                    <span className="text-small text-neutral-500 font-normal">/mois</span>
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/propriete/${property.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                </div>

                {favorite.notes && (
                  <div className="mt-3 p-2 bg-neutral-50 rounded text-xs text-neutral-600">
                    <strong>Note:</strong> {favorite.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
