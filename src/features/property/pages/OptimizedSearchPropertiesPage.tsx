import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Bed, Bath, Ruler, Loader2, CheckCircle } from 'lucide-react';
import { 
  useDebouncedProperties, 
  useDebouncedPropertyFilters 
} from '../../../hooks/useProperties';
import { DEBOUNCE_DELAYS } from '../../../hooks/useDebounce';

/**
 * Composant de recherche de propriétés avec debouncing optimisé
 * Démonstration de l'implémentation du système de debouncing pour MonToit
 */
const OptimizedSearchPropertiesPage: React.FC = () => {
  // État local pour les contrôles utilisateur
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Hook pour les filtres avec debouncing automatique (500ms)
  const {
    debouncedFilters,
    updateFilters,
    hasChanges,
    resetFilters
  } = useDebouncedPropertyFilters(
    {
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      city: '',
    },
    (filters) => {
      // Callback appelé après debouncing - ici on pourrait mettre à jour l'URL
      console.log('Filtres appliqués:', filters);
      
      // Optionnel : synchroniser avec l'URL pour les favoris de recherche
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });
      if (searchQuery) params.set('q', searchQuery);
      
      // window.history.replaceState({}, '', `/recherche?${params.toString()}`);
    },
    {
      // Options React Query pour ce hook si nécessaire
    }
  );

  // Query de propriétés avec debouncing automatique (300ms pour searchQuery)
  const {
    data: propertiesResponse,
    isLoading,
    error,
    refetch,
    isFetching
  } = useDebouncedProperties(
    debouncedFilters,
    searchQuery,
    {
      // Options React Query
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Indicateur de recherche en cours
  const isSearching = isFetching || isLoading;
  const hasResults = propertiesResponse?.data && propertiesResponse.data.length > 0;
  const resultsCount = propertiesResponse?.data?.length || 0;

  // Gestionnaires d'événements optimisés
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset pagination lors de nouvelle recherche
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({ [key]: value });
    setCurrentPage(1); // Reset pagination lors de changement de filtre
  };

  const handleResetFilters = () => {
    resetFilters();
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Affichage conditionnel des états de chargement
  const renderSearchStatus = () => {
    if (isSearching) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600 mr-2" />
          <span className="text-gray-600">
            {isFetching ? 'Recherche en cours...' : 'Chargement...'}
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Erreur lors de la recherche</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      );
    }

    if (!hasResults && (searchQuery || Object.keys(debouncedFilters).length > 0)) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-2">Aucun résultat trouvé</div>
          <p className="text-sm text-gray-500">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      );
    }

    return null;
  };

  // Statut des filtres avec debouncing
  const renderFilterStatus = () => {
    if (hasChanges) {
      return (
        <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          <Filter className="h-4 w-4 mr-2" />
          <span>Filtres en attente d'application...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
        <CheckCircle className="h-4 w-4 mr-2" />
        <span>Filtres appliqués</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Recherche Optimisée de Propriétés</h1>
        <p className="text-gray-600">
          Recherche intelligente avec debouncing automatique
        </p>
      </div>

      {/* Barre de recherche avec debouncing */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col gap-4">
          {/* Input de recherche avec debouncing */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par ville, quartier ou type... (débouncé 300ms)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {/* Indicateur de debouncing */}
            {searchQuery !== '' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <Loader2 className="animate-spin h-4 w-4 text-blue-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            )}
          </div>

          {/* Contrôles des filtres */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Filtres avancés</span>
              {Object.keys(debouncedFilters).some(key => debouncedFilters[key]) && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {Object.keys(debouncedFilters).filter(key => debouncedFilters[key]).length}
                </span>
              )}
            </button>

            {hasChanges && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Status des filtres */}
          {renderFilterStatus()}
        </div>
      </div>

      {/* Filtres avancés (développables) */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtres avancés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ville (débouncé 500ms)
              </label>
              <select
                value={debouncedFilters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les villes</option>
                <option value="Abidjan">Abidjan</option>
                <option value="Yamoussoukro">Yamoussoukro</option>
                <option value="Bouaké">Bouaké</option>
              </select>
            </div>

            {/* Type de propriété */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="inline h-4 w-4 mr-1" />
                Type de propriété
              </label>
              <select
                value={debouncedFilters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            {/* Prix minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix minimum (FCFA)
              </label>
              <input
                type="number"
                value={debouncedFilters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Ex: 50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Prix maximum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix maximum (FCFA)
              </label>
              <input
                type="number"
                value={debouncedFilters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Ex: 500000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Nombre de chambres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bed className="inline h-4 w-4 mr-1" />
                Chambres minimum
              </label>
              <select
                value={debouncedFilters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Indifférent</option>
                <option value="1">1 chambre</option>
                <option value="2">2 chambres</option>
                <option value="3">3 chambres</option>
                <option value="4">4+ chambres</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques de recherche */}
      {hasResults && (
        <div className="mb-6">
          <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg">
            <span className="text-blue-800">
              {resultsCount} propriété{resultsCount > 1 ? 's' : ''} trouvée{resultsCount > 1 ? 's' : ''}
            </span>
            {isSearching && (
              <span className="text-blue-600 text-sm">
                <Loader2 className="inline animate-spin h-4 w-4 mr-1" />
                Mise à jour...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Résultats de recherche avec debouncing */}
      <div className="space-y-4">
        {renderSearchStatus()}

        {/* Liste des propriétés */}
        {hasResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesResponse!.data!.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Pagination si nécessaire */}
        {hasResults && resultsCount >= 20 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Charger plus de résultats
            </button>
          </div>
        )}
      </div>

      {/* Footer avec informations de débogage (à retirer en production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
          <h4 className="font-semibold mb-2">🔧 Debug Info (Dev Only)</h4>
          <div>Recherche: "{searchQuery}"</div>
          <div>Filtres: {JSON.stringify(debouncedFilters)}</div>
          <div>Recherche débouncée: {searchQuery !== '' ? 'Actif' : 'Inactif'}</div>
          <div>Changements de filtres: {hasChanges ? 'En attente' : 'Appliqués'}</div>
          <div>Chargement: {isLoading ? 'Oui' : 'Non'}</div>
        </div>
      )}
    </div>
  );
};

/**
 * Composant pour afficher une carte de propriété
 */
interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    city: string;
    property_type: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    surface?: number;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
        
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{property.city}</span>
          </div>
          
          <div className="flex items-center">
            <Ruler className="h-4 w-4 mr-2" />
            <span>{property.property_type}</span>
          </div>
          
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-2" />
              <span>{property.bedrooms} chambre{property.bedrooms > 1 ? 's' : ''}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-2" />
              <span>{property.bathrooms} salle{property.bathrooms > 1 ? 's' : ''} de bain</span>
            </div>
          )}
          
          {property.surface && (
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-2" />
              <span>{property.surface} m²</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">
            {property.price.toLocaleString('fr-FR')} FCFA
          </span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizedSearchPropertiesPage;