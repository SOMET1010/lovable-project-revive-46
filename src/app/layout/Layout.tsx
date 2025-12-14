import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import HeaderPremium from './HeaderPremium';
import FooterPremium from './FooterPremium';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { ChunkLoadErrorBoundary } from '@/shared/ui/ChunkLoadErrorBoundary';
import { ToastContainer } from '@/shared/hooks/useToast';
import PageTransition from '@/shared/ui/PageTransition';
import { Breadcrumb } from '@/shared/ui/Breadcrumb';
import { GlobalLoadingSkeleton } from '@/shared/ui/GlobalLoadingSkeleton';
import { FloatingCallButton } from '@/shared/ui/FloatingCallButton';
import SUTAChatWidget from '@/shared/components/SUTAChatWidget';
import BottomNavigation from '@/shared/components/navigation/BottomNavigation';
import { CookieConsent } from '@/shared/ui/CookieConsent';

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
      {/* Skip Link pour navigation clavier (accessibilité WCAG 2.1) */}
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Aller au contenu principal"
      >
        Aller au contenu principal
      </a>
      
      {shouldShowHeaderFooter && <HeaderPremium />}
      {shouldShowHeaderFooter && <Breadcrumb />}
      <ToastContainer />
      {shouldShowHeaderFooter && <FloatingCallButton />}
      {shouldShowHeaderFooter && <SUTAChatWidget mode="floating" position="bottom-right" />}
      <ChunkLoadErrorBoundary>
        <Suspense fallback={<GlobalLoadingSkeleton variant={skeletonVariant} />}>
          {/* Wrapper synchronisant main + footer pour éviter le flash du footer */}
          <div className="flex flex-col min-h-screen">
            <main 
              id="main-content" 
              role="main"
              tabIndex={-1}
              className={shouldShowHeaderFooter ? 'flex-1 pb-20 md:pb-0 focus:outline-none' : 'flex-1 focus:outline-none'}
            >
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </main>
            {shouldShowHeaderFooter && <FooterPremium />}
          </div>
        </Suspense>
      </ChunkLoadErrorBoundary>
      {/* Mobile Bottom Navigation */}
      {shouldShowHeaderFooter && <BottomNavigation />}
      {/* Cookie Consent Banner */}
      <CookieConsent />
    </ErrorBoundary>
  );
}