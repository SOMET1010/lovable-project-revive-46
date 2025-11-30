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
              className="flex items-center gap-2 px-6 py-3 bg-[var(--terracotta-500)] text-white rounded-full hover:bg-[var(--terracotta-600)] transition-all shadow-lg hover:shadow-xl"
            >
              <Mic className="w-5 h-5" />
              <span className="hidden sm:inline">Recherche vocale</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  className="flex items-center gap-2 px-3 py-1.5 text-[var(--terracotta-600)] hover:text-[var(--terracotta-700)] hover:bg-[var(--terracotta-50)] rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Rafraîchir
                </button>
              </div>
            </div>
          </div>

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
          </div>
        </div>
      </div>

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
