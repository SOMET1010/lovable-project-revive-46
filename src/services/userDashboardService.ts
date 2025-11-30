/**
 * Service Dashboard Utilisateur
 * Gestion centralisée des données du dashboard personnel
 */

import { supabase } from './supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  user_type: string;
  active_role: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  address: string | null;
  is_verified: boolean;
  profile_setup_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  search_params: Record<string, any>;
  results_count: number;
  search_query: string | null;
  city: string | null;
  property_type: string | null;
  min_price: number | null;
  max_price: number | null;
  bedrooms: number | null;
  created_at: string;
}

export interface FavoriteProperty {
  id: string;
  user_id: string;
  property_id: string;
  notes: string | null;
  created_at: string;
  property?: {
    id: string;
    title: string;
    city: string;
    neighborhood: string | null;
    property_type: string;
    monthly_rent: number;
    bedrooms: number;
    bathrooms: number;
    surface_area: number | null;
    main_image: string | null;
    status: string;
  };
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalFavorites: number;
  totalSearches: number;
  totalAlerts: number;
  unreadNotifications: number;
}

// ============================================================================
// PROFIL UTILISATEUR
// ============================================================================

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export async function getUserProfile(): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('Utilisateur non connecté') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as UserProfile, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erreur lors de la récupération du profil'),
    };
  }
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: authError || new Error('Utilisateur non connecté') };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Erreur lors de la mise à jour du profil'),
    };
  }
}

/**
 * Upload avatar utilisateur
 */
export async function uploadAvatar(file: File): Promise<{ url: string | null; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { url: null, error: authError || new Error('Utilisateur non connecté') };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);

    // Mettre à jour le profil avec la nouvelle URL
    await updateUserProfile({ avatar_url: publicUrl });

    return { url: publicUrl, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error : new Error('Erreur lors de l\'upload de l\'avatar'),
    };
  }
}

// ============================================================================
// HISTORIQUE DE RECHERCHE
// ============================================================================

/**
 * Récupérer l'historique de recherche de l'utilisateur
 */
export async function getSearchHistory(limit = 20): Promise<{ data: SearchHistoryItem[] | null; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('Utilisateur non connecté') };
    }

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    return { data: data as SearchHistoryItem[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erreur lors de la récupération de l\'historique'),
    };
  }
}

/**
 * Ajouter une recherche à l'historique
 */
export async function addSearchToHistory(
  searchParams: Record<string, any>,
  resultsCount: number,
  searchQuery?: string
): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: authError || new Error('Utilisateur non connecté') };
    }

    const { error } = await supabase.rpc('add_search_to_history', {
      p_user_id: user.id,
      p_search_params: searchParams,
      p_results_count: resultsCount,
      p_search_query: searchQuery || null,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Erreur lors de l\'ajout à l\'historique'),
    };
  }
}

/**
 * Supprimer un élément de l'historique
 */
export async function deleteSearchHistoryItem(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', id);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Erreur lors de la suppression'),
    };
  }
}

/**
 * Effacer tout l'historique de recherche
 */
export async function clearSearchHistory(): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: authError || new Error('Utilisateur non connecté') };
    }

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Erreur lors de l\'effacement de l\'historique'),
    };
  }
}

// ============================================================================
// FAVORIS
// ============================================================================

/**
 * Récupérer les propriétés favorites de l'utilisateur
 */
export async function getFavorites(): Promise<{ data: FavoriteProperty[] | null; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('Utilisateur non connecté') };
    }

    const { data, error } = await supabase
      .from('property_favorites')
      .select(`
        *,
        property:properties(
          id,
          title,
          city,
          neighborhood,
          property_type,
          monthly_rent,
          bedrooms,
          bathrooms,
          surface_area,
          main_image,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data: data as FavoriteProperty[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erreur lors de la récupération des favoris'),
    };
  }
}

/**
 * Ajouter une propriété aux favoris
 */
export async function addToFavorites(propertyId: string, notes?: string): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: authError || new Error('Utilisateur non connecté') };
    }

    const { error } = await supabase
      .from('property_favorites')
      .insert({
        user_id: user.id,
        property_id: propertyId,
        notes: notes || null,
      });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Erreur lors de l\'ajout aux favoris'),
    };
  }
}

/**
 * Retirer une propriété des favoris
 */
export async function removeFromFavorites(propertyId: string): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: authError || new Error('Utilisateur non connecté') };
    }

    const { error } = await supabase
      .from('property_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Erreur lors de la suppression des favoris'),
    };
  }
}

/**
 * Vérifier si une propriété est dans les favoris
 */
export async function isFavorite(propertyId: string): Promise<{ isFavorite: boolean; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isFavorite: false, error: authError || new Error('Utilisateur non connecté') };
    }

    const { data, error } = await supabase
      .from('property_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      return { isFavorite: false, error };
    }

    return { isFavorite: !!data, error: null };
  } catch (error) {
    return {
      isFavorite: false,
      error: error instanceof Error ? error : new Error('Erreur lors de la vérification'),
    };
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Récupérer les notifications de l'utilisateur
 */
export async function getNotifications(limit = 50): Promise<{ data: NotificationItem[] | null; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('Utilisateur non connecté') };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    return { data: data as NotificationItem[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erreur lors de la récupération des notifications'),
    };
  }
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Erreur lors de la mise à jour'),
    };
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllNotificationsAsRead(): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: authError || new Error('Utilisateur non connecté') };
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Erreur lors de la mise à jour'),
    };
  }
}

// ============================================================================
// STATISTIQUES DASHBOARD
// ============================================================================

/**
 * Récupérer les statistiques du dashboard
 */
export async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('Utilisateur non connecté') };
    }

    // Favoris
    const { count: favoritesCount } = await supabase
      .from('property_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Recherches
    const { count: searchesCount } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Alertes
    const { count: alertsCount } = await supabase
      .from('property_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Notifications non lues
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return {
      data: {
        totalFavorites: favoritesCount || 0,
        totalSearches: searchesCount || 0,
        totalAlerts: alertsCount || 0,
        unreadNotifications: unreadCount || 0,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erreur lors de la récupération des statistiques'),
    };
  }
}
