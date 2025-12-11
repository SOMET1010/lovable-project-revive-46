/**
 * Central export point for all Zustand stores
 * 
 * Note: useAuthStore is deprecated. Use useAuth() from AuthProvider instead.
 * @see src/app/providers/AuthProvider.tsx
 */

// @deprecated - Use useAuth() from AuthProvider instead
// Kept for backward compatibility during migration
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
