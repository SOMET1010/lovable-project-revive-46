import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Home as HomeIcon, 
  X, 
  AlertCircle, 
  Filter, 
  Map as MapIcon, 
  List,
  Bed,
  Bath,
  Maximize,
  Heart,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import Breadcrumb from '@/shared/components/navigation/Breadcrumb';
import MapboxMap from '@/shared/ui/MapboxMap';
import { CITY_NAMES, ABIDJAN_NEIGHBORHOODS } from '@/shared/data/cities';
import { ScoreBadge } from '@/shared/ui/ScoreBadge';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyWithScore = Property & {
  owner_trust_score?: number | null;
  owner_full_name?: string | null;
};

export default function SearchPropertiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyWithScore[]>([]);
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
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          profiles:owner_id (
            trust_score,
            full_name
          )
        `)
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

      const mappedData = (data || []).map((p: any) => ({
        ...p,
        owner_trust_score: p.profiles?.trust_score ?? null,
        owner_full_name: p.profiles?.full_name ?? null,
        profiles: undefined,
      }));

      setProperties(mappedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Error searching properties:', err);
      setError(errorMessage);
      setProperties([]);
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
    setNeighborhood('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setSearchParams(new URLSearchParams());
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Prix sur demande';
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const activeFiltersCount = [city, propertyType, minPrice, maxPrice, bedrooms].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Header Premium */}
      <header className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-2xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb 
              items={[{ label: 'Recherche' }]} 
              className="text-white/60"
            />
          </div>
          
          {/* Hero Content */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-500/20 rounded-xl">
                  <Sparkles className="h-5 w-5 text-primary-400" />
                </div>
                <span className="text-primary-400 font-medium text-sm uppercase tracking-wide">
                  Trouvez votre chez-vous
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                Rechercher un bien
              </h1>
              <p className="text-lg text-white/70 max-w-xl">
                Explorez notre sélection de propriétés premium en Côte d'Ivoire
              </p>
            </div>

            {/* Results Counter Badge */}
            {!loading && (
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3">
                  <span className="text-3xl font-bold text-white">{properties.length}</span>
                  <span className="text-white/70 ml-2">
                    bien{properties.length > 1 ? 's' : ''} disponible{properties.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Filtres Section Premium */}
      <section className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Filter Tabs Premium */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-100 rounded-xl">
              {[
                { id: 'location', label: 'Localisation', icon: MapPin },
                { id: 'property', label: 'Type de bien', icon: HomeIcon },
                { id: 'price', label: 'Budget', icon: Filter },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilterTab(tab.id as typeof activeFilterTab)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeFilterTab === tab.id
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Filter Content */}
            <div className="min-h-[80px]">
              {activeFilterTab === 'location' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Ville
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <select
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (e.target.value !== 'Abidjan') {
                            setNeighborhood('');
                          }
                        }}
                        className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                      >
                        <option value="">Toutes les villes</option>
                        {CITY_NAMES.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {city === 'Abidjan' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-neutral-700">
                        Quartier
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <select
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                        >
                          <option value="">Tous les quartiers</option>
                          {ABIDJAN_NEIGHBORHOODS.map((hood) => (
                            <option key={hood} value={hood}>
                              {hood}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeFilterTab === 'property' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Type de propriété
                    </label>
                    <div className="relative">
                      <HomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                      >
                        <option value="">Tous les types</option>
                        <option value="appartement">Appartement</option>
                        <option value="maison">Maison</option>
                        <option value="villa">Villa</option>
                        <option value="studio">Studio</option>
                        <option value="duplex">Duplex</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Nombre de chambres
                    </label>
                    <div className="relative">
                      <Bed className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                      >
                        <option value="">Indifférent</option>
                        <option value="1">1 chambre</option>
                        <option value="2">2 chambres</option>
                        <option value="3">3 chambres</option>
                        <option value="4">4+ chambres</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {activeFilterTab === 'price' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Budget minimum
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">₣</span>
                      <input
                        type="number"
                        placeholder="Ex: 50 000"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full pl-10 pr-16 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">FCFA</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      Budget maximum
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">₣</span>
                      <input
                        type="number"
                        placeholder="Ex: 500 000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-10 pr-16 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">FCFA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser ({activeFiltersCount})
                  </button>
                )}
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                {/* Toggle View Buttons */}
                <div className="hidden sm:flex bg-neutral-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('list')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      activeView === 'list'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    Liste
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('map')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      activeView === 'map'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <MapIcon className="h-4 w-4" />
                    Carte
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-200"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">Erreur</h3>
              <p className="text-neutral-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content based on active view */}
        {activeView === 'list' ? (
          <div>
            {loading ? (
              /* Loading skeleton Premium */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
                    <div className="h-56 bg-gradient-to-br from-neutral-200 to-neutral-100 animate-pulse" />
                    <div className="p-5 space-y-4">
                      <div className="h-5 bg-neutral-200 rounded-lg w-3/4 animate-pulse" />
                      <div className="h-4 bg-neutral-100 rounded-lg w-full animate-pulse" />
                      <div className="flex gap-3">
                        <div className="h-4 bg-neutral-100 rounded-lg w-16 animate-pulse" />
                        <div className="h-4 bg-neutral-100 rounded-lg w-16 animate-pulse" />
                        <div className="h-4 bg-neutral-100 rounded-lg w-16 animate-pulse" />
                      </div>
                      <div className="h-6 bg-neutral-200 rounded-lg w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              /* Empty state Premium */
              <div className="text-center py-16 md:py-24">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-full w-28 h-28 flex items-center justify-center border border-neutral-200">
                    <HomeIcon className="h-12 w-12 text-neutral-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Aucune propriété trouvée
                </h3>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                  Essayez de modifier vos critères de recherche ou explorez d'autres zones pour découvrir plus de biens.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary-500/25 transition-all"
                >
                  <X className="h-5 w-5" />
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              /* Properties Grid Premium */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <article
                    key={property.id}
                    onClick={() => navigate(`/proprietes/${property.id}`)}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-xl hover:border-neutral-200 transition-all duration-300 cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
                        alt={property.title || 'Propriété'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          DISPONIBLE
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add to favorites
                        }}
                        className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                        aria-label="Ajouter aux favoris"
                      >
                        <Heart className="h-5 w-5 text-neutral-600 hover:text-red-500 transition-colors" />
                      </button>

                      {/* Price Badge */}
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-white drop-shadow-lg">
                            {formatPrice(property.monthly_rent)}
                          </span>
                          <span className="text-white/80 text-sm">FCFA/mois</span>
                        </div>
                      </div>

                      {/* Trust Score Badge */}
                      {property.owner_trust_score != null && (
                        <div className="absolute bottom-4 right-4 z-10">
                          <ScoreBadge 
                            score={property.owner_trust_score} 
                            variant="compact" 
                            size="sm" 
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Type Badge */}
                      <span className="inline-block bg-primary-50 text-primary-600 px-3 py-1 text-xs font-semibold rounded-full capitalize">
                        {property.property_type || 'Bien immobilier'}
                      </span>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {property.title || 'Propriété sans titre'}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-neutral-600">
                        <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {property.city || 'Non spécifié'}
                          {property.neighborhood && `, ${property.neighborhood}`}
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1.5 text-neutral-600">
                            <Bed className="h-4 w-4 text-primary-500" />
                            <span className="text-sm font-medium">{property.bedrooms} ch.</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1.5 text-neutral-600">
                            <Bath className="h-4 w-4 text-primary-500" />
                            <span className="text-sm font-medium">{property.bathrooms} sdb</span>
                          </div>
                        )}
                        {property.surface_area && (
                          <div className="flex items-center gap-1.5 text-neutral-600">
                            <Maximize className="h-4 w-4 text-primary-500" />
                            <span className="text-sm font-medium">{property.surface_area} m²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Vue Carte */
          <div className="space-y-6">
            {!loading && properties.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-neutral-600">
                  <span className="font-semibold text-neutral-900">{properties.length}</span> propriété{properties.length > 1 ? 's' : ''} sur la carte
                </p>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse" />
                  <span>Disponible</span>
                </div>
              </div>
            )}

            <div className="h-[600px] rounded-2xl overflow-hidden shadow-lg border border-neutral-200">
              <MapboxMap
                properties={properties.filter(p => p.longitude !== null && p.latitude !== null) as any}
                height="100%"
                fitBounds={properties.length > 0}
                clustering={properties.length > 10}
                onMarkerClick={(property) => {
                  navigate(`/proprietes/${property.id}`);
                }}
                onBoundsChange={(bounds) => {
                  console.log('Map bounds changed:', bounds);
                }}
              />
            </div>

            {/* Mobile property list */}
            {!loading && properties.length > 0 && (
              <div className="lg:hidden">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">À proximité</h3>
                <div className="grid grid-cols-1 gap-4">
                  {properties.slice(0, 3).map((property) => (
                    <article
                      key={property.id}
                      onClick={() => navigate(`/proprietes/${property.id}`)}
                      className="bg-white rounded-xl flex gap-4 p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
                        alt={property.title || 'Propriété'}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="inline-block bg-primary-50 text-primary-600 px-2 py-0.5 text-xs font-semibold rounded-full mb-2 capitalize">
                          {property.property_type}
                        </span>
                        <h4 className="font-semibold text-neutral-900 text-sm mb-1 line-clamp-1">
                          {property.title || 'Propriété'}
                        </h4>
                        <p className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.city} {property.neighborhood && `• ${property.neighborhood}`}
                        </p>
                        <p className="text-sm font-bold text-primary-600">
                          {formatPrice(property.monthly_rent)} FCFA/mois
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
                {properties.length > 3 && (
                  <button
                    onClick={() => setActiveView('list')}
                    className="w-full mt-4 py-3 text-primary-600 font-semibold border-2 border-primary-500 rounded-xl hover:bg-primary-50 transition-colors"
                  >
                    Voir les {properties.length} propriétés
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
