/**
 * Service API pour la gestion des propriétés avec cache intégré
 *
 * Ce service centralise tous les appels API liés aux propriétés immobilières
 * et utilise le CacheService pour optimiser les performances.
 */

import { supabase } from '@/services/supabase/client';
import { cacheService } from '@/shared/services/cacheService';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

const CACHE_TTL_MINUTES = 15;
const CACHE_PREFIX = 'properties_';

export interface PropertyFilters {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  status?: string;
}

/**
 * API de gestion des propriétés avec cache optimisé
 */
export const propertyApi = {
  /**
   * Récupère toutes les propriétés avec filtres optionnels (avec cache)
   */
  getAll: async (filters?: PropertyFilters) => {
    const cacheKey = `${CACHE_PREFIX}all_${JSON.stringify(filters || {})}`;
    const cached = cacheService.get<Property[]>(cacheKey);

    if (cached) {
      return { data: cached, error: null };
    }

    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.minRooms !== undefined) {
      query = query.gte('rooms', filters.minRooms);
    }

    if (filters?.maxRooms !== undefined) {
      query = query.lte('rooms', filters.maxRooms);
    }

    if (filters?.minArea !== undefined) {
      query = query.gte('area', filters.minArea);
    }

    if (filters?.maxArea !== undefined) {
      query = query.lte('area', filters.maxArea);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (data) {
      cacheService.set(cacheKey, data, CACHE_TTL_MINUTES);
    }

    return { data, error: null };
  },

  /**
   * Récupère une propriété par son ID (avec cache)
   */
  getById: async (id: string) => {
    const cacheKey = `${CACHE_PREFIX}id_${id}`;
    const cached = cacheService.get<Property>(cacheKey);

    if (cached) {
      return { data: cached, error: null };
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      cacheService.set(cacheKey, data, CACHE_TTL_MINUTES);
    }

    return { data, error: null };
  },

  /**
   * Récupère les propriétés d'un propriétaire (avec cache)
   */
  getByOwnerId: async (ownerId: string) => {
    const cacheKey = `${CACHE_PREFIX}owner_${ownerId}`;
    const cached = cacheService.get<Property[]>(cacheKey);

    if (cached) {
      return { data: cached, error: null };
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      cacheService.set(cacheKey, data, CACHE_TTL_MINUTES);
    }

    return { data, error: null };
  },

  /**
   * Récupère les propriétés en vedette (avec cache)
   */
  getFeatured: async () => {
    const cacheKey = `${CACHE_PREFIX}featured`;
    const cached = cacheService.get<Property[]>(cacheKey);

    if (cached) {
      return { data: cached, error: null };
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('featured', true)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    if (data) {
      cacheService.set(cacheKey, data, CACHE_TTL_MINUTES);
    }

    return { data, error: null };
  },

  /**
   * Crée une nouvelle propriété et invalide le cache
   */
  create: async (property: PropertyInsert) => {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (error) throw error;

    cacheService.invalidatePattern(CACHE_PREFIX);

    return { data, error: null };
  },

  /**
   * Met à jour une propriété et invalide le cache
   */
  update: async (id: string, updates: PropertyUpdate) => {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    cacheService.remove(`${CACHE_PREFIX}id_${id}`);
    cacheService.invalidatePattern(CACHE_PREFIX);

    return { data, error: null };
  },

  /**
   * Supprime une propriété et invalide le cache
   */
  delete: async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    cacheService.remove(`${CACHE_PREFIX}id_${id}`);
    cacheService.invalidatePattern(CACHE_PREFIX);

    return { data: null, error: null };
  },

  /**
   * Recherche de propriétés par texte (avec cache)
   */
  search: async (searchTerm: string) => {
    const cacheKey = `${CACHE_PREFIX}search_${searchTerm}`;
    const cached = cacheService.get<Property[]>(cacheKey);

    if (cached) {
      return { data: cached, error: null };
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      cacheService.set(cacheKey, data, CACHE_TTL_MINUTES);
    }

    return { data, error: null };
  },

  /**
   * Compte le nombre de propriétés avec filtres
   */
  count: async (filters?: PropertyFilters) => {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { count, error } = await query;

    if (error) throw error;
    return { data: count, error: null };
  },
};
