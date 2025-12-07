import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/shared/lib/query-config';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { registerServiceWorker } from './registerServiceWorker';
import App from './App.tsx';
import './index.css';

const queryClient = createQueryClient();

registerServiceWorker();

// Supprimer le loader initial une fois React monté
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.transition = 'opacity 0.3s ease';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  }
};

createRoot(document.getElementById('root')!).render(
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

// Attendre que React soit monté avant de retirer le loader
// requestIdleCallback pour ne pas bloquer le rendu initial
if ('requestIdleCallback' in window) {
  requestIdleCallback(removeInitialLoader, { timeout: 2000 });
} else {
  setTimeout(removeInitialLoader, 100);
}
