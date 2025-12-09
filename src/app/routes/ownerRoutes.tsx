import { RouteObject } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { ROLES, OWNER_ROLES, PROPERTY_MANAGER_ROLES } from '@/shared/constants/roles';

// Agency mandates
const MyMandatesPage = lazyWithRetry(() => import('@/pages/agency/MyMandatesPage'));
const MandateDetailPage = lazyWithRetry(() => import('@/pages/agency/MandateDetailPage'));
const SignMandatePage = lazyWithRetry(() => import('@/pages/agency/SignMandatePage'));

// Owner pages
const AddProperty = lazyWithRetry(() => import('@/pages/owner/AddPropertyPage'));
const OwnerDashboard = lazyWithRetry(() => import('@/pages/owner/DashboardPage'));
const CreateContract = lazyWithRetry(() => import('@/pages/owner/CreateContractPage'));
const OwnerContracts = lazyWithRetry(() => import('@/pages/owner/OwnerContractsPage'));
const OwnerApplications = lazyWithRetry(() => import('@/pages/owner/OwnerApplicationsPage'));

// Application form (for owner viewing applications)
const ApplicationForm = lazyWithRetry(() => import('@/pages/tenant/ApplicationFormPage'));

// Agency pages
const AgencyDashboard = lazyWithRetry(() => import('@/pages/agency/DashboardPage'));

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
    path: 'dashboard/mes-candidatures', 
    element: <ProtectedRoute allowedRoles={[...OWNER_ROLES]}><OwnerApplications /></ProtectedRoute> 
  },
  { 
    path: 'dashboard/candidature/:id', 
    element: <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.AGENCY]}><ApplicationForm /></ProtectedRoute> 
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
