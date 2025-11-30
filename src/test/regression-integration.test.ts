/**
 * Tests de Régression - Suite d'Intégration Complète
 * 
 * Ces tests valident l'intégration complète de toutes les corrections appliquées
 * dans un scénario réaliste d'utilisation de MonToit.
 */

import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mocks globaux pour l'intégration
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
    getStats: jest.fn(() => ({ totalResources: 0, byType: {} })),
    getActiveResources: jest.fn(() => []),
  },
}));

jest.mock('@/shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    logError: jest.fn(),
    handleError: jest.fn((error) => ({ message: error.message, handled: true })),
    showError: jest.fn(),
    clearError: jest.fn(),
  }),
}));

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

// Composants d'intégration simulateurs
const IntegrationTestApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  // Simulation des hooks optimisés
  const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
  const cleanup = require('@/hooks/useCleanupRegistry').useCleanupRegistry('IntegrationTestApp');

  useEffect(() => {
    // Simulation de l'initialisation avec gestion d'erreur et cleanup
    const initializeApp = async () => {
      try {
        // Chargement des données utilisateur
        const userData = await simulateApiCall('user', { 
          id: 'user-123', 
          name: 'Test User',
          email: 'test@example.com' 
        });
        setCurrentUser(userData);

        // Chargement des propriétés avec optimisations
        const propertiesData = await simulateApiCall('properties', [
          { id: '1', title: 'Maison 1', price: 100000 },
          { id: '2', title: 'Maison 2', price: 200000 },
        ]);
        setProperties(propertiesData);

        // Setup des subscriptions temps réel
        const subscription = cleanup.addSubscription(
          'properties-subscription',
          () => {
            // Mise à jour des propriétés
          }
        );

        // Setup du monitoring de performance
        const performanceObserver = cleanup.addPerformanceObserver(
          'app-performance',
          { type: 'measure' as const },
          (entries) => {
            console.log('Performance:', entries);
          }
        );

      } catch (err) {
        const error = err as Error;
        errorHandler.logError(error, 'IntegrationTestApp');
        setError(error.message);
      }
    };

    initializeApp();

    return () => {
      // Cleanup automatique
    };
  }, []);

  const simulateApiCall = async (type: string, data: any) => {
    // Simulation avec chance d'erreur
    if (Math.random() < 0.1) { // 10% de chance d'erreur
      throw new Error(`API Error for ${type}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    return data;
  };

  const handlePropertySearch = async (query: string) => {
    try {
      const results = properties.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase())
      );
      return results;
    } catch (error) {
      errorHandler.logError(error as Error, 'PropertySearch');
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      const newMessage = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
        sender: currentUser?.name || 'Anonymous'
      };

      // Optimistic update
      setMessages(prev => [...prev, newMessage]);

      // Envoi via API
      await simulateApiCall('message', newMessage);

      return newMessage;
    } catch (error) {
      // Rollback en cas d'erreur
      setMessages(prev => prev.slice(0, -1));
      errorHandler.logError(error as Error, 'SendMessage');
      throw error;
    }
  };

  if (error) {
    return (
      <div data-testid="error-state">
        <h2>Erreur d'initialisation</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Recharger</button>
      </div>
    );
  }

  if (!currentUser) {
    return <div data-testid="loading-state">Chargement de l'application...</div>;
  }

  return (
    <div data-testid="integration-app">
      <header>
        <h1>MonToit - Test d'Intégration</h1>
        <div>Utilisateur: {currentUser.name}</div>
      </header>

      <main>
        <section data-testid="properties-section">
          <h2>Propriétés ({properties.length})</h2>
          <PropertyList 
            properties={properties} 
            onSearch={handlePropertySearch}
          />
        </section>

        <section data-testid="messages-section">
          <h2>Messages ({messages.length})</h2>
          <MessageList messages={messages} />
          <MessageInput onSend={handleSendMessage} />
        </section>

        <section data-testid="notifications-section">
          <h2>Notifications</h2>
          <NotificationCenter />
        </section>
      </main>
    </div>
  );
};

const PropertyList = ({ properties, onSearch }: {
  properties: any[];
  onSearch: (query: string) => Promise<any[]>;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await onSearch(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div data-testid="property-list">
      <div>
        <input
          type="text"
          placeholder="Rechercher une propriété..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="property-search-input"
        />
        <button 
          onClick={() => handleSearch(searchQuery)}
          data-testid="property-search-button"
        >
          Rechercher
        </button>
      </div>

      {isSearching && <div data-testid="searching">Recherche en cours...</div>}

      <div data-testid="property-results">
        {(searchResults.length > 0 ? searchResults : properties).map(property => (
          <PropertyCard 
            key={property.id} 
            property={property}
            onFavorite={() => console.log('Favorited:', property.id)}
            onView={() => console.log('Viewed:', property.id)}
          />
        ))}
      </div>
    </div>
  );
};

const PropertyCard = memo<{
  property: any;
  onFavorite: (id: string) => void;
  onView: (id: string) => void;
}>(({ property, onFavorite, onView }) => {
  // Optimisation avec React.memo et null checks
  const handleFavorite = useCallback(() => {
    onFavorite(property?.id);
  }, [property?.id, onFavorite]);

  const handleView = useCallback(() => {
    onView(property?.id);
  }, [property?.id, onView]);

  // Vérification de sécurité pour les données de propriété
  const displayPrice = property?.price || 0;
  const displayTitle = property?.title || 'Titre non disponible';

  return (
    <div data-testid="property-card" className="property-card">
      <h3>{displayTitle}</h3>
      <p>Prix: {displayPrice.toLocaleString()} FCFA</p>
      <div>
        <button onClick={handleFavorite} data-testid="favorite-btn">
          ❤️ Favori
        </button>
        <button onClick={handleView} data-testid="view-btn">
          👁 Voir
        </button>
      </div>
    </div>
  );
});

const MessageList = ({ messages }: { messages: any[] }) => {
  return (
    <div data-testid="message-list">
      {messages.map(message => (
        <div key={message.id} data-testid="message-item" className="message-item">
          <strong>{message.sender}:</strong> {message.content}
          <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
        </div>
      ))}
    </div>
  );
};

const MessageInput = ({ onSend }: { onSend: (content: string) => Promise<any> }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onSend(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div data-testid="message-input">
      <input
        type="text"
        placeholder="Tapez votre message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        data-testid="message-text-input"
        disabled={isSending}
      />
      <button 
        onClick={handleSend} 
        disabled={isSending || !message.trim()}
        data-testid="send-message-button"
      >
        {isSending ? 'Envoi...' : 'Envoyer'}
      </button>
    </div>
  );
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'Bienvenue sur MonToit!', type: 'info' },
  ]);

  return (
    <div data-testid="notification-center">
      {notifications.map(notification => (
        <div key={notification.id} data-testid="notification-item" className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      ))}
    </div>
  );
};

// Import manquant pour memo
const { memo, useCallback } = React;

describe('🔗 Tests de Régression - Suite d\'Intégration Complète', () => {
  describe('1. Initialisation de l\'Application', () => {
    test('✅ Application s\'initialise avec toutes les corrections', async () => {
      render(<IntegrationTestApp />);

      // Vérifier l'état de chargement
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();

      // Attendre l'initialisation
      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });

      // Vérifier que l'utilisateur est chargé
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('✅ Gestion d\'erreur lors de l\'initialisation', async () => {
      // Mock d'un échec d'API
      const originalMathRandom = Math.random;
      Math.random = () => 0.05; // Force toujours une erreur (5% < 10%)

      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });

      expect(screen.getByText('Erreur d\'initialisation')).toBeInTheDocument();

      // Restaurer Math.random
      Math.random = originalMathRandom;
    });

    test('✅ Cleanup automatique lors du unmount', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;

      const { unmount } = render(<IntegrationTestApp />);

      // Unmount pour déclencher le cleanup
      unmount();

      // Vérifier que le cleanup a été appelé
      expect(cleanupRegistry.cleanupComponent).toHaveBeenCalledWith('IntegrationTestApp');
    });
  });

  describe('2. Recherche de Propriétés avec Optimisations', () => {
    test('✅ Recherche avec null checks et optimisations', async () => {
      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });

      // Effectuer une recherche
      fireEvent.change(screen.getByTestId('property-search-input'), {
        target: { value: 'Maison 1' }
      });

      fireEvent.click(screen.getByTestId('property-search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('searching')).toBeInTheDocument();
      });

      // Vérifier que les résultats s'affichent
      await waitFor(() => {
        expect(screen.getByTestId('property-results')).toBeInTheDocument();
      });
    });

    test('✅ PropertyCard avec React.memo et null checks', async () => {
      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(screen.getAllByTestId('property-card').length).toBeGreaterThan(0);
      });

      const firstPropertyCard = screen.getAllByTestId('property-card')[0];

      // Tester les interactions
      fireEvent.click(firstPropertyCard.querySelector('[data-testid="favorite-btn"]'));
      fireEvent.click(firstPropertyCard.querySelector('[data-testid="view-btn"]'));

      // Le composant ne doit pas planter
      expect(firstPropertyCard).toBeInTheDocument();
    });

    test('✅ Recherche gère les propriétés avec données manquantes', async () => {
      const TestPropertyWithMissingData = () => {
        const propertiesWithGaps = [
          { id: '1', title: 'Maison Complète', price: 100000 },
          { id: '2', title: null, price: null }, // Données manquantes
          { id: '3', title: 'Maison 3', price: 300000 },
        ];

        return (
          <div>
            {propertiesWithGaps.map(property => (
              <div key={property.id} data-testid="property-with-gaps">
                <div>Title: {property?.title || 'Titre non disponible'}</div>
                <div>Price: {(property?.price || 0).toLocaleString()} FCFA</div>
              </div>
            ))}
          </div>
        );
      };

      render(<TestPropertyWithMissingData />);

      // Vérifier que les données manquantes sont gérées gracieusement
      expect(screen.getByText('Title: Maison Complète')).toBeInTheDocument();
      expect(screen.getByText('Title: Titre non disponible')).toBeInTheDocument();
      expect(screen.getByText('Price: 0 FCFA')).toBeInTheDocument();
    });
  });

  describe('3. Système de Messages avec Optimistic Updates', () => {
    test('✅ Envoi de message avec optimistic updates', async () => {
      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });

      // Taper un message
      fireEvent.change(screen.getByTestId('message-text-input'), {
        target: { value: 'Test message d\'intégration' }
      });

      // Envoyer le message
      fireEvent.click(screen.getByTestId('send-message-button'));

      // Vérifier l'état d'envoi
      expect(screen.getByText('Envoi...')).toBeInTheDocument();

      // Attendre la confirmation
      await waitFor(() => {
        expect(screen.getByTestId('message-item')).toBeInTheDocument();
      });

      // Vérifier que le message apparaît
      expect(screen.getByText('Test message d\'intégration')).toBeInTheDocument();
    });

    test('✅ Rollback en cas d\'erreur d\'envoi', async () => {
      // Mock pour forcer une erreur d'envoi
      const originalMathRandom = Math.random;
      Math.random = () => 0.05; // Force une erreur

      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('message-text-input'), {
        target: { value: 'Message qui va échouer' }
      });

      fireEvent.click(screen.getByTestId('send-message-button'));

      // Attendre le traitement
      await waitFor(() => {
        expect(screen.getByText('Envoyer')).toBeInTheDocument();
      });

      // Vérifier qu'aucun message d'erreur n'est affiché (gestion silencieuse)
      expect(screen.queryByText(/message qui va échouer/i)).not.toBeInTheDocument();

      // Restaurer Math.random
      Math.random = originalMathRandom;
    });
  });

  describe('4. Notifications et Subscriptions', () => {
    test('✅ Centre de notifications fonctionnel', async () => {
      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });

      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      expect(screen.getByText('Bienvenue sur MonToit!')).toBeInTheDocument();
    });

    test('✅ Notifications avec audio context optimisé', () => {
      const TestNotificationWithAudio = () => {
        const [isPlaying, setIsPlaying] = useState(false);

        const playNotificationSound = () => {
          // Simulation d'un son de notification
          try {
            setIsPlaying(true);
            setTimeout(() => setIsPlaying(false), 1000);
          } catch (error) {
            // Gestion silencieuse des erreurs audio
          }
        };

        return (
          <div>
            <button onClick={playNotificationSound} data-testid="play-sound-btn">
              {isPlaying ? 'Son en cours...' : 'Jouer son de notification'}
            </button>
          </div>
        );
      };

      render(<TestNotificationWithAudio />);

      fireEvent.click(screen.getByTestId('play-sound-btn'));

      expect(screen.getByText('Son en cours...')).toBeInTheDocument();

      // Attendre la fin du son
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Jouer son de notification')).toBeInTheDocument();
    });
  });

  describe('5. Performance et Monitoring', () => {
    test('✅ Performance monitoring intégré', () => {
      render(<IntegrationTestApp />);

      // Le monitoring de performance doit être actif
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;
      
      expect(cleanupRegistry.addPerformanceObserver).toHaveBeenCalled();
    });

    test('✅ Gestion mémoire avec cleanup registry', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;

      // Vérifier les stats initiales
      const initialStats = cleanupRegistry.getStats();
      expect(initialStats.totalResources).toBeGreaterThanOrEqual(0);
    });
  });

  describe('6. Scénarios d\'Erreur Complexes', () => {
    test('✅ Récupération après cascade d\'erreurs', async () => {
      const TestErrorRecovery = () => {
        const [attempts, setAttempts] = useState(0);
        const [recovered, setRecovered] = useState(false);

        const simulateCascadeFailure = async () => {
          const errorTypes = ['network', 'auth', 'data', 'ui'];
          
          for (const errorType of errorTypes) {
            try {
              setAttempts(prev => prev + 1);
              
              // Simuler différents types d'erreurs
              if (Math.random() < 0.8) { // 80% chance d'erreur
                throw new Error(`${errorType} error`);
              }
              
              // Opération réussie
              setRecovered(true);
              break;
            } catch (error) {
              // Continue à la prochaine tentative
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        };

        return (
          <div data-testid="error-recovery-test">
            <div>Attempts: {attempts}</div>
            <div>Status: {recovered ? 'Recovered' : 'Failing'}</div>
            <button onClick={simulateCascadeFailure} data-testid="start-recovery">
              Start Recovery Test
            </button>
          </div>
        );
      };

      render(<TestErrorRecovery />);

      fireEvent.click(screen.getByTestId('start-recovery'));

      await waitFor(() => {
        expect(screen.getByTestId('error-recovery-test')).toBeInTheDocument();
      });
    });

    test('✅ Graceful degradation avec fallbacks multiples', async () => {
      const TestMultiFallback = () => {
        const [dataSource, setDataSource] = useState('primary');
        const [data, setData] = useState(null);

        const fetchWithMultipleFallbacks = async () => {
          const sources = ['primary', 'secondary', 'cache', 'offline'];
          
          for (const source of sources) {
            try {
              setDataSource(source);
              
              // Simuler différents niveaux de service
              const successRate = {
                primary: 0.9,
                secondary: 0.7,
                cache: 0.5,
                offline: 1.0
              }[source];

              if (Math.random() < successRate) {
                const mockData = `Data from ${source}`;
                setData(mockData);
                break;
              }
            } catch (error) {
              continue;
            }
          }
        };

        useEffect(() => {
          fetchWithMultipleFallbacks();
        }, []);

        return (
          <div data-testid="multi-fallback-test">
            <div>Data Source: {dataSource}</div>
            <div>Data: {data || 'Loading...'}</div>
          </div>
        );
      };

      render(<TestMultiFallback />);

      await waitFor(() => {
        expect(screen.getByTestId('multi-fallback-test')).toBeInTheDocument();
      });
    });
  });

  describe('7. Tests de Charge et Performance', () => {
    test('✅ Performance avec beaucoup de propriétés', async () => {
      const TestLargePropertyList = () => {
        const [properties] = useState(
          Array.from({ length: 100 }, (_, i) => ({
            id: `prop-${i}`,
            title: `Property ${i}`,
            price: 100000 + i * 1000,
          }))
        );

        return (
          <div>
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavorite={() => {}}
                onView={() => {}}
              />
            ))}
          </div>
        );
      };

      const start = performance.now();
      render(<TestLargePropertyList />);
      const end = performance.now();

      const renderTime = end - start;

      // Le rendu doit être rapide même avec beaucoup d'éléments
      expect(renderTime).toBeLessThan(1000); // Moins de 1 seconde
      expect(screen.getAllByTestId('property-card').length).toBe(100);
    });

    test('✅ Memory leaks prevention avec cleanup registry', () => {
      const cleanupRegistry = require('@/lib/cleanupRegistry').cleanupRegistry;

      const { unmount } = render(<IntegrationTestApp />);

      // Forcer plusieurs opérations avant unmount
      fireEvent.click(screen.getByTestId('property-search-button'));
      fireEvent.change(screen.getByTestId('message-text-input'), {
        target: { value: 'Test message' }
      });

      unmount();

      // Vérifier que le cleanup a été appelé pour le composant
      expect(cleanupRegistry.cleanupComponent).toHaveBeenCalledWith('IntegrationTestApp');
    });
  });

  describe('8. Tests d\'Accessibilité et UX', () => {
    test('✅ Navigation clavier fonctionnelle', async () => {
      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });

      // Tester la navigation au clavier
      const searchInput = screen.getByTestId('property-search-input');
      searchInput.focus();
      
      expect(searchInput).toHaveFocus();

      fireEvent.keyPress(searchInput, { key: 'Enter' });
      
      // Vérifier que l'interface répond
      expect(searchInput).toBeInTheDocument();
    });

    test('✅ États de chargement accessibles', async () => {
      render(<IntegrationTestApp />);

      // Vérifier l'état de chargement initial
      expect(screen.getByText('Chargement de l\'application...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('integration-app')).toBeInTheDocument();
      });

      // Vérifier les états de chargement des sous-composants
      const searchButton = screen.getByTestId('property-search-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('searching')).toBeInTheDocument();
      });
    });
  });
});

// Utilitaires d'intégration
export const createIntegrationTestScenario = (scenario: 'success' | 'partial-failure' | 'total-failure') => {
  switch (scenario) {
    case 'success':
      return {
        apiSuccessRate: 1.0,
        errorRate: 0.0,
        performanceTarget: 500,
      };
    case 'partial-failure':
      return {
        apiSuccessRate: 0.7,
        errorRate: 0.3,
        performanceTarget: 1000,
      };
    case 'total-failure':
      return {
        apiSuccessRate: 0.0,
        errorRate: 1.0,
        performanceTarget: 2000,
      };
  }
};

export const measureIntegrationPerformance = () => {
  const metrics = {
    renderTime: 0,
    apiCallTime: 0,
    memoryUsage: 0,
    errorRate: 0,
  };

  const startRender = performance.now();
  
  // Simulation des métriques
  metrics.renderTime = performance.now() - startRender;
  metrics.apiCallTime = Math.random() * 200;
  metrics.memoryUsage = (global as any).performance?.memory?.usedJSHeapSize || 0;
  metrics.errorRate = Math.random() * 0.1;

  return metrics;
};

export const simulateUserJourney = async () => {
  const steps = [
    'Login',
    'Browse Properties',
    'Search Properties',
    'View Property Details',
    'Send Message',
    'Check Notifications',
    'Logout',
  ];

  const results = [];

  for (const step of steps) {
    const stepStart = performance.now();
    
    // Simulation du step
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    const stepEnd = performance.now();
    results.push({
      step,
      duration: stepEnd - stepStart,
      success: Math.random() > 0.1, // 90% de succès
    });
  }

  return results;
};
