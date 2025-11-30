# 🎯 Guide d'Utilisation des Nouvelles Fonctionnalités - MonToit v4.0

## 🚀 Vue d'ensemble

Cette documentation décrit l'utilisation des nouvelles fonctionnalités avancées de MonToit : système de validation robuste, gestion d'erreur avec retry automatique, cleanup intelligent et monitoring des performances. Toutes ces fonctionnalités sont conçues pour améliorer la fiabilité, la sécurité et l'expérience utilisateur.

---

## 📝 1. Système de Validation Avancée

### 🔍 ValidationService - Service Centralisé

Le `ValidationService` remplace la validation basique par un système complet avec règles strictes et messages contextuels.

```typescript
import { ValidationService } from '@/services/validation/validationService';

// Validation d'un formulaire complet
const validatePropertyForm = (propertyData) => {
  const result = ValidationService.validatePropertyForm(propertyData);
  
  if (!result.isValid) {
    console.log('Erreurs:', result.errors);
    return result.errors;
  }
  
  return null; // Validation réussie
};

// Utilisation dans un composant
const PropertyForm = () => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  const validateForm = () => {
    const errors = validatePropertyForm(formData);
    setErrors(errors || {});
    setIsValid(!errors);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Les erreurs s'affichent automatiquement */}
      {errors.title && <ErrorMessage message={errors.title} />}
      {errors.monthly_rent && <ErrorMessage message={errors.monthly_rent} />}
      
      <button disabled={!isValid}>Publier</button>
    </form>
  );
};
```

#### Règles de Validation Disponibles

**1. Validation Email :**
```typescript
const emailValidation = {
  required: true,                    // Obligatoire
  pattern: 'email',                  // Format email
  domain: ['gmail.com', 'yahoo.com'] // Domaines autorisés
};
```

**2. Validation Téléphone Ivoirien :**
```typescript
const phoneValidation = {
  required: true,
  pattern: 'ci_phone',               // Format +225 XX XX XX XX
  minLength: 13,                     // +225 01 02 03 04
  maxLength: 13
};
```

**3. Validation Document :**
```typescript
const documentValidation = {
  required: true,
  allowedTypes: ['pdf', 'jpg', 'png'],
  maxSize: 5 * 1024 * 1024,          // 5 MB
  minPages: 1
};
```

### 🎯 Validation par Étapes

Pour les formulaires complexes comme les candidatures, la validation s'effectue étape par étape :

```typescript
import { useValidation } from '@/hooks/useValidation';

const ApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const { 
    validateCurrentStep, 
    isStepValid, 
    getStepErrors, 
    canProceedToNextStep 
  } = useValidation({
    steps: [
      {
        id: 1,
        name: 'Informations personnelles',
        fields: ['firstName', 'lastName', 'email', 'phone'],
        rules: {
          firstName: { required: true, minLength: 2 },
          lastName: { required: true, minLength: 2 },
          email: { required: true, pattern: 'email' },
          phone: { required: true, pattern: 'ci_phone' }
        }
      },
      {
        id: 2,
        name: 'Documents',
        fields: ['idDocument', 'incomeProof', 'guarantee'],
        rules: {
          idDocument: { required: true, allowedTypes: ['pdf', 'jpg'] },
          incomeProof: { required: true, maxSize: 5 * 1024 * 1024 },
          guarantee: { required: true, minCount: 1 }
        }
      }
    ]
  });
  
  const handleNextStep = () => {
    const validation = validateCurrentStep(currentStep, formData);
    
    if (validation.isValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Afficher les erreurs pour cette étape
      setErrors(validation.errors);
    }
  };
  
  return (
    <div>
      {/* Barre de progression */}
      <StepProgress currentStep={currentStep} totalSteps={2} />
      
      {/* Erreurs de l'étape courante */}
      {getStepErrors(currentStep).map(error => (
        <ErrorMessage key={error.field} message={error.message} />
      ))}
      
      {/* Bouton conditionnel */}
      <button 
        onClick={handleNextStep}
        disabled={!canProceedToNextStep(currentStep)}
      >
        Étape suivante
      </button>
    </div>
  );
};
```

### 🛡️ Validation Sécurisée

La validation fonctionne côté client ET serveur pour éviter les contournements :

