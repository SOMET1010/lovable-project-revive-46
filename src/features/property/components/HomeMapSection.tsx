import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Home, Loader2 } from 'lucide-react';
import type { LngLatBounds } from 'mapbox-gl';
import MapboxMap from '@/shared/ui/MapboxMap';
import { useHomeMapProperties } from '../hooks/useHomeMapProperties';

const PROPERTY_TYPES = [
  { value: 'all', label: 'Tous les biens', icon: Building2 },
  { value: 'appartement', label: 'Appartements', icon: Building2 },
  { value: 'villa', label: 'Villas', icon: Home },
  { value: 'studio', label: 'Studios', icon: Building2 },
];

const BUDGET_OPTIONS = [
  { value: 0, label: 'Tous budgets' },
  { value: 100000, label: '< 100k' },
  { value: 200000, label: '< 200k' },
  { value: 300000, label: '< 300k' },
  { value: 500000, label: '< 500k' },
];

interface Property {
  id: string;
  title: string;
  monthly_rent: number;
  longitude: number;
  latitude: number;
  status?: string;
  images?: string[];
  city?: string;
  neighborhood?: string;
}

export default function HomeMapSection() {
  const navigate = useNavigate();
  const { properties, loading, totalCount, fetchInitialProperties, fetchPropertiesInBounds } = useHomeMapProperties();
  
  const [filters, setFilters] = useState({
    propertyType: 'all',
    maxPrice: 0,
  });
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [pendingBounds, setPendingBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

  // Charger les propriétés initiales
  useEffect(() => {
    fetchInitialProperties({
      propertyType: filters.propertyType,
      maxPrice: filters.maxPrice || undefined,
    });
  }, [fetchInitialProperties, filters.propertyType, filters.maxPrice]);

  // Gérer le changement de bounds (déplacement de la carte)
  const handleBoundsChange = useCallback((bounds: LngLatBounds) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    setPendingBounds({
      north: ne.lat,
      south: sw.lat,
      east: ne.lng,
      west: sw.lng,
    });
    setShowSearchButton(true);
  }, []);

  // Rechercher dans la zone visible
  const handleSearchInZone = useCallback(() => {
    if (pendingBounds) {
      fetchPropertiesInBounds(pendingBounds, {
        propertyType: filters.propertyType,
        maxPrice: filters.maxPrice || undefined,
      });
      setShowSearchButton(false);
    }
  }, [pendingBounds, fetchPropertiesInBounds, filters]);

  // Gérer le clic sur un marqueur
  const handleMarkerClick = useCallback((property: Property) => {
    navigate(`/proprietes/${property.id}`);
  }, [navigate]);

  // Transformer les propriétés pour MapboxMap
  const mapProperties = properties.map(p => ({
    id: p.id,
    title: p.title,
    latitude: p.latitude,
    longitude: p.longitude,
    monthly_rent: p.monthly_rent,
    property_type: p.property_type,
    city: p.city,
    neighborhood: p.neighborhood ?? undefined,
    main_image: p.main_image ?? undefined,
    bedrooms: p.bedrooms ?? undefined,
    surface_area: p.surface_area ?? undefined,
    status: p.status ?? undefined,
  }));

  return (
    <section className="py-16 bg-gradient-to-b from-neutral-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            Découvrez
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Explorez les biens disponibles
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Naviguez sur la carte pour découvrir les propriétés à louer dans votre zone préférée
          </p>
        </div>

        {/* Filtres rapides */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          {/* Type de bien */}
          <div className="flex bg-white rounded-xl border border-neutral-200 p-1 shadow-sm">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilters(f => ({ ...f, propertyType: type.value }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.propertyType === type.value
                    ? 'bg-primary text-white'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <type.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Budget max */}
          <select
            value={filters.maxPrice}
            onChange={(e) => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
            className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Carte */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-neutral-200">
          <MapboxMap
            center={[-3.9962, 5.3600]}
            zoom={11}
            properties={mapProperties}
            height="500px"
            clustering={true}
            priceLabels={true}
            styleToggleEnabled={true}
            onBoundsChange={handleBoundsChange}
            onMarkerClick={handleMarkerClick}
          />

          {/* Bouton "Chercher dans cette zone" */}
          {showSearchButton && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={handleSearchInZone}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary font-medium rounded-full shadow-lg border border-neutral-200 hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                Chercher dans cette zone
              </button>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-neutral-700">Chargement...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span><strong className="text-foreground">{totalCount}</strong> biens disponibles</span>
          </div>
          <button
            onClick={() => navigate('/recherche')}
            className="text-primary font-medium hover:underline"
          >
            Voir tous les biens →
          </button>
        </div>
      </div>
    </section>
  );
}
