# 🚀 Guide de Migration - MonToit v4.0

## 🎯 Vue d'ensemble

Ce guide de migration détaille le passage des versions précédentes vers MonToit v4.0, incluant les nouvelles fonctionnalités, les modifications d'architecture, les changements Breaking Changes, et les étapes de migration nécessaires pour chaque composant.

---

## 📋 Checklist de Migration

### 🟢 Prérequis

```bash
# Vérifications avant migration
□ Node.js version >= 18.0.0
□ NPM version >= 9.0.0
□ TypeScript version >= 5.0.0
□ React version >= 18.0.0
□ Supabase CLI version >= 1.0.0

# Backup de la version actuelle
git checkout -b backup-pre-v4.0.0
git add .
git commit -m "Backup avant migration v4.0.0"
```

### ⚡ Actions Prioritaires (À faire en premier)

```bash
# 1. Migration des hooks sécurisés (CRITIQUE)
□ Migrer tous les hooks vers les nouvelles versions
□ Remplacer useState/useEffect par useHttp, useAsync, etc.
□ Ajouter AbortController à tous les composants

# 2. Implémentation du système de validation (CRITIQUE)  
□ Remplacer validation HTML5 par ValidationService
□ Implémenter validation par étapes pour formulaires complexes
□ Ajouter validation côté serveur

# 3. Migration du système d'erreur (CRITIQUE)
□ Remplacer try/catch par ErrorHandler
□ Implémenter retry automatique
□ Configurer les timeouts globaux

# 4. Mise en place du cleanup (IMPORTANT)
□ Utiliser CleanupRegistry dans tous les composants
□ Vérifier qu'il n'y a pas de memory leaks
□ Configurer le monitoring mémoire

# 5. Activation des optimisations performance (IMPORTANT)
□ Activer le debouncing sur toutes les recherches
□ Implémenter le cache intelligent
□ Optimiser les images et bundles
```

---

## 🔄 1. Migration des Hooks

### 📝 Avant vs Après

#### ❌ Anciens Hooks (v3.x)

```typescript
// ❌ useState traditionnel avec problèmes
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/properties');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
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
// - Erreurs non gérées proprement
```

#### ✅ Nouveaux Hooks Sécurisés (v4.0)

```typescript
// ✅ useHttp avec toutes les protections
const { data, loading, error, cancel } = useHttp('/api/properties', {
  method: 'GET',
  timeout: 10000,                    // Timeout automatique
  retries: 3,                        // Retry intelligent
  retryDelay: 1000,                  // Backoff exponentiel
  retryCondition: (error) => {
    return error.status >= 500 || error.name === 'NetworkError';
  },
  onSuccess: (result) => {
    console.log('✅ Données reçues:', result.length, 'propriétés');
  },
  onError: (error) => {
    console.error('❌ Erreur:', error.message);
    // Logger vers Sentry
    Sentry.captureException(error);
  }
});

// Cancellation automatique
useEffect(() => {
  return () => cancel();              // ✅ Nettoyage automatique
}, []);
```

### 🛠️ Étapes de Migration des Hooks

#### Étape 1: Identification des Hooks à Migrer

```bash
# Script pour identifier tous les hooks traditionnels
grep -r "useState.*fetch\|useEffect.*async" src/ --include="*.tsx" --include="*.ts"

# Liste des patterns à rechercher :
□ useState + fetch patterns
□ useEffect + async/await patterns  
□ try/catch dans les composants
□ setLoading patterns
□ Error handling patterns
```

#### Étape 2: Migration Automatisée

```typescript
// src/utils/hookMigration.js - Script de migration

const migrationMap = {
  // Pattern simple
  oldPattern: /const\s+\[\s*(\w+)\s*,\s*(\w+)\s*\]\s*=\s*useState\(null\)/,
  newPattern: `const { $1, loading, error, cancel } = useHttp('$2', {
    timeout: 10000,
    retries: 3
  });`
  
  // Pattern useEffect avec fetch
  oldEffectPattern: /useEffect\(\(\)\s*=>\s*{[^}]*fetch\([^)]*\)[^}]*},\s*\[([^\]]*)\]\)/,
  newEffectPattern: `useEffect(() => {
    return () => cancel();
  }, []);`
};

// Fonction de migration
function migrateHook(fileContent) {
  return fileContent
    .replace(migrationMap.oldPattern, migrationMap.newPattern)
    .replace(migrationMap.oldEffectPattern, migrationMap.newEffectPattern);
}
```

#### Étape 3: Hooks Spécifiques par Feature

**Properties Feature:**
```typescript
// src/features/property/hooks/useProperties.ts
import { useHttp } from '@/hooks/useHttp';

export const useProperties = (filters = {}) => {
  const [searchParams, setSearchParams] = useState(filters);
  
  const { data, loading, error, cancel } = useHttp(
    `/api/properties?${new URLSearchParams(searchParams)}`,
    {
      timeout: 15000,
      retries: 3,
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      onSuccess: (properties) => {
        console.log(`${properties.length} propriétés chargées`);
      }
    }
  );
  
  const updateFilters = useCallback((newFilters) => {
    setSearchParams(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, []);
  
  useEffect(() => {
    return () => cancel();
  }, [cancel]);
  
  return {
    properties: data || [],
    loading,
    error,
    filters: searchParams,
    updateFilters,
    clearFilters,
    hasFilters: Object.keys(searchParams).length > 0
  };
};
```

