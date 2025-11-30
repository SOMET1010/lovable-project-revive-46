# 🏠 Guide des Bonnes Pratiques - Équipe MonToit

**Version :** 1.0  
**Date :** 1er décembre 2025  
**Basé sur :** Analyses et corrections appliquées au projet MonToit v4.0.0

---

## 📋 Table des Matières

1. [Bonnes Pratiques React](#1-bonnes-pratiques-react)
2. [Guidelines TypeScript](#2-guidelines-typescript)
3. [Patterns de Gestion d'Erreur](#3-patterns-de-gestion-derreur)
4. [Optimisations Performance](#4-optimisations-performance)
5. [Standards de Code](#5-standards-de-code)
6. [Tests et Validation](#6-tests-et-validation)
7. [Sécurité](#7-sécurité)
8. [Accessibilité](#8-accessibilité)
9. [Monitoring et Observabilité](#9-monitoring-et-observabilité)

---

## 1. Bonnes Pratiques React

### 1.1 Null Checks et Sécurité des Données

#### ✅ Pattern Obligatoire : Optional Chaining

```typescript
// ❌ AVOID - Risque d'erreur runtime
const title = contractData.property.title;
const ownerName = userData.user.full_name;

// ✅ CORRECT - Accès sécurisé
const title = contractData?.property?.title || 'Titre par défaut';
const ownerName = userData?.user?.full_name || 'Propriétaire';

// ✅ CORRECT - Valeurs par défaut pour l'affichage
const propertyTitle = data?.property?.title || 'Propriété sans titre';
const agentEmail = data?.agent?.email || 'Email non disponible';
```

#### ✅ Pattern : Validation avant Utilisation

```typescript
// ✅ Pattern recommandé pour les validations
function SafeComponent({ data }) {
  // Validation immédiate
  if (!data?.user?.id) {
    return <div>Données utilisateur manquantes</div>;
  }

  // Utilisation sécurisée
  const userId = data.user.id;
  const userName = data.user.name || 'Utilisateur anonyme';

  return (
    <div>
      <h2>{userName}</h2>
      <p>ID: {userId}</p>
    </div>
  );
}
```

#### ✅ Pattern : Accès aux Collections

```typescript
// ✅ Accès sécurisé aux arrays
const tags = [...(data?.tags || [])];
const objects = (data?.objects || []).map(obj => obj.name);
const colors = (data?.color?.dominantColors || []).join(', ');

// ✅ Filtrage sécurisé
const filteredResults = items?.filter(item => 
  item?.category?.toLowerCase().includes(searchTerm.toLowerCase())
) || [];
```

### 1.2 Mémorisation et Optimisation

#### ✅ Pattern : useMemo pour Calculs Coûteux

```typescript
// ✅ Mémorisation des calculs coûteux
const expensiveCalculation = useMemo(() => {
  return propertyData?.features?.map(feature => ({
    ...feature,
    score: calculateFeatureScore(feature, userPreferences)
  }));
}, [propertyData, userPreferences]);

// ✅ Mémorisation des filtres derived
const filteredProperties = useMemo(() => {
  return properties?.filter(property => {
    return (
      (!filters.city || property.city === filters.city) &&
      (!filters.price || property.price <= filters.price) &&
      (!filters.type || property.type === filters.type)
    );
  });
}, [properties, filters]);
```

#### ✅ Pattern : useCallback pour Stabilité des Références

```typescript
// ✅ Stabilité des handlers
const handlePropertySelect = useCallback((propertyId: string) => {
  setSelectedProperty(propertyId);
  analytics.track('property_selected', { propertyId });
}, [setSelectedProperty]);

// ✅ Stabilité des mutations
const createProperty = useCallback(async (propertyData) => {
  try {
    await propertyService.create(propertyData);
    queryClient.invalidateQueries(['properties']);
  } catch (error) {
    // Gestion d'erreur avec ErrorHandler
    ErrorHandler.logError(error, { context: 'createProperty' });
  }
}, [queryClient]);

// ✅ Dépendances correctes
const filteredItems = useMemo(() => 
  items.filter(item => item?.category === selectedCategory),
  [items, selectedCategory] // Dépendances explicites
);
```

### 1.3 Gestion du Cycle de Vie (Cleanup)

#### ✅ Pattern : Cleanup des Effects

```typescript
// ✅ AbortController pour les fetchs
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  };

  fetchData();

  // Cleanup obligatoire
  return () => controller.abort();
}, [dependency]);

// ✅ Cleanup des timers
useEffect(() => {
  const intervalId = setInterval(() => {
    checkNotifications();
  }, 30000);

  return () => clearInterval(intervalId);
}, []);

// ✅ Cleanup des event listeners
useEffect(() => {
  const handleResize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### ✅ Pattern : Subscription Cleanup

```typescript
// ✅ Cleanup des subscriptions
useEffect(() => {
  const subscription = supabase
    .channel('property-updates')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'properties' },
      handlePropertyUpdate
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [handlePropertyUpdate]);

// ✅ Cleanup des async operations
useEffect(() => {
  let isCancelled = false;

  const loadData = async () => {
    const data = await fetchData();
    if (!isCancelled) {
      setData(data);
    }
  };

  loadData();

  return () => {
    isCancelled = true;
  };
}, [fetchData]);
```

### 1.4 Patterns de Composants

#### ✅ Pattern : Composants avec Loading States

```typescript
// ✅ Loading states explicites
function PropertyList({ filters }) {
  const { data: properties, isLoading, error } = useProperties(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={() => refetch()} />;
  }

  if (!properties?.length) {
    return <EmptyState message="Aucune propriété trouvée" />;
  }

  return (
    <div className="grid gap-4">
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

#### ✅ Pattern : Composants avec Error Boundaries

```typescript
// ✅ Boundary pour récupération gracieuse
class PropertyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Logging pour monitoring
    ErrorHandler.logError(error, { 
      context: 'PropertyErrorBoundary',
      errorInfo 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <h2>Une erreur est survenue</h2>
          <button onClick={() => window.location.reload()}>
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 2. Guidelines TypeScript

### 2.1 Types Stricts et Interfaces

#### ✅ Pattern : Interfaces Détaillées

```typescript
// ✅ Interface complète et explicite
interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  propertyType: 'house' | 'apartment' | 'villa' | 'land';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: PropertyImage[];
  amenities: string[];
  owner: PropertyOwner;
  createdAt: string;
  updatedAt: string;
}

// ✅ Interfaces imbriquées
interface PropertyOwner {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isVerified: boolean;
}

interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}
```

#### ✅ Pattern : Types Union pour States

```typescript
// ✅ States explicites
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

type RequestStatus = 
  | { status: 'idle' }
  | { status: 'loading'; data?: any }
  | { status: 'success'; data: any }
  | { status: 'error'; error: Error };

// ✅ Usage dans les hooks
function useAsyncOperation() {
  const [state, setState] = useState<RequestStatus>({ status: 'idle' });

  const execute = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await performOperation();
      setState({ status: 'success', data });
    } catch (error) {
      setState({ status: 'error', error });
    }
  }, []);
}
```

### 2.2 Éviter `any` et Utiliser Types Appropriés

#### ✅ Pattern : Types Génériques

```typescript
// ❌ AVOID - Usage de 'any'
const processData = (data: any) => data.property?.title;

// ✅ CORRECT - Types spécifiques
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error';
}

const processProperty = (response: ApiResponse<Property>): string => {
  return response.data?.title || 'Titre par défaut';
};

// ✅ Types génériques pour les hooks
function useApi<T>(
  queryKey: string[],
  queryFn: () => Promise<T>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
  });
}
```

#### ✅ Pattern : Type Guards

```typescript
// ✅ Validation de types runtime
function isProperty(data: any): data is Property {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.price === 'number'
  );
}

// ✅ Usage du type guard
function processData(data: unknown) {
  if (isProperty(data)) {
    // TypeScript sait que data est Property ici
    console.log(data.title, data.price);
  } else {
    console.log('Données invalides');
  }
}

// ✅ Narrowing avec predicates
const validProperties = properties.filter((prop): prop is Property => {
  return prop && typeof prop.id === 'string' && typeof prop.title === 'string';
});
```

### 2.3 Configuration TypeScript Stricte

#### ✅ Pattern : Configuration Recommandée

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

#### ✅ Pattern : Utils Types

```typescript
// ✅ Types utilitaires pour l'équipe
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

type NonNullable<T> = T extends null | undefined ? never : T;

// ✅ Usage
type PropertyCreateInput = Optional<Property, 'id' | 'createdAt' | 'updatedAt'>;

type VerifiedProperty = RequiredFields<Property, 'owner'>;

// ✅ Transform utilities
type PropertyDTO = {
  [K in keyof Property as `property_${K}`]: Property[K];
};

// ✅ Response types
type ApiError = {
  code: string;
  message: string;
  details?: Record<string, any>;
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
};
```

---

## 3. Patterns de Gestion d'Erreur

### 3.1 Architecture Centralisée

#### ✅ Pattern : ErrorHandler avec Retry

```typescript
// ✅ Service avec retry automatique
export class PropertyService {
  async createProperty(data: PropertyCreateInput) {
    return ErrorHandler.executeWithRetry(
      async () => {
        const result = await this.supabase
          .from('properties')
          .insert([data])
          .select()
          .single();
        
        if (result.error) throw result.error;
        return result.data;
      },
      {
        service: 'PropertyService',
        operation: 'createProperty',
        context: { userId: data.ownerId }
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        timeout: 30000,
        retryCondition: ErrorHandler.isRetryableError
      }
    );
  }

  async updateProperty(id: string, updates: Partial<Property>) {
    return ErrorHandler.executeWithRetry(
      async () => {
        const { data, error } = await this.supabase
          .from('properties')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      {
        service: 'PropertyService',
        operation: 'updateProperty',
        context: { propertyId: id }
      }
    );
  }
}
```

#### ✅ Pattern : Classification des Erreurs

```typescript
// ✅ Classification automatique
const isRetryableError = (error: any): boolean => {
  // Erreurs réseau
  if (error.name === 'NetworkError') return true;
  if (error.code === 'NETWORK_ERROR') return true;
  
  // Timeouts
  if (error.code === 'TIMEOUT') return true;
  
  // Erreurs serveur temporaires
  if (error.status >= 500 && error.status < 600) return true;
  
  // Rate limiting
  if (error.status === 429) return true;
  
  // Erreurs Supabase temporaires
  if (error.code?.startsWith('PGRST')) return true;
  
  return false;
};

// ✅ Erreurs non réessayables
const isNonRetryableError = (error: any): boolean => {
  // Authentification
  if (error.status === 401) return true;
  if (error.message?.includes('JWT')) return true;
  
  // Autorisation
  if (error.status === 403) return true;
  
  // Validation
  if (error.status === 400) return true;
  
  // Contraintes métier
  if (error.code === 'BUSINESS_RULE_VIOLATION') return true;
  
  return false;
};
```

### 3.2 Hooks avec Gestion d'Erreur

#### ✅ Pattern : useAsync avec Error Handling

```typescript
// ✅ Hook générique avec gestion d'erreur
function useAsync<T, P extends any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  options: {
    context?: Record<string, any>;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false
  });

  const execute = useCallback(async (...args: P) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await asyncFunction(...args);
      setState({ data, error: null, isLoading: false });
      options.onSuccess?.(data);
      return data;
    } catch (error) {
      const appError = ErrorHandler.formatError(error);
      setState({ data: null, error: appError, isLoading: false });
      options.onError?.(appError);
      throw appError;
    }
  }, [asyncFunction, options]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { execute, reset, ...state };
}

