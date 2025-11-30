/**
 * Hook React pour la gestion d'erreur robuste avec retry automatique
 * Avec cleanup functions robustes et monitoring des fuites de mémoire
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import ErrorHandler, { ErrorInfo, RetryConfig, ErrorContext } from '@/lib/errorHandler';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

export interface UseAsyncResult<T> {
  execute: (...args: any[]) => Promise<T>;
  loading: boolean;
  error: ErrorInfo | null;
  reset: () => void;
  cancel: () => void;
  success: boolean;
  data: T | null;
}

export interface UseAsyncOptions<T> {
  context: ErrorContext;
  config?: RetryConfig;
  onSuccess?: (data: T, ...args: any[]) => void;
  onError?: (error: ErrorInfo) => void;
}

/**
 * Hook pour exécuter des opérations asynchrones avec gestion d'erreur robuste
 * et AbortController pour annulation avec cleanup functions robustes
 */
export function useAsync<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  options: UseAsyncOptions<ReturnType<T>>
): UseAsyncResult<ReturnType<T>> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<T | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanup = useCleanupRegistry('useAsync');

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController avec cleanup automatique
      abortControllerRef.current = cleanup.createAbortController(
        `execute-${Date.now()}`,
        'Async operation AbortController',
        'useAsync.execute'
      );

      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await ErrorHandler.executeWithRetry(
          () => operation(...args, abortControllerRef.current!.signal),
          options.context,
          options.config
        );

        setData(result);
        setSuccess(true);
        setError(null);

        if (options.onSuccess) {
          options.onSuccess(result, ...args);
        }

        return result;
      } catch (err) {
        // Ignorer les erreurs d'annulation
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }

        const errorInfo = err instanceof Error ? ErrorHandler.createErrorInfo(err, options.context) : err as ErrorInfo;
        setError(errorInfo);
        setSuccess(false);
        setData(null);

        if (options.onError) {
          options.onError(errorInfo);
        }

        throw errorInfo;
      } finally {
        setLoading(false);
      }
    },
    [operation, options, cleanup]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setData(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { execute, loading, error, reset, cancel, success, data };
}

/**
 * Hook pour les opérations en batch avec AbortController et cleanup robuste
 */
export function useBatchAsync<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  options: UseAsyncOptions<any[]> & { batchSize?: number }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanup = useCleanupRegistry('useBatchAsync');

  const executeBatch = useCallback(
    async (items: any[][]): Promise<any[]> => {
      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController avec cleanup automatique
      abortControllerRef.current = cleanup.createAbortController(
        `batch-${Date.now()}`,
        'Batch async operation AbortController',
        'useBatchAsync.executeBatch'
      );

      setLoading(true);
      setError(null);
      setResults([]);
      setSuccess(false);

      try {
        const operations = items.map(item => () => operation(...item, abortControllerRef.current!.signal));
        
        const batchResults = await ErrorHandler.executeBatch(
          operations,
          { ...options.context, operation: `${options.context.operation}_batch` },
          options.config
        );

        setResults(batchResults);
        setSuccess(true);
        return batchResults;
      } catch (err) {
        // Ignorer les erreurs d'annulation
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }

        const errorInfo = err instanceof Error ? ErrorHandler.createErrorInfo(err, options.context) : err as ErrorInfo;
        setError(errorInfo);
        setSuccess(false);

        if (options.onError) {
          options.onError(errorInfo);
        }

        throw errorInfo;
      } finally {
        setLoading(false);
      }
    },
    [operation, options, cleanup]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResults([]);
    setSuccess(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { executeBatch, loading, error, results, reset, cancel, success };
}

/**
 * Hook pour les opérations critiques avec monitoring et AbortController robuste
 */
export function useCriticalOperation<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  context: ErrorContext,
  config?: RetryConfig
) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanup = useCleanupRegistry('useCriticalOperation');

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController avec cleanup automatique
      abortControllerRef.current = cleanup.createAbortController(
        `critical-${Date.now()}`,
        'Critical operation AbortController',
        'useCriticalOperation.execute'
      );

      setStatus('loading');
      setError(null);

      try {
        const result = await ErrorHandler.executeWithRetry(
          () => operation(...args, abortControllerRef.current!.signal),
          context,
          {
            maxRetries: 5, // Plus de retries pour les opérations critiques
            baseDelay: 2000, // Délai plus long
            timeout: 60000, // Timeout plus long
            ...config,
          }
        );

        setLastResult(result);
        setStatus('success');
        return result;
      } catch (err) {
        // Ignorer les erreurs d'annulation
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('idle');
          throw err;
        }

        const errorInfo = err instanceof Error ? ErrorHandler.createErrorInfo(err, context) : err as ErrorInfo;
        setError(errorInfo);
        setStatus('error');
        
        // Log pour monitoring
        console.error('[CriticalOperation]', {
          context,
          error: errorInfo,
          timestamp: new Date().toISOString(),
        });

        throw errorInfo;
      }
    },
    [operation, context, config, cleanup]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setLastResult(null);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
  }, []);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    execute,
    status,
    lastResult,
    error,
    reset,
    cancel,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle',
  };
}

/**
 * Hook pour les opérations avec cache et retry avec AbortController robuste
 */
export function useCachedAsync<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  context: ErrorContext,
  config?: RetryConfig & { cacheKey?: string; ttl?: number }
) {
  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [success, setSuccess] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanup = useCleanupRegistry('useCachedAsync');

  const execute = useCallback(
    async (cacheKey: string, ...args: Parameters<T>): Promise<ReturnType<T>> => {
      // Vérifier le cache
      if (config?.ttl) {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < config.ttl) {
          return cached.data;
        }
      }

      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController avec cleanup automatique
      abortControllerRef.current = cleanup.createAbortController(
        `cached-${Date.now()}`,
        'Cached async operation AbortController',
        'useCachedAsync.execute'
      );

      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await ErrorHandler.executeWithRetry(
          () => operation(...args, abortControllerRef.current!.signal),
          { ...context, operation: `${context.operation}_${cacheKey}` },
          config
        );

        // Mettre en cache
        setCache(prev => new Map(prev).set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        }));

        setSuccess(true);
        return result;
      } catch (err) {
        // Ignorer les erreurs d'annulation
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }

        const errorInfo = err instanceof Error ? ErrorHandler.createErrorInfo(err, context) : err as ErrorInfo;
        setError(errorInfo);
        setSuccess(false);
        throw errorInfo;
      } finally {
        setLoading(false);
      }
    },
    [operation, context, config, cache, cleanup]
  );

  const clearCache = useCallback((key?: string) => {
    if (key) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
    } else {
      setCache(new Map());
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    clearCache();
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [clearCache]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { execute, loading, error, clearCache, reset, cancel, success, cache };
}

export default useAsync;