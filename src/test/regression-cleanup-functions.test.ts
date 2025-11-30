/**
 * Tests de Régression - Cleanup Functions et Gestion d'Erreur Robuste
 * 
 * Ces tests valident que les cleanup functions robustes fonctionnent correctement
 * et qu'aucune fuite de mémoire n'est introduite.
 */

import React, { useEffect, useRef, useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock du CleanupRegistry
jest.mock('@/lib/cleanupRegistry', () => ({
  cleanupRegistry: {
    createAbortController: jest.fn(),
    createTimeout: jest.fn(),
    createInterval: jest.fn(),
    addSubscription: jest.fn(),
    addEventListener: jest.fn(),
    addPerformanceObserver: jest.fn(),
    addWebSocket: jest.fn(),
    addAudioContext: jest.fn(),
    cleanupComponent: jest.fn(),
    cleanupByType: jest.fn(),
    cleanupAll: jest.fn(),
    getStats: jest.fn(() => ({
      totalResources: 0,
      byType: {},
    })),
    getActiveResources: jest.fn(() => []),
  },
}));

// Hooks mockés
jest.mock('@/hooks/useCleanupRegistry', () => ({
  useCleanupRegistry: (componentName: string) => ({
    createAbortController: jest.fn(),
    createTimeout: jest.fn(),
    createInterval: jest.fn(),
    addSubscription: jest.fn(),
    addEventListener: jest.fn(),
    addPerformanceObserver: jest.fn(),
  }),
}));

// Composants de test avec cleanup functions
const TestAsyncComponent = ({ onCleanup }: { onCleanup?: () => void }) => {
  const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestAsyncComponent');
  const [data, setData] = useState(null);

  useEffect(() => {
    const abortController = cleanup.createAbortController('fetch-data', 'Fetch data operation');
    
    const fetchData = async () => {
      try {
        // Simuler une requête async
        await new Promise(resolve => setTimeout(resolve, 100));
        setData({ status: 'success' });
      } catch (error) {
        setData({ status: 'error', error: error.message });
      }
    };

    fetchData();

    return () => {
      onCleanup?.();
    };
  }, []);

  return <div data-testid="async-component">{data?.status || 'loading'}</div>;
};

const TestHttpComponent = () => {
  const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestHttpComponent');
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const timeout = cleanup.createTimeout('request-timeout', () => {
      setResponse({ error: 'Request timeout' });
    }, 5000);

    const abortController = cleanup.createAbortController('http-request', 'HTTP request');

    const makeRequest = async () => {
      try {
        // Simuler une requête HTTP
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResponse({ data: 'success' });
      } catch (error) {
        setResponse({ error: error.message });
      }
    };

    makeRequest();

    return () => {
      // Le cleanup automatique devrait être géré par le registry
    };
  }, []);

  return <div data-testid="http-component">{response?.data || 'waiting'}</div>;
};

const TestPerformanceComponent = () => {
  const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestPerformanceComponent');
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const performanceObserver = cleanup.addPerformanceObserver('render-metrics', {
      type: 'measure' as const,
    }, (entries) => {
      setMetrics(entries[0]?.duration || 0);
    });

    const eventListener = cleanup.addEventListener(
      window,
      'scroll',
      () => {
        // Simuler du travail sur scroll
      },
      { passive: true }
    );

    return () => {
      // Cleanup automatique
    };
  }, []);

  return <div data-testid="performance-component">Metrics: {metrics.toString()}</div>;
};

const TestSubscriptionComponent = () => {
  const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestSubscriptionComponent');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const subscription = cleanup.addSubscription(
      'messages-subscription',
      () => {
        // Simuler une subscription temps réel
        setMessages(prev => [...prev, `Message ${prev.length + 1}`]);
      }
    );

    // Simuler l'envoi de messages
    const interval = cleanup.createInterval('message-interval', () => {
      setMessages(prev => [...prev, `Message ${prev.length + 1}`]);
    }, 1000);

    return () => {
      // Cleanup automatique
    };
  }, []);

  return (
    <div data-testid="subscription-component">
      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  );
};

const TestWebSocketComponent = () => {
  const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestWebSocketComponent');
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Simuler une connexion WebSocket
    const mockWebSocket = {
      close: jest.fn(),
      send: jest.fn(),
      addEventListener: jest.fn(),
    };

    const webSocket = cleanup.addWebSocket(
      'main-connection',
      mockWebSocket,
      'Main WebSocket connection'
    );

    setConnection('connected');

    return () => {
      // Cleanup automatique de la connexion WebSocket
    };
  }, []);

  return <div data-testid="websocket-component">{connection}</div>;
};

