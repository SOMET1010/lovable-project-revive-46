/**
 * Shared Hooks Library
 * Export all reusable hooks from here
 */

export { useParallax } from './useParallax';
export type { default as UseParallaxReturn } from './useParallax';

export { useBreakpoint } from './useBreakpoint';
export { useErrorHandler } from './useErrorHandler';
export { useFeatureFlag } from './useFeatureFlag';
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