// ✅ Usage dans un composant
function PropertyForm() {
  const { execute, isLoading, error } = useAsync(
    (propertyData) => propertyService.createProperty(propertyData),
    {
      context: { component: 'PropertyForm' },
      onSuccess: (data) => {
        toast.success('Propriété créée avec succès');
        router.push(`/properties/${data.id}`);
      },
      onError: (error) => {
        toast.error(`Erreur: ${error.message}`);
      }
    }
  );

  const handleSubmit = async (propertyData) => {
    await execute(propertyData);
  };
}
```

#### ✅ Pattern : Graceful Degradation

```typescript
// ✅ Dégradation gracieuse pour les fonctionnalités non-critiques
function PropertyFeatures({ propertyId }) {
  const { data: features, error, isLoading } = useQuery({
    queryKey: ['property-features', propertyId],
    queryFn: () => propertyService.getFeatures(propertyId),
    // Dégradation gracieuse : continue même en cas d'erreur
    retry: 1,
    onError: (error) => {
      console.warn('Features unavailable:', error.message);
    }
  });

  return (
    <div>
      <h3>Caractéristiques</h3>
      
      {isLoading && <LoadingSpinner />}
      
      {error && (
        <div className="text-sm text-gray-500">
          Caractéristiques temporairement indisponibles
        </div>
      )}
      
      {/* Fonctionnalité dégradée */}
      {features ? (
        <ul>
          {features.map(feature => (
            <li key={feature.id}>{feature.name}</li>
          ))}
        </ul>
      ) : (
        // Fallback UI
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}
```

### 3.3 Logging et Monitoring

#### ✅ Pattern : Context Logging

```typescript
// ✅ Logging avec contexte riche
const logOperation = (operation: string, data: any) => {
  ErrorHandler.logInfo(`Operation: ${operation}`, {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    data: data ? JSON.stringify(data) : null
  });
};

// ✅ Usage dans les services
async function createApplication(applicationData) {
  logOperation('createApplication_start', applicationData);
  
  try {
    const result = await this.supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();
    
    logOperation('createApplication_success', { id: result.data?.id });
    
    return result.data;
  } catch (error) {
    logOperation('createApplication_error', {
      error: error.message,
      data: applicationData
    });
    
    throw error;
  }
}
```

---

## 4. Optimisations Performance

### 4.1 Debouncing et Throttling

#### ✅ Pattern : Recherche avec Debouncing

```typescript
// ✅ Hook de recherche optimisé
function usePropertySearch() {
  const [filters, setFilters] = useState({
    city: '',
    priceRange: [0, 1000000],
    propertyType: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Debouncing pour la recherche
  const debouncedSearchQuery = useDebounce(
    searchQuery, 
    DEBOUNCE_DELAYS.SEARCH // 300ms
  );

  // Debouncing pour les filtres
  const debouncedFilters = useDebounce(
    filters,
    DEBOUNCE_DELAYS.FILTERS // 500ms
  );

  // Query avec filtres débouncés
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', debouncedFilters, debouncedSearchQuery],
    queryFn: () => propertyService.search({
      ...debouncedFilters,
      searchQuery: debouncedSearchQuery
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    filters,
    searchQuery,
    setFilters,
    setSearchQuery,
    properties,
    isLoading
  };
}

// ✅ Composant de recherche
function PropertySearch() {
  const {
    filters,
    searchQuery,
    setFilters,
    setSearchQuery,
    properties,
    isLoading
  } = usePropertySearch();

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher une propriété..."
      />
      
      <select
        value={filters.city}
        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
      >
        <option value="">Toutes les villes</option>
        <option value="Abidjan">Abidjan</option>
      </select>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <PropertyList properties={properties} />
      )}
    </div>
  );
}
```

#### ✅ Pattern : Auto-save avec Debouncing

```typescript
// ✅ Hook d'auto-save optimisé
function useFormAutoSave<T>(
  initialData: T,
  saveFunction: (data: T) => Promise<void>,
  delay: number = 2000
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounced save
  const debouncedSave = useDebounce(async (data: T) => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      await saveFunction(data);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      ErrorHandler.logError(error, { context: 'autosave' });
    } finally {
      setIsSaving(false);
    }
  }, delay);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    debouncedSave({ ...formData, [field]: value });
  }, [formData, debouncedSave]);

  const saveNow = useCallback(async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      await saveFunction(formData);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      ErrorHandler.logError(error, { context: 'manual_save' });
    } finally {
      setIsSaving(false);
    }
  }, [formData, isDirty, saveFunction]);

  return {
    formData,
    isDirty,
    isSaving,
    lastSaved,
    updateField,
    saveNow
  };
}
```

### 4.2 Optimisation des Hooks

#### ✅ Pattern : Mémorisation avec useMemo

```typescript
// ✅ Calculs coûteux mémorisés
function PropertyAnalytics({ properties }) {
  // Calculs coûteux mémosés
  const analytics = useMemo(() => {
    return {
      averagePrice: calculateAveragePrice(properties),
      priceDistribution: getPriceDistribution(properties),
      topCities: getTopCities(properties),
      marketTrends: calculateMarketTrends(properties)
    };
  }, [properties]);

  // Filtres derived mémorisés
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      return (
        analytics.averagePrice > 0 &&
        property.price <= analytics.averagePrice * 2 &&
        property.status === 'available'
      );
    });
  }, [properties, analytics]);

  return (
    <div>
      <AnalyticsSummary data={analytics} />
      <PropertyGrid properties={filteredProperties} />
    </div>
  );
}
```

#### ✅ Pattern : Cache avec React Query

```typescript
// ✅ Configuration de cache optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ✅ Prefetch pour optimisation
function usePropertyPrefetch() {
  const queryClient = useQueryClient();

  const prefetchProperty = useCallback(async (propertyId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['property', propertyId],
      queryFn: () => propertyService.getById(propertyId),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  }, [queryClient]);

  const prefetchRelatedProperties = useCallback(async (city: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['properties', { city }],
      queryFn: () => propertyService.getByCity(city),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [queryClient]);

  return { prefetchProperty, prefetchRelatedProperties };
}
```

### 4.3 Memory Management

#### ✅ Pattern : Cleanup des Resources

```typescript
// ✅ Registry de cleanup pour tracking
class CleanupRegistry {
  private static instance: CleanupRegistry;
  private cleanups: Map<string, () => void> = new Map();

  static getInstance() {
    if (!CleanupRegistry.instance) {
      CleanupRegistry.instance = new CleanupRegistry();
    }
    return CleanupRegistry.instance;
  }

  register(id: string, cleanup: () => void) {
    this.cleanups.set(id, cleanup);
  }

  unregister(id: string) {
    const cleanup = this.cleanups.get(id);
    if (cleanup) {
      cleanup();
      this.cleanups.delete(id);
    }
  }

  cleanupAll() {
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups.clear();
  }
}

// ✅ Hook avec cleanup registry
function useResourceCleanup() {
  const registry = CleanupRegistry.getInstance();

  useEffect(() => {
    return () => {
      // Cleanup spécifique au composant
      registry.unregister('component-resources');
    };
  }, []);

  const registerCleanup = useCallback((id: string, cleanup: () => void) => {
    registry.register(id, cleanup);
  }, []);

  return { registerCleanup };
}
```

---

## 5. Standards de Code

### 5.1 Structure des Fichiers

#### ✅ Pattern : Organisation par Feature

```
src/
├── features/
│   ├── property/
│   │   ├── components/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyList.tsx
│   │   │   └── PropertyForm.tsx
│   │   ├── hooks/
│   │   │   ├── useProperties.ts
│   │   │   └── usePropertyForm.ts
│   │   ├── services/
│   │   │   └── propertyService.ts
│   │   ├── types/
│   │   │   └── property.types.ts
│   │   └── pages/
│   │       └── PropertyPage.tsx
│   └── shared/
│       ├── components/
│       ├── hooks/
│       └── utils/
└── shared/
    ├── components/
    ├── hooks/
    └── types/
```

#### ✅ Pattern : Convention de Nommage

```typescript
// ✅ Nommage des composants
// PascalCase pour les composants React
export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return <div>{property.title}</div>;
};

