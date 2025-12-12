import { FEATURE_FLAGS, useFeatureFlag } from '@/shared/hooks/useFeatureFlag';
import MapboxMap from './MapboxMap';
import { MapPin, Loader2 } from 'lucide-react';

// Re-export all props from MapboxMap
type MapboxMapProps = Parameters<typeof MapboxMap>[0];

interface MapboxMapGatedProps extends MapboxMapProps {
  fallbackMessage?: string;
}

/**
 * Fallback simple quand Mapbox est désactivé
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
 * MapboxMap avec feature flag - affiche un fallback si désactivé
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
    // En cas d'erreur, on tente quand même d'afficher la carte
    return <MapboxMap height={height} {...props} />;
  }

  // Feature flag désactivé
  if (!isEnabled) {
    if (import.meta.env.DEV) {
      console.log('[MapboxMapGated] Feature disabled, showing fallback');
    }
    return <MapFallback height={height} />;
  }

  // Feature flag activé - afficher la carte
  return <MapboxMap height={height} {...props} />;
}
