/**
 * Configuration et validation des variables d'environnement
 */

interface EnvConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  isDemoMode: boolean;
  supabase: {
    url: string;
    anonKey: string;
    isConfigured: boolean;
  };
}

function validateEnv(): EnvConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  // Vérifier si les variables Supabase sont configurées et valides
  const isSupabaseConfigured = 
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('demo') && 
    !supabaseAnonKey.includes('demo') &&
    supabaseUrl !== 'https://demo.supabase.co' &&
    supabaseAnonKey !== 'demo-anon-key-for-interface-only';

  // Mode demo si explicitement activé ou si Supabase n'est pas configuré
  const shouldUseDemoMode = demoMode || !isSupabaseConfigured;

  return {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isTest: import.meta.env.MODE === 'test',
    isDemoMode: shouldUseDemoMode,
    supabase: {
      url: supabaseUrl || 'https://demo.supabase.co',
      anonKey: supabaseAnonKey || 'demo-anon-key-for-interface-only',
      isConfigured: isSupabaseConfigured,
    },
  };
}

export const envConfig = validateEnv();

// Log du mode de fonctionnement
if (envConfig.isDemoMode) {
  console.log('🎭 MONTOITVPROD fonctionne en mode DÉMONSTRATION');
  console.log('📱 Interface fonctionnelle, backend simulé');
  console.log('⚙️  Configurez vos variables Supabase pour activer le mode production');
} else {
  console.log('🚀 MONTOITVPROD fonctionne en mode PRODUCTION');
  console.log('🔗 Backend Supabase activé');
}

export default envConfig;
