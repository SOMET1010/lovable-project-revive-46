import { RouteObject, Navigate } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';

// Auth pages
const ModernAuth = lazyWithRetry(() => import('@/features/auth/pages/ModernAuthPage'));
const AuthCallback = lazyWithRetry(() => import('@/features/auth/pages/CallbackPage'));
const ForgotPassword = lazyWithRetry(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPassword = lazyWithRetry(() => import('@/features/auth/pages/ResetPasswordPage'));
const ProfileSelection = lazyWithRetry(() => import('@/features/auth/pages/ProfileSelectionPage'));
const ProfileCompletion = lazyWithRetry(() => import('@/features/auth/pages/ProfileCompletionPage'));
const BiometricVerification = lazyWithRetry(() => import('@/features/auth/pages/BiometricVerificationPage'));
const NeofaceCallback = lazyWithRetry(() => import('@/features/auth/pages/NeofaceCallbackPage'));

export const authRoutes: RouteObject[] = [
  { path: 'connexion', element: <ModernAuth /> },
  { path: 'inscription', element: <ModernAuth /> },
  { path: 'login', element: <Navigate to="/connexion" replace /> },
  { path: 'auth', element: <ModernAuth /> },
  { path: 'auth/callback', element: <AuthCallback /> },
  { path: 'mot-de-passe-oublie', element: <ForgotPassword /> },
  { path: 'reinitialiser-mot-de-passe', element: <ResetPassword /> },
  { path: 'choix-profil', element: <ProtectedRoute><ProfileSelection /></ProtectedRoute> },
  { path: 'completer-profil', element: <ProtectedRoute><ProfileCompletion /></ProtectedRoute> },
  { path: 'verification-biometrique', element: <ProtectedRoute><BiometricVerification /></ProtectedRoute> },
  { path: 'neoface-callback', element: <NeofaceCallback /> },
];
