# 🧹 Guide d'Utilisation - CleanupRegistry MonToit

## Vue d'ensemble

La `CleanupRegistry` est un système centralisé pour gérer le cleanup de toutes les ressources dans les hooks et composants React de MonToit. Elle garantit qu'aucune fuite de mémoire ne se produit en nettoyant automatiquement les AbortControllers, timers, subscriptions, EventListeners, WebSockets, AudioContexts et PerformanceObservers.

## 🚀 Démarrage Rapide

### 1. Utilisation dans un Hook React

```typescript
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

function useMonHook() {
  // Initialiser la CleanupRegistry pour ce composant
  const cleanup = useCleanupRegistry('MonHook');
  
  useEffect(() => {
    // Créer un AbortController avec cleanup automatique
    const controller = cleanup.createAbortController(
      'ma-requete',
      'Description de la requête',
      'MonHook'
    );

    // Utiliser le controller
    fetch('/api/data', { signal: controller.signal });

    // Le cleanup se fait automatiquement !
  }, []);

  return { /* ... */ };
}
```

### 2. Utilisation Directe du Registry

```typescript
import { cleanupRegistry } from '@/lib/cleanupRegistry';

// Création manuelle
cleanupRegistry.createAbortController('id-unique', 'description');
cleanupRegistry.createTimeout('id-timeout', callback, 1000);
cleanupRegistry.addSubscription('id-sub', unsubscribeFn);

// Cleanup manuel
cleanupRegistry.cleanupComponent('MonComposant');
cleanupRegistry.cleanupAll();
```

## 🛠️ Types de Ressources Supportées

### AbortController
```typescript
// Création automatique
const controller = cleanup.createAbortController(
  'requete-api',
  'Requête API vers le service utilisateur',
  'UserService'
);

// Utilisation
fetch('/api/users', { signal: controller.signal });
```

### Timeouts
```typescript
// Timeout unique
cleanup.createTimeout(
  'delayed-action',
  () => console.log('Action exécutée'),
  2000,
  'Action retardée de 2 secondes'
);
```

### Intervals
```typescript
// Interval périodique
cleanup.createInterval(
  'polling-data',
  () => refetch(),
  5000,
  'Polling des données toutes les 5 secondes'
);
```

### Subscriptions
```typescript
// Subscription temps réel
const unsubscribe = supabase
  .channel('messages')
  .on('postgres_changes', callback)
  .subscribe();

cleanup.addSubscription(
  'realtime-messages',
  () => unsubscribe(),
  'Subscription temps réel des messages'
);
```

### EventListeners
```typescript
// Event listener DOM
cleanup.addEventListener(
  'scroll-handler',
  window,
  'scroll',
  handleScroll,
  { passive: true },
  'Gestionnaire de scroll'
);
```

### PerformanceObserver
```typescript
// Observer de performance
const observer = new PerformanceObserver(callback);
observer.observe({ entryTypes: ['paint'] });

cleanup.addPerformanceObserver(
  'paint-metrics',
  observer,
  'Mesure des métriques de paint'
);
```

### WebSocket
```typescript
// Connexion WebSocket
const ws = new WebSocket('wss://api.example.com/ws');
cleanup.addWebSocket(
  'chat-connection',
  ws,
  'Connexion WebSocket pour le chat'
);
```

### AudioContext
```typescript
// Contexte audio pour les sons
const audioContext = new AudioContext();
cleanup.addAudioContext(
  'notification-sounds',
  audioContext,
  'Contexte audio pour les notifications'
);
```

## 🎯 Bonnes Pratiques

### 1. Nommage des Ressources
```typescript
// ✅ Bon nommage
cleanup.createAbortController('fetch-users', 'Fetch users list', 'UsersList');

// ❌ Mauvais nommage
cleanup.createTimeout('t1', () => {}, 1000);
```

### 2. Descriptions Utiles
```typescript
// ✅ Description claire
cleanup.createInterval(
  'refresh-inventory',
  refreshInventoryData,
  30000,
  'Actualise l\'inventaire toutes les 30 secondes'
);

// ❌ Description vague
cleanup.addSubscription('sub1', unsubscribeFn, 'sub');
```

