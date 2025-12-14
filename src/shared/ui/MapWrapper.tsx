import { lazy, Suspense } from 'react';
import { Map, MapPin } from 'lucide-react';

// Utiliser uniquement LeafletMap via MapGated (OpenStreetMap gratuit)
const MapGated = lazy(() => import('./MapGated'));

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
  bedrooms?: number;
  bathrooms?: number;
  surface_area?: number;
}

interface MapWrapperProps {
  center?: [number, number];
  zoom?: number;
  properties: Property[];
  highlightedPropertyId?: string;
  onMarkerClick?: (property: Property) => void;
  onBoundsChange?: (bounds: unknown) => void;
  clustering?: boolean;
  draggableMarker?: boolean;
  showRadius?: boolean;
  radiusKm?: number;
  fitBounds?: boolean;
  height?: string;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  onMarkerDrag?: (lngLat: { lng: number; lat: number }) => void;
  searchEnabled?: boolean;
  singleMarker?: boolean;
  useClusterMode?: boolean;
}

export default function MapWrapper(props: MapWrapperProps) {
  return (
    <Suspense fallback={<MapLoadingSkeleton height={props.height} />}>
      <MapGated {...props} />
    </Suspense>
  );
}

function MapLoadingSkeleton({ height = '500px' }: { height?: string }) {
  return (
    <div
      style={{ height }}
      className="relative bg-gradient-to-br from-muted to-muted/80 rounded-lg overflow-hidden animate-pulse flex items-center justify-center"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/30 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 text-center space-y-4">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto animate-bounce shadow-lg">
          <Map className="h-10 w-10 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <p className="text-foreground font-bold text-lg">Chargement de la carte...</p>
          <p className="text-muted-foreground text-sm">Préparation de vos propriétés</p>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <MapPin className="h-4 w-4 text-primary animate-pulse" />
          <MapPin className="h-4 w-4 text-primary/70 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <MapPin className="h-4 w-4 text-primary/50 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
