import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Home as HomeIcon, SlidersHorizontal, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import Breadcrumb from '@/shared/components/navigation/Breadcrumb';
import { CITY_NAMES, ABIDJAN_NEIGHBORHOODS } from '@/shared/data/cities';
import { usePerformanceMonitoring, trackSearchEvent, trackError } from '@/hooks/usePerformanceMonitoring';

type Property = Database['public']['Tables']['properties']['Row'];

export default function SearchPropertiesPage() {
  usePerformanceMonitoring('SearchPropertiesPage');

  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search filters
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProperties();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const searchProperties = useCallback(async () => {
    const startTime = performance.now();
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible');

      if (city && city.trim()) {
        query = query.ilike('city', `%${city.trim()}%`);
      }

      if (propertyType && propertyType.trim()) {
        query = query.eq('property_type', propertyType.trim());
      }

      if (minPrice && minPrice.trim()) {
        const minPriceNum = parseInt(minPrice, 10);
        if (!isNaN(minPriceNum) && minPriceNum >= 0) {
          query = query.gte('monthly_rent', minPriceNum);
        }
      }

      if (maxPrice && maxPrice.trim()) {
        const maxPriceNum = parseInt(maxPrice, 10);
        if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
          query = query.lte('monthly_rent', maxPriceNum);
        }
      }

      if (bedrooms && bedrooms.trim()) {
        const bedroomsNum = parseInt(bedrooms, 10);
        if (!isNaN(bedroomsNum) && bedroomsNum > 0) {
          query = query.eq('bedrooms', bedroomsNum);
        }
      }

      const { data, error: queryError } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (queryError) {
        throw new Error(queryError.message || 'Erreur lors de la recherche');
      }

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      setProperties(data || []);

      trackSearchEvent({
        city: city || undefined,
        propertyType: propertyType || undefined,
        resultsCount: data?.length || 0,
        loadTime,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Error searching properties:', err);
      setError(errorMessage);
      setProperties([]);

      if (err instanceof Error) {
        trackError(err, {
          context: 'searchProperties',
          city,
          propertyType,
          minPrice,
          maxPrice,
          bedrooms,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [city, propertyType, minPrice, maxPrice, bedrooms]);

  const validateFilters = (): string | null => {
    if (minPrice && maxPrice) {
      const min = parseInt(minPrice, 10);
      const max = parseInt(maxPrice, 10);
      if (!isNaN(min) && !isNaN(max) && min > max) {
        return 'Le prix minimum ne peut pas être supérieur au prix maximum';
      }
    }
    return null;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateFilters();
    if (validationError) {
      setError(validationError);
      return;
    }

    const params = new URLSearchParams();
    if (city && city.trim()) params.set('city', city.trim());
    if (propertyType && propertyType.trim()) params.set('type', propertyType.trim());
    if (minPrice && minPrice.trim()) params.set('minPrice', minPrice.trim());
    if (maxPrice && maxPrice.trim()) params.set('maxPrice', maxPrice.trim());
    if (bedrooms && bedrooms.trim()) params.set('bedrooms', bedrooms.trim());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setCity('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Recherche' }]} />
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Ville */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <MapPin className="h-5 w-5 text-gray-400" />
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (e.target.value !== 'Abidjan') {
                      setNeighborhood('');
                    }
                  }}
                  className="flex-1 outline-none bg-transparent text-gray-900 cursor-pointer"
                >
                  <option value="">Toutes les villes</option>
                  {CITY_NAMES.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quartier (seulement si Abidjan) */}
              {city === 'Abidjan' && (
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="flex-1 outline-none bg-transparent text-gray-900 cursor-pointer"
                  >
                    <option value="">Tous les quartiers</option>
                    {ABIDJAN_NEIGHBORHOODS.map((hood) => (
                      <option key={hood} value={hood}>
                        {hood}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <HomeIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-gray-900 cursor-pointer"
                >
                  <option value="">Tous les types</option>
                  <option value="appartement">Appartement</option>
                  <option value="maison">Maison</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="duplex">Duplex</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 md:w-auto"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filtres</span>
              </button>

              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                <span>Rechercher</span>
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4 animate-slide-down">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Filtres avancés</h3>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix minimum (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 50000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix maximum (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 200000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de chambres
                    </label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none cursor-pointer"
                    >
                      <option value="">Indifférent</option>
                      <option value="1">1 chambre</option>
                      <option value="2">2 chambres</option>
                      <option value="3">3 chambres</option>
                      <option value="4">4+ chambres</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Erreur</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? 'Recherche en cours...' : `${properties.length} propriété${properties.length > 1 ? 's' : ''} trouvée${properties.length > 1 ? 's' : ''}`}
          </h1>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <HomeIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune propriété trouvée</h2>
            <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <a
                key={property.id}
                href={`/proprietes/${property.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.images?.[0] || '/images/placeholder-property.jpg'}
                    alt={property.title || 'Propriété'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-property.jpg';
                    }}
                  />
                  {/* Badge Nouveau */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                    NOUVEAU
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {property.monthly_rent?.toLocaleString() || 'N/A'}
                    </span>
                    <span className="text-gray-500">FCFA/mois</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                    {property.title || 'Sans titre'}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{property.city || 'Non spécifié'}, {property.neighborhood || ''}</span>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        🛏️ {property.bedrooms} ch
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-1">
                        🚿 {property.bathrooms} sdb
                      </span>
                    )}
                    {property.surface_area && (
                      <span className="flex items-center gap-1">
                        📐 {property.surface_area}m²
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
