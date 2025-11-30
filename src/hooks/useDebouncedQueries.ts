import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useDebounce, useDebouncedCallback, DEBOUNCE_DELAYS } from './useDebounce';
import { propertyRepository } from '../api/repositories';
import type { PropertyFilters } from '../types/monToit.types';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

// ============================================================================
// HOOKS POUR LES REQUÊTES PROPRIÉTÉS AVEC DEBOUNCING
// ============================================================================

/**
 * Hook pour la recherche de propriétés avec debouncing
 * @param filters - Filtres de recherche
 * @param searchQuery - Requête de recherche textuelle
 * @param enabled - Activation de la requête
 * @returns Données de la requête avec debouncing
 */
export function useDebouncedProperties(
  filters: PropertyFilters = {},
  searchQuery: string = '',
  enabled: boolean = true
) {
  // Débouncer la requête de recherche (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  
  // Débouncer les filtres (500ms)
  const debouncedFilters = useDebounce(filters, DEBOUNCE_DELAYS.FILTERS);

  // Construire les filtres finaux avec la requête débouncée
  const finalFilters = {
    ...debouncedFilters,
    searchQuery: debouncedSearchQuery,
  };

  // Query React Query avec les filtres débouncés
  return useQuery({
    queryKey: ['properties', finalFilters],
    queryFn: () => propertyRepository.getAll(finalFilters),
    enabled: enabled && (!!debouncedSearchQuery || Object.keys(debouncedFilters).length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour la recherche de propriétés avec callback manuel et debouncing
 * @param filters - Filtres initiaux
 * @param searchQuery - Requête de recherche initiale
 * @returns Objet avec méthodes de recherche et résultats
 */
export function usePropertiesSearch(
  initialFilters: PropertyFilters = {},
  initialSearchQuery: string = ''
) {
  const [filters, setFilters] = useCallbackWithDebounce<PropertyFilters>(initialFilters, DEBOUNCE_DELAYS.FILTERS);
  const [searchQuery, setSearchQuery] = useCallbackWithDebounce<string>(initialSearchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fonction de recherche asynchrone avec annulation
  const performSearch = useCallback(async () => {
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ...filters,
        searchQuery,
      };

      const response = await propertyRepository.getAll(finalFilters);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      setResults(response.data || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Erreur lors de la recherche');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // Déclencher la recherche avec debouncing
  const searchWithDebounce = useDebouncedCallback(performSearch, 100);

  // Effectuer la recherche automatiquement
  useEffect(() => {
    if (searchQuery || Object.keys(filters).length > 0) {
      searchWithDebounce();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [filters, searchQuery, searchWithDebounce]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    filters,
    searchQuery,
    results,
    loading,
    error,
    setFilters,
    setSearchQuery,
    search: performSearch,
    clearResults: () => setResults([]),
  };
}

/**
 * Hook pour les filtres de recherche avec debouncing optimisé
 * @param initialFilters - Filtres initiaux
 * @param onFiltersChange - Callback appelé quand les filtres changent (débouncé)
 * @returns Méthodes de gestion des filtres
 */
export function useDebouncedFilters(
  initialFilters: PropertyFilters = {},
  onFiltersChange?: (filters: PropertyFilters) => void
) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<PropertyFilters>(initialFilters);

  // Debouncer les changements de filtres
  const debouncedSetFilters = useCallbackWithDebounce<PropertyFilters>(filters, DEBOUNCE_DELAYS.FILTERS, (newFilters) => {
    setDebouncedFilters(newFilters);
    onFiltersChange?.(newFilters);
  });

  useEffect(() => {
    debouncedSetFilters(filters);
  }, [filters, debouncedSetFilters]);

  const updateFilters = useCallback((updates: Partial<PropertyFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setDebouncedFilters(initialFilters);
    onFiltersChange?.(initialFilters);
  }, [initialFilters, onFiltersChange]);

  return {
    filters,
    debouncedFilters,
    updateFilters,
    resetFilters,
    hasChanges: JSON.stringify(filters) !== JSON.stringify(debouncedFilters),
  };
}

/**
 * Hook pour l'auto-save de formulaires avec debouncing
 * @param initialData - Données initiales
 * @param saveFunction - Fonction de sauvegarde
 * @param delay - Délai avant sauvegarde (défaut: 1000ms)
 * @returns État et méthodes de gestion du formulaire
 */
export function useDebouncedFormSave<T extends Record<string, any>>(
  initialData: T,
  saveFunction: (data: T) => Promise<{ error?: any }>,
  delay: number = DEBOUNCE_DELAYS.AUTOSAVE
) {
  const [data, setData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction de sauvegarde avec debouncing
  const debouncedSave = useDebouncedCallback(async (saveData: T) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await saveFunction(saveData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, delay);

  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    debouncedSave({ ...data, ...updates });
  }, [data, debouncedSave]);

  const manualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    debouncedSave(data);
  }, [data, debouncedSave]);

  const resetData = useCallback(() => {
    setData(initialData);
    setIsDirty(false);
    setError(null);
  }, [initialData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isDirty,
    isSaving,
    lastSaved,
    error,
    updateData,
    manualSave,
    resetData,
  };
}

// ============================================================================
// HOOKS UTILITAIRES POUR DEBOUNCING
// ============================================================================

/**
 * Hook utilitaire pour créer des fonctions de callback avec debouncing
 * @param initialValue - Valeur initiale
 * @param delay - Délai de debouncing
 * @param callback - Callback appelé après le délai
 * @returns Fonction de mise à jour débouncée
 */
function useCallbackWithDebounce<T>(
  initialValue: T,
  delay: number,
  callback?: (value: T) => void
) {
  const [value, setValue] = useState<T>(initialValue);
  
  const debouncedSetValue = useDebouncedCallback((newValue: T) => {
    setValue(newValue);
    callback?.(newValue);
  }, delay);

  const setDebouncedValue = useCallback((newValue: T) => {
    setValue(newValue);
    debouncedSetValue(newValue);
  }, [debouncedSetValue]);

  return [value, setDebouncedValue] as const;
}

/**
 * Hook pour optimiser les requêtes avec debouncing et mise en cache
 * @param queryKey - Clé de requête
 * @param queryFn - Fonction de requête
 * @param filters - Filtres à débouncer
 * @param delay - Délai de debouncing
 * @returns Résultat de la requête
 */
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<{ data: T; error?: any }>,
  filters: Record<string, any>,
  delay: number = 300
) {
  const debouncedFilters = useDebounce(filters, delay);

  return useQuery({
    queryKey: [...queryKey, debouncedFilters],
    queryFn,
    enabled: Object.keys(debouncedFilters).length > 0,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}