import { RouteObject, Navigate } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { ROLES, OWNER_ROLES, AGENCY_ROLES, TENANT_ROLES } from '@/shared/constants/roles';

// Dashboard Router - redirects based on user type
const DashboardRouter = lazyWithRetry(() => import('@/shared/ui/DashboardRouter'));

// Tenant dashboard pages
const TenantDashboard = lazyWithRetry(() => import('@/features/tenant/pages/DashboardPage'));
const TenantCalendar = lazyWithRetry(() => import('@/features/tenant/pages/CalendarPage'));
const TenantMaintenance = lazyWithRetry(() => import('@/features/tenant/pages/MaintenancePage'));
const TenantScorePage = lazyWithRetry(() => import('@/features/tenant/pages/ScorePage'));
const MaintenanceRequest = lazyWithRetry(() => import('@/features/tenant/pages/MaintenanceRequestPage'));
const MyApplications = lazyWithRetry(() => import('@/features/tenant/pages/MyApplicationsPage'));
const RentalHistoryPage = lazyWithRetry(() => import('@/features/tenant/pages/RentalHistoryPage'));

// Unified dashboard
const UnifiedDashboard = lazyWithRetry(() => import('@/features/dashboard/pages/UnifiedDashboardPage'));

// Profile page
const ProfilePage = lazyWithRetry(() => import('@/features/tenant/pages/ProfilePage'));

// Favorites & saved searches
const Favorites = lazyWithRetry(() => import('@/features/tenant/pages/FavoritesPage'));
const SavedSearches = lazyWithRetry(() => import('@/features/tenant/pages/SavedSearchesPage'));

// Application & Visit pages
const ApplicationForm = lazyWithRetry(() => import('@/features/tenant/pages/ApplicationFormPage'));
const ScheduleVisit = lazyWithRetry(() => import('@/features/tenant/pages/ScheduleVisitPage'));
const MyVisits = lazyWithRetry(() => import('@/features/tenant/pages/MyVisitsPage'));

// Contract pages
const ContractDetail = lazyWithRetry(() => import('@/features/tenant/pages/ContractDetailPage'));
const MyContracts = lazyWithRetry(() => import('@/features/tenant/pages/MyContractsPage'));
const SignLease = lazyWithRetry(() => import('@/features/tenant/pages/SignLeasePage'));

// Payment pages
const MakePayment = lazyWithRetry(() => import('@/features/tenant/pages/MakePaymentPage'));
const PaymentHistory = lazyWithRetry(() => import('@/features/tenant/pages/PaymentHistoryPage'));

// Messaging
const MessagesPage = lazyWithRetry(() => import('@/features/messaging/pages/MessagesPage'));

export const tenantRoutes: RouteObject[] = [
  // Smart Dashboard Router - redirects based on user_type and roles
  { path: 'dashboard', element: <ProtectedRoute><DashboardRouter /></ProtectedRoute> },
  { path: 'mon-espace', element: <ProtectedRoute><UnifiedDashboard /></ProtectedRoute> },

  // Profile
  { path: 'profil', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: 'verification', element: <Navigate to="/profil?tab=verification" replace /> },

  // Favorites & saved searches (tenant only)
  { path: 'favoris', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES]}><Favorites /></ProtectedRoute> },
  { path: 'recherches-sauvegardees', element: <ProtectedRoute allowedRoles={[ROLES.TENANT]}><SavedSearches /></ProtectedRoute> },

  // Messaging (all authenticated users)
  { path: 'messages', element: <ProtectedRoute allowedRoles={[...TENANT_ROLES, ...OWNER_ROLES, ...AGENCY_ROLES]}><MessagesPage /></ProtectedRoute> },

  // Applications
  { path: 'candidature/:id', element: <ProtectedRoute><ApplicationForm /></ProtectedRoute> },
  { path: 'mes-candidatures', element: <ProtectedRoute><MyApplications /></ProtectedRoute> },

  // Visits
  { path: 'visiter/:id', element: <ProtectedRoute><ScheduleVisit /></ProtectedRoute> },
  { path: 'visites/planifier/:id', element: <Navigate to="/visiter/:id" replace /> },
  { path: 'mes-visites', element: <ProtectedRoute><MyVisits /></ProtectedRoute> },

  // Contracts
  { path: 'contrat/:id', element: <ProtectedRoute><ContractDetail /></ProtectedRoute> },
  { path: 'mes-contrats', element: <ProtectedRoute><MyContracts /></ProtectedRoute> },
  { path: 'signer-bail/:id', element: <ProtectedRoute><SignLease /></ProtectedRoute> },

  // Payments
  { path: 'effectuer-paiement', element: <ProtectedRoute><MakePayment /></ProtectedRoute> },
  { path: 'mes-paiements', element: <ProtectedRoute><PaymentHistory /></ProtectedRoute> },

  // Tenant specific routes
  { path: 'dashboard/locataire', element: <ProtectedRoute allowedRoles={[ROLES.TENANT]}><TenantDashboard /></ProtectedRoute> },
  { path: 'dashboard/locataire/calendrier', element: <ProtectedRoute allowedRoles={[ROLES.TENANT]}><TenantCalendar /></ProtectedRoute> },
  { path: 'maintenance/locataire', element: <ProtectedRoute allowedRoles={[ROLES.TENANT]}><TenantMaintenance /></ProtectedRoute> },
  { path: 'mon-score', element: <ProtectedRoute allowedRoles={[ROLES.TENANT]}><TenantScorePage /></ProtectedRoute> },
  { path: 'profil/historique-locations', element: <ProtectedRoute allowedRoles={[ROLES.TENANT]}><RentalHistoryPage /></ProtectedRoute> },
  { path: 'maintenance/nouvelle', element: <ProtectedRoute><MaintenanceRequest /></ProtectedRoute> },
];