// ✅ Nommage des hooks
// camelCase avec préfixe 'use'
export const useProperties = (filters?: any) => {
  // Hook implementation
};

// ✅ Nommage des services
// camelCase pour les fonctions
export const propertyService = {
  async getById(id: string): Promise<Property> {
    // Service implementation
  },
  async create(data: PropertyCreateInput): Promise<Property> {
    // Service implementation
  }
};

// ✅ Nommage des types
// PascalCase avec suffixes descriptifs
type Property = {
  id: string;
  title: string;
};

type PropertyCreateInput = Omit<Property, 'id'>;
type PropertyListProps = {
  properties: Property[];
};
type PropertyFormData = PropertyCreateInput;
```

### 5.2 Patterns de Code Réutilisables

#### ✅ Pattern : Higher-Order Components

```typescript
// ✅ HOC pour la gestion d'erreur
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          ErrorHandler.logError(error, { 
            context: 'ErrorBoundary',
            errorInfo 
          });
        }}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// ✅ HOC pour le loading state
function withLoadingState<P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ComponentType = LoadingSpinner
) {
  return function WithLoadingStateComponent(props: P & { isLoading?: boolean }) {
    const { isLoading, ...componentProps } = props;
    
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    return <Component {...(componentProps as P)} />;
  };
}

