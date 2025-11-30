# Guide de Prévention des Memory Leaks dans MonToit

## 🎯 Objectif

Ce guide présente les meilleures pratiques pour éviter les memory leaks dans les hooks personnalisés et composants React de l'application MonToit.

## 🔍 Types de Memory Leaks Identifiés

### 1. **Subscriptions non nettoyées**
- **Problème** : Les subscriptions Supabase, WebSocket, EventSource ne sont pas nettoyées
- **Impact** : Consommation continue de mémoire, listeners multiples
- **Solution** : Toujours retourner une fonction de cleanup

### 2. **Intervals et Timers non supprimés**
- **Problème** : `setInterval`, `setTimeout` non nettoyés
- **Impact** : Code qui continue de s'exécuter après le démontage
- **Solution** : Stocker les références et les supprimer dans le cleanup

### 3. **AbortController non utilisé**
- **Problème** : Requêtes asynchrones non annulées
- **Impact** : Requêtes qui continuent après le démontage
- **Solution** : Utiliser AbortController pour toutes les requêtes async

### 4. **PerformanceObserver non déconnectés**
- **Problème** : Observateurs de performance qui restent actifs
- **Impact** : Fuite de mémoire et callbacks inutiles
- **Solution** : Appeler `disconnect()` dans le cleanup

### 5. **Event listeners non supprimés**
- **Problème** : Event listeners ajoutés mais jamais supprimés
- **Impact** : Exécution de callbacks sur des éléments démontés
- **Solution** : Toujours utiliser `removeEventListener`

## 🛠️ Bonnes Pratiques par Type

### **Subscriptions Supabase**

```typescript
// ❌ MAUVAIS - Pas de cleanup
useEffect(() => {
  if (!user) return;

  const subscription = supabase
    .channel('messages')
    .on('postgres_changes', { event: 'INSERT' }, callback)
    .subscribe();

  // Pas de cleanup !
}, [user]);

// ✅ BON - Cleanup avec AbortController
useEffect(() => {
  if (!user) return;

  const abortController = new AbortController();

  const subscription = supabase
    .channel(`messages_${user.id}`) // Channel unique par utilisateur
    .on('postgres_changes', { event: 'INSERT' }, callback)
    .subscribe();

  return () => {
    if (abortController.signal) {
      abortController.abort();
    }
    subscription.unsubscribe();
  };
}, [user]);
```

### **Intervals et Timers**

```typescript
// ❌ MAUVAIS - setInterval sans cleanup
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 5000);
  
  // Pas de cleanup !
}, []);

// ✅ BON - Cleanup avec useRef
const intervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  intervalRef.current = setInterval(() => {
    fetchData();
  }, 5000);

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, []);

// ✅ BON ALTERNATIF - Utiliser refetchInterval avec condition
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchInterval: (data, query) => {
    return shouldRefresh ? 5000 : false; // Arrêt conditionnel
  },
  refetchIntervalInBackground: false,
});
```

### **AbortController pour requêtes async**

```typescript
// ❌ MAUVAIS - Requête non annulable
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/data');
    setData(response.json());
  };
  
  fetchData();
}, []);

// ✅ BON - Avec AbortController
const abortControllerRef = useRef<AbortController | null>(null);

useEffect(() => {
  const fetchData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/data', {
        signal: abortControllerRef.current.signal
      });
      setData(response.json());
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Requête annulée, ignorer l'erreur
      }
      console.error('Erreur:', error);
    }
  };

  fetchData();

  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, []);
```

### **PerformanceObserver**

```typescript
// ❌ MAUVAIS - Observer non déconnecté
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    // Traitement des métriques
  });
  
  observer.observe({ entryTypes: ['paint'] });
  
  // Pas de cleanup !
}, []);

// ✅ BON - Avec cleanup
useEffect(() => {
  let observer: PerformanceObserver | null = null;

  const measure = () => {
    observer = new PerformanceObserver((list) => {
      // Traitement des métriques
    });
    
    observer.observe({ entryTypes: ['paint'] });
  };

  measure();

  return () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };
}, []);
```

### **Event Listeners**

```typescript
// ❌ MAUVAIS - Event listener non supprimé
useEffect(() => {
  const handleResize = () => {
    // Logique de redimensionnement
  };
  
  window.addEventListener('resize', handleResize);
  
  // Pas de cleanup !
}, []);

// ✅ BON - Avec cleanup
useEffect(() => {
  const handleResize = () => {
    // Logique de redimensionnement
  };
  
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

## 📝 Structure Type d'un useEffect Sécurisé

```typescript
import { useEffect, useRef } from 'react';

