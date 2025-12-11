import { RouteObject } from 'react-router-dom';
import Layout from '@/app/layout/Layout';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';

// Import modular routes
import {
  publicRoutes,
  authRoutes,
  tenantRoutes,
  ownerRoutes,
  agencyRoutes,
  adminRoutes,
  trustAgentRoutes,
} from './routes/index';

/**
 * Main application routes
 * Routes are organized by domain for better maintainability
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Public routes (home, static pages, property search)
      ...publicRoutes,

      // Authentication routes
      ...authRoutes,

      // Tenant routes (dashboard, applications, visits, contracts, payments)
      ...tenantRoutes,

      // Owner routes (property management, contracts)
      ...ownerRoutes,

      // Agency routes (team, commissions, assignments - Sprint 7)
      ...agencyRoutes,
      trustAgentRoutes,

      // Admin routes (nested with layout)
      adminRoutes,
    ],
  },
];
