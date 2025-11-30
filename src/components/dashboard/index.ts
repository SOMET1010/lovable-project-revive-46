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