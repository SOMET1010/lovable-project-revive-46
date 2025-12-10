import { RouteObject } from 'react-router-dom';
import Layout from '@/app/layout/Layout';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';

// Import modular routes
import {
  publicRoutes,
  authRoutes,
  tenantRoutes,
  ownerRoutes,
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

      // Tenant routes under /locataire prefix
      {
        path: 'locataire',
        children: tenantRoutes,
      },

      // Owner & Agency routes under /proprietaire prefix
      {
        path: 'proprietaire',
        children: ownerRoutes,
      },

      // Trust Agent routes (nested with layout)
      trustAgentRoutes,

      // Admin routes (nested with layout)
      adminRoutes,
    ],
  },
];
