import { FeatureGate } from '@/shared/ui/FeatureGate';
import { FEATURE_FLAGS } from '@/shared/hooks/useFeatureFlag';
import MapboxMap from './MapboxMap';
import { MapPin } from 'lucide-react';

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
 * MapboxMap avec feature flag - affiche un fallback si désactivé
 */
export default function MapboxMapGated({ height, ...props }: MapboxMapGatedProps) {
  return (
    <FeatureGate 
      feature={FEATURE_FLAGS.MAPBOX_MAPS} 
      fallback={<MapFallback height={height} />}
    >
      <MapboxMap height={height} {...props} />
    </FeatureGate>
  );
}
