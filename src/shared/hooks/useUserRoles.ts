/**
 * Hook useUserRoles - Gestion centralisée des rôles utilisateur
 * Vérifie les rôles via Supabase RPC get_user_roles()
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { envConfig } from '@/shared/config/env.config';

// Type des rôles disponibles (correspondant à l'enum app_role en DB)
export type AppRole = 'admin' | 'moderator' | 'user' | 'trust_agent';

export interface UseUserRolesReturn {
  // État
  roles: AppRole[];
  loading: boolean;
  error: Error | null;
  
  // Méthodes de vérification
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasAllRoles: (roles: AppRole[]) => boolean;
  
  // Raccourcis pratiques
  isAdmin: boolean;
  isModerator: boolean;
  isTrustAgent: boolean;
  isUser: boolean;
  
  // Actions
  refreshRoles: () => Promise<void>;
}

// Rôles simulés pour le mode démo
const DEMO_ROLES: AppRole[] = ['user'];

export function useUserRoles(): UseUserRolesReturn {
  const { user } = useAuthStore();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction de chargement des rôles
  const fetchRoles = useCallback(async () => {
    // Mode démo : retourner des rôles simulés
    if (envConfig.isDemoMode) {
      setRoles(DEMO_ROLES);
      setLoading(false);
      setError(null);
      return;
    }

    // Pas d'utilisateur connecté
    if (!user?.id) {
      setRoles([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_user_roles', {
        _user_id: user.id
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      // Cast sécurisé des rôles retournés
      const userRoles = (data as AppRole[]) || [];
      setRoles(userRoles);
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Charger les rôles au montage et quand l'utilisateur change
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Méthodes de vérification mémorisées
  const hasRole = useCallback(
    (role: AppRole): boolean => roles.includes(role),
    [roles]
  );

  const hasAnyRole = useCallback(
    (checkRoles: AppRole[]): boolean => checkRoles.some(role => roles.includes(role)),
    [roles]
  );

  const hasAllRoles = useCallback(
    (checkRoles: AppRole[]): boolean => checkRoles.every(role => roles.includes(role)),
    [roles]
  );

  // Propriétés calculées mémorisées
  const computedValues = useMemo(() => ({
    isAdmin: roles.includes('admin'),
    isModerator: roles.includes('moderator'),
    isTrustAgent: roles.includes('trust_agent'),
    isUser: roles.includes('user'),
  }), [roles]);

  return {
    roles,
    loading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    ...computedValues,
    refreshRoles: fetchRoles,
  };
}

export default useUserRoles;