// ✅ Usage des HOCs
const SafePropertyCard = withErrorBoundary(PropertyCard);
const LoadingPropertyCard = withLoadingState(SafePropertyCard);
```

#### ✅ Pattern : Custom Hooks Composables

```typescript
// ✅ Hook composable pour les données avec cache
function useCachedData<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleTime?: number;
  } = {}
) {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: key,
    queryFn: fetcher,
    staleTime: options.staleTime ?? 1000 * 60 * 5,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: key });
  }, [queryClient, key]);

  const updateData = useCallback((updater: (oldData: T) => T) => {
    queryClient.setQueryData(key, updater);
  }, [queryClient, key]);

  return { data, isLoading, error, refetch, invalidate, updateData };
}

// ✅ Hook composable pour les filtres
function useFilters<T>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);
  
  const updateFilter = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(initialFilters);
  }, [filters, initialFilters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasChanges
  };
}

// ✅ Composition des hooks
function usePropertySearch() {
  const filters = useFilters<PropertyFilters>({
    city: '',
    priceRange: [0, 1000000],
    propertyType: ''
  });

  const propertyData = useCachedData<Property[]>(
    ['properties', filters.filters],
    () => propertyService.search(filters.filters),
    { ttl: 1000 * 60 * 5 }
  );

  return {
    ...filters,
    ...propertyData
  };
}
```

### 5.3 Patterns de State Management

#### ✅ Pattern : Zustand Stores Modulaires

```typescript
// ✅ Store modulaire pour l'UI
interface UIState {
  sidebarOpen: boolean;
  loading: Record<string, boolean>;
  notifications: Notification[];
  setSidebarOpen: (open: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  loading: {},
  notifications: [],
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setLoading: (key, loading) => set((state) => ({
    loading: {
      ...state.loading,
      [key]: loading
    }
  })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        ...notification,
        id: crypto.randomUUID()
      }
    ]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));

