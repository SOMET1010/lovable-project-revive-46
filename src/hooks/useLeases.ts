import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { leaseRepository } from '../api/repositories';
import type { Database } from '@/shared/lib/database.types';

type LeaseInsert = Database['public']['Tables']['leases']['Insert'];
type LeaseUpdate = Database['public']['Tables']['leases']['Update'];

// Configuration React Query optimisée pour les leases
const LEASES_QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  networkMode: 'online',
} as const;

export function useLease(id: string | undefined) {
  return useQuery({
    queryKey: ['lease', id],
    queryFn: () => (id ? leaseRepository.getById(id) : Promise.resolve({ data: null, error: null })),
    enabled: !!id,
    ...LEASES_QUERY_CONFIG,
    staleTime: 1000 * 60 * 10, // 10 minutes pour une lease spécifique
  });
}

export function useTenantLeases(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['leases', 'tenant', tenantId],
    queryFn: () =>
      tenantId ? leaseRepository.getByTenantId(tenantId) : Promise.resolve({ data: [], error: null }),
    enabled: !!tenantId,
    ...LEASES_QUERY_CONFIG,
  });
}

export function useLandlordLeases(landlordId: string | undefined) {
  return useQuery({
    queryKey: ['leases', 'landlord', landlordId],
    queryFn: () =>
      landlordId
        ? leaseRepository.getByLandlordId(landlordId)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!landlordId,
    ...LEASES_QUERY_CONFIG,
  });
}

export function usePropertyLeases(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['leases', 'property', propertyId],
    queryFn: () =>
      propertyId
        ? leaseRepository.getByPropertyId(propertyId)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!propertyId,
    ...LEASES_QUERY_CONFIG,
  });
}

export function useActiveLease(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['lease', 'active', tenantId],
    queryFn: () =>
      tenantId
        ? leaseRepository.getActiveByTenantId(tenantId)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!tenantId,
    ...LEASES_QUERY_CONFIG,
  });
}

export function useExpiringLeases(daysBeforeExpiry: number = 30) {
  return useQuery({
    queryKey: ['leases', 'expiring', daysBeforeExpiry],
    queryFn: () => leaseRepository.getExpiringLeases(daysBeforeExpiry),
    refetchInterval: 1000 * 60 * 60, // 1 heure pour les leases qui expirent
    ...LEASES_QUERY_CONFIG,
  });
}

// Hook avec pagination infinie pour l'historique complet des leases
export function useInfiniteLeases(filters?: any, options?: any) {
  return useInfiniteQuery({
    queryKey: ['leases', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      leaseRepository.getAll({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data?.hasNext) return undefined;
      return (lastPage.data.currentPage || 0) + 1;
    },
    initialPageParam: 1,
    ...LEASES_QUERY_CONFIG,
    ...options,
  });
}

export function useCreateLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lease: LeaseInsert) => leaseRepository.create(lease),
    onMutate: async (newLease) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['leases'] });
      
      const previousLeases = queryClient.getQueryData(['leases']);
      
      queryClient.setQueryData(['leases'], (old: any) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: [newLease, ...old.data.data],
            totalCount: (old.data.totalCount || 0) + 1,
          }
        };
      });

      return { previousLeases };
    },
    onError: (err, newLease, context) => {
      queryClient.setQueryData(['leases'], context?.previousLeases);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
    },
  });
}

export function useUpdateLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: LeaseUpdate }) =>
      leaseRepository.update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['lease', id] });
      
      const previousLease = queryClient.getQueryData(['lease', id]);
      
      queryClient.setQueryData(['lease', id], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, ...updates },
        };
      });

      return { previousLease };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['lease', id], context?.previousLease);
    },
    onSuccess: (data) => {
      if (data.data) {
        queryClient.setQueryData(['lease', data.data.id], data);
        queryClient.invalidateQueries({ queryKey: ['leases'] });
      }
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lease', data?.data?.id] });
    },
  });
}

export function useUpdateLeaseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leaseRepository.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['lease', id] });
      
      const previousLease = queryClient.getQueryData(['lease', id]);
      
      queryClient.setQueryData(['lease', id], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, status, updated_at: new Date().toISOString() },
        };
      });

      return { previousLease };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['lease', id], context?.previousLease);
    },
    onSuccess: (data) => {
      if (data.data) {
        queryClient.setQueryData(['lease', data.data.id], data);
        queryClient.invalidateQueries({ queryKey: ['leases'] });
      }
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lease', data?.data?.id] });
    },
  });
}

// Hook pour calculer les statistiques des leases
export function useLeaseStatistics(filters?: any) {
  return useQuery({
    queryKey: ['leases', 'statistics', filters],
    queryFn: () => leaseRepository.getStatistics(filters),
    staleTime: 1000 * 60 * 15, // 15 minutes pour les stats
    gcTime: 1000 * 60 * 60, // 1 heure
    refetchOnWindowFocus: false,
    ...LEASES_QUERY_CONFIG,
  });
}

// Hook pour les renewals de leases
export function useLeaseRenewal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, renewalData }: { id: string; renewalData: any }) =>
      leaseRepository.renew(id, renewalData),
    onMutate: async ({ id, renewalData }) => {
      // Optimistic update pour le renouvellement
      await queryClient.cancelQueries({ queryKey: ['lease', id] });
      
      const previousLease = queryClient.getQueryData(['lease', id]);
      
      queryClient.setQueryData(['lease', id], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            ...renewalData,
            renewed_at: new Date().toISOString(),
            status: 'active',
          },
        };
      });

      return { previousLease };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['lease', id], context?.previousLease);
    },
    onSuccess: (data) => {
      if (data.data) {
        queryClient.setQueryData(['lease', data.data.id], data);
        queryClient.invalidateQueries({ queryKey: ['leases'] });
      }
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lease', data?.data?.id] });
    },
  });
}

// Hook pour chercher dans les leases
export function useLeaseSearch(searchTerm: string, filters?: any) {
  return useQuery({
    queryKey: ['leases', 'search', searchTerm, filters],
    queryFn: () =>
      searchTerm && searchTerm.length > 2
        ? leaseRepository.search(searchTerm, filters)
        : Promise.resolve({ data: [], error: null }),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 1000 * 30, // 30 secondes pour les recherches
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