```typescript
// Côté client (UI)
const clientValidation = ValidationService.validatePropertyForm(data);

// Côté serveur (API)
const serverValidation = await fetch('/api/validate/property', {
  method: 'POST',
  body: JSON.stringify(data)
});

// Vérification que les deux validations concordent
if (!clientValidation.isValid || !serverValidation.isValid) {
  throw new SecurityError('Validation contournée');
}
```

---

## 🔄 2. Gestion d'Erreur Robuste avec Retry

### 🚨 ErrorHandler - Mécanisme de Récupération

Le `ErrorHandler` gère automatiquement les erreurs avec retry, backoff exponentiel et timeouts.

```typescript
import { ErrorHandler } from '@/lib/errorHandler';

// Exécution simple avec retry automatique
const fetchProperties = async () => {
  const result = await ErrorHandler.executeWithRetry(
    async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    {
      maxRetries: 3,
      baseDelay: 1000,              // Délai initial 1s
      timeout: 30000,               // Timeout total 30s
      retryCondition: (error) => {
        // Retry pour erreurs réseau et serveur
        return error.name === 'NetworkError' || 
               (error.status >= 500 && error.status < 600);
      }
    }
  );
  
  return result;
};
```

### 📊 Configuration Avancée du Retry

```typescript
const result = await ErrorHandler.executeWithRetry(
  async (attempt, signal) => {
    // Opération qui peut échouer
    const response = await fetch('/api/data', { signal });
    return response.json();
  },
  {
    maxRetries: 5,                  // Maximum 5 tentatives
    baseDelay: 1000,                // Délai de base
    maxDelay: 30000,                // Délai maximum
    backoffMultiplier: 2,           // Multiplicateur exponentiel
    jitter: true,                   // Ajout de randomness
    timeout: 45000,                 // Timeout global
    
    retryCondition: (error, attempt) => {
      // Stratégie de retry personnalisée
      if (attempt >= 3) return false;  // Stop après 3 tentatives
      
      // Retry immédiatement pour erreurs réseau
      if (error.name === 'NetworkError') return true;
      
      // Retry avec délai pour erreurs serveur temporaires
      if (error.status >= 500 && error.status < 600) return true;
      
      // Pas de retry pour erreurs client (4xx)
      if (error.status >= 400 && error.status < 500) return false;
      
      return false;
    },
    
    onRetry: (error, attempt) => {
      console.log(`Tentative ${attempt} échouée:`, error.message);
      console.log(`Prochaine tentative dans ${delay}ms`);
    },
    
    onSuccess: (result, attempt) => {
      console.log(`Réussi à la tentative ${attempt}`);
    },
    
    onFailure: (error, attempts) => {
      console.error(`Échec après ${attempts} tentatives:`, error.message);
      // Logger vers Sentry
      Sentry.captureException(error);
    }
  }
);
```

### 🎯 Retry Condition Personnalisé

```typescript
// Retry spécifique pour Supabase
const retryCondition = (error) => {
  if (error.code === 'PGRST301') return true;  // Connection timeout
  if (error.message.includes('rate limit')) return true;
  return false;
};

// Retry pour APIs externes
const externalApiRetry = (error) => {
  // OpenAI rate limiting
  if (error.status === 429) return true;
  
  // Paiement mobile money temporaire
  if (error.code === 'PAYMENT_TEMPORARY_ERROR') return true;
  
  return false;
};

// Retry pour opérations critiques
const criticalOperationRetry = (error) => {
  // Ne jamais retry pour les paiements
  if (error.type === 'PAYMENT_ERROR') return false;
  
  // Retry pour sauvegarde de données
  if (error.type === 'SAVE_ERROR') return true;
  
  return error.retryable === true;
};
```

### ⏰ Timeout Intelligent

```typescript
// Timeout différent selon le contexte
const timeouts = {
  quick: 5000,        // Recherche rapide
  normal: 15000,      // Opération normale
  long: 45000,        // Opération complexe
  payment: 30000,     // Paiement (pas de retry)
  ai: 60000          // IA (peut être long)
};

const result = await ErrorHandler.executeWithRetry(
  async () => expensiveOperation(),
  { 
    timeout: timeouts.ai,
    maxRetries: 2,
    // Pas de retry pour les timeouts
    retryCondition: (error) => error.name !== 'TimeoutError'
  }
);
```

---

## 🧹 3. Cleanup Automatique et Monitoring Mémoire

