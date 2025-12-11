import { RouteObject } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { AGENCY_ROLES } from '@/shared/constants/roles';

// Agency management pages (Sprint 7)
const TeamManagementPage = lazyWithRetry(() => import('@/features/agency/pages/TeamManagementPage'));
const AgentDetailPage = lazyWithRetry(() => import('@/features/agency/pages/AgentDetailPage'));
const CommissionsPage = lazyWithRetry(() => import('@/features/agency/pages/CommissionsPage'));
const PropertyAssignmentsPage = lazyWithRetry(() => import('@/features/agency/pages/PropertyAssignmentsPage'));
const RegistrationRequestsPage = lazyWithRetry(() => import('@/features/agency/pages/RegistrationRequestsPage'));
const AgencySettingsPage = lazyWithRetry(() => import('@/features/agency/pages/AgencySettingsPage'));
const AgencyReportsPage = lazyWithRetry(() => import('@/features/agency/pages/AgencyReportsPage'));

export const agencyRoutes: RouteObject[] = [
  // Team management
  { 
    path: 'dashboard/agence/equipe', 
    element: <ProtectedRoute allowedRoles={[...AGENCY_ROLES]}><TeamManagementPage /></ProtectedRoute> 
  },
  
  // Agent detail
  { 
    path: 'dashboard/agence/agent/:agentId', 
    element: <ProtectedRoute allowedRoles={[...AGENCY_ROLES]}><AgentDetailPage /></ProtectedRoute> 
  },
  
  // Commissions
  { 
    path: 'dashboard/agence/commissions', 
    element: <ProtectedRoute allowedRoles={[...AGENCY_ROLES]}><CommissionsPage /></ProtectedRoute> 
  },
  
  // Property assignments
  { 
    path: 'dashboard/agence/proprietes', 
    element: <ProtectedRoute allowedRoles={[...AGENCY_ROLES]}><PropertyAssignmentsPage /></ProtectedRoute> 
  },
  
  // Registration requests (recruitment)
  { 
    path: 'dashboard/agence/candidatures', 
    element: <ProtectedRoute allowedRoles={[...AGENCY_ROLES]}><RegistrationRequestsPage /></ProtectedRoute> 
  },
  
  // Agency settings
  { 
    path: 'dashboard/agence/parametres', 
    element: <ProtectedRoute allowedRoles={[...AGENCY_ROLES]}><AgencySettingsPage /></ProtectedRoute> 
  },
  
  // Reports
  { 
    path: 'dashboard/agence/rapports', 
    element: <ProtectedRoute allowedRoles={[...AGENCY_ROLES]}><AgencyReportsPage /></ProtectedRoute> 
  },
];
