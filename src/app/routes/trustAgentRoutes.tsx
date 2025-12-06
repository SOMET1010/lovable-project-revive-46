import { RouteObject, Navigate } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { ROLES } from '@/shared/constants/roles';

// Trust Agent pages
const TrustAgentLayout = lazyWithRetry(() => import('@/features/trust-agent/layouts/TrustAgentLayout'));
const TrustAgentDashboard = lazyWithRetry(() => import('@/features/trust-agent/pages/DashboardPage'));
const MissionDetail = lazyWithRetry(() => import('@/features/trust-agent/pages/MissionDetailPage'));
const PhotoVerification = lazyWithRetry(() => import('@/features/trust-agent/pages/PhotoVerificationPage'));
const DocumentValidation = lazyWithRetry(() => import('@/features/trust-agent/pages/DocumentValidationPage'));
const EtatDesLieux = lazyWithRetry(() => import('@/features/trust-agent/pages/EtatDesLieuxPage'));

export const trustAgentRoutes: RouteObject = {
  path: 'trust-agent',
  element: <ProtectedRoute allowedRoles={[ROLES.TRUST_AGENT]}><TrustAgentLayout /></ProtectedRoute>,
  children: [
    { index: true, element: <Navigate to="/trust-agent/dashboard" replace /> },
    { path: 'dashboard', element: <TrustAgentDashboard /> },
    { path: 'mission/:id', element: <MissionDetail /> },
    { path: 'photos/:id', element: <PhotoVerification /> },
    { path: 'documents/:id', element: <DocumentValidation /> },
    { path: 'etat-des-lieux/:id', element: <EtatDesLieux /> },
  ]
};
