import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import { testDatabaseConnection } from '@/shared/lib/helpers/supabaseHealthCheck';
import { logger } from '@/shared/lib/logger';
import { envConfig } from '@/shared/config/env.config';

type Profile = Database['public']['Tables']['profiles']['Row'];

export type ProfileError = {
  type: 'network' | 'database' | 'not_found' | 'permission' | 'unknown';
  message: string;
  details?: string;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileError: ProfileError | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData: { full_name: string; user_type?: string; phone?: string }) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  clearProfileError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<ProfileError | null>(null);

  useEffect(() => {
    if (envConfig.isDemoMode) {
      // Mode démo : simuler un utilisateur
      console.log('🎭 Mode démo activé - Simulation d\'utilisateur');
      setLoading(true);
      
      setTimeout(() => {
        const demoUser = {
          id: 'demo-user-123',
          email: 'demo@montoit.ci',
          user_metadata: { 
            full_name: 'Utilisateur Démo',
            user_type: 'locataire'
          }
        } as User;
        
        const demoSession = {
          user: demoUser,
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24h
        } as Session;
        
        setUser(demoUser);
        setSession(demoSession);
        setLoading(false);
        
        // Charger un profil démo
        setProfile({
          id: 'demo-user-123',
          email: 'demo@montoit.ci',
          full_name: 'Utilisateur Démo',
          user_type: 'locataire',
          phone: '+225 XX XX XX XX',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        console.log('✅ Utilisateur démo initialisé');
      }, 1500);
      
      return;
    }

    // Mode production normal
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string, retryCount = 0) => {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 1500;

    // Skip loading in demo mode - profile is already set
    if (envConfig.isDemoMode) {
      return;
    }

    try {
      logger.debug('Loading user profile', { userId, attempt: retryCount + 1, maxRetries: MAX_RETRIES + 1 });

      if (retryCount === 0) {
        const healthCheck = await testDatabaseConnection();
        if (!healthCheck.success) {
          logger.error('Database connection failed', undefined, { message: healthCheck.message });
          setProfileError({
            type: 'network',
            message: 'Problème de connexion à la base de données',
            details: healthCheck.message
          });
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error('Error loading profile from Supabase', error as Error, { userId });

        if (error.message.includes('schema cache') || error.message.includes('Could not find the table')) {
          logger.error('Schema cache error - profiles table not accessible', undefined, { userId });
          setProfileError({
            type: 'database',
            message: 'Connexion à la base de données impossible',
            details: 'Could not find the table \'public.profiles\' in the schema cache\n\nLa table des profils n\'existe pas ou n\'est pas accessible. Veuillez contacter le support.'
          });
          setLoading(false);
          return;
        }

        if (error.code === 'PGRST116') {
          console.log('[AuthContext] Profile not found, attempting recovery...');
          const recovered = await attemptProfileRecovery(userId);
          if (recovered) {
            return loadProfile(userId, retryCount + 1);
          }

          setProfileError({
            type: 'not_found',
            message: 'Profil introuvable',
            details: 'Votre profil n\'a pas été créé correctement. Tentative de récupération échouée.'
          });
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
          console.warn('[AuthContext] Permission error detected');

          if (retryCount < MAX_RETRIES) {
            console.log('[AuthContext] Retrying after permission error...');
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
            return loadProfile(userId, retryCount + 1);
          }

          setProfileError({
            type: 'permission',
            message: 'Connexion à la base de données impossible',
            details: 'permission denied for table profiles\n\nVérifiez votre connexion Internet et réessayez dans quelques instants.'
          });
        } else {
          setProfileError({
            type: 'database',
            message: 'Erreur de base de données',
            details: error.message
          });
        }

        throw error;
      }

      if (!data) {
        console.warn('[AuthContext] No profile found for user:', userId);

        if (retryCount === 0) {
          console.log('[AuthContext] Attempting profile recovery...');
          const recovered = await attemptProfileRecovery(userId);
          if (recovered) {
            return loadProfile(userId, 1);
          }
        }

        if (retryCount < MAX_RETRIES) {
          console.log(`[AuthContext] Retrying in ${RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return loadProfile(userId, retryCount + 1);
        }

        console.error('[AuthContext] Profile not found after all retries');
        setProfileError({
          type: 'not_found',
          message: 'Profil introuvable',
          details: 'Impossible de trouver votre profil après plusieurs tentatives. Veuillez contacter le support.'
        });
        setLoading(false);
        return;
      }

      console.log('[AuthContext] Profile loaded successfully:', data.email);
      setProfile(data);
      setProfileError(null);
    } catch (error: any) {
      console.error('[AuthContext] Error loading profile:', error);

      if (retryCount < MAX_RETRIES) {
        console.log(`[AuthContext] Retrying after error in ${RETRY_DELAY * (retryCount + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return loadProfile(userId, retryCount + 1);
      }

      if (!profileError) {
        setProfileError({
          type: 'unknown',
          message: 'Erreur inconnue',
          details: error.message || 'Une erreur inattendue s\'est produite.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const attemptProfileRecovery = async (userId: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Attempting to recover profile for user:', userId);

      const { data, error } = await supabase.rpc('ensure_my_profile_exists');

      if (error) {
        console.error('[AuthContext] Profile recovery failed:', error);
        return false;
      }

      console.log('[AuthContext] Profile recovery result:', data);
      return data === true;
    } catch (error) {
      console.error('[AuthContext] Profile recovery exception:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (envConfig.isDemoMode) {
      // Mode démo : toujours réussir avec un message
      console.log('🎭 Mode démo - Connexion simulée');
      return { 
        error: { 
          message: 'Mode démo : Connectez-vous en mode production pour une vraie authentification',
          status: 200
        } as AuthError 
      };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; user_type?: string; phone?: string }) => {
    if (envConfig.isDemoMode) {
      console.log('🎭 Mode démo - Inscription simulée');
      return { 
        error: { 
          message: 'Mode démo : Inscrivez-vous en mode production pour créer un vrai compte',
          status: 200
        } as AuthError 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            user_type: userData.user_type || 'locataire',
            phone: userData.phone || '',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) return { error };

      if (data.user && !data.session) {
        return { error: null };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    if (envConfig.isDemoMode) {
      console.log('🎭 Mode démo - OAuth simulé');
      return { 
        error: { 
          message: 'Mode démo : Utilisez l\'authentification en mode production',
          status: 200
        } as AuthError 
      };
    }
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (envConfig.isDemoMode) {
      console.log('🎭 Mode démo - Déconnexion simulée');
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    if (envConfig.isDemoMode) {
      console.log('🎭 Mode démo - Mise à jour du profil simulée');
      // Simuler une mise à jour réussie
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
    await loadProfile(user.id);
  };

  const resetPassword = async (email: string) => {
    if (envConfig.isDemoMode) {
      console.log('🎭 Mode démo - Réinitialisation mot de passe simulée');
      return {
        error: {
          message: 'Mode démo : Utilisez la réinitialisation en mode production',
          status: 200,
          name: 'AuthError'
        } as AuthError
      };
    }
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (functionError) {
        console.error('[AuthContext] Error calling send-password-reset:', functionError);
        return {
          error: {
            message: functionError.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation',
            status: 500,
            name: 'AuthError'
          } as AuthError
        };
      }

      if (data?.emailNotFound) {
        return {
          error: {
            message: 'Aucun compte associé à cette adresse email',
            status: 404,
            name: 'AuthError'
          } as AuthError
        };
      }

      if (data?.error) {
        return {
          error: {
            message: data.error,
            status: 500,
            name: 'AuthError'
          } as AuthError
        };
      }

      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] Password reset exception:', err);
      return {
        error: {
          message: 'Erreur lors de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.',
          status: 500,
          name: 'AuthError'
        } as AuthError
      };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      setProfileError(null);
      await loadProfile(user.id);
    }
  };

  const clearProfileError = () => {
    setProfileError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      profileError,
      signIn,
      signUp,
      signInWithProvider,
      signOut,
      updateProfile,
      resetPassword,
      refreshProfile,
      clearProfileError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
