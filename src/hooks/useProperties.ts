import { useQuery, useMutation, useQueryClient, useInfiniteQuery, useQueryKeySerializer } from '@tanstack/react-query';
import { useCallback, useMemo, useRef } from 'react';
import { propertyRepository } from '../api/repositories';
import { useHttp } from './useHttp';
import { useSupabase } from './useSupabase';
import { useDebounce, DEBOUNCE_DELAYS } from './useDebounce';
import type { Database } from '@/shared/lib/database.types';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

// Configuration React Query optimisée
const PROPERTIES_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: 'always',
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  networkMode: 'online',
} as const;

// Hook optimisé pour les propriétés avec filtres et pagination
export function useProperties(filters?: any, options?: any) {
  const queryKey = useQueryKeySerializer(['properties', filters]);
  
  return useQuery({
    queryKey,
    queryFn: () => propertyRepository.getAll(filters),
    ...PROPERTIES_QUERY_CONFIG,
    ...options,
  });
}

// Hook avec debouncing pour la recherche de propriétés en temps réel
export function useDebouncedProperties(
  filters?: any, 
  searchQuery: string = '', 
  options?: any
) {
  // Débouncer la requête de recherche (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  
  // Construire les filtres finaux avec la requête débouncée
  const finalFilters = useMemo(() => ({
    ...filters,
    searchQuery: debouncedSearchQuery,
  }), [filters, debouncedSearchQuery]);

  const queryKey = useQueryKeySerializer(['properties', 'debounced', finalFilters]);

  return useQuery({
    queryKey,
    queryFn: () => propertyRepository.getAll(finalFilters),
    enabled: !!debouncedSearchQuery || Object.keys(filters || {}).length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes pour les recherches débouncées
    gcTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
}

// Hook pour les filtres de recherche avec debouncing (500ms)
export function useDebouncedPropertyFilters(
  initialFilters?: any,
  onFiltersChange?: (filters: any) => void,
  options?: any
) {
  const [filters, setFilters] = useState<any>(initialFilters || {});
  const [debouncedFilters, setDebouncedFilters] = useState<any>(initialFilters || {});

  // Débouncer les changements de filtres
  const debouncedSetFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setTimeout(() => {
      setDebouncedFilters(newFilters);
      onFiltersChange?.(newFilters);
    }, DEBOUNCE_DELAYS.FILTERS);
  }, [onFiltersChange]);

  const updateFilters = useCallback((updates: any) => {
    const newFilters = { ...filters, ...updates };
    debouncedSetFilters(newFilters);
  }, [filters, debouncedSetFilters]);

  const resetFilters = useCallback(() => {
    const resetFilters = initialFilters || {};
    debouncedSetFilters(resetFilters);
  }, [initialFilters, debouncedSetFilters]);

  return {
    filters,
    debouncedFilters,
    updateFilters,
    resetFilters,
    hasChanges: JSON.stringify(filters) !== JSON.stringify(debouncedFilters),
  };
}

// Hook avec pagination infinie pour de meilleures performances
export function useInfiniteProperties(filters?: any, options?: any) {
  return useInfiniteQuery({
    queryKey: ['properties', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      propertyRepository.getAll({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data?.hasNext) return undefined;
      return (lastPage.data.currentPage || 0) + 1;
    },
    initialPageParam: 1,
    ...PROPERTIES_QUERY_CONFIG,
    ...options,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => (id ? propertyRepository.getById(id) : Promise.resolve({ data: null, error: null })),
    enabled: !!id,
    ...PROPERTIES_QUERY_CONFIG,
    staleTime: 1000 * 60 * 10, // 10 minutes pour une propriété spécifique
  });
}

export function useOwnerProperties(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['properties', 'owner', ownerId],
    queryFn: () =>
      ownerId
        ? propertyRepository.getByOwnerId(ownerId)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!ownerId,
    ...PROPERTIES_QUERY_CONFIG,
  });
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => propertyRepository.getFeatured(),
    ...PROPERTIES_QUERY_CONFIG,
    staleTime: 1000 * 60 * 15, // 15 minutes pour les propriétés en vedette
  });
}

