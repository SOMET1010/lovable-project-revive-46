<<<<<<< HEAD
export { default as TenantDashboard } from './TenantDashboard';
export { default as TenantApplicationsSection } from './sections/TenantApplicationsSection';
=======
/**
 * Tenant Dashboard - Exports
 * Refonte complète avec Modern Minimalism Premium
 */

// Composant principal
export { TenantDashboard } from './TenantDashboard';

// Composants de layout
export { TenantHeader } from './TenantHeader';
export { TenantSidebar } from './TenantSidebar';

// Sections du dashboard
export { TenantStatsSection } from './sections/TenantStatsSection';
export { TenantFavoritesSection } from './sections/TenantFavoritesSection';
export { TenantApplicationsSection } from './sections/TenantApplicationsSection';
export { TenantVisitsSection } from './sections/TenantVisitsSection';
export { TenantPaymentsSection } from './sections/TenantPaymentsSection';

// Types
export type {
  TenantDashboardData,
} from './TenantDashboard';

// Hooks personnalisés (à créer)
// export { useTenantDashboard } from './hooks/useTenantDashboard';
// export { useTenantStats } from './hooks/useTenantStats';
// export { useTenantFavorites } from './hooks/useTenantFavorites';
// export { useTenantApplications } from './hooks/useTenantApplications';
// export { useTenantVisits } from './hooks/useTenantVisits';
// export { useTenantPayments } from './hooks/useTenantPayments';
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
