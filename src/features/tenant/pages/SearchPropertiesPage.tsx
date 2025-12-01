import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Home as HomeIcon, X, AlertCircle, Filter, Map as MapIcon, List } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import Breadcrumb from '@/shared/components/navigation/Breadcrumb';
import MapboxMap from '@/shared/ui/MapboxMap';
import { CITY_NAMES, ABIDJAN_NEIGHBORHOODS } from '@/shared/data/cities';
import { usePerformanceMonitoring, trackSearchEvent, trackError } from '@/hooks/usePerformanceMonitoring';

type Property = Database['public']['Tables']['properties']['Row'];

export default function SearchPropertiesPage() {
  usePerformanceMonitoring('SearchPropertiesPage');

  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for new design
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [activeFilterTab, setActiveFilterTab] = useState<'location' | 'property' | 'price'>('location');

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
    <div className="min-h-screen bg-background-page">
      {/* Page Header Simple */}
      <header className="bg-background-page border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: 'Recherche' }]} />
            
            {/* Page Title */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-h2 font-bold text-neutral-900 leading-heading tracking-tight">
                  Rechercher un bien
                </h1>
                <p className="text-body text-neutral-500 mt-2 leading-relaxed">
                  Trouvez votre prochain logement idéal parmi nos propriétés disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres Horizontaux avec Tabs */}
      <section className="bg-background-page border-b border-neutral-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-neutral-50 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveFilterTab('location')}
                className={`flex-1 min-w-fit px-4 py-2 text-sm font-semibold rounded-md transition-base ease-out ${
                  activeFilterTab === 'location'
                    ? 'bg-background-page text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <MapPin className="h-4 w-4 inline mr-2" />
                Localisation
              </button>
              <button
                type="button"
                onClick={() => setActiveFilterTab('property')}
                className={`flex-1 min-w-fit px-4 py-2 text-sm font-semibold rounded-md transition-base ease-out ${
                  activeFilterTab === 'property'
                    ? 'bg-background-page text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <HomeIcon className="h-4 w-4 inline mr-2" />
                Type de bien
              </button>
              <button
                type="button"
                onClick={() => setActiveFilterTab('price')}
                className={`flex-1 min-w-fit px-4 py-2 text-sm font-semibold rounded-md transition-base ease-out ${
                  activeFilterTab === 'price'
                    ? 'bg-background-page text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Filter className="h-4 w-4 inline mr-2" />
                Prix
              </button>
            </div>

            {/* Filter Content */}
            <div className="space-y-4">
              {activeFilterTab === 'location' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Ville
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-background-page rounded-lg border border-neutral-100 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-base">
                      <MapPin className="h-5 w-5 text-neutral-400" />
                      <select
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (e.target.value !== 'Abidjan') {
                            setNeighborhood('');
                          }
                        }}
                        className="flex-1 outline-none bg-transparent text-neutral-900 cursor-pointer"
                      >
                        <option value="">Toutes les villes</option>
                        {CITY_NAMES.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {city === 'Abidjan' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-neutral-700">
                        Quartier
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-background-page rounded-lg border border-neutral-100 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-base">
                        <MapPin className="h-5 w-5 text-neutral-400" />
                        <select
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="flex-1 outline-none bg-transparent text-neutral-900 cursor-pointer"
                        >
                          <option value="">Tous les quartiers</option>
                          {ABIDJAN_NEIGHBORHOODS.map((hood) => (
                            <option key={hood} value={hood}>
                              {hood}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeFilterTab === 'property' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Type de propriété
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-background-page rounded-lg border border-neutral-100 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-base">
                      <HomeIcon className="h-5 w-5 text-neutral-400" />
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="flex-1 outline-none bg-transparent text-neutral-900 cursor-pointer"
                      >
                        <option value="">Tous les types</option>
                        <option value="appartement">Appartement</option>
                        <option value="maison">Maison</option>
                        <option value="villa">Villa</option>
                        <option value="studio">Studio</option>
                        <option value="duplex">Duplex</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Nombre de chambres
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-background-page rounded-lg border border-neutral-100 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-base">
                      <HomeIcon className="h-5 w-5 text-neutral-400" />
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="flex-1 outline-none bg-transparent text-neutral-900 cursor-pointer"
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

              {activeFilterTab === 'price' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Prix minimum (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 50000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="input w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Prix maximum (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 200000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={clearFilters}
                className="text-neutral-600 hover:text-neutral-900 font-medium transition-base"
              >
                Réinitialiser les filtres
              </button>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Rechercher
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Résultats */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-semantic-error bg-opacity-10 border border-semantic-error rounded-lg flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-semantic-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">Erreur</h3>
              <p className="text-neutral-700 text-body">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-neutral-400 hover:text-neutral-600 transition-base"
              aria-label="Fermer le message d'erreur"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Results Header avec Toggle View */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-h3 font-bold text-neutral-900 leading-heading">
              {loading ? 'Recherche en cours...' : 
                `${properties.length} propriété${properties.length > 1 ? 's' : ''} trouvée${properties.length > 1 ? 's' : ''}`
              }
            </h2>
            {!loading && properties.length > 0 && (
              <p className="text-body text-neutral-500 mt-1">
                {city || neighborhood || propertyType ? 'Résultats filtrés' : 'Toutes nos propriétés disponibles'}
              </p>
            )}
          </div>

          {/* Toggle View Buttons */}
          <div className="hidden sm:flex bg-neutral-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-base ${
                activeView === 'list'
                  ? 'bg-background-page text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              aria-pressed={activeView === 'list'}
            >
              <List className="h-4 w-4" />
              Liste
            </button>
            <button
              type="button"
              onClick={() => setActiveView('map')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-base ${
                activeView === 'map'
                  ? 'bg-background-page text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              aria-pressed={activeView === 'map'}
            >
              <MapIcon className="h-4 w-4" />
              Carte
            </button>
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === 'list' ? (
          /* Liste des propriétés */
          <div>
            {loading ? (
              /* Loading skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-64 bg-neutral-200 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-4 bg-neutral-200 rounded w-full"></div>
                      <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              /* Empty state */
              <div className="text-center py-24">
                <div className="bg-neutral-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <HomeIcon className="h-12 w-12 text-neutral-400" />
                </div>
                <h3 className="text-h4 font-bold text-neutral-900 mb-3">Aucune propriété trouvée</h3>
                <p className="text-body text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Essayez de modifier vos critères de recherche ou explorez d'autres zones.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              /* Properties Grid - 3 cols → 2 → 1 mobile */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <a
                    key={property.id}
                    href={`/proprietes/${property.id}`}
                    className="group card hover:shadow-xl transition-base ease-out transform hover:-translate-y-1"
                    aria-label={`Voir les détails de ${property.title || 'cette propriété'}`}
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden rounded-lg mb-6">
                      <img
                        src={property.images?.[0] || '/images/placeholder-property.jpg'}
                        alt={property.title || 'Propriété'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-slow"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder-property.jpg';
                        }}
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-primary-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                          DISPONIBLE
                        </span>
                      </div>

                      {/* Price Badge */}
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-background-page bg-opacity-95 backdrop-blur-sm px-3 py-2 rounded-lg">
                          <span className="text-h5 font-bold text-neutral-900">
                            {property.monthly_rent?.toLocaleString() || 'N/A'}
                          </span>
                          <span className="text-small text-neutral-600 ml-1">FCFA/mois</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      {/* Title */}
                      <h3 className="text-h5 font-bold text-neutral-900 leading-heading group-hover:text-primary-500 transition-base line-clamp-2">
                        {property.title || 'Propriété sans titre'}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-neutral-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="text-body">
                          {property.city || 'Non spécifié'}
                          {property.neighborhood && ` • ${property.neighborhood}`}
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-4 text-small text-neutral-600 pt-3 border-t border-neutral-100">
                        {property.bedrooms && (
                          <span className="flex items-center gap-1">
                            <span className="text-lg">🛏️</span>
                            <span>{property.bedrooms} ch</span>
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-1">
                            <span className="text-lg">🚿</span>
                            <span>{property.bathrooms} sdb</span>
                          </span>
                        )}
                        {property.surface_area && (
                          <span className="flex items-center gap-1">
                            <span className="text-lg">📐</span>
                            <span>{property.surface_area}m²</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Vue Carte Mapbox pleine largeur */
          <div className="space-y-6">
            {/* Properties count on map */}
            {!loading && properties.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-body text-neutral-600">
                  {properties.length} propriété{properties.length > 1 ? 's' : ''} affichée{properties.length > 1 ? 's' : ''} sur la carte
                </p>
                <div className="flex items-center gap-2 text-small text-neutral-500">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Disponible</span>
                </div>
              </div>
            )}

            {/* Mapbox Map - Pleine largeur */}
            <div className="h-[600px] rounded-xl overflow-hidden shadow-lg border border-neutral-100">
              <MapboxMap
                properties={properties}
                height="100%"
                fitBounds={properties.length > 0}
                clustering={properties.length > 10}
                onMarkerClick={(property) => {
                  // Navigate to property details
                  window.location.href = `/proprietes/${property.id}`;
                }}
                onBoundsChange={(bounds) => {
                  // Could implement bounds-based filtering here
                  console.log('Map bounds changed:', bounds);
                }}
              />
            </div>

            {/* Quick property list below map (mobile-friendly) */}
            {!loading && properties.length > 0 && (
              <div className="lg:hidden">
                <h3 className="text-h5 font-bold text-neutral-900 mb-4">Propriétés à proximité</h3>
                <div className="grid grid-cols-1 gap-4">
                  {properties.slice(0, 3).map((property) => (
                    <a
                      key={property.id}
                      href={`/proprietes/${property.id}`}
                      className="card flex gap-4 p-4 hover:shadow-md transition-base"
                    >
                      <img
                        src={property.images?.[0] || '/images/placeholder-property.jpg'}
                        alt={property.title || 'Propriété'}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900 text-sm mb-1 line-clamp-1">
                          {property.title || 'Propriété'}
                        </h4>
                        <p className="text-xs text-neutral-600 mb-2">
                          {property.city} {property.neighborhood && `• ${property.neighborhood}`}
                        </p>
                        <p className="text-sm font-bold text-neutral-900">
                          {property.monthly_rent?.toLocaleString()} FCFA/mois
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
                {properties.length > 3 && (
                  <button
                    onClick={() => setActiveView('list')}
                    className="w-full mt-4 py-3 text-primary-500 font-semibold border border-primary-500 rounded-lg hover:bg-primary-50 transition-base"
                  >
                    Voir toutes les propriétés ({properties.length})
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
