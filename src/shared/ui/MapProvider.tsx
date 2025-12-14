import { ReactNode, useState, useEffect } from 'react';
import { Map, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface MapProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  showProviderInfo?: boolean;
}

/**
 * Provider simplifié pour les cartes OpenStreetMap
 * OpenStreetMap est gratuit et toujours disponible
 */
export function MapProvider({
  children,
  fallback,
  showProviderInfo = false,
}: MapProviderProps) {
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simule un court chargement initial
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setMapError(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return fallback || <MapFallback onRetry={handleRetry} />;
  }

  return (
    <div className="relative w-full h-full">
      {/* Provider Info Badge - OpenStreetMap */}
      {showProviderInfo && (
        <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border">
          <div className="flex items-center gap-2 text-sm">
            <Map className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">OpenStreetMap</span>
          </div>
        </div>
      )}

      {/* Map Content */}
      {children}
    </div>
  );
}

/**
 * Fallback quand la carte n'est pas disponible
 */
function MapFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center">
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Carte non disponible</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Le service de cartographie est temporairement indisponible. 
          Les propriétés restent accessibles via la liste.
        </p>
        <Button onClick={onRetry} variant="outline" size="small">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </div>
    </div>
  );
}

export default MapProvider;
