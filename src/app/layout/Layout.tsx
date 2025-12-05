import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import HeaderPremium from './HeaderPremium';
import FooterPremium from './FooterPremium';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { ToastContainer } from '@/shared/hooks/useToast';
import PageTransition from '@/shared/ui/PageTransition';
import { Breadcrumb } from '@/shared/ui/Breadcrumb';
import { GlobalLoadingSkeleton } from '@/shared/ui/GlobalLoadingSkeleton';

const noLayoutRoutes = ['/auth/callback'];
const noHeaderFooterRoutes = [
  '/admin',
  '/visiter',
  '/mes-visites',
  '/verification',
  '/mes-certificats',
];

// Map routes to skeleton variants
function getSkeletonVariant(path: string): 'default' | 'dashboard' | 'property' | 'list' | 'form' {
  if (path.includes('dashboard') || path.includes('tableau-de-bord')) return 'dashboard';
  if (path.includes('propriete/') || path.includes('annonce/')) return 'property';
  if (path.includes('recherche') || path.includes('favoris') || path.includes('visites')) return 'list';
  if (path.includes('ajouter') || path.includes('modifier') || path.includes('inscription')) return 'form';
  return 'default';
}

export default function Layout() {
  const location = useLocation();
  const path = location.pathname;

  const shouldShowLayout = !noLayoutRoutes.includes(path);
  const shouldShowHeaderFooter =
    !noHeaderFooterRoutes.some((route) => path.startsWith(route)) && !noLayoutRoutes.includes(path);
  const skeletonVariant = getSkeletonVariant(path);

  if (!shouldShowLayout) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<GlobalLoadingSkeleton variant={skeletonVariant} />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {shouldShowHeaderFooter && <HeaderPremium />}
      {shouldShowHeaderFooter && <Breadcrumb />}
      <ToastContainer />
      <Suspense fallback={<GlobalLoadingSkeleton variant={skeletonVariant} />}>
        <main className={shouldShowHeaderFooter ? 'min-h-screen' : ''}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </Suspense>
      {shouldShowHeaderFooter && <FooterPremium />}
    </ErrorBoundary>
  );
}