// ✅ Store pour l'authentification
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      set({
        user: data.user,
        session: data.session,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  refreshSession: async () => {
    const { data } = await supabase.auth.refreshSession();
    set({
      user: data.user,
      session: data.session
    });
  }
}));
```

---

## 6. Tests et Validation

### 6.1 Tests Unitaires

#### ✅ Pattern : Tests avec Null Checks

```typescript
// ✅ Test de robustesse des données
describe('PropertyCard', () => {
  it('✅ Gère les données de propriété manquantes', () => {
    // Test avec données null
    const { container } = render(
      <PropertyCard property={null} />
    );
    
    expect(container.textContent).toContain('Titre par défaut');
  });

  it('✅ Utilise les valeurs par défaut sécurisées', () => {
    const incompleteProperty = {
      id: '123',
      title: null,
      price: undefined,
      owner: {
        name: 'John Doe'
      }
    };

    const { getByText } = render(
      <PropertyCard property={incompleteProperty} />
    );

    expect(getByText(/Titre par défaut/)).toBeInTheDocument();
    expect(getByText('0 €')).toBeInTheDocument(); // Prix par défaut
  });

  it('✅ Accès sécurisé aux propriétés imbriquées', () => {
    const property = {
      id: '123',
      title: 'Test Property',
      owner: {
        fullName: 'Owner Name',
        email: 'owner@test.com'
      }
    };

    render(<PropertyCard property={property} />);
    
    expect(screen.getByText('Owner Name')).toBeInTheDocument();
    expect(screen.getByText('owner@test.com')).toBeInTheDocument();
  });
});
```

#### ✅ Pattern : Tests des Hooks Custom

```typescript
// ✅ Test du hook useProperties
describe('useProperties', () => {
  const mockPropertyService = {
    getAll: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ Charge les propriétés avec filtres', async () => {
    const mockProperties = [
      { id: '1', title: 'Property 1', price: 100000 },
      { id: '2', title: 'Property 2', price: 150000 }
    ];
    
    mockPropertyService.getAll.mockResolvedValue(mockProperties);

    const { result } = renderHook(() => 
      useProperties({ city: 'Abidjan' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockProperties);
    expect(mockPropertyService.getAll).toHaveBeenCalledWith({
      city: 'Abidjan'
    });
  });

  it('✅ Gère les erreurs gracieusement', async () => {
    const mockError = new Error('Failed to fetch');
    mockPropertyService.getAll.mockRejectedValue(mockError);

    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeNull();
  });
});
```

### 6.2 Tests d'Intégration

#### ✅ Pattern : Tests de Flux Complets

```typescript
// ✅ Test du flux de création de propriété
describe('Property Creation Flow', () => {
  it('✅ Crée une propriété avec succès', async () => {
    const user = mockUser();
    const propertyData = {
      title: 'Nouvelle Propriété',
      price: 500000,
      city: 'Abidjan',
      propertyType: 'house'
    };

    // Mock des services
    jest.spyOn(propertyService, 'create').mockResolvedValue({
      id: 'new-property-id',
      ...propertyData
    });

    render(
      <QueryClient client={queryClient}>
        <PropertyForm />
      </QueryClient>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/titre/i), {
      target: { value: propertyData.title }
    });

    fireEvent.change(screen.getByLabelText(/prix/i), {
      target: { value: propertyData.price.toString() }
    });

    fireEvent.change(screen.getByLabelText(/ville/i), {
      target: { value: propertyData.city }
    });

    // Soumettre
    fireEvent.click(screen.getByRole('button', { name: /créer/i }));

    // Vérifier le résultat
    await waitFor(() => {
      expect(propertyService.create).toHaveBeenCalledWith(
        expect.objectContaining(propertyData)
      );
    });

    expect(screen.getByText(/propriété créée/i)).toBeInTheDocument();
  });

  it('✅ Gère les erreurs de validation', async () => {
    render(
      <QueryClient client={queryClient}>
        <PropertyForm />
      </QueryClient>
    );

    // Essayer de soumettre sans remplir les champs obligatoires
    fireEvent.click(screen.getByRole('button', { name: /créer/i }));

    // Vérifier les messages d'erreur
    await waitFor(() => {
      expect(screen.getByText(/titre requis/i)).toBeInTheDocument();
      expect(screen.getByText(/prix requis/i)).toBeInTheDocument();
    });
  });
});
```

### 6.3 Tests de Performance

#### ✅ Pattern : Tests de Mémoire

```typescript
// ✅ Test de mémoire pour les hooks
describe('Memory Usage Tests', () => {
  it('✅ Nettoie les subscriptions correctement', () => {
    const { unmount } = renderHook(() => useProperties());

    // Vérifier qu'il n'y a pas de fuites mémoire
    unmount();

    // Simuler un garbage collection et vérifier
    if (global.gc) {
      global.gc();
    }

    // Les subscriptions должны être nettoyées
    // (Vérification via des outils de monitoring mémoire)
  });

  it('✅ Debouncing n\\'accumule pas les timers', () => {
    const { rerender } = renderHook(
      (props) => useDebounce(props.value, 300),
      { initialProps: { value: 'test1' } }
    );

    // Plusieurs re-renders rapides
    for (let i = 0; i < 10; i++) {
      rerender({ value: `test${i + 2}` });
    }

    // Les anciens timers doivent être nettoyés
    // Vérification via des tools de profiling
  });
});
```

---

## 7. Sécurité

### 7.1 Validation des Données

#### ✅ Pattern : Validation avec Zod

```typescript
// ✅ Schémas de validation complets
import { z } from 'zod';