**Applications Feature:**
```typescript
// src/features/applications/hooks/useApplications.ts
import { useDebouncedAutoSave } from '@/hooks/useDebounce';

export const useApplicationForm = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  
  const {
    debouncedValue: savedData,
    isSaving,
    saveStatus,
    lastSaved,
    hasUnsavedChanges
  } = useDebouncedAutoSave(formData, {
    delay: 1000,                    // Auto-save après 1s d'inactivité
    validate: (data) => {
      // Validation par étape
      const stepValidations = {
        1: ['firstName', 'lastName', 'email', 'phone'],
        2: ['idDocument', 'incomeProof', 'guarantee'],
        3: ['employmentInfo', 'references']
      };
      
      const requiredFields = stepValidations[currentStep] || [];
      const errors = {};
      
      requiredFields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
          errors[field] = `${field} est requis`;
        }
      });
      
      return { isValid: Object.keys(errors).length === 0, errors };
    },
    onSave: async (data, signal) => {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal
      });
      return response.json();
    }
  });
  
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const goToNextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);
  
  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);
  
  return {
    formData,
    currentStep,
    updateField,
    goToNextStep,
    goToPreviousStep,
    isSaving,
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    // Validation helper
    validateCurrentStep: () => {
      const validation = useValidation({ step: currentStep, data: formData });
      return validation.isValid;
    }
  };
};
```

---

## 🎯 2. Migration du Système de Validation

### 🔍 Avant vs Après

#### ❌ Ancienne Validation (v3.x)

```typescript
// ❌ Validation HTML5 basique
const PropertyForm = () => {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation côté client minimale
    if (!formData.title || !formData.monthly_rent) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    // Soumission sans validation serveur
    submitToServer(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        required                          // ⚠️ Validation HTML5 seulement
        value={formData.title || ''}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />
      
      <input
        type="number"
        required                          // ⚠️ Peut être contournée
        value={formData.monthly_rent || ''}
        onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})}
      />
      
      <button type="submit">Publier</button>
    </form>
  );
};
```

#### ✅ Nouvelle Validation (v4.0)

```typescript
// ✅ ValidationService robuste avec règles strictes
const PropertyForm = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  // Validation en temps réel
  useEffect(() => {
    const validation = ValidationService.validatePropertyForm(formData);
    setErrors(validation.errors || {});
    setIsValid(validation.isValid);
  }, [formData]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation avant soumission
    const validation = ValidationService.validatePropertyForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      console.log('❌ Validation échouée:', validation.errors);
      return;
    }
    
    try {
      // Soumission avec ErrorHandler (retry automatique)
      const result = await ErrorHandler.executeWithRetry(async () => {
        const response = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      });
      
      console.log('✅ Propriété créée:', result.id);
      navigate(`/properties/${result.id}`);
      
    } catch (error) {
      console.error('❌ Erreur création:', error);
      setErrors({ submit: error.message });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Titre de la propriété *</label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && (
          <span className="error-message">{errors.title}</span>
        )}
      </div>
      
      <div className="form-field">
        <label>Loyer mensuel (FCFA) *</label>
        <input
          type="number"
          min="1000"
          max="10000000"
          value={formData.monthly_rent || ''}
          onChange={(e) => setFormData({...formData, monthly_rent: parseInt(e.target.value)})}
          className={errors.monthly_rent ? 'error' : ''}
        />
        {errors.monthly_rent && (
          <span className="error-message">{errors.monthly_rent}</span>
        )}
      </div>
      
      <div className="save-status">
        {isValid ? '✅ Valide' : '❌ Incomplet'}
        {errors.submit && (
          <span className="error">❌ {errors.submit}</span>
        )}
      </div>
      
      <button type="submit" disabled={!isValid}>
        Publier la propriété
      </button>
    </form>
  );
};
```

### 🛠️ Étapes de Migration de la Validation

#### Étape 1: Identifier les Formulaires à Migrer

```bash
# Rechercher tous les formulaires
find src -name "*.tsx" -exec grep -l "useState.*Form\|form.*onSubmit" {} \;

# Liste des formulaires à migrer :
□ PropertyForm (ajout/modification propriété)
□ ApplicationForm (candidature location)
□ AuthForm (inscription/connexion)
□ ProfileForm (profil utilisateur)
□ PaymentForm (paiements)
□ ContactForm (formulaire contact)
```

#### Étape 2: Règles de Validation par Formulaire