### 🗂️ CleanupRegistry - Gestion Centralisée

Le `CleanupRegistry` centralise le nettoyage de toutes les ressources pour éviter les memory leaks.

```typescript
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

const MyComponent = () => {
  const cleanup = useCleanupRegistry();
  
  useEffect(() => {
    // AbortController automatique
    const controller = cleanup.createAbortController(
      'api-request-1', 
      'API Request to fetch properties'
    );
    
    // Timeout automatique
    const timer = cleanup.setTimeout(
      () => console.log('Opération timeout'),
      5000,
      'Timeout for API request'
    );
    
    // Interval automatique
    const interval = cleanup.setInterval(
      () => checkStatus(),
      1000,
      'Status check interval'
    );
    
    // Abonnement (Observer pattern)
    const subscription = someService.subscribe({
      next: (data) => handleData(data),
      error: (error) => handleError(error)
    });
    
    // Cleanup automatique à la destruction
    return cleanup.cleanupComponent();
  }, []);
  
  return <div>Contenu du composant</div>;
};
```

### 📊 Monitoring des Fuites Mémoire

```typescript
import { getCleanupStats } from '@/lib/cleanupRegistry';

// Statistiques globales
const stats = getCleanupStats();
console.log('Cleanup Stats:', {
  activeControllers: stats.activeControllers,
  activeTimers: stats.activeTimers,
  activeIntervals: stats.activeIntervals,
  activeSubscriptions: stats.activeSubscriptions,
  memoryLeaks: stats.memoryLeaks,
  totalCleanups: stats.totalCleanups
});

// Alertes automatiques
if (stats.activeControllers > 100) {
  console.warn('⚠️ Trop de AbortController actifs:', stats.activeControllers);
}

if (stats.memoryLeaks.length > 0) {
  console.error('🚨 Fuites mémoire détectées:', stats.memoryLeaks);
}
```

### 🔍 Détection de Fuites

```typescript
// Configuration du monitoring
const cleanupConfig = {
  enableLeakDetection: true,
  leakThreshold: 50,          // Alerte si > 50 ressources non nettoyées
  memoryWarningThreshold: 10 * 1024 * 1024, // 10 MB
  reportInterval: 30000,      // Rapport toutes les 30s
  
  onMemoryLeak: (leakInfo) => {
    console.error('Memory Leak:', leakInfo);
    // Logger vers Sentry
    Sentry.captureMessage('Memory leak detected', {
      level: 'warning',
      extra: leakInfo
    });
  }
};

// Nettoyage manuel d'urgence
const emergencyCleanup = () => {
  cleanupRegistry.cleanupAll(); // Nettoie tout
  console.log('🧹 Emergency cleanup performed');
};
```

### 🏷️ Nommage et Tracking

```typescript
// Nommage des ressources pour debugging
const controller = cleanup.createAbortController(
  'property-search-123', 
  'Search for properties in Cocody'
);

const timer = cleanup.setTimeout(
  () => showLoadingSpinner(),
  3000,
  'Show loading after 3s'
);

// Accès aux informations de debug
console.log(cleanup.getResourceInfo('property-search-123'));
// {
//   type: 'AbortController',
//   createdAt: '2025-11-30T10:30:00Z',
//   context: 'Search for properties in Cocody'
// }
```

---

## ⚡ 4. Optimisations Performance

### 🔄 Debouncing Intelligent

#### Recherche avec Debouncing

```typescript
import { useDebouncedSearch } from '@/hooks/useDebounce';

const PropertySearch = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    debouncedValue, 
    isSearching, 
    results,
    searchTime 
  } = useDebouncedSearch('/api/search', {
    delay: 300,                    // Délai оптимал pour la recherche
    minLength: 2,                  // Minimum 2 caractères
    maxResults: 20,                // Limiter les résultats
    onSearch: async (term, signal) => {
      const response = await fetch(`/api/search?q=${term}`, { signal });
      return response.json();
    }
  });
  
  // Recherche en temps réel (après debouncing)
  useEffect(() => {
    if (debouncedValue.length >= 2) {
      console.log('Searching for:', debouncedValue);
    }
  }, [debouncedValue]);
  
  return (
    <div>
      <input
        type="text"
        placeholder="Rechercher une propriété..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {isSearching && (
        <div className="searching-indicator">
          🔍 Recherche en cours... ({searchTime}ms)
        </div>
      )}
      
      {results.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
```