### 3. Scope par Composant
```typescript
function useUserProfile(userId: string) {
  const cleanup = useCleanupRegistry('UserProfile');
  
  // Tous les resources créé ici seront cleansés ensemble
  // avec cleanup.cleanupComponent()
  
  useEffect(() => {
    const controller = cleanup.createAbortController(
      'fetch-profile',
      `Fetch profile for user ${userId}`,
      'UserProfile'
    );
    
    fetchUserProfile(userId, controller.signal);
  }, [userId]);
}
```

## 📊 Monitoring et Debug

### 1. Statistiques en Temps Réel
```typescript
const stats = cleanupRegistry.getStats();

console.log({
  total: stats.totalResources,
  abortControllers: stats.byType['abort-controller'],
  timeouts: stats.byType['timeout'],
  subscriptions: stats.byType['subscription'],
  oldestResource: stats.oldestResource,
  newestResource: stats.newestResource,
});
```

### 2. Liste des Ressources Actives
```typescript
const resources = cleanupRegistry.getActiveResources();

resources.forEach(resource => {
  console.log(`${resource.id}: ${resource.description}`, {
    type: resource.type,
    component: resource.component,
    created: resource.createdAt,
  });
});
```

### 3. Détection Automatique de Fuites
La CleanupRegistry détecte automatiquement les fuites potentielles :
- Plus de 100 ressources actives
- Plus de 10 timeouts/interval
- Plus de 20 subscriptions
- Ressources actives depuis plus de 30 minutes

Des warnings sont automatiquement logged.

## 🧪 Tests et Validation

### Vérification du Cleanup
```typescript
import { runAllCleanupTests } from '@/test/cleanupFunctions.test';

// Dans votre test
it('should cleanup properly', async () => {
  const results = await runAllCleanupTests();
  expect(results.success).toBe(true);
});
```

### Test Manual dans la Console
```typescript
// Dans la console du navigateur
import { cleanupRegistry } from '@/lib/cleanupRegistry';

// Vérifier l'état actuel
console.log(cleanupRegistry.getStats());

// Cleanup manuel si nécessaire
cleanupRegistry.cleanupAll();
```

## 🎛️ Configuration Avancée

### 1. Cleanup Hiérarchique
```typescript
// Cleanup par composant
cleanupRegistry.cleanupComponent('UserProfile');

// Cleanup par type
cleanupRegistry.cleanupByType('subscription');

// Cleanup global
cleanupRegistry.cleanupAll();
```

### 2. Gestion Manuelle
```typescript
// Supprimer une ressource spécifique
const resourceId = 'mon-timeout-id';
const removed = cleanupRegistry.remove(resourceId);

if (removed) {
  console.log(`Ressource ${resourceId} supprimée`);
}
```

## 📝 Exemple Complet

```typescript
import { useEffect, useState } from 'react';
import { useCleanupRegistry } from '@/lib/cleanupRegistry';

function useRealTimeChat(roomId: string) {
  const [messages, setMessages] = useState([]);
  const cleanup = useCleanupRegistry('RealTimeChat');

  useEffect(() => {
    // 1. AbortController pour les requêtes initiales
    const loadController = cleanup.createAbortController(
      'load-messages',
      `Load initial messages for room ${roomId}`,
      'RealTimeChat'
    );

    // 2. Subscription temps réel
    const subscription = supabase
      .channel(`chat-${roomId}`)
      .on('postgres_changes', handleNewMessage)
      .subscribe();

    cleanup.addSubscription(
      `realtime-chat-${roomId}`,
      () => subscription.unsubscribe(),
      `Real-time chat subscription for room ${roomId}`,
      'RealTimeChat'
    );

    // 3. EventListener pour les raccourcis clavier
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };

    cleanup.addEventListener(
      'keypress-listener',
      document,
      'keydown',
      handleKeyPress,
      false,
      'Keyboard shortcuts for chat'
    );

    // 4. Interval pour la synchronisation périodique
    const syncInterval = cleanup.createInterval(
      'sync-messages',
      syncWithServer,
      30000,
      'Sync messages with server every 30 seconds',
      'RealTimeChat'
    );

    // Chargement initial
    loadInitialMessages(roomId, loadController.signal)
      .then(setMessages)
      .catch(console.error);

    // Cleanup automatique quand le composant se démonte
    // ou quand roomId change
  }, [roomId, cleanup]);

  const sendMessage = async (content: string) => {
    const sendController = cleanup.createAbortController(
      'send-message',
      `Send message to room ${roomId}`,
      'RealTimeChat'
    );

    try {
      await sendMessageToRoom(roomId, content, sendController.signal);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleNewMessage = (payload) => {
    setMessages(prev => [...prev, payload.new]);
  };

  const syncWithServer = async () => {
    const syncController = cleanup.createAbortController(
      'sync-server',
      `Sync with server for room ${roomId}`,
      'RealTimeChat'
    );

    try {
      await fetchLatestMessages(roomId, syncController.signal);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return {
    messages,
    sendMessage,
  };
}
```