```typescript
// src/services/validation/rules.ts

export const validationRules = {
  // Propriété
  propertyForm: {
    title: {
      required: true,
      minLength: 10,
      maxLength: 100,
      pattern: '^[a-zA-ZÀ-ÿ0-9\s\-,\.]{10,100}$'
    },
    description: {
      required: true,
      minLength: 50,
      maxLength: 1000
    },
    monthly_rent: {
      required: true,
      type: 'number',
      min: 1000,
      max: 10000000,
      custom: (value) => {
        if (value && value % 1000 !== 0) {
          return 'Le prix doit être un multiple de 1000 FCFA';
        }
        return null;
      }
    },
    property_type: {
      required: true,
      enum: ['apartment', 'villa', 'studio', 'room', 'office', 'shop']
    },
    bedrooms: {
      required: true,
      type: 'number',
      min: 0,
      max: 20
    },
    bathrooms: {
      required: true,
      type: 'number',
      min: 1,
      max: 10
    },
    city: {
      required: true,
      enum: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo']
    },
    neighborhood: {
      required: true,
      minLength: 3,
      maxLength: 50
    }
  },
  
  // Candidature
  applicationForm: {
    // Étape 1: Informations personnelles
    step1: {
      firstName: { required: true, minLength: 2, maxLength: 50 },
      lastName: { required: true, minLength: 2, maxLength: 50 },
      email: { 
        required: true, 
        pattern: 'email',
        custom: (email) => {
          const allowedDomains = ['gmail.com', 'yahoo.fr', 'orange.ci', 'hotmail.com'];
          const domain = email.split('@')[1];
          if (allowedDomains.includes(domain)) return null;
          return 'Utilisez une adresse email valide';
        }
      },
      phone: { 
        required: true, 
        pattern: 'ci_phone',
        custom: (phone) => {
          const cleanPhone = phone.replace(/\s/g, '');
          if (cleanPhone.length !== 13) {
            return 'Numéro invalide. Format: +225 XX XX XX XX';
          }
          return null;
        }
      },
      dateOfBirth: { 
        required: true, 
        type: 'date',
        custom: (date) => {
          const age = new Date().getFullYear() - new Date(date).getFullYear();
          if (age < 18) return 'Vous devez avoir au moins 18 ans';
          if (age > 100) return 'Âge invalide';
          return null;
        }
      }
    },
    
    // Étape 2: Documents
    step2: {
      idDocument: {
        required: true,
        type: 'file',
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 5 * 1024 * 1024 // 5MB
      },
      incomeProof: {
        required: true,
        type: 'file',
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      guarantee: {
        required: true,
        type: 'array',
        minLength: 1,
        maxLength: 3
      }
    },
    
    // Étape 3: Informations emploi
    step3: {
      employer: { required: true, minLength: 2, maxLength: 100 },
      jobTitle: { required: true, minLength: 2, maxLength: 50 },
      monthlyIncome: { 
        required: true, 
        type: 'number',
        min: 50000,
        max: 5000000
      }
    }
  },
  
  // Authentification
  authForm: {
    email: { required: true, pattern: 'email' },
    password: { 
      required: true, 
      minLength: 8,
      custom: (password) => {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        if (!hasUpper) return 'Au moins une majuscule';
        if (!hasLower) return 'Au moins une minuscule';
        if (!hasNumber) return 'Au moins un chiffre';
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value, formData) => {
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        return null;
      }
    }
  }
};
```

#### Étape 3: Validation par Étapes

