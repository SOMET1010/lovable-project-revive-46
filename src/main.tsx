import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/shared/lib/query-config';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
// @ts-ignore - Ignore si le fichier n'existe pas encore dans votre structure
import { registerServiceWorker } from './registerServiceWorker';
import App from './App';
import './index.css';

// Création du client React Query
const queryClient = createQueryClient();

// Enregistrement du SW pour le mode PWA/Hors-ligne
try {
  if (typeof registerServiceWorker === 'function') {
    registerServiceWorker();
  }
} catch (e) {
  console.warn('Service Worker registration skipped');
}

// Fonction critique : Supprimer le loader initial du DOM une fois React prêt
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    // Transition douce pour éviter le flash blanc
    loader.style.transition = 'opacity 0.5s ease';
    loader.style.opacity = '0';
    
    // Suppression physique du DOM après la transition
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 500);
  }
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("L'élément racine 'root' est introuvable dans le document.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);

// Optimisation : Attendre que le navigateur soit "idle" pour retirer le loader
// Garantit que React a eu la priorité pour le rendu initial (First Paint)
if ('requestIdleCallback' in window) {
  // @ts-ignore - Typescript peut ne pas connaître requestIdleCallback selon la config
  window.requestIdleCallback(() => removeInitialLoader());
} else {
  // Fallback robuste pour Safari et anciens navigateurs
  setTimeout(removeInitialLoader, 100);
}