// Hook optimisé pour les mutations avec optimistic updates
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (property: PropertyInsert) => propertyRepository.create(property),
    onMutate: async (newProperty) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      
      const previousProperties = queryClient.getQueryData(['properties']);
      
      queryClient.setQueryData(['properties'], (old: any) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: [newProperty, ...old.data.data],
            totalCount: (old.data.totalCount || 0) + 1,
          }
        };
      });

      return { previousProperties };
    },
    onError: (err, newProperty, context) => {
      // Rollback on error
      queryClient.setQueryData(['properties'], context?.previousProperties);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PropertyUpdate }) =>
      propertyRepository.update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['property', id] });
      
      const previousProperty = queryClient.getQueryData(['property', id]);
      
      queryClient.setQueryData(['property', id], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, ...updates },
        };
      });

      return { previousProperty };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['property', id], context?.previousProperty);
    },
    onSuccess: (data) => {
      if (data.data) {
        queryClient.setQueryData(['property', data.data.id], data);
        queryClient.invalidateQueries({ queryKey: ['properties'] });
      }
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property', data?.data?.id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertyRepository.delete(id),
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      
      const previousProperties = queryClient.getQueryData(['properties']);
      
      queryClient.setQueryData(['properties'], (old: any) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.filter((p: any) => p.id !== id),
            totalCount: Math.max(0, (old.data.totalCount || 1) - 1),
          }
        };
      });

      return { previousProperties };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['properties'], context?.previousProperties);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.removeQueries({ queryKey: ['property'] });
    },
  });
}

export function useIncrementPropertyViews() {
  const queryClient = useQueryClient();
  const lastViewTime = useRef<Map<string, number>>(new Map());

  return useMutation({
    mutationFn: (propertyId: string) => {
      const now = Date.now();
      const lastView = lastViewTime.current.get(propertyId) || 0;
      
      // Limiter à une vue par minute par propriété
      if (now - lastView < 60000) {
        return Promise.resolve({ data: null, error: null });
      }
      
      lastViewTime.current.set(propertyId, now);
      return propertyRepository.incrementViewCount(propertyId);
    },
    onSuccess: (data, propertyId) => {
      // Mise à jour optimiste du compteur de vues
      queryClient.setQueryData(['property', propertyId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            view_count: (old.data.view_count || 0) + 1,
          },
        };
      });
    },
  });
}

// ============================================================================
// HOOKS SÉCURISÉS OPTIMISÉS AVEC ABORTCONTROLLER
// ============================================================================

/**
 * Hook sécurisé pour récupérer les propriétés avec AbortController et caching
 */
export function useSecureProperties(filters?: any) {
  const { loading, error, success, data, execute, cancel, reset } = useHttp();
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

  const fetchProperties = useCallback(async (fetchFilters = filters) => {
    try {
      const cacheKey = JSON.stringify(fetchFilters);
      const cached = cacheRef.current.get(cacheKey);
      
      // Utiliser le cache si valide
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const queryParams = new URLSearchParams();
      if (fetchFilters?.search) {
        queryParams.append('search', fetchFilters.search);
      }
      if (fetchFilters?.city) {
        queryParams.append('city', fetchFilters.city);
      }
      if (fetchFilters?.priceMin) {
        queryParams.append('price_min', fetchFilters.priceMin.toString());
      }
      if (fetchFilters?.priceMax) {
        queryParams.append('price_max', fetchFilters.priceMax.toString());
      }
      if (fetchFilters?.type) {
        queryParams.append('type', fetchFilters.type);
      }

      const url = `/api/properties?${queryParams.toString()}`;
      const response = await execute(url);
      
      // Mettre en cache
      const result = response?.data || [];
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés:', error);
      return [];
    }
  }, [execute, filters]);

  // Memoized properties pour éviter les recalculs inutiles
  const memoizedProperties = useMemo(() => {
    return data as any[] || [];
  }, [data]);

  // Clear cache périodique
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    properties: memoizedProperties,
    loading,
    error,
    success,
    fetchProperties,
    cancel,
    reset,
    clearCache,
  };
}

