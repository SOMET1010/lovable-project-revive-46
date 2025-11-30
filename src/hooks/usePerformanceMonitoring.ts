import { useEffect, useRef } from 'react';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

interface PerformanceMetrics {
  pageName: string;
  loadTime?: number;
  renderTime?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

interface UsePerformanceMonitoringOptions {
  trackPaintMetrics?: boolean;
  trackNavigationTiming?: boolean;
  trackMemoryUsage?: boolean;
  trackLongTasks?: boolean;
}

/**
 * Hook pour monitorer les performances de page avec cleanup automatique
 */
export function usePerformanceMonitoring(
  pageName: string,
  options: UsePerformanceMonitoringOptions = {}
) {
  const {
    trackPaintMetrics = true,
    trackNavigationTiming = true,
    trackMemoryUsage = false,
    trackLongTasks = false
  } = options;

  const cleanup = useCleanupRegistry('usePerformanceMonitoring');
  const metricsRef = useRef<PerformanceMetrics>({ pageName });
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      console.warn('[PerformanceMonitoring] Performance API not available');
      return;
    }

    const measurePageLoad = () => {
      try {
        const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (trackNavigationTiming) {
          const metrics: PerformanceMetrics = {
            pageName,
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            renderTime: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          };

          metricsRef.current = { ...metricsRef.current, ...metrics };

          console.log(`[Performance] ${pageName}:`, metrics);

          // Envoyer les métriques à l'analytics
          if ((window as any).gtag) {
            (window as any).gtag('event', 'page_performance', {
              page_name: pageName,
              page_load_time: metrics.loadTime,
              dom_content_loaded: metrics.renderTime,
            });
          }
        }

        // Mesurer l'utilisation de la mémoire
        if (trackMemoryUsage && (performance as any).memory) {
          const memory = (performance as any).memory;
          const memoryMetrics = {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          };

          console.log(`[Memory] ${pageName}:`, memoryMetrics);

          if ((window as any).gtag) {
            (window as any).gtag('event', 'memory_usage', {
              page_name: pageName,
              ...memoryMetrics,
            });
          }
        }
      } catch (error) {
        console.error('Error measuring performance:', error);
      }
    };

    // Setup PerformanceObserver pour les métriques de paint
    if (trackPaintMetrics && 'PerformanceObserver' in window) {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                metricsRef.current.firstContentfulPaint = entry.startTime;
                console.log(`[Paint] FCP for ${pageName}:`, entry.startTime);
              }
            } else if (entry.entryType === 'largest-contentful-paint') {
              metricsRef.current.largestContentfulPaint = entry.startTime;
              console.log(`[Paint] LCP for ${pageName}:`, entry.startTime);
            }
          }
        });

        // Ajouter le PerformanceObserver avec cleanup automatique
        cleanup.addPerformanceObserver(
          `paint-${pageName}`,
          observerRef.current,
          'Paint metrics observer',
          'usePerformanceMonitoring'
        );

        try {
          observerRef.current.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        } catch (e) {
          console.warn('Performance observer not supported for this entry type');
        }
      } catch (error) {
        console.warn('Failed to setup PerformanceObserver:', error);
      }
    }

    // Observer les long tasks pour identifier les blocages
    if (trackLongTasks && 'PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn(`[LongTask] Detected in ${pageName}:`, {
              duration: entry.duration,
              startTime: entry.startTime,
            });

            // Tracker les long tasks avec gtag
            if ((window as any).gtag) {
              (window as any).gtag('event', 'long_task', {
                page_name: pageName,
                task_duration: entry.duration,
                task_start_time: entry.startTime,
              });
            }
          }
        });

        // Ajouter le long task observer avec cleanup automatique
        cleanup.addPerformanceObserver(
          `longtasks-${pageName}`,
          longTaskObserver,
          'Long task observer',
          'usePerformanceMonitoring'
        );

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Failed to setup long task observer:', error);
      }
    }

    // Mesurer le temps de chargement initial
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      // Ajouter l'event listener avec cleanup automatique
      cleanup.addEventListener(
        `load-${pageName}`,
        window,
        'load',
        measurePageLoad,
        false,
        'Page load measurement',
        'usePerformanceMonitoring'
      );
    }

    // Cleanup automatique lors du démontage
    return () => {
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (error) {
          console.warn('Error disconnecting PerformanceObserver:', error);
        }
      }
    };
  }, [pageName, trackPaintMetrics, trackNavigationTiming, trackMemoryUsage, trackLongTasks, cleanup]);

  return {
    metrics: metricsRef.current,
  };
}

export function trackSearchEvent(params: {
  searchTerm?: string;
  city?: string;
  propertyType?: string;
  resultsCount: number;
  loadTime: number;
}) {
  try {
    console.log('[Analytics] Search event:', params);

    if ((window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: params.searchTerm || 'none',
        city: params.city || 'all',
        property_type: params.propertyType || 'all',
        results_count: params.resultsCount,
        load_time: params.loadTime,
      });
    }
  } catch (error) {
    console.error('Error tracking search event:', error);
  }
}

export function trackError(error: Error, context?: Record<string, any>) {
  try {
    console.error('[Error Tracking]', error, context);

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });
    }

    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  } catch (trackingError) {
    console.error('Error in error tracking:', trackingError);
  }
}

/**
 * Hook pour mesurer le temps de rendu d'un composant
 */
export function useRenderPerformance(componentName: string) {
  const startTimeRef = useRef<number>();
  const cleanup = useCleanupRegistry('useRenderPerformance');

  useEffect(() => {
    startTimeRef.current = performance.now();

    // Cleanup function pour mesurer le temps de rendu
    const measureRenderTime = () => {
      if (startTimeRef.current) {
        const renderTime = performance.now() - startTimeRef.current;
        console.log(`[RenderPerformance] ${componentName}: ${renderTime.toFixed(2)}ms`);

        if (renderTime > 16) { // Plus de 16ms = plus d'une frame
          console.warn(`[RenderPerformance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }

        if ((window as any).gtag && renderTime > 16) {
          (window as any).gtag('event', 'slow_render', {
            component_name: componentName,
            render_time: renderTime,
          });
        }
      }
    };

    // Mesurer après le rendu
    const timeoutId = cleanup.createTimeout(
      `render-${componentName}`,
      measureRenderTime,
      0, // Exécution immédiate après le rendu
      `Render time measurement for ${componentName}`,
      'useRenderPerformance'
    );

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [componentName, cleanup]);
}
