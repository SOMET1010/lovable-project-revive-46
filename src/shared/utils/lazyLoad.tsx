import { lazy, Suspense, ComponentType } from 'react';
import LoadingFallback from '@/shared/ui/GlobalLoadingSkeleton';

/**
 * Lazy loading with retry for chunk loading errors
 * Retries the import on failure to handle network issues
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyWithRetry = (
  componentImport: () => Promise<{ default: ComponentType<any> }>,
  retries = 3,
  delay = 1000
) => {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        if (i === retries - 1) {
          // Dernier retry échoué : force un hard refresh
          window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return componentImport();
  });
};

/**
 * HOC to wrap lazy components with Suspense
 * Provides consistent loading state across all lazy-loaded pages
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Loadable = <P extends Record<string, any>>(Component: ComponentType<P>) => {
  const LoadableComponent = (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
  
  LoadableComponent.displayName = `Loadable(${Component.displayName || Component.name || 'Component'})`;
  
  return LoadableComponent;
};