#### Filtres Avancés avec Cache

```typescript
import { useDebouncedFilters } from '@/hooks/useDebounce';

const AdvancedFilters = () => {
  const {
    filters,
    setFilters,
    debouncedFilters,
    isFiltering,
    isStale,
    applyFilters,
    resetFilters
  } = useDebouncedFilters({
    delay: 500,
    enableCache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    
    onFilter: async (filters, signal) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const response = await fetch(`/api/properties?${params}`, { signal });
      return response.json();
    }
  });
  
  // Gestion des filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Appliquer les filtres
  const handleApplyFilters = async () => {
    await applyFilters();
    setIsStale(false);
  };
  
  return (
    <div className="filter-panel">
      <select 
        value={filters.propertyType || ''} 
        onChange={(e) => handleFilterChange('propertyType', e.target.value)}
      >
        <option value="">Type de bien</option>
        <option value="apartment">Appartement</option>
        <option value="villa">Villa</option>
      </select>
      
      <input
        type="number"
        placeholder="Prix min"
        value={filters.minPrice || ''}
        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
      />
      
      {isFiltering && <Spinner />}
      {isStale && <button onClick={handleApplyFilters}>Appliquer</button>}
    </div>
  );
};
```

#### Auto-sauvegarde Intelligente

```typescript
import { useDebouncedAutoSave } from '@/hooks/useDebounce';

const PropertyForm = () => {
  const {
    formData,
    updateField,
    isSaving,
    saveStatus,
    lastSaved,
    errors,
    hasUnsavedChanges
  } = useDebouncedAutoSave({
    delay: 1000,                    // Sauvegarder après 1s d'inactivité
    validate: (data) => {
      const errors = {};
      if (!data.title?.trim()) errors.title = 'Titre requis';
      if (!data.monthly_rent || data.monthly_rent <= 0) {
        errors.monthly_rent = 'Prix valide requis';
      }
      return { isValid: Object.keys(errors).length === 0, errors };
    },
    onSave: async (data, signal) => {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal
      });
      return response.json();
    },
    onSaveSuccess: (result) => {
      console.log('✅ Sauvegardé:', result.id);
      toast.success('Propriété sauvegardée');
    },
    onSaveError: (error) => {
      console.error('❌ Erreur sauvegarde:', error);
      toast.error('Erreur de sauvegarde');
    }
  });
  
  // Attention si changement non sauvegardé
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées.';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  return (
    <form>
      <div className="save-status">
        {isSaving && <span>💾 Sauvegarde...</span>}
        {saveStatus === 'success' && (
          <span>✅ Sauvegardé {lastSaved?.toLocaleTimeString()}</span>
        )}
        {saveStatus === 'error' && (
          <span>❌ Erreur de sauvegarde</span>
        )}
        {hasUnsavedChanges && (
          <span>⚠️ Modifications non sauvegardées</span>
        )}
      </div>
      
      <input
        type="text"
        placeholder="Titre de la propriété"
        value={formData.title || ''}
        onChange={(e) => updateField('title', e.target.value)}
        className={errors.title ? 'error' : ''}
      />
      {errors.title && <span className="error">{errors.title}</span>}
      
      <input
        type="number"
        placeholder="Loyer mensuel"
        value={formData.monthly_rent || ''}
        onChange={(e) => updateField('monthly_rent', parseInt(e.target.value))}
        className={errors.monthly_rent ? 'error' : ''}
      />
      {errors.monthly_rent && <span className="error">{errors.monthly_rent}</span>}
    </form>
  );
};
```

---

## 📊 5. Monitoring et Métriques

### 📈 Métriques de Performance