```typescript
// Composant de validation multi-étapes
const MultiStepForm = ({ steps, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const { validateCurrentStep, isStepValid, getStepErrors } = useValidation({
    steps: steps,
    currentStep: currentStep
  });
  
  const handleNextStep = () => {
    const validation = validateCurrentStep(currentStep, formData);
    
    if (validation.isValid) {
      setCurrentStep(prev => prev + 1);
      setErrors({}); // Clear errors
    } else {
      setErrors(validation.errors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  const handleSubmit = async () => {
    const validation = validateCurrentStep(currentStep, formData, true); // Validation finale
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Soumission avec ErrorHandler
    try {
      const result = await ErrorHandler.executeWithRetry(async () => {
        return await onSubmit(formData);
      });
      
      console.log('✅ Formulaire soumis:', result);
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setErrors({ submit: error.message });
    }
  };
  
  return (
    <div className="multi-step-form">
      {/* Barre de progression */}
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      
      {/* Erreurs de l'étape courante */}
      <div className="step-errors">
        {Object.entries(getStepErrors(currentStep)).map(([field, error]) => (
          <ErrorMessage key={field} field={field} message={error} />
        ))}
      </div>
      
      {/* Contenu de l'étape */}
      <StepContent
        step={currentStep}
        data={formData}
        onChange={(field, value) => setFormData(prev => ({...prev, [field]: value}))}
        errors={errors}
      />
      
      {/* Navigation */}
      <div className="form-navigation">
        {currentStep > 1 && (
          <button onClick={handlePreviousStep}>
            ← Étape précédente
          </button>
        )}
        
        {currentStep < steps.length ? (
          <button 
            onClick={handleNextStep}
            disabled={!isStepValid(currentStep, formData)}
          >
            Étape suivante →
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={!isStepValid(currentStep, formData)}
          >
            Soumettre
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## 🔄 3. Migration du Système d'Erreur

### 🛡️ Avant vs Après

#### ❌ Ancienne Gestion d'Erreur (v3.x)

```typescript
// ❌ try/catch basique sans retry
const PropertyService = {
  async getProperties() {
    try {
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Pas de retry, pas de fallback
      throw error;
    }
  },
  
  async createProperty(data) {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating property:', error);
      // L'utilisateur doit réessayer manuellement
      alert('Erreur lors de la création. Veuillez réessayer.');
      throw error;
    }
  }
};
```

#### ✅ Nouvelle Gestion d'Erreur (v4.0)

```typescript
// ✅ ErrorHandler avec retry automatique et fallbacks
const PropertyService = {
  async getProperties(filters = {}) {
    return await ErrorHandler.executeWithRetry(async () => {
      const response = await fetch(`/api/properties?${new URLSearchParams(filters)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validation des données reçues
      if (!Array.isArray(data)) {
        throw new Error('Format de réponse invalide');
      }
      
      return data;
    }, {
      maxRetries: 3,
      baseDelay: 1000,                    // Délai initial
      backoffMultiplier: 2,               // Backoff exponentiel
      jitter: true,                       // Éviter thundering herd
      timeout: 30000,                     // Timeout global
      
      // Retry seulement pour certains types d'erreur
      retryCondition: (error, attempt) => {
        // Retry pour erreurs réseau
        if (error.name === 'NetworkError') return true;
        
        // Retry pour erreurs serveur temporaires (5xx)
        if (error.status >= 500 && error.status < 600) return true;
        
        // Retry pour timeouts
        if (error.name === 'TimeoutError') return true;
        
        // Retry pour erreurs rate limiting
        if (error.status === 429) return true;
        
        // Pas de retry pour erreurs client (4xx sauf 429)
        if (error.status >= 400 && error.status < 500) return false;
        
        return false;
      },
      
      // Callbacks de monitoring
      onRetry: (error, attempt, delay) => {
        console.log(`🔄 Tentative ${attempt} échouée: ${error.message}`);
        console.log(`⏱️ Prochaine tentative dans ${delay}ms`);
        
        // Logger vers Sentry
        Sentry.addBreadcrumb({
          message: `Retry attempt ${attempt}`,
          data: { error: error.message, delay },
          level: 'info'
        });
      },
      
      onSuccess: (data, attempt) => {
        console.log(`✅ Réussi à la tentative ${attempt}`);
        console.log(`${data.length} propriétés chargées`);
        
        // Métriques de performance
        performanceMonitor.trackHttpRequest(performance.now(), false);
      },
      
      onFailure: (error, attempts) => {
        console.error(`❌ Échec après ${attempts} tentatives:`, error.message);
        
        // Logger l'erreur finale
        Sentry.captureException(error, {
          tags: {
            operation: 'getProperties',
            attempts
          }
        });
        
        // Fallback gracieux
        return {
          properties: [],              // Données par défaut
          error: error.message,
          fallback: true
        };
      }
    });
  },
  
  async createProperty(data) {
    // Pour les opérations critiques, retry avec fallback
    return await ErrorHandler.executeWithRetry(async () => {
      // Validation côté client avant envoi
      const validation = ValidationService.validatePropertyForm(data);
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
      }
      
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Client-Version': '4.0.0'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // Vérification de la réponse
      if (!result.id) {
        throw new Error('Réponse invalide du serveur');
      }
      
      return result;
    }, {
      maxRetries: 2,                    // Moins d'essais pour les créations
      baseDelay: 2000,                  // Délai plus long
      timeout: 60000,                   // Timeout plus long pour création
      
      // Pour les créations, retry seulement sur erreurs réseau
      retryCondition: (error) => {
        return error.name === 'NetworkError' || 
               error.name === 'TimeoutError';
      },
      
      onSuccess: (result) => {
        // Notification de succès
        toast.success(`Propriété créée: ${result.title}`);
        
        // Track event
        Sentry.addBreadcrumb({
          message: 'Property created successfully',
          data: { propertyId: result.id, title: result.title },
          level: 'info'
        });
      },
      
      onFailure: (error) => {
        // Message d'erreur utilisateur
        toast.error('Erreur lors de la création de la propriété');
        
        // Logger l'erreur
        Sentry.captureException(error, {
          tags: { operation: 'createProperty' }
        });
        
        // Pas de fallback pour création - l'utilisateur doit agir
        throw error;
      }
    });
  }
};
```

### 🛠️ Étapes de Migration du Système d'Erreur

#### Étape 1: Identifier les Services à Migrer

```bash
# Rechercher tous les try/catch dans les services
find src/services -name "*.ts" -exec grep -l "try.*catch\|fetch(" {} \;

# Liste des services à migrer :
□ PropertyService
□ ApplicationService  
□ AuthService
□ PaymentService
□ NotificationService
□ MessagingService
□ UserService
```

#### Étape 2: Migration par Service

```typescript
// src/services/BaseService.ts - Service de base avec ErrorHandler
export abstract class BaseService {
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      timeout?: number;
      operationName?: string;
      critical?: boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      timeout = 30000,
      operationName = this.constructor.name,
      critical = false
    } = options;
    
    return await ErrorHandler.executeWithRetry(async () => {
      return await operation();
    }, {
      maxRetries,
      baseDelay,
      timeout,
      
      retryCondition: (error) => {
        // Conditions de retry par défaut
        return error.name === 'NetworkError' ||
               error.name === 'TimeoutError' ||
               (error.status >= 500 && error.status < 600);
      },
      
      onRetry: (error, attempt, delay) => {
        console.log(`🔄 ${operationName} - Tentative ${attempt}/${maxRetries}`);
        console.log(`⏱️ Prochaine tentative dans ${delay}ms`);
        
        Sentry.addBreadcrumb({
          message: `${operationName} retry attempt`,
          data: { attempt, delay, error: error.message },
          level: 'warning'
        });
      },
      
      onSuccess: (result) => {
        console.log(`✅ ${operationName} réussi`);
      },
      
      onFailure: (error, attempts) => {
        console.error(`❌ ${operationName} échoué après ${attempts} tentatives`);
        
        Sentry.captureException(error, {
          tags: { 
            service: operationName,
            attempts,
            critical
          }
        });
      }
    });
  }
}
```

```typescript
// src/services/PropertyService.ts - Service migré
import { BaseService } from './BaseService';

export class PropertyService extends BaseService {
  async getProperties(filters = {}) {
    return await this.executeWithRetry(
      async () => {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`/api/properties?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validation des données
        if (!Array.isArray(data)) {
          throw new Error('Format de réponse invalide');
        }
        
        return data;
      },
      {
        operationName: 'getProperties',
        maxRetries: 3,
        baseDelay: 1000,
        timeout: 30000,
        critical: false
      }
    );
  }
  
  async getProperty(id: string) {
    return await this.executeWithRetry(
      async () => {
        const response = await fetch(`/api/properties/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Propriété non trouvée');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      },
      {
        operationName: 'getProperty',
        maxRetries: 2,
        baseDelay: 1000,
        timeout: 15000,
        critical: false
      }
    );
  }
  
  async createProperty(data: PropertyData) {
    return await this.executeWithRetry(
      async () => {
        // Validation côté client
        const validation = ValidationService.validatePropertyForm(data);
        if (!validation.isValid) {
          throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
        }
        
        const response = await fetch('/api/properties', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Client-Version': '4.0.0'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.id) {
          throw new Error('Réponse invalide du serveur');
        }
        
        return result;
      },
      {
        operationName: 'createProperty',
        maxRetries: 2,
        baseDelay: 2000,
        timeout: 60000,
        critical: true // Opération critique
      }
    );
  }
  
  async updateProperty(id: string, data: Partial<PropertyData>) {
    return await this.executeWithRetry(
      async () => {
        const response = await fetch(`/api/properties/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      },
      {
        operationName: 'updateProperty',
        maxRetries: 2,
        baseDelay: 1500,
        timeout: 45000,
        critical: true
      }
    );
  }
  
  async deleteProperty(id: string) {
    return await this.executeWithRetry(
      async () => {
        const response = await fetch(`/api/properties/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return { success: true };
      },
      {
        operationName: 'deleteProperty',
        maxRetries: 1, // Une seule tentative pour suppression
        baseDelay: 1000,
        timeout: 30000,
        critical: true
      }
    );
  }
}

export const propertyService = new PropertyService();
```

---

## 🧹 4. Migration du Système de Cleanup

### 🔍 Avant vs Après

#### ❌ Ancien Système (v3.x)

```typescript
// ❌ Pas de cleanup - memory leaks !
const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  
  useEffect(() => {
    // Pas de cleanup - memory leak potentiel !
    fetch('/api/properties').then(res => res.json()).then(setProperties);
  }, []);
  
  // Problèmes :
  // - Pas d'annulation des requêtes
  // - Pas de cleanup des timers
  // - Pas de cleanup des subscriptions
  // - Memory leaks non détectés
};

// ❌ Timer non nettoyé
const Countdown = () => {
  const [count, setCount] = useState(10);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer); // Oublié dans 90% des cas !
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Si le composant est démonté, le timer continue !
  }, []);
  
  return <div>{count}</div>;
};
```

#### ✅ Nouveau Système (v4.0)

```typescript
// ✅ CleanupRegistry pour prévention memory leaks
const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const cleanup = useCleanupRegistry();
  
  useEffect(() => {
    // AbortController automatique avec cleanup
    const controller = cleanup.createAbortController(
      'property-list-fetch',
      'Récupération liste propriétés'
    );
    
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties', {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setProperties(data);
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur fetch propriétés:', error);
          Sentry.captureException(error);
        }
      }
    };
    
    fetchProperties();
    
    // Cleanup automatique à la destruction du composant
    return cleanup.cleanupComponent();
  }, []);
  
  return (
    <div>
      <h2>Propriétés ({properties.length})</h2>
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
      
      {/* Statistiques de cleanup pour debug */}
      <DebugInfo>
        Ressources actives: {cleanup.getStats().activeResources}
      </DebugInfo>
    </div>
  );
};

// ✅ Timer automatique avec cleanup
const Countdown = ({ start = 10, onComplete }) => {
  const [count, setCount] = useState(start);
  const cleanup = useCleanupRegistry();
  
  useEffect(() => {
    // Timer avec cleanup automatique
    const timer = cleanup.setTimeout(() => {
      setCount(prev => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000, 'countdown-timer');
    
    // Auto-cleanup à la destruction
    return cleanup.cleanupComponent();
  }, [start, onComplete]);
  
  return <div className="countdown">{count}</div>;
};

// ✅ Subscription avec cleanup automatique
const NotificationListener = () => {
  const [notifications, setNotifications] = useState([]);
  const cleanup = useCleanupRegistry();
  
  useEffect(() => {
    // Subscription avec cleanup automatique
    const subscription = notificationService.subscribe({
      next: (notification) => {
        setNotifications(prev => [...prev, notification]);
      },
      error: (error) => {
        console.error('Erreur notification:', error);
        Sentry.captureException(error);
      }
    });
    
    // Enregistrer la subscription pour cleanup
    cleanup.registerResource('notification-subscription', {
      type: 'subscription',
      resource: subscription,
      description: 'Abonnement notifications'
    });
    
    // Auto-cleanup
    return cleanup.cleanupComponent();
  }, []);
  
  return (
    <div>
      {notifications.map((notif, index) => (
        <Notification key={index} {...notif} />
      ))}
    </div>
  );
};
```

### 🛠️ Étapes de Migration du Cleanup

#### Étape 1: Identifier les Memory Leaks

```bash
# Script pour détecter les patterns problématiques
grep -r "setInterval\|setTimeout\|fetch.*then\|subscribe" src/ --include="*.tsx" --include="*.ts" | grep -v "cleanup\|abort"

# Patterns à rechercher :
□ setInterval sans cleanup
□ setTimeout sans cleanup  
□ fetch avec then (promises non	awaited)
□ Event listeners sans removal
□ Subscriptions sans unsubscribe
□ WebSocket connections non fermées
```

#### Étape 2: Migration Automatisée

```typescript
// src/utils/cleanupMigration.js - Script de migration

const cleanupMigrationPatterns = {
  // Pattern setInterval
  oldPattern: /setInterval\(\s*\(\)\s*=>\s*{([^}]+)}\s*,\s*(\d+)\)/,
  newPattern: 'cleanup.setTimeout(() => {$1}, $2, \'interval-$TIMESTAMP\')',
  
  // Pattern setTimeout  
  oldPattern: /setTimeout\(\s*\(\)\s*=>\s*{([^}]+)}\s*,\s*(\d+)\)/,
  newPattern: 'cleanup.setTimeout(() => {$1}, $2, \'timeout-$TIMESTAMP\')',
  
  // Pattern fetch.then
  oldPattern: /\.then\s*\(\s*(\w+)\s*=>\s*{([^}]+)}\s*\)/,
  newPattern: '.then($1 => {$2}).catch(error => console.error(\'Fetch error:\', error))'
};

// Fonction de migration
function migrateCleanup(fileContent) {
  let result = fileContent;
  
  // Ajouter le hook cleanup au début des composants
  result = result.replace(
    /const\s+(\w+)\s*=\s*\(\)\s*=>\s*{/,
    'const $1 = () => {\n  const cleanup = useCleanupRegistry();\n'
  );
  
  // Migrer les patterns
  Object.entries(cleanupMigrationPatterns).forEach(([pattern, replacement]) => {
    result = result.replace(new RegExp(pattern, 'g'), replacement);
  });
  
  // Ajouter le cleanup à la fin
  result = result.replace(
    /return\s*\([^)]*\)/,
    'return cleanup.cleanupComponent();\n});\n  return ($1)'
  );
  
  return result;
}
```

#### Étape 3: Components avec Cleanup

```typescript
// Exemples de migration par type de composant

// 1. Composant avec Timer
const TimerComponent = () => {
  const [time, setTime] = useState(0);
  const cleanup = useCleanupRegistry();
  
  useEffect(() => {
    // ✅ Timer avec cleanup automatique
    const timer = cleanup.setTimeout(() => {
      setTime(prev => prev + 1);
    }, 1000, 'timer-increment');
    
    // ✅ Auto-cleanup
    return cleanup.cleanupComponent();
  }, []);
  
  return <div>Temps écoulé: {time}s</div>;
};

// 2. Composant avec API Call
const DataFetcher = ({ url }) => {
  const [data, setData] = useState(null);
  const cleanup = useCleanupRegistry();
  
  useEffect(() => {
    // ✅ AbortController avec cleanup
    const controller = cleanup.createAbortController('data-fetch', 'API call');
    
    const fetchData = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        const result = await response.json();
        setData(result);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    };
    
    fetchData();
    
    // ✅ Auto-cleanup
    return cleanup.cleanupComponent();
  }, [url]);
  
  return data ? <div>{JSON.stringify(data)}</div> : <Spinner />;
};

// 3. Composant avec Event Listener
const KeyboardListener = () => {
  const [keys, setKeys] = useState([]);
  const cleanup = useCleanupRegistry();
  
  useEffect(() => {
    // ✅ Event listener avec cleanup automatique
    const handleKeyPress = (event) => {
      setKeys(prev => [...prev, event.key]);
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    // ✅ Enregistrer pour cleanup automatique
    cleanup.registerResource('keyboard-listener', {
      type: 'event',
      action: 'removeEventListener',
      target: document,
      event: 'keydown',
      handler: handleKeyPress
    });
    
    // ✅ Auto-cleanup
    return cleanup.cleanupComponent();
  }, []);
  
  return (
    <div>
      <h3>Touches appuyées:</h3>
      <div>{keys.join(', ')}</div>
    </div>
  );
};
```

---

## 📊 5. Tests de Migration

### 🧪 Tests Automatisés

```typescript
// src/test/migration/migration.test.ts
import { renderHook, act, cleanup } from '@testing-library/react';
import { useHttp } from '@/hooks/useHttp';
import { ValidationService } from '@/services/validation/validationService';
import { ErrorHandler } from '@/lib/errorHandler';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

describe('Migration v4.0 Tests', () => {
  afterEach(() => {
    cleanup();
  });
  
  describe('Hook Migration', () => {
    test('useHttp devrait remplacer useState + fetch', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      
      const { result } = renderHook(() => 
        useHttp('/api/test', { timeout: 5000 })
      );
      
      // Attendre que la requête se termine
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ data: 'test' });
      expect(result.current.error).toBeNull();
      
      // Vérifier que le cleanup est appelé
      expect(typeof result.current.cancel).toBe('function');
    });
    
    test('cleanup devrait prévenir les memory leaks', () => {
      const { result } = renderHook(() => useCleanupRegistry());
      
      act(() => {
        // Simuler création de ressources
        result.current.createAbortController('test-request');
        result.current.setTimeout(() => {}, 1000, 'test-timer');
      });
      
      // Vérifier ressources actives
      const stats = result.current.getStats();
      expect(stats.activeControllers).toBe(1);
      expect(stats.activeTimers).toBe(1);
      
      // Cleanup
      act(() => {
        result.current.cleanupComponent();
      });
      
      // Vérifier nettoyage
      const finalStats = result.current.getStats();
      expect(finalStats.activeControllers).toBe(0);
      expect(finalStats.activeTimers).toBe(0);
    });
  });
  
  describe('Validation Migration', () => {
    test('ValidationService devrait remplacer validation HTML5', () => {
      const invalidData = {
        title: '', // Manquant
        monthly_rent: -100, // Négatif
        email: 'invalid-email' // Format invalide
      };
      
      const result = ValidationService.validatePropertyForm(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Le titre est requis');
      expect(result.errors.monthly_rent).toContain('doit être positive');
      expect(result.errors.email).toContain('format invalide');
    });
    
    test('validation multi-étapes devrait fonctionner', () => {
      const { result } = renderHook(() => 
        useValidation({
          steps: [
            { id: 1, fields: ['email', 'password'] },
            { id: 2, fields: ['firstName', 'lastName'] }
          ]
        })
      );
      
      // Données incomplètes
      const incompleteData = { email: 'test@example.com' };
      const step1Validation = act(() => 
        result.current.validateCurrentStep(1, incompleteData)
      );
      
      expect(step1Validation.isValid).toBe(false);
      expect(step1Validation.errors.password).toBe('Le mot de passe est requis');
      
      // Données complètes
      const completeData = { 
        email: 'test@example.com', 
        password: 'password123' 
      };
      const step1Complete = act(() => 
        result.current.validateCurrentStep(1, completeData)
      );
      
      expect(step1Complete.isValid).toBe(true);
    });
  });
  
  describe('Error Handling Migration', () => {
    test('ErrorHandler devrait gérer retry automatique', async () => {
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
    
    test('fallback devrait être appelé après échec total', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Permanent error'));
      
      const result = await ErrorHandler.executeWithRetry(mockFn, {
        maxRetries: 2,
        baseDelay: 100
      });
      
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result.fallback).toBe(true);
      expect(result.error).toBe('Permanent error');
    });
  });
});
```

### 📋 Tests de Régression

```typescript
// src/test/regression/regression.test.ts
describe('Regression Tests Post-Migration', () => {
  test('propriétés devraient se charger correctement', async () => {
    const { result } = renderHook(() => 
      useHttp('/api/properties', { timeout: 10000 })
    );
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
  
  test('formulaires devraient se valider correctement', () => {
    const formData = {
      title: 'Appartement 3 pièces Cocody',
      monthly_rent: 150000,
      bedrooms: 3,
      bathrooms: 2
    };
    
    const validation = ValidationService.validatePropertyForm(formData);
    expect(validation.isValid).toBe(true);
  });
  
  test('navigation devrait fonctionner', () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<PropertyList />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Test navigation
    fireEvent.click(screen.getByText(/Propriétés/i));
    expect(screen.getByText(/Liste des propriétés/i)).toBeInTheDocument();
  });
});
```

---

## 📋 6. Checklist Finale de Migration

### ✅ Vérifications Techniques

```bash
# 1. Hooks migrés
□ useHttp remplace tous les useState + fetch
□ useDebounced* remplace tous les useEffect with timeout
□ useAsync remplace tous les async operations
□ AbortController utilisé partout
□ Cleanup automatique activé

# 2. Validation migrée
□ ValidationService utilisé pour tous les formulaires
□ Validation par étapes implémentée
□ Validation côté serveur active
□ Messages d'erreur localisés

# 3. Error handling migré  
□ ErrorHandler utilisé dans tous les services
□ Retry automatique configuré
□ Timeouts globaux définis
□ Fallbacks implémentés
□ Monitoring d'erreur actif

# 4. Performance optimisée
□ Debouncing sur recherches
□ Cache intelligent configuré
□ Lazy loading activé
□ Images optimisées
□ Bundle size réduit

# 5. Tests validés
□ Tests unitaires passent (90%+)
□ Tests d'intégration passent
□ Tests E2E passent
□ Performance non dégradée
□ Memory leaks éliminés
```

### 🧪 Tests de Validation

```bash
# Tests manuels recommandés
□ Navigation entre pages (tester toutes les routes)
□ Formulaires d'inscription/connexion
□ Recherche de propriétés avec filtres
□ Candidature complète (toutes les étapes)
□ Création/modification propriété
□ Paiements mobile money
□ Notifications et messaging
□ Responsive design (mobile/tablet)

# Tests automatisés
npm run test                    # Tests unitaires
npm run test:e2e               # Tests end-to-end  
npm run test:performance       # Tests performance
npm run test:memory           # Tests memory leaks
```

### 📊 Métriques de Validation

```typescript
// Métriques à vérifier après migration
const migrationMetrics = {
  performance: {
    // Bundle size doit être réduit
    initialBundle: '<1.5 MB',      // Previously 2.8 MB
    gzipped: '<400 KB',            // Previously 920 KB
    loadTime: '<2s',               // Previously 3.2s
    
    // HTTP performance améliorée
    avgResponseTime: '<2s',        // Previously 2.3s
    errorRate: '<5%',              // Previously 8.5%
    cacheHitRate: '>70%'           // Previously 15%
  },
  
  quality: {
    // Memory management
    memoryLeaks: 0,                 // Previously 15+
    cleanupRate: '>95%',            // Previously 65%
    activeResources: '<100',        // Previously 250+
    
    // Validation
    formValidationRate: '100%',     // Previously variable
    serverValidationRate: '100%',   // Previously missing
    errorHandlingCoverage: '>95%'   // Previously <50%
  },
  
  userExperience: {
    // Error recovery
    autoRetrySuccess: '>80%',       // Previously 0%
    gracefulDegradation: true,      // Previously false
    
    // UI responsiveness
    inputLag: '<50ms',              // Previously 200ms+
    searchResponse: '<1s',          // Previously 3s+
    formSubmission: '<3s'           // Previously 5s+
  }
};

// Script de vérification
function validateMigration() {
  console.log('🔍 Validation Migration v4.0');
  
  const currentMetrics = getCurrentMetrics();
  
  Object.entries(migrationMetrics).forEach(([category, metrics]) => {
    console.log(`\n📊 ${category.toUpperCase()}:`);
    
    Object.entries(metrics).forEach(([metric, target]) => {
      const current = currentMetrics[category]?.[metric];
      const passed = validateMetric(metric, current, target);
      
      console.log(`  ${passed ? '✅' : '❌'} ${metric}: ${current} (target: ${target})`);
    });
  });
}
```

---

## 🎯 7. Formation de l'Équipe

### 📚 Programme de Formation

```markdown
## Formation MonToit v4.0 - Programme Détaillé

### Jour 1: Fondamentaux
□ Morning (9h-12h): Architecture v4.0 + Nouveaux concepts
  - Hooks sécurisés avec AbortController
  - Système de validation avancé  
  - Error handling avec retry automatique
  
□ Afternoon (14h-17h): Travaux pratiques
  - Migration d'un composant simple
  - Implémentation d'un hook sécurisé
  - Tests unitaires

### Jour 2: Fonctionnalités Avancées
□ Morning (9h-12h): Performance + Monitoring
  - Cache intelligent et debouncing
  - Cleanup automatique et memory management
  - Monitoring et alertes
  
□ Afternoon (14h-17h): Intégration
  - Migration complète d'une feature
  - Tests d'intégration
  - Debugging et troubleshooting

### Jour 3: Production Ready
□ Morning (9h-12h): Best Practices
  - Code review v4.0 standards
  - Performance optimization
  - Security best practices
  
□ Afternoon (14h-17h): Déploiement
  - CI/CD pipeline v4.0
  - Monitoring production
  - Rollback procedures
```

### 📖 Documentation de Référence

```markdown
# Référence Rapide pour l'Équipe

## Hooks (Migration Rapide)
```typescript
// Au lieu de:
const [data, setData] = useState(null);
useEffect(() => { fetch('/api').then(setData); }, []);

// Utiliser:
const { data, loading, cancel } = useHttp('/api', { timeout: 10000 });
useEffect(() => () => cancel(), []);
```

## Validation (Remplacement)
```typescript
// Au lieu de:
<input required />

// Utiliser:
const { isValid, errors } = validateForm(data);
{errors.field && <ErrorMessage>{errors.field}</ErrorMessage>}
```

## Error Handling (Standard)
```typescript
// Au lieu de:
try { await operation(); } catch (e) { console.error(e); }

// Utiliser:
await ErrorHandler.executeWithRetry(operation, { maxRetries: 3 });
```

## Cleanup (Obligatoire)
```typescript
// Toujours utiliser:
const cleanup = useCleanupRegistry();
useEffect(() => cleanup.cleanupComponent(), []);
```

### 🚀 Guide de Déploiement

1. **Preparation:**
   ```bash
   git checkout -b release/v4.0.0
   npm run build:analyze  # Vérifier bundle size
   npm run test:coverage  # Vérifier couverture
   ```

2. **Déploiement Staging:**
   ```bash
   npm run deploy:staging
   # Tests E2E complets
   # Performance audit
   ```

3. **Déploiement Production:**
   ```bash
   npm run deploy:production
   # Monitoring actif
   # Alerting configuré
   ```

4. **Post-déploiement:**
   ```bash
   npm run validate:production
   # Vérification métriques
   # Validation user flows
   ```

Cette documentation de migration fournit tous les éléments nécessaires pour une transition réussie vers MonToit v4.0, avec des instructions détaillées, des exemples pratiques, et un plan de formation complet pour l'équipe.