/**
 * Hook pour gérer le mode démonstration
 * Intercepte les appels API et utilise des données factices
 */

import { useEffect } from 'react';
import { envConfig } from '@/shared/config/env.config';
import { demoService } from '@/shared/services/demoDataService';

// Intercepteur global pour les appels API
const setupApiInterceptors = () => {
  if (!envConfig.isDemoMode) return;

  console.log('🎭 Configuration des intercepteurs API pour le mode démo');

  // Intercepter les fetch pour les appels Supabase
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Si c'est un appel Supabase, simuler une réponse
    if (url.includes('supabase.co') || url.includes('rest/v1')) {
      console.log('🎭 Interception d\'appel Supabase en mode démo:', url);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simuler un délai réseau
      
      return new Response(JSON.stringify({
        data: [],
        error: null
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    return originalFetch(input, init);
  };

  // Intercepter les appels supabase.from()
  if (typeof window !== 'undefined' && (window as any).supabase) {
    const originalSupabase = (window as any).supabase;
    console.log('🎭 Interception des appels Supabase réels');
  }
};

export const useDemoMode = () => {
  useEffect(() => {
    if (envConfig.isDemoMode) {
      console.log('🎭 Mode démo activé - Configuration des services mock');
      setupApiInterceptors();
    }
  }, []);

  // Services de demo à utiliser dans les composants
  return {
    isDemoMode: envConfig.isDemoMode,
    services: envConfig.isDemoMode ? demoService : null,
    
    // Méthodes utilitaires
    simulateLoading: (min = 500, max = 1500) => {
      const delay = Math.random() * (max - min) + min;
      return new Promise(resolve => setTimeout(resolve, delay));
    },
    
    // Datos de ejemplo
    getDemoUser: () => ({
      id: 'demo-user-123',
      email: 'demo@montoit.ci',
      full_name: 'Utilisateur Démo',
      user_type: 'locataire'
    }),
    
    getDemoSession: () => ({
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      user: {
        id: 'demo-user-123',
        email: 'demo@montoit.ci'
      }
    })
  };
};

export default useDemoMode;