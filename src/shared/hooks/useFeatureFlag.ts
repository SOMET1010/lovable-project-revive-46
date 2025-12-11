import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  description: string | null;
  config: Record<string, unknown> | null;
}

// Feature flag names as constants for type safety
export const FEATURE_FLAGS = {
  ONECI_VERIFICATION: 'oneci_verification',
  CNAM_VERIFICATION: 'cnam_verification',
  MAPBOX_MAPS: 'mapbox_maps',
  AZURE_MAPS: 'azure_maps',
  FACIAL_VERIFICATION: 'facial_verification',
  CRYPTONEO_SIGNATURE: 'cryptoneo_signature',
  AI_CHATBOT: 'ai_chatbot',
  MOBILE_MONEY_PAYMENTS: 'mobile_money_payments',
  SMS_NOTIFICATIONS: 'sms_notifications',
} as const;

export type FeatureFlagName = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

/**
 * Hook to fetch all feature flags from database
 */
export function useAllFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async (): Promise<FeatureFlag[]> => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('id, feature_name, is_enabled, description, config')
        .order('feature_name');

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        feature_name: d.feature_name,
        is_enabled: d.is_enabled ?? false,
        description: d.description,
        config: d.config as Record<string, unknown> | null,
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to check if a specific feature is enabled
 * @param featureName - The name of the feature flag to check
 * @returns Object with isEnabled boolean, loading state, and config
 */
export function useFeatureFlag(featureName: FeatureFlagName | string) {
  const { data: flags, isLoading, error, refetch } = useAllFeatureFlags();

  const flag = flags?.find(f => f.feature_name === featureName);

  return {
    isEnabled: flag?.is_enabled ?? false,
    isLoading,
    error,
    config: flag?.config ?? null,
    flag,
    refetch,
    key: featureName,
  };
}

/**
 * Hook to check multiple features at once
 * @param featureNames - Array of feature flag names
 * @returns Object with features map, loading state
 */
export function useMultipleFeatureFlags(featureNames: (FeatureFlagName | string)[]) {
  const { data: flags, isLoading, error } = useAllFeatureFlags();

  const features = featureNames.reduce((acc, name) => {
    const flag = flags?.find(f => f.feature_name === name);
    acc[name] = {
      isEnabled: flag?.is_enabled ?? false,
      config: flag?.config ?? null,
    };
    return acc;
  }, {} as Record<string, { isEnabled: boolean; config: Record<string, unknown> | null }>);

  return {
    features,
    isLoading,
    error,
    isAnyEnabled: featureNames.some(name => features[name]?.isEnabled),
    areAllEnabled: featureNames.every(name => features[name]?.isEnabled),
  };
}

/**
 * Hook to invalidate feature flags cache (useful after toggling)
 */
export function useInvalidateFeatureFlags() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
  };
}

/**
 * Hook pour obtenir tous les feature flags d'une catégorie
 */
export function useFeatureFlagsByCategory(category: string) {
  const { data: flags, isLoading, error } = useAllFeatureFlags();

  const filteredFlags = flags?.filter(f => {
    const config = f.config;
    return config?.['category'] === category;
  }) || [];

  return {
    flags: filteredFlags,
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
