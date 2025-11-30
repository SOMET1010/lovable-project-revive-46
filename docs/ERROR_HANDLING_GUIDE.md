# Guide d'utilisation - Gestion d'erreur robuste MonToit

## Vue d'ensemble

Cette nouvelle gestion d'erreur robuste a été implémentée pour améliorer la fiabilité des services critiques de MonToit avec :

- **Retry automatique** avec backoff exponentiel
- **Gestion des timeouts** configurable
- **Logging détaillé** avec contexte
- **Classification des erreurs** (réessayables vs non-réessayables)
- **Hooks React** pour une intégration facile

## Architecture

```
ErrorHandler (noyau)
├── executeWithRetry() - Opérations avec retry automatique
├── execute() - Opérations simples avec try-catch
├── executeBatch() - Opérations en parallèle
├── isRetryableError() - Classification des erreurs
└── createErrorInfo() - Formatage des erreurs

Hooks React
├── useAsync() - Hook générique pour opérations async
├── useBatchAsync() - Hook pour opérations en lot
├── useCriticalOperation() - Hook pour opérations critiques
└── useCachedAsync() - Hook avec cache et retry
```

## Services améliorés

### 1. ApplicationService
- **Fonctionnalités** : CRUD candidatures, upload documents, scoring
- **Retry config** : 3 tentatives, délai de base 1s, timeout 30s
- **Erreurs réessayables** : Problèmes réseau, timeouts Supabase

### 2. PaymentService  
- **Fonctionnalités** : Traitement paiements Mobile Money
- **Retry config** : 2 tentatives, délai de base 2s, timeout 45s
- **Erreurs réessayables** : Erreurs réseau, codes 5xx, rate limiting

### 3. ContractService
- **Fonctionnalités** : Génération/sauvegarde contrats PDF
- **Retry config** : 3 tentatives, délai de base 1s, timeout 30s
- **Erreurs réessayables** : Problèmes Supabase, timeouts génération

## Utilisation dans les composants React

### Utilisation basique avec useAsync

```typescript
import { useAsync } from '@/hooks/useAsync';
import { createApplication } from '@/services/applicationService';

function ApplicationForm() {
  const { execute, loading, error } = useAsync(createApplication, {
    context: { service: 'ApplicationForm', operation: 'createApplication' },
    config: {
      maxRetries: 3,
      onRetry: (attempt, error, delay) => {
        console.log(`Retry attempt ${attempt} in ${delay}ms`);
      }
    },
    onSuccess: (data) => {
      console.log('Application created:', data);
    },
    onError: (error) => {
      console.error('Failed to create application:', error);
    }
  });

  const handleSubmit = async (formData) => {
    try {
      await execute(propertyId, applicantId, formData);
    } catch (error) {
      // Error déjà formaté et loggé
      console.log('Error code:', error.code);
      console.log('Is retryable:', error.retryable);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {loading && <Spinner />}
      {error && <ErrorMessage message={error.message} retryable={error.retryable} />}
      {/* Form fields */}
    </form>
  );
}
```

### Utilisation pour opérations critiques

```typescript
import { useCriticalOperation } from '@/hooks/useAsync';
import { processPayment } from '@/services/paymentService';

function PaymentProcessor() {
  const {
    execute,
    status,
    lastResult,
    error,
    isLoading,
    isSuccess,
    isError
  } = useCriticalOperation(processPayment, 
    { service: 'PaymentProcessor', operation: 'processPayment' },
    {
      maxRetries: 5, // Plus de tentatives pour les paiements
      baseDelay: 2000,
      timeout: 60000
    }
  );

  return (
    <div>
      {isLoading && <PaymentStatus status="processing" />}
      {isSuccess && <PaymentStatus status="success" result={lastResult} />}
      {isError && <PaymentError error={error} onRetry={() => execute(amount, provider, phone, ref)} />}
    </div>
  );
}
```

### Utilisation en batch

```typescript
import { useBatchAsync } from '@/hooks/useAsync';
import { uploadDocument } from '@/services/applicationService';

function DocumentUploader() {
  const { executeBatch, loading, results } = useBatchAsync(uploadDocument, {
    context: { service: 'DocumentUploader', operation: 'uploadDocument' },
    config: {
      maxRetries: 2,
      onError: (error) => {
        console.error('Batch operation failed:', error);
      }
    }
  });

  const handleBatchUpload = async (files) => {
    const operations = files.map(file => [
      applicationId,
      file,
      determineDocumentType(file.name)
    ]);
    
    const results = await executeBatch(operations);
    
    results.forEach((result, index) => {
      if (result instanceof Error) {
        console.error(`Failed to upload file ${index}:`, result);
      } else {
        console.log(`File ${index} uploaded successfully:`, result);
      }
    });
  };

  return (
    <div>
      {loading && <UploadingProgress />}
      {results.map((result, index) => (
        <FileUploadResult key={index} result={result} />
      ))}
    </div>
  );
}
```

