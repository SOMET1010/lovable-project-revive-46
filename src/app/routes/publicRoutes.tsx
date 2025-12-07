// Force rebuild - 2025-12-07T20:00:00Z
import { RouteObject } from 'react-router-dom';
import { lazyWithRetry } from '@/shared/utils/lazyLoad';
import SearchErrorBoundary from '@/features/tenant/components/SearchErrorBoundary';

// TEST: Import direct de HomePage pour déboguer le problème de lazy loading
import Home from '@/features/property/pages/HomePage';

// Autres pages en lazy load
const NotFound = lazyWithRetry(() => import('@/features/property/pages/NotFoundPage'));
const AddPropertyLanding = lazyWithRetry(() => import('@/features/property/pages/AddPropertyLandingPage'));

// Property pages
const SearchProperties = lazyWithRetry(() => import('@/features/tenant/pages/SearchPropertiesPage'));
const PropertyDetail = lazyWithRetry(() => import('@/features/tenant/pages/PropertyDetailPage'));

// Static pages
const AboutPage = lazyWithRetry(() => import('@/features/auth/pages/AboutPage'));
const TermsOfServicePage = lazyWithRetry(() => import('@/features/auth/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazyWithRetry(() => import('@/features/auth/pages/PrivacyPolicyPage'));
const ContactPage = lazyWithRetry(() => import('@/features/auth/pages/ContactPage'));
const HelpPage = lazyWithRetry(() => import('@/features/auth/pages/HelpPage'));
const FAQPage = lazyWithRetry(() => import('@/features/auth/pages/FAQPage'));
const HowItWorksPage = lazyWithRetry(() => import('@/features/auth/pages/HowItWorksPage'));

export const publicRoutes: RouteObject[] = [
  // Home - IMPORT DIRECT pour test
  { index: true, element: <Home /> },

  // Static pages
  { path: 'a-propos', element: <AboutPage /> },
  { path: 'conditions-utilisation', element: <TermsOfServicePage /> },
  { path: 'politique-confidentialite', element: <PrivacyPolicyPage /> },
  { path: 'mentions-legales', element: <TermsOfServicePage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'aide', element: <HelpPage /> },
  { path: 'faq', element: <FAQPage /> },
  { path: 'comment-ca-marche', element: <HowItWorksPage /> },
  { path: 'guide', element: <HowItWorksPage /> },

  // Property landing pages
  { path: 'ajouter-propriete', element: <AddPropertyLanding /> },
  { path: 'louer-mon-bien', element: <AddPropertyLanding /> },

  // Property search & details
  { path: 'recherche', element: <SearchErrorBoundary><SearchProperties /></SearchErrorBoundary> },
  { path: 'propriete/:id', element: <PropertyDetail /> },
  { path: 'properties/:id', element: <PropertyDetail /> },
  { path: 'proprietes/:id', element: <PropertyDetail /> },

  // 404 fallback
  { path: '*', element: <NotFound /> },
];
