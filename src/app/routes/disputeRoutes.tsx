import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load dispute pages
const CreateDisputePage = lazy(() => import('@/features/dispute/pages/CreateDisputePage'));
const MyDisputesPage = lazy(() => import('@/features/dispute/pages/MyDisputesPage'));
const DisputeDetailPage = lazy(() => import('@/features/dispute/pages/DisputeDetailPage'));

// Lazy load admin review moderation
const ReviewModerationPage = lazy(() => import('@/features/admin/pages/ReviewModerationPage'));

/**
 * Dispute routes for users
 */
export const disputeRoutes: RouteObject[] = [
  {
    path: 'creer-litige',
    element: <CreateDisputePage />,
  },
  {
    path: 'mes-litiges',
    element: <MyDisputesPage />,
  },
  {
    path: 'litige/:id',
    element: <DisputeDetailPage />,
  },
];

/**
 * Admin review moderation route
 */
export const reviewModerationRoute: RouteObject = {
  path: 'moderation-avis',
  element: <ReviewModerationPage />,
};