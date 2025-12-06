import { useState, useEffect, lazy, Suspense } from 'react';
import { Map, AlertCircle, MapPin } from 'lucide-react';

const MapboxMap = lazy(() => import('./MapboxMap'));

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

interface MapWrapperProps {
  center?: [number, number];
  zoom?: number;
  properties: Property[];
  highlightedPropertyId?: string;
  onMarkerClick?: (property: Property) => void;
  onBoundsChange?: (bounds: any) => void;
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
}

export default function MapWrapper(props: MapWrapperProps) {
  const [_mapError, setMapError] = useState(false);
  const [useAzureFallback, setUseAzureFallback] = useState(false);

  useEffect(() => {
    const handleMapError = () => {
      console.error('Mapbox failed to load, switching to fallback');
      setMapError(true);
      setUseAzureFallback(true);
    };

    window.addEventListener('mapbox-error', handleMapError);
    return () => window.removeEventListener('mapbox-error', handleMapError);
  }, []);

  if (useAzureFallback) {
    return <AzureMapsComponent {...props} />;
  }

  return (
    <Suspense fallback={<MapLoadingSkeleton height={props.height} />}>
      <div
        onError={() => {
          console.error('Mapbox component error, using fallback');
          setMapError(true);
          setUseAzureFallback(true);
        }}
      >
        <MapboxMap {...props} />
      </div>
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

function AzureMapsComponent({
  properties,
  height = '500px',
  center: _center = [-4.0083, 5.36],
  zoom: _zoom = 12,
  onMarkerClick,
}: MapWrapperProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
    if (onMarkerClick) {
      onMarkerClick(property);
    }
  };

  return (
    <div
      style={{ height }}
      className="relative bg-gradient-to-br from-muted to-accent/20 rounded-lg overflow-hidden border-2 border-border"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-8 max-w-2xl">
          <div className="bg-card rounded-2xl shadow-xl p-8 mb-6">
            <div className="bg-primary rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Map className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Carte non disponible
            </h3>
            <p className="text-muted-foreground mb-4">
              Le service de cartographie n'est pas accessible pour le moment.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Vérifiez la configuration du token Mapbox</span>
            </div>
          </div>

          {properties.length > 0 && (
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h4 className="font-bold text-lg mb-4 text-foreground">
                {properties.length} propriété{properties.length > 1 ? 's' : ''} disponible{properties.length > 1 ? 's' : ''}
              </h4>
              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {properties.slice(0, 5).map((property) => (
                  <button
                    key={property.id}
                    onClick={() => handleMarkerClick(property)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedProperty?.id === property.id
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-border hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-lg p-2 flex-shrink-0">
                        <Map className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-foreground truncate mb-1">
                          {property.title}
                        </h5>
                        <p className="text-sm text-muted-foreground mb-2">
                          {property.city}
                          {property.neighborhood && `, ${property.neighborhood}`}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {property.monthly_rent.toLocaleString()} FCFA/mois
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {properties.length > 5 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  + {properties.length - 5} autre{properties.length - 5 > 1 ? 's' : ''} propriété{properties.length - 5 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
