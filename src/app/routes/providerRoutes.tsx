import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load provider pages
const ProviderRegistrationPage = lazy(() => import('@/features/provider/pages/ProviderRegistrationPage'));
const ProviderDashboardPage = lazy(() => import('@/features/provider/pages/ProviderDashboardPage'));
const ProviderJobDetailPage = lazy(() => import('@/features/provider/pages/ProviderJobDetailPage'));

const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
    {children}
  </Suspense>
);

export const providerRoutes: RouteObject[] = [
  {
    path: '/devenir-prestataire',
    element: <LazyWrapper><ProviderRegistrationPage /></LazyWrapper>
  },
  {
    path: '/prestataire/dashboard',
    element: <LazyWrapper><ProviderDashboardPage /></LazyWrapper>
  },
  {
    path: '/prestataire/job/:id',
    element: <LazyWrapper><ProviderJobDetailPage /></LazyWrapper>
  },
  {
    path: '/prestataire/intervention/:id',
    element: <LazyWrapper><ProviderJobDetailPage /></LazyWrapper>
  }
];

export default providerRoutes;