```typescript
import { getPerformanceMetrics } from '@/lib/performanceMonitor';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="performance-dashboard">
      <h3>📊 Métriques de Performance</h3>
      
      <div className="metrics-grid">
        <MetricCard
          title="Requêtes HTTP"
          value={metrics.http.total}
          subtitle={`${metrics.http.averageDuration}ms moyen`}
          trend={metrics.http.trend}
        />
        
        <MetricCard
          title="Taux d'Erreur"
          value={`${(metrics.errors.rate * 100).toFixed(1)}%`}
          subtitle={`${metrics.errors.total} erreurs`}
          trend={metrics.errors.trend}
        />
        
        <MetricCard
          title="Retry Rate"
          value={`${(metrics.retries.rate * 100).toFixed(1)}%`}
          subtitle={`${metrics.retries.averageAttempts} tentatives moyenne`}
          trend={metrics.retries.trend}
        />
        
        <MetricCard
          title="Mémoire Active"
          value={`${(metrics.memory.active / 1024).toFixed(1)}KB`}
          subtitle={`${metrics.memory.leaks} fuites détectées`}
          trend={metrics.memory.trend}
        />
      </div>
    </div>
  );
};
```

### 🚨 Alertes Automatiques

```typescript
// Configuration des seuils d'alerte
const alertConfig = {
  http: {
    timeoutWarning: 5000,        // > 5s = warning
    errorRateWarning: 0.1,       // > 10% = warning
    retryRateWarning: 0.05       // > 5% = investigation
  },
  memory: {
    leakWarning: 10,             // > 10 fuites = critical
    activeResourceWarning: 100,  // > 100 resources = warning
    cleanupRateWarning: 0.8      // < 80% cleanup = problem
  },
  performance: {
    slowOperationWarning: 3000,  // > 3s = slow
    highCPUWarning: 0.8,         // > 80% CPU = warning
    memoryUsageWarning: 0.7      // > 70% memory = warning
  }
};

// Surveillance automatique
useEffect(() => {
  const checkAlerts = () => {
    const metrics = getPerformanceMetrics();
    
    // Alertes performance HTTP
    if (metrics.http.averageDuration > alertConfig.http.timeoutWarning) {
      console.warn('⚠️ Operations lentes détectées');
      Sentry.addBreadcrumb({
        message: 'HTTP operations slow',
        data: { averageDuration: metrics.http.averageDuration },
        level: 'warning'
      });
    }
    
    // Alertes mémoire
    if (metrics.memory.leaks > alertConfig.memory.leakWarning) {
      console.error('🚨 Fuites mémoire critiques');
      Sentry.captureMessage('Critical memory leaks detected', {
        level: 'error',
        extra: { leaks: metrics.memory.leaks }
      });
    }
  };
  
  const interval = setInterval(checkAlerts, 10000); // Vérifier toutes les 10s
  return () => clearInterval(interval);
}, []);
```

---

## 🧪 6. Tests et Validation

### Test du Système de Validation

```typescript
import { ValidationService } from '@/services/validation/validationService';

describe('ValidationService', () => {
  test('devrait valider les emails correctement', () => {
    const validEmails = [
      'user@example.com',
      'test@gmail.com',
      'admin@montoit.ci'
    ];
    
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'user@',
      'user@example'
    ];
    
    validEmails.forEach(email => {
      const result = ValidationService.validateEmail(email);
      expect(result.isValid).toBe(true);
    });
    
    invalidEmails.forEach(email => {
      const result = ValidationService.validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email');
    });
  });
  
  test('devrait valider les numéros ivoiriens', () => {
    const validPhones = [
      '+225 01 02 03 04',
      '+225 07 12 34 56',
      '01 02 03 04'
    ];
    
    const invalidPhones = [
      '123456789',           // Trop court
      '+225 99 99 99 99',    // Format wrong
      'abc def ghi jkl'      // Pas numérique
    ];
    
    validPhones.forEach(phone => {
      const result = ValidationService.validateCIPhoneNumber(phone);
      expect(result.isValid).toBe(true);
    });
  });
});
```

### Test de la Gestion d'Erreur

```typescript
import { ErrorHandler } from '@/lib/errorHandler';

describe('ErrorHandler', () => {
  test('devrait réussir après retry', async () => {
    let attempt = 0;
    const mockFn = jest.fn().mockImplementation(() => {
      attempt++;
      if (attempt < 3) {
        throw new Error('Temporary error');
      }
      return 'success';
    });
    
    const result = await ErrorHandler.executeWithRetry(mockFn, {
      maxRetries: 3,
      baseDelay: 100
    });
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
  
  test('devrait échouer après max retries', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Permanent error'));
    
    await expect(
      ErrorHandler.executeWithRetry(mockFn, {
        maxRetries: 2,
        baseDelay: 100
      })
    ).rejects.toThrow('Permanent error');
    
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
```

