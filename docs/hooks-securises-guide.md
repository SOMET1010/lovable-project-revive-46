# 🔐 Guide des Hooks Sécurisés - MonToit v4.0

## 🎯 Vue d'ensemble

Les hooks sécurisés de MonToit remplacent les hooks traditionnels React par des versions renforcées avec gestion automatique des timeouts, cancellation, retry logic et monitoring des performances. Tous les hooks utilisent `AbortController` pour éviter les memory leaks et fournissent une gestion d'erreur robuste.

---

## 📋 Hooks Disponibles

### 1. 🌍 useHttp - Requêtes HTTP Sécurisées

**Remplacement sécurisé des fetch() standards avec gestion automatique des timeouts et retry.**

```typescript
import { useHttp } from '@/hooks/useHttp';

const { data, loading, error, cancel } = useHttp('/api/properties', {
  method: 'GET',
  timeout: 10000,           // Timeout automatique (10s)
  retries: 3,               // Nombre de retry
  retryDelay: 1000,         // Délai entre retry (1s)
  onSuccess: (data) => {
    console.log('Requête réussie:', data);
  },
  onError: (error) => {
    console.error('Erreur:', error.message);
  }
});

// Cancellation propre
useEffect(() => {
  return () => cancel();
}, []);
```

**Options disponibles :**

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `timeout` | number | 10000 | Timeout en millisecondes |
| `retries` | number | 3 | Nombre de tentatives |
| `retryDelay` | number | 1000 | Délai entre retry (ms) |
| `retryCondition` | function | auto | Condition pour retry |
| `signal` | AbortController | auto | Signal d'annulation |
| `headers` | object | {} | Headers HTTP |
| `credentials` | string | 'same-origin' | Gestion credentials |

**Retry automatique :**

```typescript
// Retry seulement pour erreurs réseau
const { data } = useHttp('/api/data', {
  retryCondition: (error) => {
    return error.name === 'NetworkError' || 
           error.code === 'NETWORK_ERROR';
  },
  maxRetries: 3
});

// Retry pour erreurs serveur (5xx)
const { data } = useHttp('/api/data', {
  retryCondition: (error) => {
    return error.status >= 500;
  },
  maxRetries: 2
});
```

---

### 2. ⚡ useAsync - Opérations Asynchrones Sécurisées

**Gestion sécurisée des opérations asynchrones avec AbortController intégré.**

```typescript
import { useAsync } from '@/hooks/useAsync';

const { execute, data, loading, error, cancel } = useAsync({
  onCancel: () => {
    console.log('Opération annulée');
  },
  onTimeout: () => {
    console.log('Timeout atteint');
  }
});

// Exécution
const handleExpensiveOperation = async () => {
  await execute(async (signal) => {
    // Opération qui peut être annulée
    const response = await fetch('/api/expensive', { signal });
    return response.json();
  }, { timeout: 30000 });
};
```

**Avantages :**

- ⏰ Timeout automatique configurable
- 🛑 Cancellation propre avec AbortController
- 📊 Métriques de performance intégrées
- 🔄 Retry automatique optionnel

---

### 3. 🎯 useDebouncedSearch - Recherche avec Debouncing

**Optimisation des requêtes de recherche avec debouncing intelligent et état de chargement.**

```typescript
import { useDebouncedSearch } from '@/hooks/useDebounce';

const { 
  debouncedValue, 
  searchTerm, 
  setSearchTerm, 
  isSearching, 
  results 
} = useDebouncedSearch('/api/search', {
  delay: 300,              // Délai debouncing
  minLength: 2,            // Minimum caractères
  maxResults: 20,          // Nombre max résultats
  transformResults: (data) => data.properties,
  onSearch: (term, signal) => {
    return fetch(`/api/search?q=${term}`, { signal });
  }
});

// Utilisation dans le composant
<input
  type="text"
  placeholder="Rechercher une propriété..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className={isSearching ? 'loading' : ''}
/>

{isSearching && <Spinner />}

// Affichage des résultats
{results.map(property => (
  <PropertyCard key={property.id} property={property} />
))}
```

**États disponibles :**

- `searchTerm` : Terme de recherche actuel
- `debouncedValue` : Valeur après debouncing
- `isSearching` : État de recherche en cours
- `results` : Résultats de la recherche
- `error` : Erreur éventuelle

---

### 4. 🗂️ useDebouncedFilters - Filtres Avancés

**Gestion des filtres complexes avec debouncing et cache automatique.**

```typescript
import { useDebouncedFilters } from '@/hooks/useDebounce';

const { 
  filters, 
  setFilters, 
  debouncedFilters, 
  isFiltering, 
  hasChanges 
} = useDebouncedFilters({
  delay: 500,               // Délai debouncing
  debounceKey: 'advanced-filters', // Clé de cache
  onFilter: (filters, signal) => {
    const params = new URLSearchParams(filters);
    return fetch(`/api/properties?${params}`, { signal });
  }
});

// Définir un filtre
const updatePriceRange = (min: number, max: number) => {
  setFilters(prev => ({
    ...prev,
    minPrice: min,
    maxPrice: max
  }));
};

// Interface utilisateur
<div className="filter-panel">
  <input
    type="number"
    placeholder="Prix min"
    value={filters.minPrice || ''}
    onChange={(e) => updatePriceRange(e.target.value, filters.maxPrice)}
  />
  
  <input
    type="number"
    placeholder="Prix max"
    value={filters.maxPrice || ''}
    onChange={(e) => updatePriceRange(filters.minPrice, e.target.value)}
  />
  
  {isFiltering && <LoadingIndicator />}
  {hasChanges && <ApplyButton />}
</div>
```