// Validation des propriétés
const PropertySchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.number().positive('Le prix doit être positif').max(100000000, 'Prix trop élevé'),
  city: z.enum(['Abidjan', 'Bouaké', 'Yamoussoukro'], {
    errorMap: () => ({ message: 'Ville invalide' })
  }),
  propertyType: z.enum(['house', 'apartment', 'villa', 'land']),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(1).max(10),
  area: z.number().positive().max(10000),
  address: z.string().min(5, 'Adresse trop courte'),
  images: z.array(z.string().url()).max(20, 'Trop d\\'images')
});

// Validation de création
const PropertyCreateSchema = PropertySchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// ✅ Usage dans les services
export class PropertyService {
  async createProperty(data: unknown) {
    // Validation des données d'entrée
    const validatedData = PropertyCreateSchema.parse(data);
    
    // Validation métier supplémentaire
    if (validatedData.price < 50000) {
      throw new Error('Prix minimum: 50,000 FCFA');
    }

    // Traitement sécurisé
    return this.supabase
      .from('properties')
      .insert([validatedData])
      .select()
      .single();
  }
}
```

#### ✅ Pattern : Sanitisation des Inputs

```typescript
// ✅ Sanitisation des données utilisateur
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

// ✅ Validation des uploads
const ImageUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB max
    'Le fichier ne doit pas dépasser 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Format de fichier non supporté'
  ),
  description: z.string().max(200).optional()
});

