# Guide d'Implémentation du Système de Debouncing pour MonToit

## Vue d'ensemble

Ce guide explique comment utiliser le système de debouncing implémenté pour optimiser les requêtes API et améliorer les performances de l'application MonToit.

## Table des matières

1. [Introduction](#introduction)
2. [Hooks de base](#hooks-de-base)
3. [Recherche de propriétés](#recherche-de-propriétés)
4. [Filtres de recherche](#filtres-de-recherche)
5. [Auto-save de formulaires](#auto-save-de-formulaires)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Configuration recommandée](#configuration-recommandée)
8. [Bonnes pratiques](#bonnes-pratiques)

## Introduction

Le système de debouncing permet de :
- Réduire le nombre de requêtes API inutiles
- Améliorer les performances de l'interface utilisateur
- Éviter le spam de requêtes lors de la saisie
- Optimiser l'expérience utilisateur avec l'auto-save

## Hooks de base

### `useDebounce`

Hook générique pour débouncer n'importe quelle valeur :

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const MyComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Rechercher..."
    />
  );
};
```

### `useDebouncedCallback`

Hook pour débouncer des fonctions :

```typescript
import { useDebouncedCallback } from '@/hooks/useDebounce';

const MyComponent = () => {
  const debouncedApiCall = useDebouncedCallback((data) => {
    apiService.saveData(data);
  }, 500);

  const handleInputChange = (value) => {
    debouncedApiCall({ value, timestamp: Date.now() });
  };

  return <input onChange={(e) => handleInputChange(e.target.value)} />;
};
```

## Recherche de propriétés

### `useDebouncedProperties`

Hook spécialisé pour la recherche de propriétés avec debouncing automatique :

```typescript
import { useDebouncedProperties } from '@/hooks/useProperties';

const PropertySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    minPrice: 0,
    maxPrice: 0,
    propertyType: ''
  });

  const { 
    data: properties, 
    isLoading, 
    error,
    refetch 
  } = useDebouncedProperties(filters, searchQuery);

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher des propriétés..."
      />
      {isLoading && <div>Chargement...</div>}
      {properties?.map(property => <PropertyCard key={property.id} property={property} />)}
    </div>
  );
};
```

### `usePropertiesSearch`

Hook pour une recherche plus contrôlée avec callbacks manuels :

```typescript
import { usePropertiesSearch } from '@/hooks/useDebouncedQueries';

const AdvancedPropertySearch = () => {
  const {
    filters,
    searchQuery,
    results,
    loading,
    error,
    setFilters,
    setSearchQuery,
    search,
    clearResults
  } = usePropertiesSearch(
    { city: '', minPrice: 0 },
    ''
  );

  const handleSearch = () => {
    search(); // Déclenche une recherche manuelle
  };

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Rechercher</button>
      {loading && <div>Recherche en cours...</div>}
      {results.map(property => <PropertyCard key={property.id} property={property} />)}
    </div>
  );
};
```

## Filtres de recherche

### `useDebouncedPropertyFilters`

Hook pour gérer les filtres avec debouncing :

```typescript
import { useDebouncedPropertyFilters } from '@/hooks/useProperties';

const SearchFilters = () => {
  const {
    debouncedFilters,
    updateFilters,
    hasChanges
  } = useDebouncedPropertyFilters(
    { city: '', propertyType: '' },
    (filters) => {
      console.log('Filtres appliqués:', filters);
      // Déclencher une recherche ou mettre à jour l'URL
    }
  );

  return (
    <div>
      <select
        value={debouncedFilters.city}
        onChange={(e) => updateFilters({ city: e.target.value })}
      >
        <option value="">Toutes les villes</option>
        <option value="Abidjan">Abidjan</option>
      </select>
      {hasChanges && <div>Filtres en attente...</div>}
    </div>
  );
};
```

## Auto-save de formulaires

### `usePropertyFormWithAutoSave`

Hook pour les formulaires de propriétés avec auto-save :

```typescript
import { usePropertyFormWithAutoSave } from '@/hooks/property/usePropertyFormWithAutoSave';

