import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Home as HomeIcon, 
  X, 
  AlertCircle, 
  Map as MapIcon, 
  List,
  Bed,
  Bath,
  Maximize,
  Heart,
  SlidersHorizontal,
  ArrowUpDown,
  Banknote,
  Loader2
} from 'lucide-react';
import Breadcrumb from '@/shared/components/navigation/Breadcrumb';
import MapboxMap from '@/shared/ui/MapboxMap';
import { CITY_NAMES } from '@/shared/data/cities';
import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import InfiniteScroll from '@/shared/components/InfiniteScroll';
import { useInfiniteProperties } from '../hooks/useInfiniteProperties';

// Premium Ivorian Color Palette
const COLORS = {
  chocolat: '#2C1810',
  sable: '#E8D4C5',
  orange: '#F16522',
  creme: '#FAF7F4',
  grisNeutre: '#A69B95',
  grisTexte: '#6B5A4E',
  border: '#EFEBE9',
};

export default function SearchPropertiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for view mode
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState('recent');

  // Search filters from URL
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [_neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');

  // Applied filters (only update when form is submitted)
  const [appliedFilters, setAppliedFilters] = useState({
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
  });

  // Infinite scroll hook
  const {
    properties,
    loading,
    loadingMore,
    error: queryError,
    hasMore,
    loadMore,
    totalCount,
  } = useInfiniteProperties(appliedFilters);

  const [error, setError] = useState<string | null>(null);

  // Sync URL params to applied filters on mount and URL change
  useEffect(() => {
    setAppliedFilters({
      city: searchParams.get('city') || '',
      propertyType: searchParams.get('type') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedrooms: searchParams.get('bedrooms') || '',
    });
  }, [searchParams]);

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

    setError(null);
    const params = new URLSearchParams();
    if (city?.trim()) params.set('city', city.trim());
    if (propertyType?.trim()) params.set('type', propertyType.trim());
    if (minPrice?.trim()) params.set('minPrice', minPrice.trim());
    if (maxPrice?.trim()) params.set('maxPrice', maxPrice.trim());
    if (bedrooms?.trim()) params.set('bedrooms', bedrooms.trim());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setCity('');
    setNeighborhood('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setError(null);
    setSearchParams(new URLSearchParams());
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Prix sur demande';
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const activeFiltersCount = [
    appliedFilters.city, 
    appliedFilters.propertyType, 
    appliedFilters.minPrice, 
    appliedFilters.maxPrice, 
    appliedFilters.bedrooms
  ].filter(Boolean).length;

  const displayError = error || queryError;

  // Quick filter tags
  const quickFilters = ['Piscine', 'Meublé', 'Bord de lagune', 'Sécurisé', 'Parking'];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.creme }}>
      
      {/* ==================== HEADER CHOCOLAT ==================== */}
      <header 
        className="relative overflow-hidden pb-12 pt-24 md:pt-28 px-4"
        style={{ backgroundColor: COLORS.chocolat }}
      >
        {/* Texture de fond subtile */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb 
              items={[{ label: 'Recherche' }]} 
              className="text-white/60"
            />
          </div>

          {/* Header Content */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.orange }}>
                <Search className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Moteur de recherche</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Trouver un bien</h1>
              <p className="mt-1" style={{ color: `${COLORS.sable}CC` }}>
                Explorez notre sélection certifiée en Côte d'Ivoire
              </p>
            </div>
            
            {!loading && (
              <div className="hidden md:flex items-center gap-2 text-sm" style={{ color: COLORS.sable }}>
                <span className="font-bold text-white">{totalCount}</span> biens disponibles
              </div>
            )}
          </div>

          {/* ==================== BARRE DE FILTRES CAPSULE ==================== */}
          <form onSubmit={handleSearch}>
            <div 
              className="bg-white p-2 rounded-[20px] shadow-lg flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x"
              style={{ borderColor: COLORS.border }}
            >
              {/* Localisation */}
              <div className="flex-1 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3 h-3" style={{ color: COLORS.grisNeutre }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: COLORS.grisNeutre }}>Localisation</span>
                </div>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (e.target.value !== 'Abidjan') {
                      setNeighborhood('');
                    }
                  }}
                  className="w-full border-0 p-0 h-6 font-bold focus:ring-0 bg-transparent cursor-pointer"
                  style={{ color: COLORS.chocolat }}
                >
                  <option value="">Toutes les villes</option>
                  {CITY_NAMES.map((cityName) => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </div>

              {/* Type de bien */}
              <div className="flex-1 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <HomeIcon className="w-3 h-3" style={{ color: COLORS.grisNeutre }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: COLORS.grisNeutre }}>Type de bien</span>
                </div>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full border-0 p-0 h-6 font-bold focus:ring-0 bg-transparent cursor-pointer"
                  style={{ color: COLORS.chocolat }}
                >
                  <option value="">Tous les types</option>
                  <option value="appartement">Appartement</option>
                  <option value="maison">Maison</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="duplex">Duplex</option>
                </select>
              </div>

              {/* Budget */}
              <div className="flex-1 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="w-3 h-3" style={{ color: COLORS.grisNeutre }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: COLORS.grisNeutre }}>Budget max</span>
                </div>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border-0 p-0 h-6 font-bold focus:ring-0 bg-transparent cursor-pointer"
                  style={{ color: COLORS.chocolat }}
                >
                  <option value="">Tout budget</option>
                  <option value="100000">Max 100 000 FCFA</option>
                  <option value="200000">Max 200 000 FCFA</option>
                  <option value="500000">Max 500 000 FCFA</option>
                  <option value="1000000">Max 1 000 000 FCFA</option>
                  <option value="2000000">Max 2 000 000 FCFA</option>
                </select>
              </div>

              {/* Bouton Rechercher */}
              <div className="p-2">
                <button
                  type="submit"
                  className="w-full md:w-auto rounded-[16px] text-white px-8 py-4 font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{ backgroundColor: COLORS.orange }}
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Rechercher</span>
                </button>
              </div>
            </div>

            {/* Filtres Avancés & Tags Rapides */}
            <div className="flex flex-wrap gap-4 mt-6 items-center">
              <button
                type="button"
                className="flex items-center gap-2 border border-white/10 rounded-full h-9 px-4 text-xs hover:bg-white/10 transition-colors"
                style={{ color: COLORS.sable }}
              >
                <SlidersHorizontal className="w-3 h-3" /> Plus de filtres
              </button>
              
              <div className="h-4 w-px bg-white/10 hidden md:block" />

              {quickFilters.map(tag => (
                <button 
                  key={tag} 
                  type="button"
                  className="text-xs border border-white/10 rounded-full px-3 py-1.5 bg-white/5 hover:text-white transition-colors"
                  style={{ color: `${COLORS.sable}B3` }}
                >
                  {tag}
                </button>
              ))}

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors ml-auto"
                  style={{ color: COLORS.orange }}
                >
                  <X className="w-3 h-3" />
                  Réinitialiser ({activeFiltersCount})
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* ==================== CONTENU PRINCIPAL ==================== */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Barre d'outils (Tri & Vue) */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.grisTexte }}>
            <span className="font-bold" style={{ color: COLORS.chocolat }}>{totalCount}</span> résultats trouvés
          </div>

          <div className="flex items-center gap-3">
            {/* Tri */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-full text-sm bg-white border cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                style={{ borderColor: COLORS.border, color: COLORS.grisTexte }}
              >
                <option value="recent">Les plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.grisNeutre }} />
            </div>

            {/* Toggle Vue */}
            <div 
              className="bg-white border rounded-full p-1 flex items-center"
              style={{ borderColor: COLORS.border }}
            >
              <button 
                type="button"
                onClick={() => setActiveView('list')}
                className={`p-2 rounded-full transition-all ${
                  activeView === 'list' 
                    ? 'text-white shadow-md' 
                    : 'hover:bg-gray-50'
                }`}
                style={{ 
                  backgroundColor: activeView === 'list' ? COLORS.chocolat : 'transparent',
                  color: activeView === 'list' ? 'white' : COLORS.grisNeutre
                }}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => setActiveView('map')}
                className={`p-2 rounded-full transition-all ${
                  activeView === 'map' 
                    ? 'text-white shadow-md' 
                    : 'hover:bg-gray-50'
                }`}
                style={{ 
                  backgroundColor: activeView === 'map' ? COLORS.chocolat : 'transparent',
                  color: activeView === 'map' ? 'white' : COLORS.grisNeutre
                }}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">Erreur</h3>
              <p className="text-neutral-700">{displayError}</p>
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

        {/* CONTENU (Liste ou Carte) */}
        <div className="flex gap-8 items-start">
          
          {/* GRILLE DES BIENS */}
          <div className={`flex-1 ${activeView === 'map' ? 'hidden lg:block' : ''}`}>
            <InfiniteScroll
              onLoadMore={loadMore}
              hasMore={hasMore}
              loading={loadingMore}
              threshold={300}
              loader={
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.orange }} />
                  <span className="ml-3" style={{ color: COLORS.grisTexte }}>Chargement...</span>
                </div>
              }
              endMessage={
                properties.length > 0 ? (
                  <div className="flex justify-center items-center py-8" style={{ color: COLORS.grisNeutre }}>
                    <span>Vous avez vu toutes les propriétés disponibles</span>
                  </div>
                ) : null
              }
            >
              {loading ? (
                /* Loading skeleton Premium */
                <div className={`grid gap-6 ${activeView === 'map' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-white rounded-[20px] h-[420px] animate-pulse border"
                      style={{ borderColor: COLORS.border }}
                    />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                /* Empty state Premium */
                <div className="text-center py-16 md:py-24">
                  <div className="relative inline-block mb-8">
                    <div 
                      className="absolute inset-0 rounded-full blur-2xl animate-pulse"
                      style={{ backgroundColor: `${COLORS.orange}33` }}
                    />
                    <div 
                      className="relative rounded-full w-28 h-28 flex items-center justify-center border"
                      style={{ backgroundColor: COLORS.creme, borderColor: COLORS.border }}
                    >
                      <HomeIcon className="h-12 w-12" style={{ color: COLORS.grisNeutre }} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.chocolat }}>
                    Aucune propriété trouvée
                  </h3>
                  <p className="mb-8 max-w-md mx-auto" style={{ color: COLORS.grisTexte }}>
                    Essayez de modifier vos critères de recherche ou explorez d'autres zones.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: COLORS.orange }}
                  >
                    <X className="h-5 w-5" />
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                /* Properties Grid Premium Ivorian */
                <div className={`grid gap-6 ${activeView === 'map' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {properties.map((property, index) => (
                    <article
                      key={property.id}
                      onClick={() => navigate(`/proprietes/${property.id}`)}
                      className="group bg-white rounded-[20px] overflow-hidden border hover:shadow-[0_20px_40px_rgba(44,24,16,0.08)] transition-all duration-300 cursor-pointer"
                      style={{ 
                        borderColor: COLORS.border,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${COLORS.orange}4D`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = COLORS.border;
                      }}
                    >
                      {/* Image Container */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
                          alt={property.title || 'Propriété'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
                          }}
                        />
                        
                        {/* Badges Flottants */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {index < 3 && (
                            <span 
                              className="text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase shadow-sm"
                              style={{ backgroundColor: COLORS.orange }}
                            >
                              Nouveau
                            </span>
                          )}
                          <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-md uppercase shadow-sm" style={{ color: COLORS.chocolat }}>
                            Disponible
                          </span>
                        </div>

                        {/* Bouton Favori */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Add to favorites
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white transition-colors group/fav"
                          aria-label="Ajouter aux favoris"
                        >
                          <Heart className="w-4 h-4 group-hover/fav:text-red-500 transition-colors" />
                        </button>

                        {/* Prix Overlay */}
                        <div className="absolute bottom-3 left-3">
                          <div 
                            className="backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg"
                            style={{ backgroundColor: `${COLORS.chocolat}E6` }}
                          >
                            <span className="font-bold text-lg">{formatPrice(property.monthly_rent)}</span>
                            <span className="text-[10px] opacity-80 ml-1">FCFA/mois</span>
                          </div>
                        </div>
                      </div>

                      {/* Infos */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p 
                              className="text-[10px] font-bold uppercase mb-1"
                              style={{ color: COLORS.grisNeutre }}
                            >
                              {property.property_type || 'Bien immobilier'}
                            </p>
                            <h3 
                              className="font-bold text-lg leading-tight transition-colors line-clamp-1"
                              style={{ color: COLORS.chocolat }}
                            >
                              {property.title || 'Propriété sans titre'}
                            </h3>
                          </div>
                          {property.owner_trust_score != null && (
                            <ScoreBadge score={property.owner_trust_score} size="sm" variant="compact" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-sm mb-4" style={{ color: COLORS.grisTexte }}>
                          <MapPin className="w-3.5 h-3.5" style={{ color: COLORS.orange }} />
                          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city || 'Non spécifié'}
                        </div>

                        {/* Features */}
                        <div 
                          className="flex items-center gap-4 pt-4 border-t text-xs font-medium"
                          style={{ borderColor: COLORS.border, color: COLORS.grisNeutre }}
                        >
                          {property.bedrooms && (
                            <div className="flex items-center gap-1.5">
                              <Bed className="w-4 h-4" style={{ color: COLORS.orange }} /> {property.bedrooms} ch.
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1.5">
                              <Bath className="w-4 h-4" style={{ color: COLORS.orange }} /> {property.bathrooms} sdb
                            </div>
                          )}
                          {property.surface_area && (
                            <div className="flex items-center gap-1.5">
                              <Maximize className="w-4 h-4" style={{ color: COLORS.orange }} /> {property.surface_area} m²
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </InfiniteScroll>
          </div>

          {/* MAP (Visible seulement si mode Carte activé) */}
          {activeView === 'map' && (
            <div className="hidden lg:block w-[45%] h-[800px] sticky top-24">
              <div 
                className="w-full h-full rounded-[24px] overflow-hidden shadow-inner border"
                style={{ borderColor: COLORS.border }}
              >
                {properties.filter(p => p.longitude !== null && p.latitude !== null).length > 0 ? (
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
                ) : (
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center"
                    style={{ backgroundColor: '#E5E5E5' }}
                  >
                    <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-xs">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: `${COLORS.orange}1A` }}
                      >
                        <MapIcon className="w-6 h-6" style={{ color: COLORS.orange }} />
                      </div>
                      <h3 className="font-bold mb-2" style={{ color: COLORS.chocolat }}>Carte Interactive</h3>
                      <p className="text-sm" style={{ color: COLORS.grisTexte }}>
                        Aucune propriété géolocalisée disponible pour le moment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vue carte mobile */}
        {activeView === 'map' && (
          <div className="lg:hidden space-y-6">
            <div 
              className="h-[400px] rounded-2xl overflow-hidden shadow-lg border"
              style={{ borderColor: COLORS.border }}
            >
              {properties.filter(p => p.longitude !== null && p.latitude !== null).length > 0 ? (
                <MapboxMap
                  properties={properties.filter(p => p.longitude !== null && p.latitude !== null) as any}
                  height="100%"
                  fitBounds={properties.length > 0}
                  clustering={properties.length > 10}
                  onMarkerClick={(property) => {
                    navigate(`/proprietes/${property.id}`);
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: '#E5E5E5' }}
                >
                  <div className="text-center">
                    <MapIcon className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.grisNeutre }} />
                    <p style={{ color: COLORS.grisTexte }}>Aucune propriété géolocalisée</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile property cards */}
            {!loading && properties.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.chocolat }}>À proximité</h3>
                <div className="grid grid-cols-1 gap-4">
                  {properties.slice(0, 4).map((property) => (
                    <article
                      key={property.id}
                      onClick={() => navigate(`/proprietes/${property.id}`)}
                      className="bg-white rounded-xl flex gap-4 p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderColor: COLORS.border }}
                    >
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
                        alt={property.title || 'Propriété'}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <span 
                          className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-2 capitalize"
                          style={{ backgroundColor: `${COLORS.orange}1A`, color: COLORS.orange }}
                        >
                          {property.property_type}
                        </span>
                        <h4 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: COLORS.chocolat }}>
                          {property.title || 'Propriété'}
                        </h4>
                        <p className="text-xs mb-2 flex items-center gap-1" style={{ color: COLORS.grisTexte }}>
                          <MapPin className="h-3 w-3" style={{ color: COLORS.orange }} />
                          {property.city} {property.neighborhood && `• ${property.neighborhood}`}
                        </p>
                        <p className="text-sm font-bold" style={{ color: COLORS.orange }}>
                          {formatPrice(property.monthly_rent)} FCFA/mois
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
                {properties.length > 4 && (
                  <button
                    onClick={() => setActiveView('list')}
                    className="w-full mt-4 py-3 font-semibold border-2 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ color: COLORS.orange, borderColor: COLORS.orange }}
                  >
                    Voir les {totalCount} propriétés
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