## ⚠️ Points d'Attention

### 1. Dépendances du Hook
```typescript
// ✅ Correct
useEffect(() => {
  const controller = cleanup.createAbortController('test', 'desc', 'Component');
}, [cleanup]); // cleanup doit être dans les dépendances

// ❌ Incorrect
useEffect(() => {
  const controller = cleanup.createAbortController('test', 'desc', 'Component');
}, []); // cleanup n'est pas dans les dépendances
```

### 2. Idempotence du Cleanup
```typescript
// ✅ Les fonctions de cleanup doivent être idempotentes
cleanup: () => {
  if (!controller.signal.aborted) {
    controller.abort();
  }
};

// ❌ Problématique
cleanup: () => {
  controller.abort(); // Peut lancer une erreur si appelé deux fois
};
```

### 3. Gestion des Erreurs
```typescript
// ✅ Gestion robuste des erreurs
cleanup: () => {
  try {
    subscription.unsubscribe();
  } catch (error) {
    console.warn('Cleanup failed:', error);
  }
};
```

## 🔧 Intégration avec les Outils Existants

### React Query
```typescript
function useQueryWithCleanup(queryKey: string, queryFn: () => Promise<any>) {
  const cleanup = useCleanupRegistry('ReactQuery');
  
  return useQuery({
    queryKey,
    queryFn: () => {
      const controller = cleanup.createAbortController(
        `query-${queryKey}`,
        `React Query: ${queryKey}`,
        'ReactQuery'
      );
      return queryFn();
    },
    // ... autres options
  });
}
```

### Supabase
```typescript
function useSupabaseQuery(table: string, filters: any) {
  const cleanup = useCleanupRegistry('SupabaseQuery');
  
  return useQuery({
    queryKey: [table, filters],
    queryFn: async () => {
      const controller = cleanup.createAbortController(
        `supabase-${table}`,
        `Supabase query for ${table}`,
        'SupabaseQuery'
      );
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .match(filters);
        
      if (error) throw error;
      return data;
    },
  });
}
```

## 📚 Ressources Supplémentaires

- [Documentation React sur useEffect](https://react.dev/reference/react/useEffect)
- [AbortController MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [PerformanceObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
- [WebSocket MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🐛 Dépannage

### Problème : Ressources non nettoyées
```typescript
// Vérifier les statistiques
console.log(cleanupRegistry.getStats());

// Cleanup manuel d'urgence
cleanupRegistry.cleanupAll();
```

### Problème : Fuites de mémoire détectées
```typescript
// Identifier les ressources problématiques
const resources = cleanupRegistry.getActiveResources();
resources.forEach(r => {
  const age = Date.now() - r.createdAt.getTime();
  if (age > 1800000) { // 30 minutes
    console.warn(`Old resource: ${r.id}`, r);
  }
});
```

### Problème : Erreurs de cleanup
```typescript
// Vérifier que les fonctions de cleanup sont idempotentes
const resource = cleanupRegistry.getActiveResources()[0];
try {
  resource.cleanup();
  resource.cleanup(); // Doit ne rien faire
  console.log('Cleanup is idempotent ✅');
} catch (error) {
  console.error('Cleanup is not idempotent ❌', error);
}
```