---

### 5. 💾 useDebouncedAutoSave - Sauvegarde Automatique

**Auto-sauvegarde des formulaires avec debouncing et validation.**

```typescript
import { useDebouncedAutoSave } from '@/hooks/useDebounce';

const { 
  debouncedValue, 
  isSaving, 
  saveStatus, 
  lastSaved 
} = useDebouncedAutoSave(formData, {
  delay: 1000,                    // Délai avant sauvegarde
  validate: (data) => {           // Validation avant sauvegarde
    return {
      valid: !!data.email && !!data.name,
      errors: {
        email: !data.email ? 'Email requis' : null,
        name: !data.name ? 'Nom requis' : null
      }
    };
  },
  onSave: async (data, signal) => {
    const response = await fetch('/api/save-form', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      signal
    });
    return response.json();
  },
  onSaveSuccess: (result) => {
    console.log('Sauvegarde réussie:', result);
  },
  onSaveError: (error) => {
    console.error('Erreur sauvegarde:', error);
  }
});

// Affichage de l'état
<div className="autosave-status">
  {isSaving && <span>Sauvegarde...</span>}
  {saveStatus === 'success' && (
    <span className="success">
      ✅ Sauvegardé à {lastSaved?.toLocaleTimeString()}
    </span>
  )}
  {saveStatus === 'error' && (
    <span className="error">
      ❌ Erreur de sauvegarde
    </span>
  )}
</div>
```

---

### 6. 🏠 useApplications - Gestion Candidatures

**Hook spécialisé pour la gestion des candidatures avec validation et cleanup automatique.**

```typescript
import { useApplications } from '@/hooks/useApplications';

const {
  applications,
  currentApplication,
  loading,
  error,
  createApplication,
  updateApplication,
  validateCurrentStep,
  submitApplication,
  cancelOperation
} = useApplications({
  onValidateStep: (step, data) => {
    // Validation personnalisée par étape
    return validationRules[step](data);
  },
  onSubmitSuccess: (result) => {
    navigate(`/candidature/confirmation/${result.id}`);
  },
  onSubmitError: (error) => {
    console.error('Erreur soumission:', error);
  }
});

// Validation de l'étape courante
const handleStepValidation = () => {
  const validation = validateCurrentStep(currentStep, formData);
  if (validation.isValid) {
    // Peut passer à l'étape suivante
    nextStep();
  } else {
    // Afficher les erreurs
    setErrors(validation.errors);
  }
};

// Soumission avec validation
const handleSubmit = async () => {
  const result = await submitApplication(formData);
  if (result.success) {
    // Redirection ou feedback
  }
};
```

---

## 🛡️ Fonctionnalités Sécurisées Communes

### 1. AbortController Intégré

Tous les hooks gèrent automatiquement l'AbortController :

```typescript
// Cancellation automatique à la destruction du composant
useEffect(() => {
  return () => {
    // Le hook annule automatiquement toutes les opérations
    console.log('Cleanup automatique effectué');
  };
}, []);
```

### 2. Memory Leak Prevention

```typescript
// Le registry centralisé surveille les ressources
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

const cleanup = useCleanupRegistry();

// Ressources automatiquement nettoyées
useEffect(() => {
  const controller = cleanup.createAbortController('request-id');
  const timer = cleanup.setTimeout(() => {}, 5000);
  
  return cleanup.cleanupComponent();
}, []);
```

### 3. Error Handling Standardisé

```typescript
// Tous les hooks exposent une gestion d'erreur uniforme
const { error } = useHttp('/api/data');

if (error) {
  switch (error.type) {
    case 'NETWORK_ERROR':
      // Gérer erreur réseau
      break;
    case 'TIMEOUT_ERROR':
      // Gérer timeout
      break;
    case 'VALIDATION_ERROR':
      // Gérer erreur validation
      break;
    default:
      // Erreur générique
  }
}
```

### 4. Performance Monitoring

```typescript
// Métriques intégrées pour tous les hooks
const { performance, data } = useHttp('/api/data');

// Données disponibles :
{
  duration: 1250,        // Durée en ms
  retryCount: 1,         // Nombre de retry
  timeoutUsed: false,    // Timeout atteint
  cacheHit: false        // Cache utilisé
}
```

---

## 🔧 Migration depuis les Hooks Traditionnels

### Avant (旧)

```typescript
// ❌ Hook traditionnel avec problèmes
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [dependency]);

// Problèmes :
// - Pas de cancellation
// - Pas de timeout
// - Pas de retry
// - Pas de gestion mémoire
```

