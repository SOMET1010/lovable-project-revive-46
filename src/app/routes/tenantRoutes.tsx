import { RouteObject, Navigate } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { ROLES, OWNER_ROLES, AGENCY_ROLES, TENANT_ROLES, ALL_AUTHENTICATED } from '@/shared/constants/roles';

// Dashboard Router - redirects based on user type
const DashboardRouter = lazyWithRetry(() => import('@/shared/ui/DashboardRouter'));

// Tenant dashboard pages
const TenantDashboard = lazyWithRetry(() => import('@/pages/tenant/DashboardPage'));
const TenantCalendar = lazyWithRetry(() => import('@/pages/tenant/CalendarPage'));
const TenantMaintenance = lazyWithRetry(() => import('@/pages/tenant/MaintenancePage'));
const TenantScorePage = lazyWithRetry(() => import('@/pages/tenant/ScorePage'));
const MaintenanceRequest = lazyWithRetry(() => import('@/pages/tenant/MaintenanceRequestPage'));
const MyApplications = lazyWithRetry(() => import('@/pages/tenant/MyApplicationsPage'));
const RentalHistoryPage = lazyWithRetry(() => import('@/pages/tenant/RentalHistoryPage'));

// Unified dashboard
const UnifiedDashboard = lazyWithRetry(() => import('@/pages/dashboard/UnifiedDashboardPage'));

// Profile page
const ProfilePage = lazyWithRetry(() => import('@/pages/tenant/ProfilePage'));

// Favorites & saved searches
const Favorites = lazyWithRetry(() => import('@/pages/tenant/FavoritesPage'));
const SavedSearches = lazyWithRetry(() => import('@/pages/tenant/SavedSearchesPage'));

// Application & Visit pages
const ApplicationForm = lazyWithRetry(() => import('@/pages/tenant/ApplicationFormPage'));
const ScheduleVisit = lazyWithRetry(() => import('@/pages/tenant/ScheduleVisitPage'));
const MyVisits = lazyWithRetry(() => import('@/pages/tenant/MyVisitsPage'));

// Contract pages
const ContractDetail = lazyWithRetry(() => import('@/pages/tenant/ContractDetailPage'));
const MyContracts = lazyWithRetry(() => import('@/pages/tenant/MyContractsPage'));
const SignLease = lazyWithRetry(() => import('@/pages/tenant/SignLeasePage'));

// Payment pages
const MakePayment = lazyWithRetry(() => import('@/pages/tenant/MakePaymentPage'));
const PaymentHistory = lazyWithRetry(() => import('@/pages/tenant/PaymentHistoryPage'));

// Messaging
const MessagesPage = lazyWithRetry(() => import('@/pages/messaging/MessagesPage'));

// Shared tenant layout with sidebar
const TenantSidebarLayout = lazyWithRetry(() => import('@/features/tenant/components/TenantSidebarLayout'));

export const tenantRoutes: RouteObject[] = [
  // Smart Dashboard Router - redirects based on user_type and roles
  { path: 'dashboard', element: <ProtectedRoute><DashboardRouter /></ProtectedRoute> },

  // Profile
  { path: 'profil', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: 'verification', element: <Navigate to="/profil?tab=verification" replace /> },

  // Favorites & saved searches (tenant only)
  { path: 'favoris', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><Favorites /></ProtectedRoute> },

  // Applications
  { path: 'mes-candidatures', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><MyApplications /></ProtectedRoute> },

  // Visits
  { path: 'visites/planifier/:id', element: <Navigate to="/visiter/:id" replace /> },
  { path: 'mes-visites', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><MyVisits /></ProtectedRoute> },

  // Contracts
  { path: 'mes-contrats', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><MyContracts /></ProtectedRoute> },

  // Payments
  { path: 'mes-paiements', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><PaymentHistory /></ProtectedRoute> },

  // Tenant specific routes
  { path: 'dashboard/locataire', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><TenantDashboard /></ProtectedRoute> },
  { path: 'maintenance/locataire', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><TenantMaintenance /></ProtectedRoute> },
  { path: 'mon-score', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><TenantScorePage /></ProtectedRoute> },
  { path: 'profil/historique-locations', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><RentalHistoryPage /></ProtectedRoute> },

  // Routes that should keep the tenant sidebar visible
  {
    element: <ProtectedRoute allowedRoles={[...ALL_AUTHENTICATED]}><TenantSidebarLayout /></ProtectedRoute>,
    children: [
      { path: 'mon-espace', element: <UnifiedDashboard /> },
      { path: 'recherches-sauvegardees', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><SavedSearches /></ProtectedRoute> },
      { path: 'messages', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES, ...OWNER_ROLES, ...AGENCY_ROLES]}><MessagesPage /></ProtectedRoute> },
      { path: 'dashboard/locataire/calendrier', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><TenantCalendar /></ProtectedRoute> },
      { path: 'maintenance/nouvelle', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><MaintenanceRequest /></ProtectedRoute> },
      { path: 'visiter/:id', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><ScheduleVisit /></ProtectedRoute> },
      { path: 'candidature/:id', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><ApplicationForm /></ProtectedRoute> },
      { path: 'contrat/:id', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><ContractDetail /></ProtectedRoute> },
      { path: 'signer-bail/:id', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><SignLease /></ProtectedRoute> },
      { path: 'effectuer-paiement', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><MakePayment /></ProtectedRoute> },
    ],
  },
];
