import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { supabase } from '@/services/supabase/client';

/**
 * Hook pour vérifier si un feature flag est activé
 */
export function useFeatureFlag(
  flagKey: string,
  options: {
    forceDisabled?: boolean;
    forceEnabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { forceDisabled = false, forceEnabled = false, refetchInterval } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feature-flag', flagKey],
    queryFn: async () => {
      if (forceDisabled) return { enabled: false, key: flagKey };
      if (forceEnabled) return { enabled: true, key: flagKey };

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env['VITE_SUPABASE_URL']}/functions/v1/check-feature-flag?key=${flagKey}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to check feature flag');
      }

      return response.json();
    },
    enabled: !forceDisabled && !forceEnabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isEnabled: forceEnabled || (data?.enabled ?? false),
    isLoading: !forceDisabled && !forceEnabled && isLoading,
    error,
    refetch,
    key: flagKey,
  };
}

/**
 * Hook pour vérifier plusieurs feature flags en une seule fois
 */
export function useFeatureFlags(flagKeys: string[]) {
  const flags = flagKeys.reduce(
    (acc, key) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      acc[key] = useFeatureFlag(key);
      return acc;
    },
    {} as Record<string, ReturnType<typeof useFeatureFlag>>
  );

  return flags;
}

/**
 * Hook pour obtenir tous les feature flags d'une catégorie
 */
export function useFeatureFlagsByCategory(category: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['feature-flags-category', category],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env['VITE_SUPABASE_URL']}/functions/v1/manage-feature-flags?category=${category}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch feature flags');

      const result = await response.json();
      return result.flags;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    flags: data,
    isLoading,
    error,
  };
}

/**
 * Composant wrapper pour afficher du contenu conditionnel selon un feature flag
 */
export function FeatureFlag({
  flag,
  children,
  fallback = null,
  loadingFallback = null,
}: {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}) {
  const { isEnabled, isLoading } = useFeatureFlag(flag);

  if (isLoading) {
    return React.createElement(React.Fragment, null, loadingFallback);
  }

  return React.createElement(React.Fragment, null, isEnabled ? children : fallback);
}
