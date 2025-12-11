/**
 * Shared Hooks Library
 * Export all reusable hooks from here
 */

export { useParallax } from './useParallax';
export type { default as UseParallaxReturn } from './useParallax';

export { useBreakpoint } from './useBreakpoint';
export { useErrorHandler } from './useErrorHandler';
export { 
  useFeatureFlag, 
  useAllFeatureFlags, 
  useMultipleFeatureFlags, 
  useFeatureFlagsByCategory,
  useInvalidateFeatureFlags,
  FeatureFlag,
  FEATURE_FLAGS 
} from './useFeatureFlag';
export type { FeatureFlag as FeatureFlagType, FeatureFlagName } from './useFeatureFlag';
export { useLocalStorage } from './useLocalStorage';
export { useToast } from './useToast';
export { useUserRoles } from './useUserRoles';
export type { AppRole, UseUserRolesReturn } from './useUserRoles';

// Migrated hooks from src/hooks
export { 
  useDebounce, 
  useDebouncedCallback, 
  useDebouncedSearch, 
  useDebouncedFilters, 
  useDebouncedAutoSave, 
  DEBOUNCE_DELAYS 
} from './useDebounce';

// Debouncing utilities
export * from './debouncing';

// Real-time hooks
export { useLeaseSignatureRealtime } from './useLeaseSignatureRealtime';
export type { LeaseSignatureData } from './useLeaseSignatureRealtime';

// Migrated hooks from src/hooks/
export { useAgencyMandates } from './useAgencyMandates';
export type { Agency, MandatePermissions, MandateScope, AgencyMandate, CreateMandateParams } from './useAgencyMandates';

// Native platform hooks
export * from './native';
