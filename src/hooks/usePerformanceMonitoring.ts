import { useEffect } from 'react';

interface PerformanceMetrics {
  pageName: string;
  loadTime?: number;
  renderTime?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

export function usePerformanceMonitoring(pageName: string) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const measurePageLoad = () => {
      try {
        const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        const metrics: PerformanceMetrics = {
          pageName,
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          renderTime: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        };

        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'paint') {
                if (entry.name === 'first-contentful-paint') {
                  metrics.firstContentfulPaint = entry.startTime;
                }
              } else if (entry.entryType === 'largest-contentful-paint') {
                metrics.largestContentfulPaint = entry.startTime;
              }
            }
          });

          try {
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
          } catch (e) {
            console.warn('Performance observer not supported for this entry type');
          }
        }

        console.log(`[Performance] ${pageName}:`, metrics);

        if ((window as any).gtag) {
          (window as any).gtag('event', 'page_performance', {
            page_name: pageName,
            page_load_time: metrics.loadTime,
            dom_content_loaded: metrics.renderTime,
          });
        }
      } catch (error) {
        console.error('Error measuring performance:', error);
      }
    };

    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, [pageName]);
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
