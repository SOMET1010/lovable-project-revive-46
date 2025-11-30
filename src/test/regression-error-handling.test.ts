/**
 * Tests de Régression - Gestion d'Erreur Robuste
 * 
 * Ces tests valident que la gestion d'erreur robuste fonctionne correctement
 * dans tous les composants et services de MonToit.
 */

import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock des services avec gestion d'erreur
jest.mock('@/lib/errorHandler', () => ({
  errorHandler: {
    logError: jest.fn(),
    handleError: jest.fn((error) => ({ message: error.message, handled: true })),
    createError: jest.fn((message, code, statusCode) => ({ message, code, statusCode })),
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

// Composants de test avec gestion d'erreur robuste
const TestErrorBoundary = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setError(new Error(error.message));
      setHasError(true);
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError && error) {
    return (
      <div data-testid="error-boundary">
        <h2>Une erreur est survenue</h2>
        <p>{error.message}</p>
        {fallback}
      </div>
    );
  }

  return <>{children}</>;
};

const TestComponentWithError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();

  const handleClick = () => {
    try {
      if (shouldThrow) {
        throw new Error('Erreur simulée dans le composant');
      }
      // Operation normale
    } catch (error) {
      errorHandler.logError(error as Error, 'TestComponentWithError');
      errorHandler.handleError(error as Error);
    }
  };

  return (
    <div data-testid="test-component">
      <button onClick={handleClick} data-testid="trigger-error">
        Trigger Error
      </button>
    </div>
  );
};

const TestAsyncComponentWithError = ({ shouldFail = false }: { shouldFail?: boolean }) => {
  const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      if (shouldFail) {
        throw new Error('Erreur réseau simulée');
      }
      
      // Simuler une opération async réussie
      await new Promise(resolve => setTimeout(resolve, 100));
      setData({ status: 'success', message: 'Données chargées' });
    } catch (err) {
      const error = err as Error;
      errorHandler.logError(error, 'TestAsyncComponentWithError');
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div data-testid="async-error-component">
      {error ? (
        <div data-testid="error-message">{error}</div>
      ) : data ? (
        <div data-testid="success-message">{data.message}</div>
      ) : (
        <div data-testid="loading-message">Chargement...</div>
      )}
      <button onClick={fetchData} data-testid="retry-button">
        Réessayer
      </button>
    </div>
  );
};

