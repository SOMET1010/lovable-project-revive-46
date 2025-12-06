import { RouteObject, Navigate } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import AdminLayout from '@/app/layout/AdminLayout';
import { ROLES } from '@/shared/constants/roles';

// Admin pages
const AdminDashboard = lazyWithRetry(() => import('@/features/admin/pages/DashboardPage'));
const AdminUsers = lazyWithRetry(() => import('@/features/admin/pages/UsersPage'));
const AdminUserRoles = lazyWithRetry(() => import('@/features/admin/pages/UserRolesPage'));
const AdminApiKeys = lazyWithRetry(() => import('@/features/admin/pages/ApiKeysPage'));
const AdminBusinessRules = lazyWithRetry(() => import('@/features/admin/pages/BusinessRulesPage'));
const AdminCEVManagement = lazyWithRetry(() => import('@/features/admin/pages/CEVManagementPage'));
const AdminTrustAgents = lazyWithRetry(() => import('@/features/admin/pages/TrustAgentsPage'));
const AdminAnalytics = lazyWithRetry(() => import('@/features/admin/pages/AnalyticsPage'));
const AdminProperties = lazyWithRetry(() => import('@/features/admin/pages/PropertiesPage'));
const AdminTransactions = lazyWithRetry(() => import('@/features/admin/pages/TransactionsPage'));
const AdminServiceMonitoring = lazyWithRetry(() => import('@/features/admin/pages/ServiceMonitoringPage'));
const AdminLogs = lazyWithRetry(() => import('@/features/admin/pages/LogsPage'));
const AdminServiceProviders = lazyWithRetry(() => import('@/features/admin/pages/ServiceProvidersPage'));
const AdminServiceConfiguration = lazyWithRetry(() => import('@/features/admin/pages/ServiceConfigurationPage'));
const AdminDataGenerator = lazyWithRetry(() => import('@/features/admin/pages/DataGeneratorPage'));

export const adminRoutes: RouteObject = {
  path: 'admin',
  element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminLayout /></ProtectedRoute>,
  children: [
    { index: true, element: <Navigate to="/admin/tableau-de-bord" replace /> },
    { path: 'tableau-de-bord', element: <AdminDashboard /> },
    { path: 'utilisateurs', element: <AdminUsers /> },
    { path: 'gestion-roles', element: <AdminUserRoles /> },
    { path: 'api-keys', element: <AdminApiKeys /> },
    { path: 'regles-metier', element: <AdminBusinessRules /> },
    { path: 'cev-management', element: <AdminCEVManagement /> },
    { path: 'cev/:id', element: <AdminCEVManagement /> },
    { path: 'trust-agents', element: <AdminTrustAgents /> },
    { path: 'analytics', element: <AdminAnalytics /> },
    { path: 'properties', element: <AdminProperties /> },
    { path: 'transactions', element: <AdminTransactions /> },
    { path: 'service-monitoring', element: <AdminServiceMonitoring /> },
    { path: 'logs', element: <AdminLogs /> },
    { path: 'service-providers', element: <AdminServiceProviders /> },
    { path: 'service-configuration', element: <AdminServiceConfiguration /> },
    { path: 'test-data-generator', element: <AdminDataGenerator /> },
  ]
};
