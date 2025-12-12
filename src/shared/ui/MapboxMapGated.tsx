import { FEATURE_FLAGS, useFeatureFlag } from '@/shared/hooks/useFeatureFlag';
import MapboxMap from './MapboxMap';
import LeafletMap from './LeafletMap';
import { MapPin, Loader2, Map } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

// Re-export all props from MapboxMap
type MapboxMapProps = Parameters<typeof MapboxMap>[0];

interface MapboxMapGatedProps extends MapboxMapProps {
  fallbackMessage?: string;
}

/**
 * Fallback simple quand toutes les cartes échouent
 */
function MapFallback({ height = '400px' }: { height?: string }) {
  return (
    <div 
      className="flex flex-col items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20"
      style={{ height }}
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-primary" />
      </div>
      <p className="text-muted-foreground font-medium">Carte non disponible</p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        La fonctionnalité cartographique sera bientôt activée
      </p>
    </div>
  );
}

/**
 * Loading state pour la carte
 */
function MapLoading({ height = '400px' }: { height?: string }) {
  return (
    <div 
      className="flex flex-col items-center justify-center bg-muted/20 rounded-xl animate-pulse"
      style={{ height }}
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
      <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
    </div>
  );
}

/**
 * Wrapper MapboxMap avec fallback automatique vers OpenStreetMap/Leaflet
 */
function MapboxWithFallback({ height, properties, onMarkerClick, ...props }: MapboxMapProps) {
  const [useLeaflet, setUseLeaflet] = useState(false);
  const [mapboxError, setMapboxError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // Convertir les propriétés pour Leaflet (format différent)
  const leafletProperties = useMemo(() => {
    if (!properties) return [];
    return properties.map(p => ({
      id: p.id,
      title: p.title,
      city: p.city || '',
      price: p.monthly_rent,
      latitude: p.latitude,
      longitude: p.longitude,
      images: p.images,
      property_type: undefined,
      bedrooms: p.bedrooms,
      surface_area: p.surface_area,
    }));
  }, [properties]);

  // Timeout de 8 secondes pour Mapbox, puis fallback vers Leaflet
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapboxError) {
        setLoadTimeout(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [mapboxError]);

  // Si Mapbox échoue ou timeout, utiliser Leaflet
  useEffect(() => {
    if (mapboxError || loadTimeout) {
      console.log('[MapboxMapGated] Switching to OpenStreetMap fallback');
      setUseLeaflet(true);
    }
  }, [mapboxError, loadTimeout]);

  // Écouter les erreurs Mapbox via un event custom
  useEffect(() => {
    const handleMapboxError = () => {
      console.log('[MapboxMapGated] Mapbox error detected, switching to Leaflet');
      setMapboxError(true);
    };

    window.addEventListener('mapbox-error', handleMapboxError);
    return () => window.removeEventListener('mapbox-error', handleMapboxError);
  }, []);

  if (useLeaflet) {
    return (
      <div className="relative">
        <LeafletMap
          properties={leafletProperties}
          height={height}
          onPropertyClick={(id) => {
            const prop = properties?.find(p => p.id === id);
            if (prop && onMarkerClick) onMarkerClick(prop);
          }}
          showControls={true}
        />
        {/* Badge indiquant le fallback */}
        <div className="absolute top-12 left-3 z-[1001]">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
            <Map className="w-3 h-3" />
            <span>Mode alternatif</span>
          </div>
        </div>
      </div>
    );
  }

  return <MapboxMap height={height} properties={properties} onMarkerClick={onMarkerClick} {...props} />;
}

/**
 * MapboxMap avec feature flag - affiche un fallback si désactivé
 * Avec fallback automatique vers OpenStreetMap si Mapbox échoue
 */
export default function MapboxMapGated({ height, ...props }: MapboxMapGatedProps) {
  const { isEnabled, isLoading, error } = useFeatureFlag(FEATURE_FLAGS.MAPBOX_MAPS);

  // Log pour diagnostic
  if (import.meta.env.DEV) {
    console.log('[MapboxMapGated] Feature flag state:', { 
      feature: FEATURE_FLAGS.MAPBOX_MAPS,
      isEnabled, 
      isLoading,
      error: error?.message 
    });
  }

  // État de chargement du feature flag
  if (isLoading) {
    return <MapLoading height={height} />;
  }

  // Erreur lors du chargement du feature flag
  if (error) {
    console.error('[MapboxMapGated] Feature flag error:', error);
    // En cas d'erreur, on tente quand même d'afficher la carte avec fallback
    return <MapboxWithFallback height={height} {...props} />;
  }

  // Feature flag désactivé
  if (!isEnabled) {
    if (import.meta.env.DEV) {
      console.log('[MapboxMapGated] Feature disabled, showing fallback');
    }
    return <MapFallback height={height} />;
  }

  // Feature flag activé - afficher la carte avec fallback automatique
  return <MapboxWithFallback height={height} {...props} />;
}
