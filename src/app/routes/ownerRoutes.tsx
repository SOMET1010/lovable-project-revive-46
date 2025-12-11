import { RouteObject } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { ROLES, OWNER_ROLES, PROPERTY_MANAGER_ROLES } from '@/shared/constants/roles';
import OwnerDashboardLayout from '@/features/owner/components/OwnerDashboardLayout';

// Owner pages
const AddProperty = lazyWithRetry(() => import('@/pages/owner/AddPropertyPage'));
const OwnerDashboard = lazyWithRetry(() => import('@/pages/owner/DashboardPage'));
const CreateContract = lazyWithRetry(() => import('@/pages/owner/CreateContractPage'));
const OwnerContracts = lazyWithRetry(() => import('@/pages/owner/OwnerContractsPage'));
const OwnerApplications = lazyWithRetry(() => import('@/pages/owner/OwnerApplicationsPage'));
const MyProperties = lazyWithRetry(() => import('@/pages/owner/MyPropertiesPage'));
const OwnerProfilePage = lazyWithRetry(() => import('@/pages/owner/ProfilePage'));

// Application form (for owner viewing applications)
const ApplicationForm = lazyWithRetry(() => import('@/pages/tenant/ApplicationFormPage'));

export const ownerRoutes: RouteObject[] = [
  {
    element: (
      <ProtectedRoute allowedRoles={[...OWNER_ROLES]}>
        <OwnerDashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // Owner dashboard
      {
        path: 'dashboard',
        element: <OwnerDashboard />,
      },

      // Add property
      {
        path: 'ajouter-propriete',
        element: (
          <ProtectedRoute allowedRoles={[...PROPERTY_MANAGER_ROLES]}>
            <AddProperty />
          </ProtectedRoute>
        ),
      },

      // Contracts
      {
        path: 'creer-contrat',
        element: <CreateContract />,
      },
      {
        path: 'creer-contrat/:propertyId',
        element: <CreateContract />,
      },
      {
        path: 'contrats',
        element: <OwnerContracts />,
      },

      // Properties
      {
        path: 'mes-proprietes',
        element: <MyProperties />,
      },

      // Profile
      {
        path: 'profil',
        element: <OwnerProfilePage />,
      },

      // Applications
      {
        path: 'candidatures',
        element: <OwnerApplications />,
      },
    ],
  },
  // Routes partagées qui peuvent être accessibles par les agences aussi
  {
    path: 'candidature/:id',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.AGENCY]}>
        <ApplicationForm />
      </ProtectedRoute>
    ),
  },
];