// ✅ Hook de validation
function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: unknown): data is T => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema]);

  return { errors, validate };
}
```

### 7.2 Sécurité des APIs

#### ✅ Pattern : Authentification et Autorisation

```typescript
// ✅ Middleware d'authentification
function withAuth(handler: RequestHandler) {
  return async (req: Request, res: Response) => {
    try {
      const token = extractToken(req);
      
      if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Token invalide' });
      }

      // Ajouter l'utilisateur à la requête
      (req as any).user = user;
      
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur d\\'authentification' });
    }
  };
}

// ✅ Vérification des permissions
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!hasPermission(user, permission)) {
      return res.status(403).json({ 
        error: 'Permissions insuffisantes' 
      });
    }
    
    next();
  };
}

// ✅ Usage dans les routes
app.post('/properties', 
  withAuth,
  requirePermission('create_property'),
  createPropertyHandler
);
```

#### ✅ Pattern : Rate Limiting

```typescript
// ✅ Rate limiting par utilisateur
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// ✅ Middleware de rate limiting
function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const userId = user?.id || req.ip;
    
    if (!checkRateLimit(userId, limit, windowMs)) {
      return res.status(429).json({
        error: 'Trop de requêtes, veuillez réessayer plus tard'
      });
    }
    
    next();
  };
}
```

---

## 8. Accessibilité

### 8.1 Standards WCAG

#### ✅ Pattern : Navigation Clavier

```typescript
// ✅ Composants accessibles
function PropertyCard({ property }: PropertyCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Action du clic
      navigateToProperty(property.id);
    }
  };

  return (
    <article
      role="article"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-labelledby={`property-title-${property.id}`}
      aria-describedby={`property-description-${property.id}`}
      className="property-card"
    >
      <img
        src={property.images?.[0]?.url}
        alt={`Photo de la propriété ${property.title}`}
        loading="lazy"
      />
      
      <h3 id={`property-title-${property.id}`}>
        {property.title || 'Propriété sans titre'}
      </h3>
      
      <p id={`property-description-${property.id}`}>
        {property.description || 'Aucune description disponible'}
      </p>
      
      <div aria-label={`Prix: ${property.price || 0} FCFA`}>
        {property.price ? `${property.price.toLocaleString()} FCFA` : 'Prix non spécifié'}
      </div>
    </article>
  );
}
```

#### ✅ Pattern : Gestion des Focus

```typescript
// ✅ Hook de gestion du focus
function useFocusManagement() {
  const focusableElements = useRef<HTMLElement[]>([]);

  const getFocusableElements = useCallback((container: HTMLElement) => {
    const elements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusableElements.current = Array.from(elements) as HTMLElement[];
  }, []);

  const focusFirst = useCallback(() => {
    if (focusableElements.current.length > 0) {
      focusableElements.current[0].focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (focusableElements.current.length > 0) {
      focusableElements.current[focusableElements.current.length - 1].focus();
    }
  }, []);

  return { getFocusableElements, focusFirst, focusLast };
}

// ✅ Modal accessible
function AccessibleModal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { getFocusableElements, focusFirst } = useFocusManagement();

  useEffect(() => {
    if (isOpen && modalRef.current) {
      getFocusableElements(modalRef.current);
      focusFirst();
      
      // Trap du focus dans la modal
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, getFocusableElements, focusFirst, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="modal-content"
      >
        <button
          onClick={onClose}
          aria-label="Fermer la modal"
          className="modal-close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
```

### 8.2 Annonces d'État

#### ✅ Pattern : Live Regions

```typescript
// ✅ Annonces pour les changements d'état
function useLiveAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const LiveAnnouncer = () => (
    <div
      ref={announcerRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );

  return { announce, LiveAnnouncer };
}

// ✅ Usage dans les composants
function PropertySearchResults({ properties }) {
  const { announce, LiveAnnouncer } = useLiveAnnouncer();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (properties) {
      const count = properties.length;
      announce(
        `${count} propriété${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''} pour "${searchTerm}"`,
        'polite'
      );
    }
  }, [properties, searchTerm, announce]);

  return (
    <div>
      <LiveAnnouncer />
      <SearchInput onChange={setSearchTerm} />
      <PropertyGrid properties={properties} />
    </div>
  );
}
```

---

## 9. Monitoring et Observabilité

### 9.1 Métriques de Performance

#### ✅ Pattern : Performance Monitoring

```typescript
// ✅ Hook de monitoring des performances
function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Envoyer les métriques
      analytics.track('component_render_time', {
        component: componentName,
        renderTime: Math.round(renderTime),
        timestamp: Date.now()
      });
    };
  }, [componentName]);
}

