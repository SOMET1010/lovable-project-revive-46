import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/shared/lib/query-config';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import App from './App';
import './index.css';

// Fonction critique : Supprimer le loader initial du DOM
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.transition = 'opacity 0.4s ease';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
    }, 400);
  }
};

// Fonction pour afficher une erreur dans le loader
const showErrorInLoader = (error: unknown) => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.innerHTML = `
      <div style="text-align:center;padding:20px;">
        <div style="color:#dc2626;font-family:Inter,sans-serif;font-size:16px;margin-bottom:12px;">
          Erreur de chargement
        </div>
        <button onclick="window.location.reload()" style="background:#ea580c;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-family:Inter,sans-serif;">
          Rafraîchir la page
        </button>
      </div>
    `;
  }
  console.error('❌ Erreur de démarrage React:', error);
};

// Démarrage de l'application avec gestion d'erreur globale
try {
  const queryClient = createQueryClient();
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error("Élément #root introuvable");
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

  // Supprimer le loader une fois React monté
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(removeInitialLoader);
  } else {
    setTimeout(removeInitialLoader, 100);
  }

} catch (error) {
  showErrorInLoader(error);
}

// Fallback de sécurité : forcer la suppression du loader après 5 secondes
setTimeout(() => {
  const loader = document.getElementById('initial-loader');
  if (loader && loader.style.opacity !== '0') {
    removeInitialLoader();
  }
}, 5000);
