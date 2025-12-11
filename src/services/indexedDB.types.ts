/**
 * Types pour IndexedDBService
 * Remplace les types 'any' par des interfaces strictement typées
 */

/**
 * Données de propriété stockées en favori (offline)
 */
export interface FavoritePropertyData {
  id: string;
  title: string;
  address: string | null;
  city: string;
  neighborhood?: string | null;
  monthly_rent: number;
  main_image: string | null;
  property_type: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  surface_area?: number | null;
  status?: string;
}

/**
 * Filtres de recherche stockés en historique
 */
export interface SearchFilters {
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minSurface?: number;
  maxSurface?: number;
  furnished?: boolean;
  parking?: boolean;
  query?: string;
}

/**
 * Coordonnées de localisation
 */
export interface GeoLocation {
  lat: number;
  lng: number;
}

/**
 * Données de la queue de synchronisation
 */
export interface SyncQueueData {
  propertyId?: string;
  action?: string;
  userId?: string;
  timestamp?: number;
  formData?: Record<string, unknown>;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
}

/**
 * Actions disponibles pour la queue de synchronisation
 */
export type SyncAction = 
  | 'favorite_add' 
  | 'favorite_remove' 
  | 'property_view' 
  | 'contact_submit';

/**
 * Statuts de synchronisation
 */
export type SyncStatus = 'synced' | 'pending' | 'error';

/**
 * Statuts de la queue
 */
export type QueueStatus = 'pending' | 'processing' | 'failed';

/**
 * Entrée de favori dans la base
 */
export interface FavoriteEntry {
  id: string;
  propertyData: FavoritePropertyData;
  addedAt: number;
  syncStatus: SyncStatus;
}

/**
 * Entrée d'historique de recherche
 */
export interface SearchHistoryEntry {
  id: number;
  query: string;
  filters: SearchFilters;
  location?: GeoLocation;
  timestamp: number;
}

/**
 * Entrée de queue de synchronisation
 */
export interface SyncQueueEntry {
  id: number;
  action: SyncAction;
  data: SyncQueueData;
  timestamp: number;
  retryCount: number;
  status: QueueStatus;
}

/**
 * Entrée de cache de propriété
 */
export interface PropertyCacheEntry {
  id: string;
  data: FavoritePropertyData;
  cachedAt: number;
  expiresAt: number;
}

/**
 * Statistiques de la base IndexedDB
 */
export interface IndexedDBStats {
  favoritesCount: number;
  searchHistoryCount: number;
  syncQueueCount: number;
  cacheCount: number;
  lastSync?: number;
}