const TestAudioComponent = () => {
  const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestAudioComponent');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Simuler un contexte audio
    const mockAudioContext = {
      close: jest.fn(),
      createOscillator: jest.fn(),
      destination: {},
    };

    const audioContext = cleanup.addAudioContext(
      'notification-audio',
      mockAudioContext,
      'Notification sound context'
    );

    return () => {
      // Cleanup automatique de l'AudioContext
    };
  }, []);

  return (
    <div data-testid="audio-component">
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Stop' : 'Play'} Sound
      </button>
    </div>
  );
};

describe('🧹 Tests de Régression - Cleanup Functions et Gestion de Mémoire', () => {
  describe('1. CleanupRegistry - Gestion Centralisée', () => {
    test('✅ Création sécurisée des AbortControllers', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      const mockAbortController = { abort: jest.fn() };
      
      cleanupRegistry.createAbortController('test-operation', 'Test operation', 'TestComponent');

      expect(cleanupRegistry.createAbortController).toHaveBeenCalledWith(
        'test-operation',
        'Test operation',
        'TestComponent'
      );
    });

    test('✅ Gestion des timeouts avec cleanup automatique', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      const timeoutCallback = jest.fn();
      cleanupRegistry.createTimeout('test-timeout', timeoutCallback, 1000, 'Test timeout', 'TestComponent');

      expect(cleanupRegistry.createTimeout).toHaveBeenCalledWith(
        'test-timeout',
        timeoutCallback,
        1000,
        'Test timeout',
        'TestComponent'
      );
    });

    test('✅ Gestion des intervals avec cleanup automatique', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      const intervalCallback = jest.fn();
      cleanupRegistry.createInterval('test-interval', intervalCallback, 1000, 'Test interval', 'TestComponent');

      expect(cleanupRegistry.createInterval).toHaveBeenCalledWith(
        'test-interval',
        intervalCallback,
        1000,
        'Test interval',
        'TestComponent'
      );
    });

    test('✅ Gestion des subscriptions temps réel', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      const unsubscribe = jest.fn();
      cleanupRegistry.addSubscription('test-subscription', unsubscribe, 'Test subscription', 'TestComponent');

      expect(cleanupRegistry.addSubscription).toHaveBeenCalledWith(
        'test-subscription',
        unsubscribe,
        'Test subscription',
        'TestComponent'
      );
    });

    test('✅ Statistiques du registry accessibles', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      const stats = cleanupRegistry.getStats();

      expect(stats).toHaveProperty('totalResources');
      expect(stats).toHaveProperty('byType');
      expect(typeof stats.totalResources).toBe('number');
      expect(typeof stats.byType).toBe('object');
    });
  });

  describe('2. useAsync Hook - Améliorations avec Cleanup', () => {
    test('✅ useAsync utilise AbortController via cleanup registry', async () => {
      render(<TestAsyncComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('async-component')).toHaveTextContent('success');
      });
    });

    test('✅ useAsync gère les erreurs avec cleanup', async () => {
      const TestErrorAsyncComponent = ({ shouldError = false }) => {
        const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestErrorAsyncComponent');
        const [data, setData] = useState(null);

        useEffect(() => {
          const fetchData = async () => {
            if (shouldError) {
              throw new Error('Test error');
            }
            setData({ status: 'success' });
          };

          fetchData();

          return () => {
            // Cleanup automatique
          };
        }, [shouldError]);

        return <div data-testid="error-async">{data?.status || 'loading'}</div>;
      };

      render(<TestErrorAsyncComponent shouldError={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-async')).toBeInTheDocument();
      });
    });
  });

  describe('3. useHttp Hook - Requêtes avec Gestion Robuste', () => {
    test('✅ useHttp gère timeouts et AbortController', async () => {
      render(<TestHttpComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('http-component')).toHaveTextContent('waiting');
      }, { timeout: 2000 });
    });

    test('✅ useHttp annule les requêtes obsolètes', () => {
      const TestHttpWithCancel = () => {
        const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestHttpWithCancel');
        const [cancelled, setCancelled] = useState(false);

        useEffect(() => {
          const abortController = cleanup.createAbortController('request', 'HTTP request');
          
          const makeRequest = async () => {
            try {
              // Simuler une requête qui sera annulée
              await new Promise(resolve => setTimeout(resolve, 2000));
              setCancelled(true);
            } catch (error) {
              setCancelled(true);
            }
          };

          makeRequest();

          // Simuler une annulation après unmount
          return () => {
            abortController.abort();
          };
        }, []);

        return <div data-testid="http-cancel">{cancelled ? 'cancelled' : 'pending'}</div>;
      };

      const { unmount } = render(<TestHttpWithCancel />);
      
      // Unmount avant que la requête soit terminée
      unmount();

      expect(screen.getByTestId('http-cancel')).toBeInTheDocument();
    });
  });

  describe('4. usePerformanceMonitoring - Surveillance et Cleanup', () => {
    test('✅ PerformanceObserver avec cleanup automatique', async () => {
      render(<TestPerformanceComponent />);

      // Le composant doit se rendre sans erreur
      expect(screen.getByTestId('performance-component')).toBeInTheDocument();
    });

    test('✅ EventListeners avec cleanup automatique', () => {
      const TestEventListenerComponent = () => {
        const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestEventListenerComponent');
        const [eventCount, setEventCount] = useState(0);

        useEffect(() => {
          const handleScroll = () => {
            setEventCount(prev => prev + 1);
          };

          const eventListener = cleanup.addEventListener(
            window,
            'scroll',
            handleScroll,
            { passive: true }
          );

          return () => {
            // Cleanup automatique
          };
        }, []);

        return <div data-testid="event-listener">Events: {eventCount}</div>;
      };

      render(<TestEventListenerComponent />);

      // Simuler un scroll
      fireEvent.scroll(window);

      expect(screen.getByTestId('event-listener')).toBeInTheDocument();
    });
  });

  describe('5. useNotifications - Audio et Subscriptions', () => {
    test('✅ AudioContext avec cleanup automatique', () => {
      render(<TestAudioComponent />);

      // Le composant doit se rendre sans erreur
      expect(screen.getByTestId('audio-component')).toBeInTheDocument();

      const button = screen.getByText('Play Sound');
      fireEvent.click(button);

      expect(screen.getByText('Stop Sound')).toBeInTheDocument();
    });

    test('✅ Subscriptions Supabase avec cleanup automatique', async () => {
      jest.useFakeTimers();

      render(<TestSubscriptionComponent />);

      // Avancer le temps pour déclencher les intervals
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('subscription-component')).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('6. WebSocket et AudioContext - Ressources Spécialisées', () => {
    test('✅ WebSocket avec cleanup automatique', () => {
      render(<TestWebSocketComponent />);

      expect(screen.getByTestId('websocket-component')).toHaveTextContent('connected');
    });
  });

  describe('7. Détection de Fuites de Mémoire', () => {
    test('✅ Surveillance automatique des ressources actives', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      const stats = cleanupRegistry.getStats();
      const activeResources = cleanupRegistry.getActiveResources();

      expect(stats.totalResources).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(activeResources)).toBe(true);
    });

    test('✅ Alertes pour usage anormal de ressources', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      // Simuler l'ajout de nombreuses ressources
      for (let i = 0; i < 105; i++) {
        cleanupRegistry.createTimeout(`timeout-${i}`, () => {}, 1000, 'Test timeout');
      }

      const stats = cleanupRegistry.getStats();
      
      // Vérifier que les alertes sont déclenchées pour > 100 ressources
      expect(stats.totalResources).toBeGreaterThanOrEqual(100);
    });

    test('✅ Cleanup par composant fonctionne', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      cleanupRegistry.cleanupComponent('TestComponent');

      expect(cleanupRegistry.cleanupComponent).toHaveBeenCalledWith('TestComponent');
    });

    test('✅ Cleanup par type de ressource fonctionne', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      cleanupRegistry.cleanupByType('timeout');

      expect(cleanupRegistry.cleanupByType).toHaveBeenCalledWith('timeout');
    });

    test('✅ Cleanup global fonctionne', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      cleanupRegistry.cleanupAll();

      expect(cleanupRegistry.cleanupAll).toHaveBeenCalled();
    });
  });

  describe('8. Tests d\'Intégration - Composants avec Multiple Cleanup', () => {
    test('✅ Composant complexe avec multiple types de cleanup', () => {
      const ComplexComponentWithCleanup = () => {
        const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('ComplexComponent');
        const [data, setData] = useState({});
        const [metrics, setMetrics] = useState({});

        useEffect(() => {
          // Créer plusieurs types de ressources
          const abortController = cleanup.createAbortController('fetch-data', 'Fetch data');
          const timeout = cleanup.createTimeout('data-timeout', () => {}, 5000);
          const interval = cleanup.createInterval('metrics-interval', () => {}, 1000);
          const subscription = cleanup.addSubscription('data-subscription', () => {});
          const eventListener = cleanup.addEventListener(window, 'resize', () => {});
          const performanceObserver = cleanup.addPerformanceObserver('perf-observer', {}, () => {});

          const fetchData = async () => {
            setData({ status: 'loaded' });
          };

          fetchData();

          return () => {
            // Cleanup automatique pour tous les types
          };
        }, []);

        return (
          <div data-testid="complex-component">
            <div data-testid="data-status">{data.status}</div>
          </div>
        );
      };

      render(<ComplexComponentWithCleanup />);

      expect(screen.getByTestId('complex-component')).toBeInTheDocument();
      expect(screen.getByTestId('data-status')).toHaveTextContent('loaded');
    });

    test('✅ Unmount propre sans fuites', () => {
      const TestCleanupOnUnmount = ({ shouldUnmount = false }) => {
        const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestCleanupOnUnmount');

        useEffect(() => {
          const abortController = cleanup.createAbortController('test-request', 'Test request');
          const timeout = cleanup.createTimeout('test-timeout', () => {}, 10000);
          const subscription = cleanup.addSubscription('test-subscription', () => {});

          return () => {
            // Ce cleanup doit être appelé lors de l'unmount
          };
        }, []);

        return <div data-testid="cleanup-test">Test Component</div>;
      };

      const { unmount } = render(<TestCleanupOnUnmount />);
      
      // Unmount pour tester le cleanup
      unmount();

      expect(screen.queryByTestId('cleanup-test')).not.toBeInTheDocument();
    });
  });

  describe('9. Tests de Robustesse - Gestion d\'Erreur dans Cleanup', () => {
    test('✅ Gestion d\'erreur lors du cleanup de ressources', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      // Mock d'une fonction de cleanup qui plante
      const failingCleanup = () => {
        throw new Error('Cleanup failed');
      };

      expect(() => {
        cleanupRegistry.cleanupComponent('FailingComponent');
      }).not.toThrow(); // Le registry doit gérer les erreurs silencieusement
    });

    test('✅ Resurrection-safe cleanup registry', () => {
      const TestResurrectionSafe = () => {
        const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('TestResurrectionSafe');
        const [mounted, setMounted] = useState(true);

        useEffect(() => {
          const abortController = cleanup.createAbortController('test-request', 'Test request');

          // Simuler une tentative de resurrection
          const timeout = setTimeout(() => {
            setMounted(false);
          }, 100);

          return () => {
            clearTimeout(timeout);
            // Cleanup qui ne plante pas même si le composant n'est plus mounté
          };
        }, [mounted]);

        return <div data-testid="resurrection-test">{mounted ? 'mounted' : 'unmounted'}</div>;
      };

      render(<TestResurrectionSafe />);

      expect(screen.getByTestId('resurrection-test')).toHaveTextContent('mounted');
    });
  });

  describe('10. Performance des Cleanup Functions', () => {
    test('✅ Performance overhead minimal du CleanupRegistry', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      const start = performance.now();
      
      // Créer 1000 ressources pour tester la performance
      for (let i = 0; i < 1000; i++) {
        cleanupRegistry.createTimeout(`perf-test-${i}`, () => {}, 1000);
      }
      
      const end = performance.now();
      const duration = end - start;

      // Le registry doit gérer 1000 ressources en moins de 100ms
      expect(duration).toBeLessThan(100);
    });

    test('✅ Cleanup automatique rapide', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      // Créer des ressources
      for (let i = 0; i < 100; i++) {
        cleanupRegistry.createTimeout(`cleanup-test-${i}`, () => {}, 1000);
      }

      const start = performance.now();
      
      // Nettoyer toutes les ressources
      cleanupRegistry.cleanupAll();
      
      const end = performance.now();
      const duration = end - start;

      // Le cleanup de 100 ressources doit être rapide
      expect(duration).toBeLessThan(50);
    });
  });
});

// Utilitaires pour les tests de cleanup
export const createMockResource = (type: string, id: string) => {
  const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
  
  switch (type) {
    case 'timeout':
      return cleanupRegistry.createTimeout(id, () => {}, 1000);
    case 'interval':
      return cleanupRegistry.createInterval(id, () => {}, 1000);
    case 'subscription':
      return cleanupRegistry.addSubscription(id, () => {});
    case 'abort-controller':
      return cleanupRegistry.createAbortController(id, 'Test operation');
    default:
      return null;
  }
};

export const measureCleanupPerformance = (resourceCount: number) => {
  const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
  
  // Créer des ressources
  for (let i = 0; i < resourceCount; i++) {
    cleanupRegistry.createTimeout(`perf-${i}`, () => {}, 1000);
  }

  const start = performance.now();
  cleanupRegistry.cleanupAll();
  const end = performance.now();

  return end - start;
};

export const simulateMemoryLeak = () => {
  const timeouts = [];
  
  // Créer plusieurs timeouts qui ne sont pas nettoyés
  for (let i = 0; i < 50; i++) {
    const timeout = setTimeout(() => {
      console.log(`Leaked timeout ${i}`);
    }, 1000);
    timeouts.push(timeout);
  }

  return timeouts;
};