const PropertyForm = () => {
  const {
    formData,
    isDirty,
    isSaving,
    isSaved,
    lastSaved,
    autoSaveError,
    updateField,
    manualSave,
    resetForm
  } = usePropertyFormWithAutoSave(
    null, // propertyId (null pour création)
    true, // enableAutoSave
    2000  // autoSaveDelay (2 secondes)
  );

  return (
    <form>
      <input
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        placeholder="Titre de la propriété"
      />
      
      {isSaving && <div>Sauvegarde en cours...</div>}
      {isSaved && <div>Sauvegardé avec succès!</div>}
      {autoSaveError && <div>Erreur: {autoSaveError}</div>}
      
      <button type="button" onClick={manualSave}>
        Sauvegarder maintenant
      </button>
    </form>
  );
};
```

### `useFormDraft`

Hook pour sauvegarder les brouillons de formulaires :

```typescript
import { useFormDraft } from '@/hooks/useAutoSave';

const ContactForm = () => {
  const {
    draftData,
    isDraftDirty,
    lastSaved,
    updateDraft,
    clearDraft,
    loadDraft
  } = useFormDraft(
    'contact-form',
    { name: '', email: '', message: '' },
    5000 // Auto-save toutes les 5 secondes
  );

  // Charger le brouillon au montage
  useEffect(() => {
    const saved = loadDraft();
    if (saved) {
      console.log('Brouillon chargé:', saved);
    }
  }, []);

  return (
    <form>
      <input
        value={draftData.name}
        onChange={(e) => updateDraft({ name: e.target.value })}
        placeholder="Votre nom"
      />
      {isDraftDirty && <div>Brouillon modifié - sauvegarde automatique</div>}
      <button type="button" onClick={clearDraft}>Effacer le brouillon</button>
    </form>
  );
};
```

## Exemples d'utilisation

### Recherche en temps réel avec filtres

```typescript
import { useDebouncedProperties, useDebouncedPropertyFilters } from '@/hooks';

const RealTimePropertySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtres avec debouncing
  const {
    debouncedFilters,
    updateFilters
  } = useDebouncedPropertyFilters(
    { city: '', propertyType: '', minPrice: 0 },
    (filters) => {
      // Mettre à jour l'URL avec les filtres
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  );

  // Propriétés débouncées
  const { data: properties, isLoading } = useDebouncedProperties(
    debouncedFilters,
    searchQuery
  );

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Recherche en temps réel..."
      />
      <select
        value={debouncedFilters.city}
        onChange={(e) => updateFilters({ city: e.target.value })}
      >
        <option value="">Toutes les villes</option>
        <option value="Abidjan">Abidjan</option>
      </select>
      {isLoading ? (
        <div>Recherche en cours...</div>
      ) : (
        <div>{properties?.length} propriétés trouvées</div>
      )}
    </div>
  );
};
```

### Formulaire avec validation et auto-save

```typescript
import { usePropertyFormWithAutoSave } from '@/hooks/property';

const AdvancedPropertyForm = () => {
  const {
    formData,
    errors,
    isDirty,
    isSaving,
    isSaved,
    autoSaveError,
    validationErrors,
    updateField,
    validateCurrentStep,
    submitForm
  } = usePropertyFormWithAutoSave(
    null, // Nouvelle propriété
    true, // Auto-save activé
    3000  // Délai de 3 secondes
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation avant soumission
    if (!validateCurrentStep()) {
      return;
    }

    // Soumission finale
    const result = await submitForm();
    if (result.success) {
      console.log('Propriété créée avec ID:', result.propertyId);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Titre"
        />
        {errors.title && <span className="error">{errors.title}</span>}
        {validationErrors.title && <span className="error">{validationErrors.title}</span>}
      </div>

      <div>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => updateField('price', parseInt(e.target.value))}
          placeholder="Prix"
        />
        {errors.price && <span className="error">{errors.price}</span>}
      </div>

      {isSaving && <div>Sauvegarde automatique en cours...</div>}
      {isSaved && <div>✓ Sauvegardé automatiquement</div>}
      {autoSaveError && <div className="error">Erreur de sauvegarde: {autoSaveError}</div>}

      <button type="submit">Créer la propriété</button>
    </form>
  );
};
```

## Configuration recommandée

### Délais de debouncing

```typescript
import { DEBOUNCE_DELAYS } from '@/hooks/useDebounce';

