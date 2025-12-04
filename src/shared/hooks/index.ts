/**
 * Shared Hooks Library
 * Export all reusable hooks from here
 */

export { useParallax } from './useParallax';
export type { default as UseParallaxReturn } from './useParallax';

export { useBreakpoint } from './useBreakpoint';
export { useDemoMode } from './useDemoMode';
export { useErrorHandler } from './useErrorHandler';
export { useFeatureFlag } from './useFeatureFlag';
export { useLocalStorage } from './useLocalStorage';
export { useToast } from './useToast';

// Migrated hooks from src/hooks
export { useContract } from './useContract';
export { 
  useDebounce, 
  useDebouncedCallback, 
  useDebouncedSearch, 
  useDebouncedFilters, 
  useDebouncedAutoSave, 
  DEBOUNCE_DELAYS 
} from './useDebounce';
export { useVerification } from './useVerification';

// Debouncing utilities
export * from './debouncing';
