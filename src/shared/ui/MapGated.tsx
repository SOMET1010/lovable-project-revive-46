import LeafletMap from './LeafletMap';
import { MapPin, Loader2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

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
  main_image?: string;
  bedrooms?: number;
  surface_area?: number;
}

interface MapGatedProps {
  center?: [number, number];
  zoom?: number;
  properties?: Property[];
  highlightedPropertyId?: string;
  onMarkerClick?: (property: Property) => void;
  height?: string;
  fallbackMessage?: string;
}

/**
 * Fallback simple quand les cartes sont désactivées
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
 * Composant carte principal utilisant OpenStreetMap (Leaflet)
 * 100% gratuit - pas de token requis
 */
export default function MapboxMapGated({ 
  height, 
  properties, 
  onMarkerClick,
  center,
  zoom,
}: MapGatedProps) {
  const [isReady, setIsReady] = useState(false);

  // Simuler un court délai de chargement pour le rendu initial
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Convertir les propriétés pour Leaflet
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

  // Vérifier si on a des propriétés avec coordonnées valides
  const hasValidProperties = leafletProperties.some(
    p => p.latitude && p.longitude && 
         !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  // État de chargement
  if (!isReady) {
    return <MapLoading height={height} />;
  }

  // Pas de propriétés valides
  if (!hasValidProperties && !center) {
    return <MapFallback height={height} />;
  }

  // Afficher la carte Leaflet (OpenStreetMap - 100% gratuit)
  return (
    <LeafletMap
      properties={leafletProperties}
      height={height}
      onPropertyClick={(id) => {
        const prop = properties?.find(p => p.id === id);
        if (prop && onMarkerClick) onMarkerClick(prop);
      }}
      showControls={true}
      initialCenter={center ? [center[1], center[0]] : undefined}
      initialZoom={zoom}
    />
  );
}

// Export alias pour compatibilité
export { MapboxMapGated as MapGated };
