/**
 * Dashboard Components - Exports centralisés
 * Point d'entrée pour tous les dashboards de la plateforme MONTOITVPROD
 */

// Tenant Dashboard (Locataires)
export { TenantDashboard } from './tenant/TenantDashboard';
export { TenantHeader } from './tenant/TenantHeader';
export { TenantSidebar } from './tenant/TenantSidebar';
export { 
  TenantStatsSection,
  TenantFavoritesSection,
  TenantApplicationsSection,
  TenantVisitsSection,
  TenantPaymentsSection 
} from './tenant/sections';

// Owner Dashboard (Propriétaires)
export { OwnerDashboard } from './owner/OwnerDashboard';
export { OwnerHeader } from './owner/OwnerHeader';
export { OwnerSidebar } from './owner/OwnerSidebar';
export { 
  OwnerStatsSection,
  OwnerPropertiesSection,
  OwnerTenantsSection,
  OwnerApplicationsSection,
  OwnerPaymentsSection 
} from './owner/sections';

// Types principaux
export type { TenantDashboardData } from './tenant/TenantDashboard';
export type { OwnerDashboardData } from './owner/OwnerDashboard';