### Après (新)

```typescript
// ✅ Hook sécurisé avec toutes les protections
const { data, loading, error, cancel } = useHttp('/api/data', {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  onSuccess: (result) => setData(result),
  onError: (error) => console.error(error)
});

// Cancellation automatique
useEffect(() => {
  return () => cancel();
}, []);
```

---

## 📊 Monitoring & Métriques

### Statistiques par Hook

```typescript
// Accès aux métriques globales
import { getHookMetrics } from '@/lib/performanceMonitor';

const metrics = getHookMetrics();

console.log('useHttp Stats:', {
  totalRequests: metrics.http.totalRequests,
  averageDuration: metrics.http.averageDuration,
  retryRate: metrics.http.retryRate,
  errorRate: metrics.http.errorRate
});
```

### Alertes de Performance

```typescript
// Configuration des seuils d'alerte
const config = {
  http: {
    timeoutWarning: 5000,    // Alerte si > 5s
    retryWarning: 5,         // Alerte si > 5 retry
    errorRateWarning: 0.1    // Alerte si > 10% erreur
  },
  async: {
    durationWarning: 10000,  // Alerte si > 10s
    memoryLeakThreshold: 100 // Alerte si > 100 ops non nettoyées
  }
};
```

---

## 🧪 Tests des Hooks

### Test unitaire useHttp

```typescript
import { renderHook, act } from '@testing-library/react';
import { useHttp } from '@/hooks/useHttp';

describe('useHttp', () => {
  test('devrait faire une requête GET', async () => {
    const { result } = renderHook(() => 
      useHttp('/api/test', { method: 'GET' })
    );

    await act(async () => {
      // Attendre que la requête se termine
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
  });

  test('devrait annuler la requête au cleanup', async () => {
    const { unmount } = renderHook(() => 
      useHttp('/api/test', { timeout: 10000 })
    );

    unmount(); // Déclenche le cleanup
    
    // Vérifier que l'AbortController a été appelé
    expect(mockAbortController.abort).toHaveBeenCalled();
  });
});
```

### Test d'intégration

```typescript
describe('Hook Integration', () => {
  test('devrait gérer retry avec backoff', async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData) });

    const { result } = renderHook(() => 
      useHttp('/api/test', { 
        retries: 3,
        retryDelay: 100
      })
    );

    // Attendre que le retry se termine
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

---

## 🚀 Bonnes Pratiques

### ✅ Recommandations

```typescript
// ✅ Utiliser les hooks sécurisés partout
const { data } = useHttp('/api/data', {
  timeout: 10000,
  retries: 3
});

// ✅ Gestion d'erreur explicite
const { error } = useHttp('/api/data');
if (error) {
  return <ErrorMessage error={error} />;
}

// ✅ Cancellation propre
useEffect(() => {
  return () => cancel();
}, []);

// ✅ Optimisation avec debouncing
const { debouncedValue } = useDebouncedSearch(searchTerm, {
  delay: 300
});

// ✅ Validation avant envoi
const { isValid } = useValidation(data);
if (!isValid) return;
```

### ❌ Anti-patterns à Éviter

```typescript
// ❌ Ne pas utiliser fetch() directement
const data = await fetch('/api/data'); // Risqué

// ❌ Ignorer les erreurs
useHttp('/api/data'); // Sans gestion d'erreur

// ❌ Oublier la cancellation
useEffect(() => {
  useHttp('/api/data');
}, []); // Pas de cleanup

// ❌ Timeout trop court
useHttp('/api/data', { timeout: 100 }); // Risqué pour APIs lentes
```

---

## 🔧 Configuration Avancée

### Personnalisation Globale

```typescript
// src/hooks/config.ts
export const hookConfig = {
  http: {
    defaultTimeout: 10000,
    defaultRetries: 3,
    defaultRetryDelay: 1000,
    maxRetries: 5,
    retryCondition: (error) => {
      // Retry pour erreurs réseau et serveur
      return error.name === 'NetworkError' || 
             (error.status >= 500 && error.status < 600);
    }
  },
  debounce: {
    defaultDelay: 300,
    maxDelay: 2000,
    enableCache: true
  },
  async: {
    defaultTimeout: 30000,
    enableMetrics: true
  }
};
```

### Intercepteurs (Interceptors)

```typescript
// Ajout d'intercepteurs pour logging automatique
useHttp('/api/data', {
  onRequest: (config) => {
    console.log('Request:', config);
  },
  onResponse: (response) => {
    console.log('Response:', response);
    return response;
  },
  onError: (error) => {
    console.error('HTTP Error:', error);
    // Logger vers Sentry
    Sentry.captureException(error);
  }
});
```

---

## 📚 Fichiers de Référence

- **Hook principal :** `src/hooks/useHttp.ts`
- **Debouncing :** `src/hooks/useDebounce.ts`
- **Applications :** `src/hooks/useApplications.ts`
- **Registry cleanup :** `src/lib/cleanupRegistry.ts`
- **Performance monitor :** `src/lib/performanceMonitor.ts`
- **Tests :** `src/test/hooks/`