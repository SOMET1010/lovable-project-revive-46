// Configuration et service Supabase centralisé
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

class SupabaseService {
  private supabase: any = null;
  private initialized = false;

  // Initialisation du client Supabase
  initialize(config: SupabaseConfig) {
    if (typeof window !== 'undefined') {
      try {
        // Dynamique import pour éviter les erreurs SSR
        import('@supabase/supabase-js').then(({ createClient }) => {
          this.supabase = createClient(config.url, config.anonKey);
          this.initialized = true;
        }).catch((error) => {
          console.error('Erreur lors de l\'initialisation de Supabase:', error);
          // Fallback pour le développement
          this.createMockClient();
        });
      } catch (error) {
        console.error('Erreur lors de l\'import de Supabase:', error);
        this.createMockClient();
      }
    } else {
      // Côté serveur, utiliser le client réel
      this.createMockClient();
    }
  }

  // Client mock pour les erreurs ou le développement
  private createMockClient() {
    this.supabase = {
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase non configuré') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      },
      from: () => ({
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase non configuré') }),
        select: () => ({
          single: () => Promise.resolve({ data: null, error: new Error('Supabase non configuré') })
        }),
        update: () => Promise.resolve({ error: new Error('Supabase non configuré') }),
        eq: function() { return this; }
      })
    };
    this.initialized = true;
  }

  // Getter pour le client Supabase
  getClient() {
    if (!this.initialized) {
      console.warn('Supabase n\'est pas encore initialisé');
    }
    return this.supabase;
  }

  // Méthode pour vérifier si le client est prêt
  isReady(): boolean {
    return this.initialized && this.supabase !== null;
  }
}

// Export de l'instance singleton
export const supabaseService = new SupabaseService();

// Export du client par défaut (pour compatibilité)
export const supabase = {
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any, options?: any) => 
        supabaseService.getClient().storage.from(bucket).upload(path, file, options),
      getPublicUrl: (path: string) => 
        supabaseService.getClient().storage.from(bucket).getPublicUrl(path)
    })
  },
  from: (table: string) => ({
    insert: (data: any) => supabaseService.getClient().from(table).insert(data),
    select: () => ({
      single: () => supabaseService.getClient().from(table).select().single(),
      eq: (column: string, value: any) => supabaseService.getClient().from(table).select().eq(column, value)
    }),
    update: (data: any) => supabaseService.getClient().from(table).update(data),
    eq: (column: string, value: any) => supabaseService.getClient().from(table).eq(column, value)
  })
};

// Configuration automatique (remplacer par vos vraies clés)
const SUPABASE_CONFIG: SupabaseConfig = {
  url: import.meta.env['VITE_SUPABASE_URL'] || 'https://your-project.supabase.co',
  anonKey: import.meta.env['VITE_SUPABASE_ANON_KEY'] || 'your-anon-key'
};

// Initialisation automatique
if (typeof window !== 'undefined') {
  supabaseService.initialize(SUPABASE_CONFIG);
}

export default supabaseService;
