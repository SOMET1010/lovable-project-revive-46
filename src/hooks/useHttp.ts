/**
 * Hook pour les requêtes HTTP sécurisées avec AbortController
 * Avec cleanup functions robustes et monitoring des fuites de mémoire
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAsync } from './useAsync';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';
import type { ErrorInfo } from '@/lib/errorHandler';

/**
 * Configuration pour les requêtes HTTP
 */
export interface HttpConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  baseDelay?: number;
  signal?: AbortSignal;
}

/**
 * Résultat d'une requête HTTP
 */
export interface HttpResult<T = any> {
  data: T | null;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * État d'une requête HTTP
 */
export interface HttpState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  status: number | null;
  statusText: string | null;
  response: HttpResult<T> | null;
}

/**
 * Actions pour les requêtes HTTP
 */
export interface HttpActions {
  request: <T = any>(url: string, options?: RequestInit & HttpConfig) => Promise<HttpResult<T>>;
  get: <T = any>(url: string, config?: HttpConfig) => Promise<HttpResult<T>>;
  post: <T = any>(url: string, body?: any, config?: HttpConfig) => Promise<HttpResult<T>>;
  put: <T = any>(url: string, body?: any, config?: HttpConfig) => Promise<HttpResult<T>>;
  patch: <T = any>(url: string, body?: any, config?: HttpConfig) => Promise<HttpResult<T>>;
  delete: <T = any>(url: string, config?: HttpConfig) => Promise<HttpResult<T>>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Hook pour les requêtes HTTP sécurisées avec AbortController et cleanup robuste
 */
export function useHttp(): HttpState<any> & HttpActions {
  const [state, setState] = useState<HttpState<any>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    status: null,
    statusText: null,
    response: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanup = useCleanupRegistry('useHttp');

  /**
   * Fonction générique pour les requêtes HTTP
   */
  const request = useCallback(async <T = any>(
    url: string, 
    options: RequestInit & HttpConfig = {}
  ): Promise<HttpResult<T>> => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau AbortController avec cleanup automatique
    abortControllerRef.current = cleanup.createAbortController(
      `http-request-${Date.now()}`,
      'HTTP request AbortController',
      'useHttp.request'
    );

    // Fusionner les options
    const {
      headers = {},
      timeout = 30000,
      retries = 0,
      signal: externalSignal,
      ...fetchOptions
    } = options;

    // Construire les headers
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Créer le signal d'abort avec timeout
    const combinedSignal = AbortSignal.timeout(timeout);
    
    // Fusionner avec le signal externe si fourni
    const finalSignal = externalSignal 
      ? AbortSignal.any([combinedSignal, externalSignal])
      : combinedSignal;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
      status: null,
      statusText: null,
    }));

    // Fonction de retry
    const executeRequest = async (attempt: number = 0): Promise<HttpResult<T>> => {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: requestHeaders,
          signal: finalSignal,
        });

        const result: HttpResult<T> = {
          data: null,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        };

        // Parser le corps de la réponse
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          result.data = await response.json();
        } else {
          result.data = await response.text() as any;
        }

        setState(prev => ({
          ...prev,
          data: result.data,
          loading: false,
          success: response.ok,
          error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
          response: result,
        }));

        return result;
      } catch (error: any) {
        // Ignorer les erreurs d'annulation
        if (error.name === 'AbortError') {
          throw error;
        }

        // Gérer les timeouts
        if (error.name === 'TimeoutError') {
          const timeoutError = new Error(`Requête timeout après ${timeout}ms`);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
            return executeRequest(attempt + 1);
          }
          throw timeoutError;
        }

        // Retry pour les erreurs réseau
        if (attempt < retries && !error.name?.includes('AbortError')) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
          return executeRequest(attempt + 1);
        }

        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la requête HTTP';
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
        }));

        throw error;
      }
    };

    try {
      const result = await executeRequest();
      return result;
    } catch (error: any) {
      // Ignorer les erreurs d'annulation lors du retry
      if (error.name === 'AbortError') {
        throw error;
      }
      throw error;
    }
  }, [cleanup]);

  /**
   * Méthodes HTTP shorthand
   */
  const get = useCallback(<T = any>(url: string, config?: HttpConfig): Promise<HttpResult<T>> => {
    return request<T>(url, { ...config, method: 'GET' });
  }, [request]);

  const post = useCallback(<T = any>(
    url: string, 
    body?: any, 
    config?: HttpConfig
  ): Promise<HttpResult<T>> => {
    return request<T>(url, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }, [request]);

  const put = useCallback(<T = any>(
    url: string, 
    body?: any, 
    config?: HttpConfig
  ): Promise<HttpResult<T>> => {
    return request<T>(url, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }, [request]);

  const patch = useCallback(<T = any>(
    url: string, 
    body?: any, 
    config?: HttpConfig
  ): Promise<HttpResult<T>> => {
    return request<T>(url, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }, [request]);

  const del = useCallback(<T = any>(url: string, config?: HttpConfig): Promise<HttpResult<T>> => {
    return request<T>(url, { ...config, method: 'DELETE' });
  }, [request]);

  /**
   * Annuler la requête en cours
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState(prev => ({
      ...prev,
      loading: false,
    }));
  }, []);

  /**
   * Reset de l'état
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      status: null,
      statusText: null,
      response: null,
    });
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    cancel,
    reset,
  };
}

/**
 * Hook spécialisé pour les requêtes avec React Query-like API et cleanup robuste
 */
export function useHttpQuery<T = any>(
  url: string | null,
  config: HttpConfig & { enabled?: boolean } = {}
) {
  const [state, setState] = useState<HttpState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    status: null,
    statusText: null,
    response: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { enabled = true, ...requestConfig } = config;
  const cleanup = useCleanupRegistry('useHttpQuery');

  const execute = useCallback(async () => {
    if (!url || !enabled) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController avec cleanup automatique
      abortControllerRef.current = cleanup.createAbortController(
        `query-${Date.now()}`,
        'HTTP query AbortController',
        'useHttpQuery.execute'
      );

      const response = await fetch(url, {
        ...requestConfig,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json') 
        ? await response.json() 
        : await response.text();

      setState({
        data,
        loading: false,
        error: null,
        success: true,
        status: response.status,
        statusText: response.statusText,
        response: {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        },
      });

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la requête',
        success: false,
      }));
    }
  }, [url, enabled, requestConfig, cleanup]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  // Exécuter automatiquement si enabled
  useEffect(() => {
    execute();
  }, [execute]);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    cancel,
    refetch,
  };
}