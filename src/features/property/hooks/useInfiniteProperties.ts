/**
 * Hook pour le chargement infini de propriétés avec pagination et cache
 *
 * Fonctionnalités :
 * - Infinite scroll automatique
 * - Cache localStorage avec TTL
 * - Préchargement des pages suivantes
 * - Gestion optimiste des données
 * - Support des filtres
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import { cacheService } from '@/shared/services/cacheService';

type Property = Database['public']['Tables']['properties']['Row'];

interface UseInfinitePropertiesOptions {
  pageSize?: number;
  enabled?: boolean;
  filters?: {
    city?: string;
    propertyType?: string;
    propertyCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    isFurnished?: boolean | null;
    hasParking?: boolean | null;
    hasAC?: boolean | null;
  };
  cacheTTL?: number; // en minutes
  enableCache?: boolean;
}

interface UseInfinitePropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  total: number | null;
  currentPage: number;
  totalPages: number;
  isLoadingMore: boolean;
}

export function useInfiniteProperties(
  options: UseInfinitePropertiesOptions = {}
): UseInfinitePropertiesReturn {
  const {
    pageSize = 20,
    enabled = true,
    filters = {},
    cacheTTL = 5,
    enableCache = true
  } = options;

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);

  // Générer une clé de cache basée sur les filtres
  const getCacheKey = useCallback((page: number) => {
    const filterKey = JSON.stringify(filters);
    return `properties_page_${page}_${filterKey}`;
  }, [filters]);

  // Charger le count total
  const loadTotal = useCallback(async () => {
    try {
      let query = supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'disponible');

      // Appliquer les filtres
      if (filters.propertyCategory) {
        query = query.eq('property_category', filters.propertyCategory);
      } else {
        query = query.eq('property_category', 'residentiel');
      }

      if (filters.city) {
        query = query.or(`city.ilike.%${filters.city}%,neighborhood.ilike.%${filters.city}%`);
      }

      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters.minPrice) {
        query = query.gte('monthly_rent', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('monthly_rent', filters.maxPrice);
      }

      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }

      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }

      if (filters.isFurnished !== null && filters.isFurnished !== undefined) {
        query = query.eq('is_furnished', filters.isFurnished);
      }

      if (filters.hasParking !== null && filters.hasParking !== undefined) {
        query = query.eq('has_parking', filters.hasParking);
      }

      if (filters.hasAC !== null && filters.hasAC !== undefined) {
        query = query.eq('has_ac', filters.hasAC);
      }

      const { count, error: countError } = await query;

      if (countError) throw countError;

      setTotal(count);
    } catch (err) {
      console.error('Error loading total count:', err);
    }
  }, [filters]);

  // Charger une page de propriétés
  const loadPage = useCallback(async (page: number, append: boolean = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    const isFirstLoad = page === 0 && !append;

    if (isFirstLoad) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    setError(null);

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Vérifier le cache d'abord
      const cacheKey = getCacheKey(page);
      if (enableCache) {
        const cached = cacheService.get<Property[]>(cacheKey);
        if (cached) {
          if (append) {
            setProperties(prev => [...prev, ...cached]);
          } else {
            setProperties(cached);
          }
          setHasMore(cached.length === pageSize);
          setCurrentPage(page);
          setLoading(false);
          setIsLoadingMore(false);
          loadingRef.current = false;
          return;
        }
      }

      // Construire la requête
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible');

      // Appliquer les filtres
      if (filters.propertyCategory) {
        query = query.eq('property_category', filters.propertyCategory);
      } else {
        query = query.eq('property_category', 'residentiel');
      }

      if (filters.city && filters.city.trim() !== '' && filters.city !== 'Toutes les villes') {
        query = query.or(`city.ilike.%${filters.city}%,neighborhood.ilike.%${filters.city}%`);
      }

      if (filters.propertyType && filters.propertyType.trim() !== '') {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters.minPrice && filters.minPrice > 0) {
        query = query.gte('monthly_rent', filters.minPrice);
      }

      if (filters.maxPrice && filters.maxPrice > 0) {
        query = query.lte('monthly_rent', filters.maxPrice);
      }

      if (filters.bedrooms && filters.bedrooms > 0) {
        query = query.gte('bedrooms', filters.bedrooms);
      }

      if (filters.bathrooms && filters.bathrooms > 0) {
        query = query.gte('bathrooms', filters.bathrooms);
      }

      if (filters.isFurnished !== null && filters.isFurnished !== undefined) {
        query = query.eq('is_furnished', filters.isFurnished);
      }

      if (filters.hasParking !== null && filters.hasParking !== undefined) {
        query = query.eq('has_parking', filters.hasParking);
      }

      if (filters.hasAC !== null && filters.hasAC !== undefined) {
        query = query.eq('has_ac', filters.hasAC);
      }

      // Pagination
      query = query
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const newProperties = data || [];

      // Sauvegarder dans le cache
      if (enableCache && newProperties.length > 0) {
        cacheService.set(cacheKey, newProperties, cacheTTL);
      }

      // Mettre à jour l'état
      if (append) {
        setProperties(prev => [...prev, ...newProperties]);
      } else {
        setProperties(newProperties);
      }

      setHasMore(newProperties.length === pageSize);
      setCurrentPage(page);

      // Précharger la page suivante
      if (newProperties.length === pageSize) {
        setTimeout(() => {
          const nextCacheKey = getCacheKey(page + 1);
          if (!cacheService.has(nextCacheKey)) {
            // Précharger silencieusement
            loadPage(page + 1, false).catch(() => {
              // Ignorer les erreurs de préchargement
            });
          }
        }, 1000);
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error loading properties:', err);
        setError(err);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [filters, pageSize, getCacheKey, enableCache, cacheTTL]);

  // Charger plus de propriétés
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;
    await loadPage(currentPage + 1, true);
  }, [currentPage, hasMore, loadPage]);

  // Rafraîchir les données
  const refresh = useCallback(async () => {
    // Invalider le cache
    if (enableCache) {
      cacheService.invalidatePattern('properties_page_');
    }

    setCurrentPage(0);
    setHasMore(true);
    await Promise.all([
      loadPage(0, false),
      loadTotal()
    ]);
  }, [loadPage, loadTotal, enableCache]);

  // Chargement initial
  useEffect(() => {
    if (!enabled) return;

    setCurrentPage(0);
    setHasMore(true);

    Promise.all([
      loadPage(0, false),
      loadTotal()
    ]);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, filters, loadPage, loadTotal]);

  // Calculer le nombre total de pages
  const totalPages = total ? Math.ceil(total / pageSize) : 0;

  return {
    properties,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
    currentPage,
    totalPages,
    isLoadingMore
  };
}