export function useSecureHook() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // 1. Validation des dépendances
    if (!shouldExecute) return;

    // 2. Initialisation des ressources
    abortControllerRef.current = new AbortController();

    // 3. Fonctions de callback
    const callback = () => {
      // Logique métier
    };

    // 4. Configuration des observers/listeners
    observerRef.current = new PerformanceObserver(callback);
    observerRef.current.observe({ entryTypes: ['paint'] });

    window.addEventListener('resize', callback);

    // 5. Timer si nécessaire
    intervalRef.current = setInterval(callback, 1000);

    // 6. Cleanup function
    return () => {
      // Annulation des requêtes en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Nettoyage des timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Déconnexion des observers
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Suppression des event listeners
      window.removeEventListener('resize', callback);
    };
  }, [/* dépendances */]);
}
```

## 🔧 Patterns Recommandés

### **1. Hook avec AbortController Intégré**

```typescript
import { useCallback, useRef, useEffect } from 'react';

export function useAsyncFetch() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWithAbort = useCallback(async (url: string) => {
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau contrôleur
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      });
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        return null; // Requête annulée
      }
      throw error;
    }
  }, []);

  // Cleanup automatique
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { fetchWithAbort };
}
```

### **2. Hook avec Timer Sécurisé**

```typescript
import { useCallback, useRef, useEffect } from 'react';

export function useSecureInterval() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const setSecureInterval = useCallback((callback: () => void, delay: number) => {
    // Nettoyer l'interval précédent
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(callback, delay);
  }, []);

  const clearSecureInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup automatique
  useEffect(() => {
    return clearSecureInterval;
  }, [clearSecureInterval]);

  return { setSecureInterval, clearSecureInterval };
}
```

### **3. Hook avec Subscription Sécurisée**

```typescript
import { useEffect, useRef, useCallback } from 'react';

export function useSecureSubscription() {
  const subscriptionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const subscribe = useCallback((channelName: string, callback: (payload: any) => void) => {
    // Nettoyer la subscription précédente
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Créer un AbortController
    abortControllerRef.current = new AbortController();

    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*' }, callback)
      .subscribe();

    subscriptionRef.current = subscription;
  }, []);

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup automatique
  useEffect(() => {
    return unsubscribe;
  }, [unsubscribe]);

  return { subscribe, unsubscribe };
}
```

## 🧪 Tests pour Détecter les Memory Leaks

### **1. Test de Cleanup avec React Testing Library**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';

describe('useMessageNotifications', () => {
  it('should cleanup subscription on unmount', () => {
    const { unmount } = renderHook(() => useMessageNotifications());
    
    // Simuler le démontage
    unmount();
    
    // Vérifier qu'il n'y a pas d'erreurs ou de fuites
  });
});
```

### **2. Test des AbortController**

```typescript
it('should abort pending requests on unmount', async () => {
  const { unmount } = renderHook(() => useVerification('user123'));
  
  // Démontage immédiat
  unmount();
  
  // Vérifier que les requêtes sont annulées
  expect(abortControllerRef.current?.signal.aborted).toBe(true);
});
```

## 📊 Outils de Monitoring

### **1. React DevTools Profiler**
- Vérifier les composants qui restent montés
- Identifier les renders inutiles

### **2. Chrome DevTools Memory Tab**
- Prendre des snapshots avant/après navigation
- Identifier les objets non garbage collectés

### **3. ESLint Rules**
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "react-hooks/rules-of-hooks": "error"
  }
}
```

## ✅ Checklist de Revue de Code

### **Pour chaque useEffect :**
- [ ] **Cleanup function retournée** : Le useEffect retourne-t-il une fonction de cleanup ?
- [ ] **AbortController** : Les requêtes async utilisent-elles AbortController ?
- [ ] **Intervals/Timers** : Les setInterval/setTimeout sont-ils nettoyés ?
- [ ] **Subscriptions** : Les subscriptions sont-elles annulées ?
- [ ] **Event Listeners** : Les event listeners sont-ils supprimés ?
- [ ] **PerformanceObserver** : Les observers sont-ils déconnectés ?
- [ ] **Dépendances** : Les dépendances sont-elles optimales ?

### **Patterns d'anti-patterns à éviter :**
- ❌ useEffect sans cleanup function
- ❌ setInterval sans clearInterval
- ❌ fetch() sans AbortController
- ❌ Event listeners sans removeEventListener
- ❌ PerformanceObserver sans disconnect()
- ❌ Supabase subscriptions sans unsubscribe()

## 🚀 Conclusion

La prévention des memory leaks nécessite une discipline constante dans l'écriture des hooks et composants React. Les bonnes pratiques présentées dans ce guide doivent être appliquées systématiquement pour maintenir les performances de l'application MonToit.

### **Points clés à retenir :**
1. **Toujours prévoir un cleanup** pour chaque ressource allouée
2. **Utiliser AbortController** pour toutes les requêtes asynchrones
3. **Nettoyer les intervals et timers** systématiquement
4. **Déconnecter les observers** et supprimer les listeners
5. **Tester le cleanup** avec des tests unitaires

En suivant ces recommandations, nous garantissons une application MonToit performante et sans fuites de mémoire.
