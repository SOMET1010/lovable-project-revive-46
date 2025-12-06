import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyWithScore = Property & {
  owner_trust_score?: number | null;
  owner_full_name?: string | null;
};

interface UseInfinitePropertiesOptions {
  city?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  sortBy?: 'recent' | 'price_asc' | 'price_desc';
  pageSize?: number;
}

interface UseInfinitePropertiesResult {
  properties: PropertyWithScore[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalCount: number;
}

const DEFAULT_PAGE_SIZE = 20;

export function useInfiniteProperties(options: UseInfinitePropertiesOptions): UseInfinitePropertiesResult {
  const { city, propertyType, minPrice, maxPrice, bedrooms, sortBy = 'recent', pageSize = DEFAULT_PAGE_SIZE } = options;
  
  const [properties, setProperties] = useState<PropertyWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const pageRef = useRef(0);
  const filtersRef = useRef({ city, propertyType, minPrice, maxPrice, bedrooms, sortBy });

  const buildQuery = useCallback(() => {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'disponible');

    if (city?.trim()) {
      query = query.ilike('city', `%${city.trim()}%`);
    }
    if (propertyType?.trim()) {
      query = query.eq('property_type', propertyType.trim());
    }
    if (minPrice?.trim()) {
      const min = parseInt(minPrice, 10);
      if (!isNaN(min) && min >= 0) {
        query = query.gte('monthly_rent', min);
      }
    }
    if (maxPrice?.trim()) {
      const max = parseInt(maxPrice, 10);
      if (!isNaN(max) && max >= 0) {
        query = query.lte('monthly_rent', max);
      }
    }
    if (bedrooms?.trim()) {
      const beds = parseInt(bedrooms, 10);
      if (!isNaN(beds) && beds > 0) {
        query = query.eq('bedrooms', beds);
      }
    }

    return query;
  }, [city, propertyType, minPrice, maxPrice, bedrooms]);

  const enrichWithOwnerData = useCallback(async (data: Property[]): Promise<PropertyWithScore[]> => {
    const ownerIds = data
      .map(p => p.owner_id)
      .filter((id): id is string => id !== null);
    
    const uniqueOwnerIds = [...new Set(ownerIds)];
    
    if (uniqueOwnerIds.length === 0) {
      return data.map(p => ({ ...p, owner_trust_score: null, owner_full_name: null }));
    }

    const { data: profilesData } = await supabase.rpc('get_public_profiles', {
      profile_user_ids: uniqueOwnerIds
    });

    const ownerProfiles = new Map<string, { trust_score: number | null; full_name: string | null }>();
    (profilesData || []).forEach((profile: { user_id: string; trust_score: number | null; full_name: string | null }) => {
      ownerProfiles.set(profile.user_id, {
        trust_score: profile.trust_score,
        full_name: profile.full_name
      });
    });

    return data.map(p => {
      const owner = p.owner_id ? ownerProfiles.get(p.owner_id) : null;
      return {
        ...p,
        owner_trust_score: owner?.trust_score ?? null,
        owner_full_name: owner?.full_name ?? null,
      };
    });
  }, []);

  const fetchProperties = useCallback(async (page: number, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const query = buildQuery();
      const orderColumn = sortBy === 'price_asc' || sortBy === 'price_desc' ? 'monthly_rent' : 'created_at';
      const ascending = sortBy === 'price_asc';
      const { data, error: queryError, count } = await query
        .order(orderColumn, { ascending })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (queryError) {
        // Handle 416 Range Not Satisfiable as end of data, not an error
        if (queryError.code === 'PGRST103' || queryError.message?.includes('416')) {
          setHasMore(false);
          setLoadingMore(false);
          setLoading(false);
          return;
        }
        
        // Clean error message for user display
        const cleanMessage = typeof queryError.message === 'string' && queryError.message.trim().length > 5
          ? queryError.message
          : 'Erreur lors du chargement des propriétés';
        throw new Error(cleanMessage);
      }

      const enrichedData = await enrichWithOwnerData(data || []);
      const currentTotal = count || 0;
      
      if (isLoadMore) {
        setProperties(prev => {
          const newTotal = prev.length + enrichedData.length;
          // Update hasMore based on actual fetched count vs total
          setHasMore(newTotal < currentTotal && enrichedData.length === pageSize);
          return [...prev, ...enrichedData];
        });
      } else {
        setProperties(enrichedData);
        setTotalCount(currentTotal);
        setHasMore(enrichedData.length < currentTotal && enrichedData.length === pageSize);
      }

      pageRef.current = page;
    } catch (err) {
      // Validate error message before displaying
      let message = 'Erreur lors du chargement';
      if (err instanceof Error && err.message && err.message.length > 2 && !err.message.startsWith('{')) {
        message = err.message;
      }
      setError(message);
      if (!isLoadMore) {
        setProperties([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQuery, enrichWithOwnerData, pageSize, sortBy]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchProperties(pageRef.current + 1, true);
  }, [fetchProperties, loadingMore, hasMore]);

  const refresh = useCallback(async () => {
    pageRef.current = 0;
    setHasMore(true);
    await fetchProperties(0, false);
  }, [fetchProperties]);

  // Reset and refetch when filters or sort change
  useEffect(() => {
    const filtersChanged = 
      filtersRef.current.city !== city ||
      filtersRef.current.propertyType !== propertyType ||
      filtersRef.current.minPrice !== minPrice ||
      filtersRef.current.maxPrice !== maxPrice ||
      filtersRef.current.bedrooms !== bedrooms ||
      filtersRef.current.sortBy !== sortBy;

    if (filtersChanged) {
      filtersRef.current = { city, propertyType, minPrice, maxPrice, bedrooms, sortBy };
      pageRef.current = 0;
      setHasMore(true);
      fetchProperties(0, false);
    }
  }, [city, propertyType, minPrice, maxPrice, bedrooms, sortBy, fetchProperties]);

  // Initial load
  useEffect(() => {
    fetchProperties(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    properties,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount,
  };
}