/**
 * Hook sécurisé pour une propriété avec AbortController et cache
 */
export function useSecureProperty(id: string | undefined) {
  const { loading, error, success, data, execute, cancel, reset } = useHttp();
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

  const fetchProperty = useCallback(async () => {
    if (!id) return null;
    
    const cacheKey = `property-${id}`;
    const cached = cacheRef.current.get(cacheKey);
    
    // Utiliser le cache si valide
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    try {
      const response = await execute(`/api/properties/${id}`);
      
      // Mettre en cache
      const result = response?.data || null;
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération de la propriété:', error);
      return null;
    }
  }, [execute, id]);

  // Memoized property
  const memoizedProperty = useMemo(() => {
    return data as any || null;
  }, [data]);

  const clearCache = useCallback(() => {
    if (id) {
      cacheRef.current.delete(`property-${id}`);
    }
  }, [id]);

  return {
    property: memoizedProperty,
    loading,
    error,
    success,
    fetchProperty,
    cancel,
    reset,
    clearCache,
  };
}

/**
 * Hook sécurisé pour les propriétés d'un propriétaire avec AbortController et cache
 */
export function useSecureOwnerProperties(ownerId: string | undefined) {
  const { loading, error, success, data, execute, cancel, reset } = useHttp();
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

  const fetchOwnerProperties = useCallback(async () => {
    if (!ownerId) return [];
    
    const cacheKey = `owner-${ownerId}`;
    const cached = cacheRef.current.get(cacheKey);
    
    // Utiliser le cache si valide
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    try {
      const response = await execute(`/api/properties/owner/${ownerId}`);
      
      // Mettre en cache
      const result = response?.data || [];
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés du propriétaire:', error);
      return [];
    }
  }, [execute, ownerId]);

  // Memoized properties
  const memoizedProperties = useMemo(() => {
    return data as any[] || [];
  }, [data]);

  const clearCache = useCallback(() => {
    if (ownerId) {
      cacheRef.current.delete(`owner-${ownerId}`);
    }
  }, [ownerId]);

  return {
    properties: memoizedProperties,
    loading,
    error,
    success,
    fetchOwnerProperties,
    cancel,
    reset,
    clearCache,
  };
}

/**
 * Hook sécurisé pour les propriétés mises en avant avec AbortController et cache long
 */
export function useSecureFeaturedProperties() {
  const { loading, error, success, data, execute, cancel, reset } = useHttp();
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

  const fetchFeaturedProperties = useCallback(async () => {
    const cacheKey = 'featured';
    const cached = cacheRef.current.get(cacheKey);
    
    // Utiliser le cache si valide
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    try {
      const response = await execute('/api/properties/featured');
      
      // Mettre en cache
      const result = response?.data || [];
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés mises en avant:', error);
      return [];
    }
  }, [execute]);

  // Memoized properties
  const memoizedProperties = useMemo(() => {
    return data as any[] || [];
  }, [data]);

  const clearCache = useCallback(() => {
    cacheRef.current.delete('featured');
  }, []);

  return {
    properties: memoizedProperties,
    loading,
    error,
    success,
    fetchFeaturedProperties,
    cancel,
    reset,
    clearCache,
  };
}

/**
 * Hook sécurisé pour créer une propriété avec AbortController et validation
 */
export function useSecureCreateProperty() {
  const { loading, error, success, data, request, cancel, reset } = useHttp();

  const createProperty = useCallback(async (propertyData: any) => {
    try {
      // Validation côté client
      if (!propertyData?.title || !propertyData?.price) {
        throw new Error('Données de propriété incomplètes');
      }

      const response = await request('/api/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 secondes pour l'upload d'images
      });
      
      return response?.data;
    } catch (error) {
      console.error('Erreur lors de la création de la propriété:', error);
      throw error;
    }
  }, [request]);

  // Memoized property
  const memoizedProperty = useMemo(() => {
    return data as any || null;
  }, [data]);

  return {
    createdProperty: memoizedProperty,
    loading,
    error,
    success,
    createProperty,
    cancel,
    reset,
  };
}
