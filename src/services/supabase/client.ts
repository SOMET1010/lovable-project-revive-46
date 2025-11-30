import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { envConfig } from '@/shared/config/env.config';

// Client Supabase pour le mode demo (mock)
const createDemoSupabaseClient = () => {
  console.log('🎭 Création du client Supabase en mode DÉMONSTRATION');
  
  // Mock data pour les démos
  const mockData = {
    properties: [
      {
        id: 'demo-prop-1',
        title: 'Villa moderne à Cocody',
        price: 150000,
        location: 'Cocody, Abidjan',
        property_type: 'villa',
        status: 'available',
        bedrooms: 4,
        bathrooms: 3,
        area: 250,
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-prop-2',
        title: 'Appartement 3 pièces à Plateau',
        price: 80000,
        location: 'Plateau, Abidjan',
        property_type: 'apartment',
        status: 'available',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        created_at: new Date().toISOString()
      }
    ],
    users: [
      {
        id: 'demo-user-123',
        email: 'demo@montoit.ci',
        full_name: 'Utilisateur Démo',
        user_type: 'locataire',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    stats: {
      total_properties: 1250,
      total_users: 850,
      total_visits: 3200
    }
  };

  // Fonction helper pour créer les requêtes mockées
  const createMockQuery = () => {
    const query = {
      select: () => query,
      eq: () => query,
      neq: () => query,
      gt: () => query,
      gte: () => query,
      lt: () => query,
      lte: () => query,
      like: () => query,
      ilike: () => query,
      is: () => query,
      in: () => query,
      contains: () => query,
      containedBy: () => query,
      rangeGt: () => query,
      rangeGte: () => query,
      rangeLt: () => query,
      rangeLte: () => query,
      rangeAdjacent: () => query,
      overlaps: () => query,
      textSearch: () => query,
      not: () => query,
      or: () => query,
      filter: () => query,
      order: () => query,
      limit: () => query,
      range: () => query,
      single: () => Promise.resolve({ 
        data: mockData.users[0], 
        error: null,
        status: 200,
        statusText: 'OK'
      }),
      maybeSingle: () => Promise.resolve({ 
        data: mockData.users[0], 
        error: null,
        status: 200,
        statusText: 'OK'
      }),
      then: (resolve: any) => resolve({ 
        data: mockData.properties, 
        error: null,
        status: 200,
        statusText: 'OK'
      })
    };
    return query;
  };

  // Retourner un client factice avec des méthodes mockées
  return {
    auth: {
      getSession: () => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      }),
      onAuthStateChange: (callback: any) => {
        // Simuler un utilisateur démo
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'demo-user-123',
              email: 'demo@montoit.ci',
              user_metadata: { full_name: 'Utilisateur Démo' }
            },
            access_token: 'demo-token',
            refresh_token: 'demo-refresh'
          });
        }, 1000);
        
        return {
          data: { subscription: { unsubscribe: () => {} } }
        };
      },
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Mode démo - Connexion non disponible' } 
      }),
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Mode démo - Inscription non disponible' } 
      }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithOAuth: () => Promise.resolve({ error: { message: 'Mode démo - OAuth non disponible' } })
    },
    from: (table: string) => ({
      select: () => createMockQuery(),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      upsert: () => Promise.resolve({ data: null, error: null })
    }),
    functions: {
      invoke: () => Promise.resolve({ data: null, error: { message: 'Mode démo - Fonctions non disponibles' } })
    },
    channel: (name: string) => {
      const channel = {
        on: (event: string, config: any, callback: any) => {
          // Retourner le même objet pour permettre les appels en chaîne .on().on()
          return channel;
        },
        subscribe: () => ({
          unsubscribe: () => {},
          status: 'SUBSCRIBED',
          onStatusChange: () => {},
          // Retourner aussi l'objet pour compatibilité
          then: () => Promise.resolve()
        }),
        unsubscribe: () => {}
      };
      return channel;
    },
    getChannels: () => [],
    removeChannel: () => Promise.resolve({ error: null })
  } as any;
};

// Client Supabase normal
const createNormalSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing required Supabase environment variables. ' +
      'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. ' +
      'See .env.example for reference.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

// Créer le client approprié selon le mode
export const supabase = envConfig.isDemoMode 
  ? createDemoSupabaseClient()
  : createNormalSupabaseClient();
