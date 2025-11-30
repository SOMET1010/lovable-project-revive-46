// Export de tous les hooks de debouncing pour MonToit

// Hooks de base
export { useDebounce, useDebouncedCallback, useDebouncedSearch, useDebouncedFilters, useDebouncedAutoSave, DEBOUNCE_DELAYS } from './useDebounce';

// Hooks pour les requêtes débouncées
export { 
  useDebouncedProperties, 
  usePropertiesSearch, 
  useDebouncedFilters as usePropertyFilters, 
  useDebouncedFormSave,
  useOptimizedQuery 
} from './useDebouncedQueries';

// Hooks pour l'auto-save
export { 
  usePropertyFormAutoSave, 
  useAutoSaveForm, 
  useFormDraft 
} from './useAutoSave';

// Hooks étendus pour les propriétés
export { 
  usePropertyFormWithAutoSave, 
  usePropertyFormWithDraft 
} from '../property/hooks/usePropertyFormWithAutoSave';

// Extensions des hooks existants
export { 
  useDebouncedPropertyFilters 
} from './useProperties';