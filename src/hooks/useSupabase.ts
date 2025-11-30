import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Configuration pour les requêtes Supabase
 */
export interface SupabaseConfig {
  table?: string;
  select?: string;
  filter?: string;
  order?: string;
  limit?: number;
  signal?: AbortSignal;
}

/**
 * Résultat d'une requête Supabase
 */
export interface SupabaseResult<T = any> {
  data: T | null;
  error: PostgrestError | null;
  count?: number | null;
}

/**
 * État d'une requête Supabase
 */
export interface SupabaseState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  count?: number | null;
}

/**
 * Actions pour les requêtes Supabase
 */
export interface SupabaseActions {
  query: <T = any>(config: SupabaseConfig) => Promise<SupabaseResult<T>>;
  get: <T = any>(table: string, id: string, select?: string) => Promise<SupabaseResult<T>>;
  select: <T = any>(table: string, select?: string, filter?: string) => Promise<SupabaseResult<T[]>>;
  insert: <T = any>(table: string, data: any) => Promise<SupabaseResult<T>>;
  update: <T = any>(table: string, id: string, data: any) => Promise<SupabaseResult<T>>;
  delete: <T = any>(table: string, id: string) => Promise<SupabaseResult<T>>;
  upsert: <T = any>(table: string, data: any) => Promise<SupabaseResult<T>>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Hook pour les requêtes Supabase sécurisées avec AbortController
 */
export function useSupabase(): SupabaseState<any> & SupabaseActions {
  const [state, setState] = useState<SupabaseState<any>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fonction générique pour les requêtes Supabase
   */
  const query = useCallback(async <T = any>(config: SupabaseConfig): Promise<SupabaseResult<T>> => {
    const { table, signal: externalSignal, ...queryConfig } = config;

    if (!table) {
      throw new Error('Le nom de la table est requis');
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController();

    // Fusionner les signaux
    const finalSignal = externalSignal 
      ? AbortSignal.any([abortControllerRef.current.signal, externalSignal])
      : abortControllerRef.current.signal;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      let queryBuilder = supabase.from(table);

      // Appliquer la sélection
      if (queryConfig.select) {
        queryBuilder = queryBuilder.select(queryConfig.select);
      } else {
        queryBuilder = queryBuilder.select('*');
      }

      // Appliquer les filtres
      if (queryConfig.filter) {
        queryBuilder = queryBuilder.filter(queryConfig.filter.split(',')[0], 'eq', queryConfig.filter.split(',')[1]);
      }

      // Appliquer l'ordre
      if (queryConfig.order) {
        const [column, direction] = queryConfig.order.split(':');
        queryBuilder = queryBuilder.order(column, { ascending: direction !== 'desc' });
      }

      // Appliquer la limite
      if (queryConfig.limit) {
        queryBuilder = queryBuilder.limit(queryConfig.limit);
      }

      // Exécuter la requête avec timeout
      const result = await Promise.race([
        queryBuilder,
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout de requête Supabase')), 30000);
        })
      ]);

      setState(prev => ({
        ...prev,
        data: result.data,
        loading: false,
        success: !result.error,
        error: result.error ? result.error.message : null,
      }));

      return result as SupabaseResult<T>;
    } catch (error: any) {
      // Ignorer les erreurs d'annulation
      if (error.name === 'AbortError') {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la requête Supabase';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
      }));

      return {
        data: null,
        error: {
          message: errorMessage,
          details: error instanceof Error ? error.stack : String(error),
          hint: '',
          code: 'SUPABASE_ERROR',
        } as PostgrestError,
      };
    }
  }, []);

  /**
   * Méthodes Supabase shorthand
   */
  const get = useCallback(<T = any>(
    table: string, 
    id: string, 
    select?: string
  ): Promise<SupabaseResult<T>> => {
    return query<T>({
      table,
      select: select || '*',
      filter: `id,eq,${id}`,
      limit: 1,
    });
  }, [query]);

  const select = useCallback(<T = any>(
    table: string, 
    select?: string, 
    filter?: string
  ): Promise<SupabaseResult<T[]>> => {
    return query<T[]>({
      table,
      select: select || '*',
      filter,
    });
  }, [query]);

  const insert = useCallback(<T = any>(
    table: string, 
    data: any
  ): Promise<SupabaseResult<T>> => {
    return query<T>({
      table,
    });
  }, [query]);

  /**
   * Implémentation simplifiée pour l'insert
   */
  const executeInsert = useCallback(async <T = any>(
    table: string, 
    insertData: any
  ): Promise<SupabaseResult<T>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from(table)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        success: true,
        error: null,
      }));

      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'insertion';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
      }));

      return {
        data: null,
        error: {
          message: errorMessage,
          details: error instanceof Error ? error.stack : String(error),
          hint: '',
          code: 'SUPABASE_INSERT_ERROR',
        } as PostgrestError,
      };
    }
  }, []);

  const update = useCallback(<T = any>(
    table: string, 
    id: string, 
    updateData: any
  ): Promise<SupabaseResult<T>> => {
    return executeInsert(table, { ...updateData, id });
  }, [executeInsert]);

  const del = useCallback(async <T = any>(
    table: string, 
    id: string
  ): Promise<SupabaseResult<T>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        error: null,
      }));

      return { data: null as any, error: null };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
      }));

      return {
        data: null,
        error: {
          message: errorMessage,
          details: error instanceof Error ? error.stack : String(error),
          hint: '',
          code: 'SUPABASE_DELETE_ERROR',
        } as PostgrestError,
      };
    }
  }, []);

  const upsert = useCallback(async <T = any>(
    table: string, 
    upsertData: any
  ): Promise<SupabaseResult<T>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from(table)
        .upsert(upsertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        success: true,
        error: null,
      }));

      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upsert';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
      }));

      return {
        data: null,
        error: {
          message: errorMessage,
          details: error instanceof Error ? error.stack : String(error),
          hint: '',
          code: 'SUPABASE_UPSERT_ERROR',
        } as PostgrestError,
      };
    }
  }, []);

  /**
   * Annuler la requête en cours
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
    });
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
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
    ...state,
    query,
    get,
    select,
    insert: executeInsert,
    update,
    delete: del,
    upsert,
    cancel,
    reset,
  };
}

/**
 * Hook spécialisé pour les queries Supabase avec auto-exécution
 */
export function useSupabaseQuery<T = any>(
  queryFn: (signal: AbortSignal) => Promise<SupabaseResult<T>>,
  enabled: boolean = true
) {
  const [state, setState] = useState<SupabaseState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController
      abortControllerRef.current = new AbortController();

      const result = await queryFn(abortControllerRef.current.signal);

      setState(prev => ({
        ...prev,
        data: result.data,
        loading: false,
        success: !result.error,
        error: result.error ? result.error.message : null,
      }));

      return result;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la requête Supabase';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
      }));
    }
  }, [queryFn, enabled]);

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