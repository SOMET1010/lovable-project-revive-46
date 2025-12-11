import { RouteObject } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { AGENCY_ROLES } from '@/shared/constants/roles';
import AgencyDashboardLayout from '@/features/agency/components/AgencyDashboardLayout';

// Agency pages
const AgencyDashboard = lazyWithRetry(() => import('@/pages/agency/DashboardPage'));
const MyMandatesPage = lazyWithRetry(() => import('@/pages/agency/MyMandatesPage'));
const MandateDetailPage = lazyWithRetry(() => import('@/pages/agency/MandateDetailPage'));
const SignMandatePage = lazyWithRetry(() => import('@/pages/agency/SignMandatePage'));
const AgencyAddProperty = lazyWithRetry(() => import('@/pages/agency/AddPropertyPage'));
const AgencyAnalyticsPage = lazyWithRetry(() => import('@/pages/agency/AnalyticsPage'));
const AgencyCalendarPage = lazyWithRetry(() => import('@/pages/agency/CalendarPage'));
const AgencyProfilePage = lazyWithRetry(() => import('@/pages/agency/ProfilePage'));

export const agencyRoutes: RouteObject[] = [
  {
    element: (
      <ProtectedRoute allowedRoles={[...AGENCY_ROLES]}>
        <AgencyDashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // Agency dashboard
      {
        path: 'dashboard',
        element: <AgencyDashboard />,
      },

      // Agency mandates
      {
        path: 'mandats',
        element: <MyMandatesPage />,
      },
      {
        path: 'mandats/:id',
        element: <MandateDetailPage />,
      },
      {
        path: 'signer-mandat/:id',
        element: <SignMandatePage />,
      },

      // Property management
      {
        path: 'biens',
        element: <AgencyAddProperty />,
      },

      // Profile
      {
        path: 'profil',
        element: <AgencyProfilePage />,
      },

      // Agency-specific pages
      {
        path: 'analytics',
        element: <AgencyAnalyticsPage />,
      },
      {
        path: 'calendrier',
        element: <AgencyCalendarPage />,
      },
    ],
  },
];