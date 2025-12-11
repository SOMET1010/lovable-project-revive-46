import { useFeatureFlag, type FeatureFlagName } from '@/shared/hooks/useFeatureFlag';
import { Loader2, Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: FeatureFlagName | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  showDisabledMessage?: boolean;
  disabledMessage?: string;
}

/**
 * Component that conditionally renders children based on feature flag status
 * 
 * @example
 * <FeatureGate feature="ai_chatbot">
 *   <ChatbotWidget />
 * </FeatureGate>
 * 
 * @example with fallback
 * <FeatureGate 
 *   feature="mapbox_maps" 
 *   fallback={<StaticMap />}
 * >
 *   <InteractiveMap />
 * </FeatureGate>
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback = null,
  showLoading = false,
  showDisabledMessage = false,
  disabledMessage = "Cette fonctionnalité n'est pas disponible actuellement.",
}: FeatureGateProps) {
  const { isEnabled, isLoading } = useFeatureFlag(feature);

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) return null;

  if (!isEnabled) {
    if (showDisabledMessage) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl text-center">
          <Lock className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{disabledMessage}</p>
        </div>
      );
    }
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * HOC to wrap a component with feature flag check
 */
export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: FeatureFlagName | string,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    const { isEnabled, isLoading } = useFeatureFlag(featureName);

    if (isLoading) return null;
    
    if (!isEnabled) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default FeatureGate;
