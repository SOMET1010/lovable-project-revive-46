import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { testDatabaseConnection } from '@/shared/lib/helpers/supabaseHealthCheck';
import { logger } from '@/shared/lib/logger';
import { normalizeUserType } from '@/shared/lib/utils';

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
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
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
    } catch (error: unknown) {
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
          details: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const attemptProfileRecovery = async (userId: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Attempting to create profile for user:', userId);

      // Try to create the profile directly
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          user_id: userId,
          email: userData.user.email,
          full_name: userData.user.user_metadata?.['full_name'] || '',
          user_type: normalizeUserType(userData.user.user_metadata?.['user_type']),
          phone: userData.user.user_metadata?.['phone'] || '',
        }, { onConflict: 'id' });

      if (error) {
        console.error('[AuthContext] Profile creation failed:', error);
        return false;
      }

      console.log('[AuthContext] Profile created successfully');
      return true;
    } catch (error) {
      console.error('[AuthContext] Profile recovery exception:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; user_type?: string; phone?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            user_type: normalizeUserType(userData.user_type),
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
    } catch (err: unknown) {
      return { error: err as AuthError };
    }
  };

  const signInWithProvider = async (provider: Provider) => {
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
    } catch (err: unknown) {
      return { error: err as AuthError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
    await loadProfile(user.id);
  };

  const resetPassword = async (email: string) => {
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
    } catch (err: unknown) {
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
