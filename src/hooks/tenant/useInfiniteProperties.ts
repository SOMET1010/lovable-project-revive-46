import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyWithScore = Property & {
  owner_trust_score?: number | null;
  owner_full_name?: string | null;
  owner_is_verified?: boolean | null;
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

export function useInfiniteProperties(
  options: UseInfinitePropertiesOptions
): UseInfinitePropertiesResult {
  const {
    city,
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    sortBy = 'recent',
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  const [properties, setProperties] = useState<PropertyWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
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
        query = query.gte('price', min);
      }
    }
    if (maxPrice?.trim()) {
      const max = parseInt(maxPrice, 10);
      if (!isNaN(max) && max >= 0) {
        query = query.lte('price', max);
      }
    }
    if (bedrooms?.trim()) {
      const beds = parseInt(bedrooms, 10);
      if (!isNaN(beds) && beds > 0) {
        query = query.eq('bedrooms_count', beds);
      }
    }

    return query;
  }, [city, propertyType, minPrice, maxPrice, bedrooms]);

  const enrichWithOwnerData = useCallback(
    async (data: Property[]): Promise<PropertyWithScore[]> => {
      const ownerIds = data.map((p) => p.owner_id).filter((id): id is string => id !== null);

      const uniqueOwnerIds = [...new Set(ownerIds)];

      if (uniqueOwnerIds.length === 0) {
        return data.map((p) => ({
          ...p,
          owner_trust_score: null,
          owner_full_name: null,
          owner_is_verified: null,
        }));
      }

      const { data: profilesData } = await supabase.rpc('get_public_profiles', {
        profile_user_ids: uniqueOwnerIds,
      });

      const ownerProfiles = new Map<
        string,
        { trust_score: number | null; full_name: string | null; is_verified: boolean | null }
      >();
      (profilesData || []).forEach(
        (profile: {
          user_id: string;
          trust_score: number | null;
          full_name: string | null;
          is_verified: boolean | null;
        }) => {
          ownerProfiles.set(profile.user_id, {
            trust_score: profile.trust_score,
            full_name: profile.full_name,
            is_verified: profile.is_verified,
          });
        }
      );

      return data.map((p) => {
        const owner = p.owner_id ? ownerProfiles.get(p.owner_id) : null;
        return {
          ...p,
          owner_trust_score: owner?.trust_score ?? null,
          owner_full_name: owner?.full_name ?? null,
          owner_is_verified: owner?.is_verified ?? null,
        };
      });
    },
    []
  );

  const fetchProperties = useCallback(
    async (page: number, isLoadMore = false) => {
      // Prevent concurrent calls
      if (loadingRef.current) return;
      loadingRef.current = true;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        // Récupérer les IDs des propriétaires vérifiés
        const { data: verifiedProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_verified', true);

        if (profilesError) throw profilesError;

        const verifiedOwnerIds = verifiedProfiles?.map((p) => p.id) || [];
        console.log('useInfiniteProperties: verifiedOwnerIds count', verifiedOwnerIds.length);

        let query = buildQuery();
        // Filtrer par propriétaires vérifiés si la liste n'est pas vide
        if (verifiedOwnerIds.length > 0) {
          query = query.in('owner_id', verifiedOwnerIds);
        } else {
          // Aucun propriétaire vérifié, donc aucune propriété à afficher
          console.log('useInfiniteProperties: aucun propriétaire vérifié');
          setProperties([]);
          setTotalCount(0);
          setHasMore(false);
          return;
        }

        const orderColumn =
          sortBy === 'price_asc' || sortBy === 'price_desc' ? 'price' : 'created_at';
        const ascending = sortBy === 'price_asc';
        const {
          data,
          error: queryError,
          count,
        } = await query
          .order(orderColumn, { ascending })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (queryError) {
          // Handle 416 Range Not Satisfiable as end of data, not an error
          if (queryError.code === 'PGRST103' || queryError.message?.includes('416')) {
            setHasMore(false);
            return;
          }

          // Clean error message for user display
          const cleanMessage =
            typeof queryError.message === 'string' && queryError.message.trim().length > 5
              ? queryError.message
              : 'Erreur lors du chargement des propriétés';
          throw new Error(cleanMessage);
        }

        const enrichedData = await enrichWithOwnerData(data || []);
        // Filtrer une seconde fois pour s'assurer (au cas où la jointure échoue)
        const verifiedProperties = enrichedData.filter((p) => p.owner_is_verified === true);
        console.log('useInfiniteProperties: raw data count', data?.length || 0);
        console.log('useInfiniteProperties: enriched count', enrichedData.length);
        console.log('useInfiniteProperties: verified count', verifiedProperties.length);
        console.log('useInfiniteProperties: count from query', count);
        const currentTotal = count || 0;

        if (isLoadMore) {
          setProperties((prev) => {
            const newTotal = prev.length + verifiedProperties.length;
            // Update hasMore based on actual fetched count vs total
            setHasMore(newTotal < currentTotal && verifiedProperties.length === pageSize);
            return [...prev, ...verifiedProperties];
          });
        } else {
          setProperties(verifiedProperties);
          setTotalCount(currentTotal);
          // hasMore is true only if we got a full page AND there's more data
          setHasMore(
            verifiedProperties.length === pageSize && verifiedProperties.length < currentTotal
          );
        }

        pageRef.current = page;
      } catch (err) {
        // Validate error message before displaying
        let message = 'Erreur lors du chargement';
        if (
          err instanceof Error &&
          err.message &&
          err.message.length > 2 &&
          !err.message.startsWith('{')
        ) {
          message = err.message;
        }
        setError(message);
        if (!isLoadMore) {
          setProperties([]);
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildQuery, enrichWithOwnerData, pageSize, sortBy]
  );

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
