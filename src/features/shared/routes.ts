// Configuration des routes pour MONTOIT-STABLE

import { lazy } from 'react';

// Lazy loading des pages pour optimiser les performances
const ContactPage = lazy(() => import('./pages/ContactPage'));

export const contactRoutes = [
  {
    path: '/contact',
    element: ContactPage,
    meta: {
      title: 'Contactez-nous - MonToit',
      description: 'Contactez l\'équipe MonToit pour toute question concernant nos services immobiliers en Côte d\'Ivoire. Support réactif et équipe dédiée.',
      keywords: 'contact, support, immobilier, Côte d\'Ivoire, MonToit',
      canonical: '/contact'
    },
    breadcrumb: [
      { label: 'Accueil', href: '/' },
      { label: 'Contact', href: '/contact' }
    ]
  }
];

export const integrationInstructions = `
Instructions pour intégrer ces routes dans l'application :

1. Dans votre fichier de routes principal (ex: src/App.tsx ou src/routes.tsx) :

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { contactRoutes } from './features/shared/routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes existantes... */}
        
        {/* Nouvelles routes */}
        {contactRoutes.map((route) => (
          <Route 
            key={route.path}
            path={route.path} 
            element={
              <Suspense fallback={<div>Chargement...</div>}>
                <route.element />
              </Suspense>
            } 
          />
        ))}
        
        {/* Fallback route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

2. Pour React Router v6 avec lazy loading :

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  // Routes existantes...
  ...contactRoutes.map(route => ({
    path: route.path,
    element: route.element,
  }))
]);

function App() {
  return <RouterProvider router={router} />;
}
`;

export default contactRoutes;