// ✅ Monitoring des requêtes API
function useApiMonitoring() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMutation = (event: any) => {
      const { data, error } = event;
      
      if (error) {
        analytics.track('api_mutation_error', {
          mutationKey: event?.mutation?.options?.mutationKey,
          error: error.message,
          timestamp: Date.now()
        });
      } else {
        analytics.track('api_mutation_success', {
          mutationKey: event?.mutation?.options?.mutationKey,
          duration: event?.mutation?.variables?.duration,
          timestamp: Date.now()
        });
      }
    };

    queryClient.getMutationCache().subscribe(handleMutation);

    return () => {
      queryClient.getMutationCache().unsubscribe(handleMutation);
    };
  }, [queryClient]);

  return {
    trackApiCall: (endpoint: string, duration: number, status: number) => {
      analytics.track('api_call', {
        endpoint,
        duration,
        status,
        timestamp: Date.now()
      });
    }
  };
}
```

#### ✅ Pattern : Error Tracking

```typescript
// ✅ Tracking centralisé des erreurs
class ErrorTracker {
  private static instance: ErrorTracker;

  static getInstance() {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, context: any = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    // Envoyer à Sentry
    Sentry.captureException(error, { extra: errorData });

    // Envoyer à l'analytics interne
    analytics.track('error', errorData);

    // Logger en local pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', errorData);
    }
  }

  trackUserAction(action: string, data: any = {}) {
    analytics.track('user_action', {
      action,
      data,
      timestamp: Date.now(),
      userId: this.getCurrentUserId()
    });
  }

  private getCurrentUserId(): string | null {
    // Récupérer l'ID utilisateur depuis le store ou context
    return localStorage.getItem('userId');
  }
}

// ✅ Hook pour tracking automatique
function useErrorTracking() {
  const errorTracker = ErrorTracker.getInstance();

  useEffect(() => {
    // Global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      errorTracker.trackError(event.error, {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorTracker.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [errorTracker]);

  return errorTracker;
}
```

---

## 📋 Checklist de Validation

### Avant chaque commit :

#### React & TypeScript
- [ ] Tous les accès aux propriétés utilisent l'optional chaining (`?.`)
- [ ] Valeurs par défaut définies pour tous les champs optionnels
- [ ] Pas de `any` utilisé, types spécifiques définis
- [ ] Interfaces complètes pour toutes les structures de données
- [ ] Composants avec loading states et error boundaries
- [ ] useMemo pour les calculs coûteux
- [ ] useCallback pour les handlers
- [ ] Cleanup des effects avec return function

#### Performance
- [ ] Debouncing implémenté pour la recherche et filtres
- [ ] Images avec lazy loading
- [ ] Code splitting pour les routes volumineuses
- [ ] Cache approprié pour les requêtes fréquentes
- [ ] Pas de memory leaks (subscriptions nettoyées)

#### Gestion d'Erreur
- [ ] ErrorHandler utilisé pour toutes les opérations async
- [ ] Retry configuré selon le type d'opération
- [ ] Logging avec contexte approprié
- [ ] Dégradation gracieuse pour les fonctionnalités non-critiques

#### Sécurité
- [ ] Validation avec Zod pour tous les inputs
- [ ] Sanitisation des données utilisateur
- [ ] Authentification vérifiée sur toutes les routes protégées
- [ ] Rate limiting sur les endpoints sensibles

#### Tests
- [ ] Tests unitaires pour les composants critiques
- [ ] Tests de null checks pour tous les composants
- [ ] Tests d'intégration pour les flux principaux
- [ ] Couverture de test > 80%

#### Accessibilité
- [ ] Navigation clavier fonctionnelle
- [ ] ARIA labels appropriés
- [ ] Annonces d'état pour les changements dynamiques
- [ ] Contraste des couleurs suffisant
- [ ] Focus management dans les modals

---

## 🎯 Conclusion

Ce guide synthétise les bonnes pratiques identifiées lors des analyses et corrections du projet MonToit. Il est conçu pour :

1. **Prévenir les erreurs** courantes (null checks, types)
2. **Optimiser les performances** (debouncing, memoization)
3. **Améliorer la maintenabilité** (patterns, standards)
4. **Garantir la qualité** (tests, monitoring)
5. **Assurer l'accessibilité** (WCAG, navigation)

### Prochaines étapes :

1. **Formation de l'équipe** sur ces bonnes pratiques
2. **Linting et Prettier** configurés selon ces standards
3. **CI/CD** avec validation automatique des patterns
4. **Reviews de code** avec checklist spécifique
5. **Mise à jour régulière** du guide selon l'évolution du projet

### Ressources supplémentaires :

- [Documentation React](https://react.dev)
- [Guide TypeScript](https://typescriptlang.org/docs)
- [Standards WCAG](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library](https://testing-library.com/docs)
- [React Query](https://tanstack.com/query/latest)

---

**Guide maintenu par l'équipe technique MonToit**  
**Dernière mise à jour :** 1er décembre 2025