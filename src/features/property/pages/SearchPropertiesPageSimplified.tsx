<<<<<<< HEAD
import React, { useState } from 'react';
import { Search, Filter, MapPin, Bed, Bath, Ruler } from 'lucide-react';

const SearchPropertiesPageSimplified: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    city: ''
  });

  const handleSearch = () => {
    // Logique de recherche
    console.log('Recherche:', { searchQuery, filters });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Rechercher des Propriétés</h1>
        <p className="text-gray-600">Trouvez la propriété de vos rêves</p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par ville, quartier ou type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">Filtres</h2>
        </div>
        
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
              <option value="villa">Villa</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="abidjan">Abidjan</option>
              <option value="yamoussoukro">Yamoussoukro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chambres</label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix min</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix max</label>
            <input
              type="number"
              placeholder="Illimité"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
=======
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import SearchFilters from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import VoiceSearch, { parseVoiceQuery } from '../components/VoiceSearch';
import { toast } from '@/shared/hooks/useToast';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { Mic, RefreshCw } from 'lucide-react';
import { useInfiniteProperties } from '../hooks/useInfiniteProperties';
import InfiniteScroll from '@/shared/components/InfiniteScroll';
import { cacheService } from '@/shared/services/cacheService';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyType = Database['public']['Tables']['properties']['Row']['property_type'];
type PropertyCategory = 'residentiel' | 'commercial';

export default function SearchPropertiesPageSimplified() {
  const navigate = useNavigate();
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);

  // Utilisation de useLocalStorage pour persister les filtres
  const [searchCity, setSearchCity] = useLocalStorage('search_city', '');
  const [propertyType, setPropertyType] = useLocalStorage<PropertyType | ''>('property_type', '');
  const [propertyCategory, setPropertyCategory] = useLocalStorage<PropertyCategory | ''>('property_category', '');
  const [minPrice, setMinPrice] = useLocalStorage('min_price', '');
  const [maxPrice, setMaxPrice] = useLocalStorage('max_price', '');
  const [bedrooms, setBedrooms] = useLocalStorage('bedrooms', '');
  const [bathrooms, setBathrooms] = useLocalStorage('bathrooms', '');
  const [isFurnished, setIsFurnished] = useLocalStorage<boolean | null>('is_furnished', null);
  const [hasParking, setHasParking] = useLocalStorage<boolean | null>('has_parking', null);
  const [hasAC, setHasAC] = useLocalStorage<boolean | null>('has_ac', null);

  // Utiliser le hook d'infinite scroll avec cache
  const {
    properties,
    loading,
    hasMore,
    loadMore,
    refresh,
    total,
    currentPage,
    totalPages,
    isLoadingMore
  } = useInfiniteProperties({
    pageSize: 20,
    filters: {
      city: searchCity,
      propertyType: propertyType as string,
      propertyCategory: propertyCategory as string,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      isFurnished: isFurnished,
      hasParking: hasParking,
      hasAC: hasAC
    },
    cacheTTL: 10,
    enableCache: true
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const category = params.get('category');
    const type = params.get('type');

    if (city) setSearchCity(city);
    if (category) setPropertyCategory(category as PropertyCategory);
    if (type) setPropertyType(type as PropertyType);
  }, []);

  const handleRefresh = async () => {
    await refresh();
    toast.success('Liste rafraîchie', {
      description: `${total || 0} propriétés trouvées`
    });
  };

  const handleReset = async () => {
    setSearchCity('');
    setPropertyType('');
    setPropertyCategory('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setIsFurnished(null);
    setHasParking(null);
    setHasAC(null);

    // Invalider le cache
    cacheService.invalidatePattern('properties_page_');

    await refresh();
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/propriete/${propertyId}`);
  };

  const handleVoiceTranscript = (transcript: string) => {
    const parsed = parseVoiceQuery(transcript);

    if (parsed.city) setSearchCity(parsed.city);
    if (parsed.propertyType) setPropertyType(parsed.propertyType as PropertyType);
    if (parsed.bedrooms) setBedrooms(parsed.bedrooms.toString());
    if (parsed.maxPrice) setMaxPrice(parsed.maxPrice.toString());

    setShowVoiceSearch(false);

    setTimeout(() => {
      refresh();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Rechercher un bien
              </h1>
              <p className="text-gray-600">
                Trouvez le logement idéal parmi nos {total || properties.length} biens disponibles
              </p>
            </div>
            <button
              onClick={() => setShowVoiceSearch(true)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Mic className="w-5 h-5" />
              <span className="hidden sm:inline">Recherche vocale</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SearchFilters
                searchCity={searchCity}
                setSearchCity={setSearchCity}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                propertyCategory={propertyCategory}
                setPropertyCategory={setPropertyCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                bathrooms={bathrooms}
                setBathrooms={setBathrooms}
                isFurnished={isFurnished}
                setIsFurnished={setIsFurnished}
                hasParking={hasParking}
                setHasParking={setHasParking}
                hasAC={hasAC}
                setHasAC={setHasAC}
                onSearch={refresh}
                onReset={handleReset}
              />

              {/* Stats et actions */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div>
                  {total !== null && (
                    <span>
                      {total.toLocaleString()} propriété{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
                      {totalPages > 0 && ` • Page ${currentPage + 1}/${totalPages}`}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Rafraîchir
                </button>
              </div>
            </div>
          </div>

          {/* Résultats avec Infinite Scroll */}
          <div className="lg:col-span-3">
            <InfiniteScroll
              onLoadMore={loadMore}
              hasMore={hasMore}
              loading={isLoadingMore}
              endMessage={
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {properties.length === 0
                      ? 'Aucune propriété trouvée'
                      : `${properties.length} propriété${properties.length > 1 ? 's' : ''} affichée${properties.length > 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              }
            >
              <SearchResults
                properties={properties}
                loading={loading}
                onPropertyClick={handlePropertyClick}
              />
            </InfiniteScroll>
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Résultats */}
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Search className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Aucun résultat trouvé
        </h3>
        <p className="text-gray-500">
          Modifiez vos critères de recherche pour trouver des propriétés
        </p>
      </div>
    </div>
  );
};

export default SearchPropertiesPageSimplified;
=======
      {/* Voice Search Modal */}
      {showVoiceSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <VoiceSearch onTranscript={handleVoiceTranscript} />
            <button
              onClick={() => setShowVoiceSearch(false)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