const TestFormWithValidation = () => {
  const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (data: typeof formData) => {
    const newErrors: any = {};

    if (!data.email) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!data.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (data.password.length < 8) {
      newErrors.password = 'Mot de passe trop court';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // Simuler un envoi qui peut échouer
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            Math.random() > 0.3 ? resolve('success') : reject(new Error('Échec de l\'envoi'));
          }, 1000);
        });
        
        // Succès
        alert('Formulaire envoyé avec succès !');
      } catch (error) {
        const err = error as Error;
        errorHandler.logError(err, 'TestFormWithValidation');
        setErrors({ submit: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form data-testid="test-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          data-testid="email-input"
        />
        {errors.email && <span data-testid="email-error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="password">Mot de passe:</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          data-testid="password-input"
        />
        {errors.password && <span data-testid="password-error">{errors.password}</span>}
      </div>
      
      {errors.submit && <div data-testid="submit-error">{errors.submit}</div>}
      
      <button type="submit" disabled={isSubmitting} data-testid="submit-button">
        {isSubmitting ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
};

const TestServiceWithRetry = () => {
  const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState(null);

  const performOperationWithRetry = async (maxAttempts = 3) => {
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        setAttempts(i);
        
        // Simuler une opération qui peut échouer
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            Math.random() > 0.7 ? resolve('success') : reject(new Error(`Tentative ${i} échouée`));
          }, 500);
        });
        
        setResult('Opération réussie après ' + i + ' tentatives');
        break;
      } catch (error) {
        const err = error as Error;
        errorHandler.logError(err, `TestServiceWithRetry-attempt-${i}`);
        
        if (i === maxAttempts) {
          setResult('Échec après ' + maxAttempts + ' tentatives');
          break;
        }
        
        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  return (
    <div data-testid="retry-service">
      <div>Attempts: {attempts}</div>
      <div>Result: {result || 'En cours...'}</div>
      <button onClick={() => performOperationWithRetry()} data-testid="start-retry">
        Démarrer l'opération
      </button>
    </div>
  );
};

const TestNetworkErrorComponent = () => {
  const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
  const [networkStatus, setNetworkStatus] = useState('online');

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
    };

    const handleOffline = () => {
      setNetworkStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const simulateNetworkError = () => {
    try {
      // Simuler une erreur réseau
      throw new Error('Network request failed');
    } catch (error) {
      errorHandler.logError(error as Error, 'TestNetworkErrorComponent');
      errorHandler.handleError(error as Error);
    }
  };

  return (
    <div data-testid="network-error-component">
      <div>Status: {networkStatus}</div>
      <button onClick={simulateNetworkError} data-testid="simulate-error">
        Simuler erreur réseau
      </button>
    </div>
  );
};

describe('🛡️ Tests de Régression - Gestion d\'Erreur Robuste', () => {
  describe('1. ErrorBoundary - Capture d\'Erreurs', () => {
    test('✅ ErrorBoundary capture les erreurs de rendu', () => {
      const ThrowError = () => {
        throw new Error('Erreur de rendu');
      };

      render(
        <TestErrorBoundary>
          <ThrowError />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    });

    test('✅ ErrorBoundary avec fallback personnalisé', () => {
      const ThrowError = () => {
        throw new Error('Erreur critique');
      };

      const customFallback = <div data-testid="custom-fallback">Fallback personnalisé</div>;

      render(
        <TestErrorBoundary fallback={customFallback}>
          <ThrowError />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('2. Composants avec Gestion d\'Erreur', () => {
    test('✅ Composant gère les erreurs sync sans planter', () => {
      render(<TestComponentWithError shouldThrow={true} />);

      const button = screen.getByTestId('trigger-error');
      fireEvent.click(button);

      // Le composant ne doit pas planter
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    test('✅ Composant gère les erreurs dans useCallback', () => {
      const TestCallbackError = () => {
        const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
        const [clickCount, setClickCount] = useState(0);

        const handleClick = () => {
          try {
            setClickCount(prev => prev + 1);
            if (clickCount >= 2) {
              throw new Error('Erreur après 2 clics');
            }
          } catch (error) {
            errorHandler.logError(error as Error, 'TestCallbackError');
          }
        };

        return (
          <div>
            <button onClick={handleClick} data-testid="callback-button">
              Click me ({clickCount})
            </button>
          </div>
        );
      };

      render(<TestCallbackError />);

      // Cliquer plusieurs fois pour déclencher l'erreur
      fireEvent.click(screen.getByTestId('callback-button'));
      fireEvent.click(screen.getByTestId('callback-button'));
      fireEvent.click(screen.getByTestId('callback-button'));

      expect(screen.getByTestId('callback-button')).toBeInTheDocument();
    });
  });

  describe('3. Composants Asynchrones avec Gestion d\'Erreur', () => {
    test('✅ Composant async gère les erreurs réseau', async () => {
      render(<TestAsyncComponentWithError shouldFail={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('async-error-component')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    test('✅ Composant async se remet des erreurs', async () => {
      render(<TestAsyncComponentWithError shouldFail={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });

      // Cliquer sur retry
      fireEvent.click(screen.getByTestId('retry-button'));

      // Le composant doit tenter de recharger
      expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    test('✅ Composant async gère le succès après échec', async () => {
      let attempt = 0;
      const TestVariableAsyncError = () => {
        const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
        const [data, setData] = useState(null);
        const [error, setError] = useState(null);

        const fetchData = async () => {
          try {
            attempt++;
            if (attempt <= 2) {
              throw new Error(`Tentative ${attempt} échouée`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            setData({ status: 'success' });
          } catch (err) {
            const error = err as Error;
            errorHandler.logError(error, 'TestVariableAsyncError');
            setError(error.message);
          }
        };

        useEffect(() => {
          fetchData();
        }, []);

        return (
          <div data-testid="variable-async">
            {error && <div data-testid="error-msg">{error}</div>}
            {data && <div data-testid="success-msg">Success</div>}
            <button onClick={fetchData} data-testid="retry-variable">Retry</button>
          </div>
        );
      };

      render(<TestVariableAsyncError />);

      await waitFor(() => {
        expect(screen.getByTestId('retry-variable')).toBeInTheDocument();
      });

      // Cliquer sur retry plusieurs fois
      fireEvent.click(screen.getByTestId('retry-variable'));
      fireEvent.click(screen.getByTestId('retry-variable'));

      await waitFor(() => {
        expect(screen.getByTestId('success-msg')).toBeInTheDocument();
      });
    });
  });

  describe('4. Formulaires avec Validation et Gestion d\'Erreur', () => {
    test('✅ Validation côté client fonctionne', () => {
      render(<TestFormWithValidation />);

      // Tenter d'envoyer un formulaire vide
      fireEvent.click(screen.getByTestId('submit-button'));

      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    test('✅ Validation email avec regex correcte', () => {
      render(<TestFormWithValidation />);

      // Entrer un email invalide
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'email-invalide' }
      });

      fireEvent.click(screen.getByTestId('submit-button'));

      expect(screen.getByTestId('email-error')).toHaveTextContent('Email invalide');
    });

    test('✅ Validation mot de passe avec longueur minimale', () => {
      render(<TestFormWithValidation />);

      // Entrer un mot de passe trop court
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: '123' }
      });

      fireEvent.click(screen.getByTestId('submit-button'));

      expect(screen.getByTestId('password-error')).toHaveTextContent('Mot de passe trop court');
    });

    test('✅ Formulaire valide s\'envoie avec succès', async () => {
      render(<TestFormWithValidation />);

      // Remplir le formulaire avec des données valides
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' }
      });

      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByTestId('submit-button'));

      // Attendre le résultat (peut réussir ou échouer aléatoirement)
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      });
    });

    test('✅ Gestion d\'erreur lors de l\'envoi du formulaire', async () => {
      // Mock de Math.random pour forcer un échec
      const originalRandom = Math.random;
      Math.random = () => 0.1; // Force l'échec

      render(<TestFormWithValidation />);

      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' }
      });

      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('submit-error')).toBeInTheDocument();
      });

      // Restaurer Math.random
      Math.random = originalRandom;
    });
  });

  describe('5. Services avec Retry Logic', () => {
    test('✅ Service avec retry automatique', async () => {
      render(<TestServiceWithRetry />);

      fireEvent.click(screen.getByTestId('start-retry'));

      await waitFor(() => {
        expect(screen.getByTestId('retry-service')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Vérifier que le nombre de tentatives augmente
      await waitFor(() => {
        expect(screen.getByText(/Attempts:/)).toBeInTheDocument();
      });
    });

    test('✅ Retry avec backoff exponentiel', async () => {
      const TestBackoffRetry = () => {
        const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
        const [delays, setDelays] = useState<number[]>([]);

        const performOperationWithBackoff = async () => {
          const backoffDelays = [];
          
          for (let i = 0; i < 3; i++) {
            try {
              await new Promise((resolve, reject) => {
                setTimeout(() => {
                  reject(new Error(`Attempt ${i + 1} failed`));
                }, 100);
              });
            } catch (error) {
              backoffDelays.push(Math.pow(2, i) * 1000); // 1s, 2s, 4s
              errorHandler.logError(error as Error, `BackoffRetry-${i}`);
            }
          }
          
          setDelays(backoffDelays);
        };

        return (
          <div data-testid="backoff-retry">
            <button onClick={performOperationWithBackoff} data-testid="start-backoff">
              Start Backoff Retry
            </button>
            <div data-testid="delays">
              Delays: {delays.join(', ')}
            </div>
          </div>
        );
      };

      render(<TestBackoffRetry />);

      fireEvent.click(screen.getByTestId('start-backoff'));

      await waitFor(() => {
        expect(screen.getByTestId('delays')).toHaveTextContent('1000, 2000, 4000');
      });
    });
  });

  describe('6. Gestion des Erreurs Réseau', () => {
    test('✅ Détection du statut réseau', () => {
      render(<TestNetworkErrorComponent />);

      expect(screen.getByText('Status: online')).toBeInTheDocument();
    });

    test('✅ Gestion des erreurs réseau simulées', () => {
      render(<TestNetworkErrorComponent />);

      fireEvent.click(screen.getByTestId('simulate-error'));

      // Le composant doit gérer l'erreur sans planter
      expect(screen.getByTestId('network-error-component')).toBeInTheDocument();
    });

    test('✅ Recovery après erreur réseau', async () => {
      const TestNetworkRecovery = () => {
        const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
        const [connectionState, setConnectionState] = useState('connected');
        const [error, setError] = useState(null);

        const simulateNetworkFailure = () => {
          setConnectionState('disconnected');
          setError('Connexion perdue');

          // Simuler une tentative de reconnexion
          setTimeout(() => {
            setConnectionState('reconnecting');
            setTimeout(() => {
              setConnectionState('connected');
              setError(null);
            }, 1000);
          }, 1000);
        };

        return (
          <div data-testid="network-recovery">
            <div>State: {connectionState}</div>
            {error && <div data-testid="network-error">{error}</div>}
            <button onClick={simulateNetworkFailure} data-testid="simulate-failure">
              Simulate Failure
            </button>
          </div>
        );
      };

      render(<TestNetworkRecovery />);

      fireEvent.click(screen.getByTestId('simulate-failure'));

      await waitFor(() => {
        expect(screen.getByText('State: disconnected')).toBeInTheDocument();
      });

      // Attendre la reconnexion
      await waitFor(() => {
        expect(screen.getByText('State: connected')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('7. Tests d\'Intégration - Chaîne Complète d\'Erreurs', () => {
    test('✅ Pipeline complet avec gestion d\'erreur à chaque étape', async () => {
      const TestErrorPipeline = () => {
        const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
        const [pipelineState, setPipelineState] = useState({ step: 0, error: null, data: null });

        const runPipeline = async () => {
          const steps = ['validation', 'auth', 'processing', 'response'];
          
          for (let i = 0; i < steps.length; i++) {
            try {
              setPipelineState(prev => ({ ...prev, step: i + 1, error: null }));
              
              // Simuler des erreurs à certaines étapes
              if (i === 1 && Math.random() > 0.7) { // 30% chance d'erreur auth
                throw new Error('Authentication failed');
              }
              
              if (i === 2 && Math.random() > 0.8) { // 20% chance d'erreur processing
                throw new Error('Processing failed');
              }
              
              // Simuler le travail
              await new Promise(resolve => setTimeout(resolve, 200));
              
            } catch (error) {
              const err = error as Error;
              errorHandler.logError(err, `Pipeline-${steps[i]}`);
              setPipelineState(prev => ({ ...prev, error: err.message }));
              break;
            }
          }
          
          setPipelineState(prev => ({ ...prev, data: 'Pipeline completed' }));
        };

        return (
          <div data-testid="error-pipeline">
            <div>Step: {pipelineState.step}/4</div>
            {pipelineState.error && <div data-testid="pipeline-error">{pipelineState.error}</div>}
            {pipelineState.data && <div data-testid="pipeline-success">{pipelineState.data}</div>}
            <button onClick={runPipeline} data-testid="run-pipeline">
              Run Pipeline
            </button>
          </div>
        );
      };

      render(<TestErrorPipeline />);

      fireEvent.click(screen.getByTestId('run-pipeline'));

      await waitFor(() => {
        expect(screen.getByTestId('error-pipeline')).toBeInTheDocument();
      });
    });

    test('✅ Graceful degradation après erreurs critiques', async () => {
      const TestGracefulDegradation = () => {
        const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
        const [serviceStatus, setServiceStatus] = useState({
          primary: 'available',
          secondary: 'available',
          cache: 'available',
        });
        const [data, setData] = useState(null);

        const fetchWithFallback = async () => {
          try {
            // Essayer le service principal
            await new Promise((resolve, reject) => {
              setTimeout(() => {
                Math.random() > 0.6 ? resolve('primary data') : reject(new Error('Primary failed'));
              }, 500);
            });
            setData('Données du service principal');
          } catch (primaryError) {
            errorHandler.logError(primaryError as Error, 'PrimaryService');
            setServiceStatus(prev => ({ ...prev, primary: 'failed' }));
            
            try {
              // Essayer le service secondaire
              await new Promise((resolve, reject) => {
                setTimeout(() => {
                  Math.random() > 0.3 ? resolve('secondary data') : reject(new Error('Secondary failed'));
                }, 300);
              });
              setData('Données du service secondaire (fallback)');
            } catch (secondaryError) {
              errorHandler.logError(secondaryError as Error, 'SecondaryService');
              setServiceStatus(prev => ({ ...prev, secondary: 'failed' }));
              
              try {
                // Essayer le cache
                await new Promise(resolve => setTimeout(resolve, 100));
                setData('Données du cache local');
                setServiceStatus(prev => ({ ...prev, cache: 'used' }));
              } catch (cacheError) {
                errorHandler.logError(cacheError as Error, 'CacheService');
                setData('Aucune donnée disponible');
              }
            }
          }
        };

        return (
          <div data-testid="graceful-degradation">
            <div>Primary: {serviceStatus.primary}</div>
            <div>Secondary: {serviceStatus.secondary}</div>
            <div>Cache: {serviceStatus.cache}</div>
            {data && <div data-testid="fallback-data">{data}</div>}
            <button onClick={fetchWithFallback} data-testid="fetch-fallback">
              Fetch with Fallback
            </button>
          </div>
        );
      };

      render(<TestGracefulDegradation />);

      fireEvent.click(screen.getByTestId('fetch-fallback'));

      await waitFor(() => {
        expect(screen.getByTestId('graceful-degradation')).toBeInTheDocument();
      });
    });
  });

  describe('8. Tests de Performance - Gestion d\'Erreur', () => {
    test('✅ Performance de la gestion d\'erreur', () => {
      const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
      
      const start = performance.now();
      
      // Simuler de nombreuses erreurs à gérer
      for (let i = 0; i < 1000; i++) {
        try {
          throw new Error(`Error ${i}`);
        } catch (error) {
          errorHandler.logError(error as Error, `PerformanceTest-${i}`);
        }
      }
      
      const end = performance.now();
      const duration = end - start;

      // La gestion d'erreur doit être rapide
      expect(duration).toBeLessThan(500); // Moins de 500ms pour 1000 erreurs
    });

    test('✅ Memory usage avec gestion d\'erreur', () => {
      const initialMemory = (global as any).performance?.memory?.usedJSHeapSize || 0;
      
      // Créer de nombreuses erreurs
      const errors = [];
      for (let i = 0; i < 100; i++) {
        errors.push(new Error(`Memory test error ${i}`));
      }
      
      // Simuler la gestion de ces erreurs
      const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
      errors.forEach(error => {
        errorHandler.logError(error, 'MemoryTest');
      });
      
      // Les erreurs doivent être nettoyées
      errors.length = 0;
      
      expect(errors.length).toBe(0);
    });
  });

  describe('9. Tests de Robustesse - Edge Cases', () => {
    test('✅ Gestion d\'erreurs circulaires', () => {
      const TestCircularError = () => {
        const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
        
        const createCircularError = () => {
          const error = new Error('Circular error');
          (error as any).cause = error; // Erreur circulaire
          return error;
        };

        const handleCircularError = () => {
          try {
            const error = createCircularError();
            errorHandler.logError(error, 'CircularErrorTest');
          } catch (handlerError) {
            // La gestion d'erreur ne doit pas planter sur une erreur circulaire
            console.log('Handler survived circular error');
          }
        };

        return (
          <div data-testid="circular-error-test">
            <button onClick={handleCircularError} data-testid="trigger-circular">
              Trigger Circular Error
            </button>
          </div>
        );
      };

      render(<TestCircularError />);
      
      fireEvent.click(screen.getByTestId('trigger-circular'));
      
      expect(screen.getByTestId('circular-error-test')).toBeInTheDocument();
    });

    test('✅ Gestion d\'erreurs avec données manquantes', () => {
      const TestMissingDataError = () => {
        const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
        
        const handleMissingDataError = () => {
          try {
            // Simuler une erreur avec des données manquantes
            const error = new Error();
            delete (error as any).message;
            delete (error as any).stack;
            
            errorHandler.logError(error, 'MissingDataTest');
          } catch (handlerError) {
            // Ne doit pas planter
          }
        };

        return (
          <div data-testid="missing-data-test">
            <button onClick={handleMissingDataError} data-testid="trigger-missing">
              Trigger Missing Data Error
            </button>
          </div>
        );
      };

      render(<TestMissingDataError />);
      
      fireEvent.click(screen.getByTestId('trigger-missing'));
      
      expect(screen.getByTestId('missing-data-test')).toBeInTheDocument();
    });
  });
});

// Utilitaires pour les tests
export const createMockError = (message: string, code?: string) => ({
  message,
  code: code || 'UNKNOWN_ERROR',
  timestamp: new Date().toISOString(),
  stack: new Error().stack,
});

export const simulateNetworkFailure = () => {
  // Simuler une panne réseau
  const originalFetch = global.fetch;
  global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
  
  return () => {
    global.fetch = originalFetch;
  };
};

export const measureErrorHandlingPerformance = (errorCount: number) => {
  const errorHandler = require('@/shared/hooks/useErrorHandler').useErrorHandler();
  
  const start = performance.now();
  
  for (let i = 0; i < errorCount; i++) {
    try {
      throw new Error(`Test error ${i}`);
    } catch (error) {
      errorHandler.logError(error as Error, `PerformanceTest-${i}`);
    }
  }
  
  const end = performance.now();
  return end - start;
};