### Test du Cleanup

```typescript
import { CleanupRegistry } from '@/lib/cleanupRegistry';

describe('CleanupRegistry', () => {
  test('devrait nettoyer les AbortController', () => {
    const registry = new CleanupRegistry();
    
    const controller = registry.createAbortController('test-request');
    expect(registry.getActiveControllers()).toBe(1);
    
    registry.cleanupComponent('test-request');
    expect(registry.getActiveControllers()).toBe(0);
  });
  
  test('devrait détecter les fuites mémoire', () => {
    const registry = new CleanupRegistry();
    
    // Simuler une fuite
    registry.createAbortController('leaked-request');
    registry.createTimeout(() => {}, 1000, 'leaked-timer');
    
    const stats = registry.getStats();
    expect(stats.activeControllers).toBe(1);
    expect(stats.activeTimers).toBe(1);
  });
});
```

---

## 📚 7. Bonnes Pratiques et Anti-patterns

### ✅ Recommandations

```typescript
// ✅ Toujours utiliser la validation
const { isValid, errors } = validateForm(formData);
if (!isValid) return;

// ✅ Utiliser les hooks sécurisés
const { data, loading, cancel } = useHttp('/api/data', {
  timeout: 10000,
  retries: 3
});

// ✅ Gérer l'annulation proprement
useEffect(() => {
  return () => cancel();
}, []);

// ✅ Utiliser le cleanup registry
const cleanup = useCleanupRegistry();
useEffect(() => {
  const timer = cleanup.setTimeout(() => {}, 5000);
  return cleanup.cleanupComponent();
}, []);

// ✅ Valider avant opérations critiques
const canSubmit = validateCurrentStep(formData);
if (!canSubmit) return;

// ✅ Monitorer les performances
const { duration, retryCount } = useHttp('/api/data');
if (duration > 5000) {
  console.warn('Operation lente détectée');
}
```

### ❌ Anti-patterns à Éviter

```typescript
// ❌ Pas de validation
fetch('/api/data', { body: JSON.stringify(userInput) });

// ❌ Pas de gestion d'erreur
const data = await fetch('/api/data').then(r => r.json());

// ❌ Oublier l'annulation
useEffect(() => {
  fetch('/api/data');
}, []);

// ❌ Pas de cleanup
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  // Oublie le cleanup !
}, []);

// ❌ Timeout trop court
useHttp('/api/data', { timeout: 100 }); // Va échouer

// ❌ Validation côté client uniquement
const isValid = formValid(); // Peut être contournée
```

---

## 🔧 Configuration et Personnalisation

### Configuration Globale

```typescript
// src/config/features.ts
export const featureConfig = {
  validation: {
    enabled: true,
    strict: true,
    showAllErrors: true,
    serverSideValidation: true
  },
  
  retry: {
    enabled: true,
    defaultMaxRetries: 3,
    defaultTimeout: 10000,
    exponentialBackoff: true,
    jitter: true
  },
  
  cleanup: {
    enabled: true,
    enableLeakDetection: true,
    leakThreshold: 50,
    autoCleanup: true
  },
  
  debouncing: {
    enabled: true,
    defaultDelay: 300,
    maxDelay: 2000,
    enableCache: true
  },
  
  monitoring: {
    enabled: true,
    sendToSentry: true,
    performanceTracking: true,
    alertThresholds: {
      responseTime: 5000,
      errorRate: 0.1,
      memoryLeaks: 10
    }
  }
};
```

### Customisation des Hooks

```typescript
// src/hooks/custom/useCustomHttp.ts
import { useHttp } from '@/hooks/useHttp';

export const useCustomHttp = (url, options = {}) => {
  return useHttp(url, {
    timeout: featureConfig.retry.defaultTimeout,
    retries: featureConfig.retry.defaultMaxRetries,
    retryDelay: 1000,
    ...options,
    onError: (error) => {
      // Log custom
      console.error('Custom HTTP Error:', error);
      
      // Notification utilisateur
      showNotification('Erreur de connexion', 'error');
      
      // Appel de la fonction originale
      options.onError?.(error);
    }
  });
};
```

---

Cette documentation complète vous permet d'utiliser toutes les nouvelles fonctionnalités avancées de MonToit v4.0. Ces améliorations apportent une robustesse, une sécurité et une performance accrues à la plateforme.