## Configuration avancée

### Retry condition personnalisée

```typescript
const customRetryCondition = (error: any) => {
  // Retry sur erreurs réseau
  if (error.name === 'NetworkError') return true;
  
  // Retry sur codes HTTP spécifiques
  if (error.status === 429) return true; // Rate limit
  
  // Ne pas retry sur erreurs d'authentification
  if (error.message?.includes('JWT') || error.status === 401) return false;
  
  return false;
};

const config = {
  retryCondition: customRetryCondition,
  maxRetries: 5,
  onRetry: (attempt, error, delay) => {
    // Log personnalisé pour monitoring
    logToMonitoring({
      attempt,
      delay,
      error: error.message,
      service: 'MyService'
    });
  }
};
```

### Timeout et monitoring

```typescript
const monitoredConfig = {
  timeout: 30000, // 30 secondes
  onRetry: (attempt, error, delay) => {
    // Envoyer métriques
    metrics.increment('retry_attempts', { service: 'MyService' });
    metrics.timing('retry_delay', delay);
  }
};

const result = await ErrorHandler.executeWithRetry(
  operation,
  { service: 'MyService', operation: 'myOperation', context: { userId: '123' } },
  monitoredConfig
);
```

## Meilleures pratiques

### 1. Context toujours fourni
```typescript
// ✅ Bon
ErrorHandler.executeWithRetry(operation, { 
  service: 'UserService', 
  operation: 'updateProfile',
  context: { userId, action: 'profile_update' }
});

// ❌ Mauvais  
ErrorHandler.executeWithRetry(operation, { service: 'UserService' });
```

### 2. Configuration appropriée selon le type d'opération
```typescript
// Opérations critiques (paiements)
const CRITICAL_CONFIG = {
  maxRetries: 5,
  baseDelay: 2000,
  timeout: 60000
};

// Opérations non-critiques (notifications)
const NON_CRITICAL_CONFIG = {
  maxRetries: 2,
  baseDelay: 1000,
  timeout: 10000
};
```

### 3. Gestion des erreurs dans l'UI
```typescript
function ErrorDisplay({ error }: { error: ErrorInfo }) {
  return (
    <div className="error-container">
      <h3>{error.message}</h3>
      {error.retryable && (
        <button onClick={() => retry()}>
          Réessayer
        </button>
      )}
      <details>
        <summary>Détails techniques</summary>
        <pre>{JSON.stringify(error.context, null, 2)}</pre>
      </details>
    </div>
  );
}
```

### 4. Logging et monitoring
```typescript
// Configuration recommandée pour la production
const PROD_CONFIG = {
  onRetry: (attempt, error, delay) => {
    // Logger toutes les tentatives de retry
    console.warn('Retry attempt', { attempt, delay, error: error.message });
    
    // Envoyer aux services de monitoring
    if (attempt >= 3) {
      logToSentry(error, { attempt, delay, service: 'MyService' });
    }
  }
};
```

## Types d'erreurs et retry

### Erreurs réessayables automatiquement
- Problèmes réseau (timeout, connexion perdue)
- Erreurs serveur 5xx
- Rate limiting (429)
- Erreurs Supabase temporaires (PGRST116)

### Erreurs NON réessayables
- Erreurs d'authentification (401, JWT)
- Erreurs d'autorisation (403)
- Validation des données (400)
- Contraintes métier (ex: solde insuffisant)

## Migration des services existants

Pour migrer un service existant :

1. **Ajouter l'import** : `import { ErrorHandler } from '@/lib/errorHandler';`

2. **Définir le context** :
```typescript
const SERVICE_CONTEXT = { 
  service: 'MyService', 
  context: { module: 'myModule' } 
};
```

3. **Configurer le retry** :
```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  timeout: 30000,
  retryCondition: ErrorHandler.createSupabaseRetryCondition()
};
```

4. **Wrapper les opérations** :
```typescript
// Avant
async myOperation() {
  try {
    const result = await someAsyncCall();
    return { data: result };
  } catch (error) {
    return { error: error.message };
  }
}

// Après
async myOperation() {
  return ErrorHandler.executeWithRetry(async () => {
    const result = await someAsyncCall();
    return { data: result };
  }, { ...SERVICE_CONTEXT, operation: 'myOperation' }, RETRY_CONFIG);
}
```

## Monitoring et observabilité

Le système est prêt pour l'intégration avec :
- **Sentry** : Pour le tracking des erreurs
- **LogRocket** : Pour la replay des sessions
- **Datadog** : Pour les métriques et monitoring
- **Custom analytics** : Pour les métriques business

Les logs incluent :
- Service et opération
- Contexte (userId, resourceId, etc.)
- Nombre de tentatives
- Délai entre tentatives
- Stack trace complète
- Timestamp précis

Cette implémentation rend MonToit beaucoup plus robuste face aux pannes temporaires et améliore significativement l'expérience utilisateur.