import { RouteObject } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { ROLES, OWNER_ROLES, PROPERTY_MANAGER_ROLES } from '@/shared/constants/roles';

// Agency mandates
const MyMandatesPage = lazyWithRetry(() => import('@/features/agency/pages/MyMandatesPage'));
const MandateDetailPage = lazyWithRetry(() => import('@/features/agency/pages/MandateDetailPage'));
const SignMandatePage = lazyWithRetry(() => import('@/features/agency/pages/SignMandatePage'));

// Owner pages
const AddProperty = lazyWithRetry(() => import('@/features/owner/pages/AddPropertyPage'));
const OwnerDashboard = lazyWithRetry(() => import('@/features/owner/pages/DashboardPage'));
const CreateContract = lazyWithRetry(() => import('@/features/owner/pages/CreateContractPage'));
const OwnerContracts = lazyWithRetry(() => import('@/features/owner/pages/OwnerContractsPage'));
const OwnerApplications = lazyWithRetry(() => import('@/features/owner/pages/OwnerApplicationsPage'));
const OwnerMaintenance = lazyWithRetry(() => import('@/features/owner/pages/OwnerMaintenancePage'));
const MySubmissions = lazyWithRetry(() => import('@/features/owner/pages/MySubmissionsPage'));

// Application form (for owner viewing applications)
const ApplicationForm = lazyWithRetry(() => import('@/features/tenant/pages/ApplicationFormPage'));

// Agency pages
const AgencyDashboard = lazyWithRetry(() => import('@/features/agency/pages/DashboardPage'));

export const ownerRoutes: RouteObject[] = [
  // Owner dashboard
  { 
    path: 'dashboard/proprietaire', 
    element: <ProtectedRoute allowedRoles={[...OWNER_ROLES]}><OwnerDashboard /></ProtectedRoute> 
  },
  
  // Add property
  { 
    path: 'dashboard/ajouter-propriete', 
    element: <ProtectedRoute allowedRoles={[...PROPERTY_MANAGER_ROLES]}><AddProperty /></ProtectedRoute> 
  },
  { 
    path: 'add-property', 
    element: <ProtectedRoute allowedRoles={[...PROPERTY_MANAGER_ROLES]}><AddProperty /></ProtectedRoute> 
  },
  
  // Contracts
  { 
    path: 'dashboard/creer-contrat', 
    element: <ProtectedRoute allowedRoles={[...OWNER_ROLES]}><CreateContract /></ProtectedRoute> 
  },
  { 
    path: 'creer-contrat/:propertyId', 
    element: <ProtectedRoute allowedRoles={[...OWNER_ROLES]}><CreateContract /></ProtectedRoute> 
  },
  { 
    path: 'dashboard/mes-contrats', 
    element: <ProtectedRoute allowedRoles={[...OWNER_ROLES]}><OwnerContracts /></ProtectedRoute> 
  },
  
  // Applications
  { 
    path: 'dashboard/candidatures', 
    element: <ProtectedRoute allowedRoles={[...OWNER_ROLES]}><OwnerApplications /></ProtectedRoute> 
  },
  { 
    path: 'dashboard/candidature/:id', 
    element: <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.AGENCY]}><ApplicationForm /></ProtectedRoute> 
  },
  
  // Maintenance
  { 
    path: 'dashboard/maintenance', 
    element: <ProtectedRoute allowedRoles={[...OWNER_ROLES]}><OwnerMaintenance /></ProtectedRoute> 
  },
  
  // Suivi des soumissions
  { 
    path: 'dashboard/mes-soumissions', 
    element: <ProtectedRoute allowedRoles={[...OWNER_ROLES]}><MySubmissions /></ProtectedRoute> 
  },

  // Agency dashboard
  { 
    path: 'dashboard/agence', 
    element: <ProtectedRoute allowedRoles={[ROLES.AGENCY, ROLES.AGENT]}><AgencyDashboard /></ProtectedRoute> 
  },

  // Agency mandates
  { 
    path: 'mes-mandats', 
    element: <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.AGENCY, ROLES.AGENT]}><MyMandatesPage /></ProtectedRoute> 
  },
  { 
    path: 'dashboard/mes-mandats', 
    element: <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.AGENCY, ROLES.AGENT]}><MyMandatesPage /></ProtectedRoute> 
  },
  { 
    path: 'mandat/:id', 
    element: <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.AGENCY, ROLES.AGENT]}><MandateDetailPage /></ProtectedRoute> 
  },
  { 
    path: 'mandat/signer/:id', 
    element: <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.AGENCY, ROLES.AGENT]}><SignMandatePage /></ProtectedRoute> 
  },
];
