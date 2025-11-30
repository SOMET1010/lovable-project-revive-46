<<<<<<< HEAD
// Main dashboard exports
export { default as TenantDashboard } from './tenant/TenantDashboard';
export { default as OwnerDashboard } from './owner/OwnerDashboard';
export { default as AgencyDashboard } from './agency/AgencyDashboard';

// Section exports
export { default as TenantApplicationsSection } from './tenant/sections/TenantApplicationsSection';
export { default as OwnerApplicationsSection } from './owner/sections/OwnerApplicationsSection';
export { default as AgencyApplicationsSection } from './agency/sections/AgencyApplicationsSection';

// Shared component exports
export { 
  default as ApplicationCard,
  type Application
} from './shared/ApplicationCard';

export { 
  default as ApplicationFilters,
  type FilterOptions
} from './shared/ApplicationFilters';

export { 
  default as ApplicationStats,
  type ApplicationStats as ApplicationStatsType
} from './shared/ApplicationStats';

// Demo export
export { default as DemoApplicationsIntegration } from './DemoApplicationsIntegration';
=======
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
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