// Recommandations par type d'action
const DEBOUNCE_CONFIG = {
  SEARCH: DEBOUNCE_DELAYS.SEARCH,        // 300ms - Recherche rapide
  FILTERS: DEBOUNCE_DELAYS.FILTERS,      // 500ms - Filtres complexes
  AUTOSAVE: DEBOUNCE_DELAYS.AUTOSAVE,    // 1000ms - Auto-save standard
  TYPING: DEBOUNCE_DELAYS.TYPING,        // 500ms - Saisie de texte
  FORM_DRAFT: 5000,                      // 5s - Brouillon de formulaire
};
```

### Configuration React Query

```typescript
// Configuration optimisée pour les requêtes débouncées
const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,    // 5 minutes
  gcTime: 10 * 60 * 1000,      // 10 minutes
  refetchOnWindowFocus: false, // Désactiver pour éviter les requêtes inutiles
  retry: 2,                    // 2 tentatives max
};
```

## Bonnes pratiques

### 1. Ne pas débouncer tout

Utiliser le debouncing uniquement pour :
- Les champs de recherche
- Les filtres de recherche
- L'auto-save de formulaires
- Les requêtes potentiellement spamées

### 2. Choisir le bon délai

- **300ms** : Recherche en temps réel (réactif mais pas trop)
- **500ms** : Filtres complexes (pour éviter les requêtes rapides)
- **1000ms+** : Auto-save (laisser le temps à l'utilisateur de saisir)
- **5000ms+** : Brouillons (sauvegarde périodique)

### 3. Gérer les états

Toujours afficher :
- Un indicateur de chargement pendant les requêtes
- Un message de succès après sauvegarde
- Les erreurs de sauvegarde
- Le statut "en attente" pendant le debouncing

### 4. Optimiser les performances

```typescript
// Bon : Utiliser useMemo pour les filtres complexes
const finalFilters = useMemo(() => ({
  ...debouncedFilters,
  computedField: expensiveComputation(debouncedFilters)
}), [debouncedFilters]);

// Bon : Annuler les requêtes précédentes
useEffect(() => {
  const controller = new AbortController();
  
  fetchData(filters, controller.signal)
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Erreur:', err);
      }
    });

  return () => controller.abort();
}, [debouncedFilters]);
```

### 5. Tester le debouncing

```typescript
// Test de l'auto-save
it('should auto-save after delay when form changes', async () => {
  const { result } = renderHook(() => 
    usePropertyFormWithAutoSave(null, true, 1000)
  );

  act(() => {
    result.current.updateField('title', 'Test Property');
  });

  await waitFor(() => {
    expect(result.current.isDirty).toBe(true);
  }, { timeout: 500 });

  await waitFor(() => {
    expect(result.current.isSaved).toBe(true);
  }, { timeout: 2000 });
});
```

## Surveillance et monitoring

### Métriques à surveiller

- **Temps de réponse des requêtes** : Doit rester stable avec le debouncing
- **Nombre de requêtes** : Doit être réduit significativement
- **Taux d'erreurs** : Ne doit pas augmenter avec le debouncing
- **Expérience utilisateur** : Feedback visuel approprié

### Logs de débogage

```typescript
// Ajouter des logs pour monitorer les performances
useEffect(() => {
  if (isDirty) {
    console.log('Auto-save scheduled in', autoSaveDelay, 'ms');
  }
}, [isDirty, autoSaveDelay]);

useEffect(() => {
  if (isSaving) {
    console.log('Auto-save started at', new Date().toISOString());
  }
}, [isSaving]);

useEffect(() => {
  if (isSaved) {
    console.log('Auto-save completed at', new Date().toISOString());
  }
}, [isSaved]);
```

## Conclusion

Le système de debouncing améliore significativement les performances de MonToit en :

1. **Réduisant les requêtes API** inutiles
2. **Améliorant la réactivité** de l'interface
3. **Offrant une meilleure UX** avec l'auto-save
4. **Optimisant les performances** globales

Utilisez ces hooks de manière sélective en fonction des besoins spécifiques de chaque fonctionnalité.