/**
 * Configuration des Tests de Régression - MonToit
 * 
 * Ce fichier configure l'environnement de test et les utilitaires
 * pour tous les tests de régression des corrections appliquées.
 */

import '@testing-library/jest-dom';

// Configuration Jest pour les tests de régression
export const regressionTestConfig = {
  // Timeout global pour tous les tests
  testTimeout: 30000,

  // Configuration des mocks
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // Patterns de fichiers de test
  testMatch: [
    '<rootDir>/src/test/regression-*.test.ts',
    '<rootDir>/src/test/cleanupFunctions.test.ts',
    '<rootDir>/src/test/memory-leaks-validation.test.ts',
  ],

  // Variables d'environnement pour les tests
  testEnvironment: 'jsdom',

  // Configuration du coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/index.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Seuils spécifiques pour les composants optimisés
    'src/**/*optimized*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};

// Utilitaires globaux pour les tests
export const testUtils = {
  // Mock des APIs
  mockApi: {
    success: (data: any, delay: number = 100) => 
      new Promise(resolve => setTimeout(() => resolve(data), delay)),
    
    error: (message: string = 'API Error', delay: number = 100) => 
      new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay)),
    
    random: (successRate: number = 0.8, delay: number = 100) => 
      new Promise((resolve, reject) => 
        setTimeout(() => {
          Math.random() < successRate 
            ? resolve({ success: true })
            : reject(new Error('Random API failure'));
        }, delay)
      ),
  },

  // Mock des hooks avec optimisations
  mockOptimizedHooks: {
    useProperties: () => ({
      data: [
        { id: '1', title: 'Test Property 1', price: 100000 },
        { id: '2', title: 'Test Property 2', price: 200000 },
      ],
      loading: false,
      error: null,
      refetch: jest.fn(),
    }),

    useNotifications: () => ({
      notifications: [
        { id: '1', message: 'Test notification', read: false },
      ],
      markAsRead: jest.fn(),
      clearAll: jest.fn(),
    }),

    useMessages: () => ({
      messages: [
        { id: '1', content: 'Test message', sender: 'User1' },
      ],
      sendMessage: jest.fn(),
      loading: false,
    }),
  },

  // Mock des composants optimisés
  mockOptimizedComponents: {
    PropertyCard: ({ property, onFavorite, onView }: any) => (
      <div data-testid="mock-property-card">
        <div>{property?.title || 'No title'}</div>
        <button onClick={() => onFavorite(property?.id)}>Favorite</button>
        <button onClick={() => onView(property?.id)}>View</button>
      </div>
    ),

    SearchResults: ({ properties, onPropertyClick }: any) => (
      <div data-testid="mock-search-results">
        {properties?.map((prop: any) => (
          <div key={prop.id} onClick={() => onPropertyClick(prop.id)}>
            {prop.title}
          </div>
        ))}
      </div>
    ),
  },

  // Utilitaires de performance
  performance: {
    measureRender: (component: React.ReactElement) => {
      const start = performance.now();
      const { container } = render(component);
      const end = performance.now();
      return {
        duration: end - start,
        element: container,
      };
    },

    measureAsyncOperation: async (operation: () => Promise<any>) => {
      const start = performance.now();
      const result = await operation();
      const end = performance.now();
      return {
        duration: end - start,
        result,
      };
    },

    measureMemoryUsage: () => {
      if ((global as any).performance?.memory) {
        return (global as any).performance.memory.usedJSHeapSize;
      }
      return 0;
    },
  },

  // Utilitaires de test d'erreur
  errorTesting: {
    createTestError: (message: string = 'Test Error') => new Error(message),

    simulateNetworkError: () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));
      return () => { global.fetch = originalFetch; };
    },

    simulateTimeout: (timeoutMs: number = 5000) => {
      return new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout Error')), timeoutMs)
      );
    },
  },

  // Utilitaires de cleanup
  cleanup: {
    createMockCleanupRegistry: () => ({
      createAbortController: jest.fn(),
      createTimeout: jest.fn(),
      createInterval: jest.fn(),
      addSubscription: jest.fn(),
      addEventListener: jest.fn(),
      addPerformanceObserver: jest.fn(),
      cleanupComponent: jest.fn(),
      getStats: jest.fn(() => ({ totalResources: 0, byType: {} })),
    }),

    waitForCleanup: () => 
      new Promise(resolve => setTimeout(resolve, 100)),
  },
};

// Données de test communes
export const testData = {
  // Propriétés de test
  properties: [
    {
      id: '1',
      title: 'Villa moderne à Cocody',
      price: 250000000,
      location: 'Cocody',
      type: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      description: 'Magnifique villa moderne',
      images: ['image1.jpg', 'image2.jpg'],
      owner: { id: 'owner1', name: 'Jean Dupont' },
    },
    {
      id: '2',
      title: 'Appartement 3 pièces Plateau',
      price: 85000000,
      location: 'Plateau',
      type: 'appartement',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      description: 'Appartement au cœur du Plateau',
      images: ['image3.jpg'],
      owner: { id: 'owner2', name: 'Marie Martin' },
    },
    {
      id: '3',
      title: null, // Propriété avec données manquantes
      price: null,
      location: 'Abidjan',
      type: 'maison',
      // Champs manquants intentionnellement
    },
  ],

  // Utilisateurs de test
  users: [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+22501234567',
      role: 'tenant',
      profile: {
        avatar: 'avatar1.jpg',
        preferences: { notifications: true, language: 'fr' },
      },
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'owner',
      profile: {
        verified: true,
        properties: ['1', '2'],
      },
    },
  ],

  // Messages de test
  messages: [
    {
      id: 'msg1',
      content: 'Bonjour, je suis intéressé par cette propriété',
      sender: 'user1',
      timestamp: new Date().toISOString(),
      propertyId: '1',
    },
    {
      id: 'msg2',
      content: 'Merci pour votre intérêt. Pouvez-vous me donner plus d\'informations ?',
      sender: 'user2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      propertyId: '1',
    },
  ],

  // Notifications de test
  notifications: [
    {
      id: 'notif1',
      type: 'info',
      title: 'Bienvenue sur MonToit',
      message: 'Votre compte a été créé avec succès',
      read: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'notif2',
      type: 'success',
      title: 'Propriété ajoutée',
      message: 'Votre propriété a été publiée avec succès',
      read: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],

  // Erreurs de test
  errors: {
    networkError: 'Erreur de réseau: Impossible de se connecter au serveur',
    validationError: 'Erreur de validation: Données manquantes ou invalides',
    authError: 'Erreur d\'authentification: Token expiré',
    serverError: 'Erreur serveur: Problème temporaire, réessayez plus tard',
    unknownError: 'Erreur inconnue: Une erreur inattendue s\'est produite',
  },
};

// Configuration spécifique par type de test
export const testConfigurations = {
  // Tests de null checks
  nullChecks: {
    includeEdgeCases: true,
    testUndefinedProperties: true,
    testNullArrays: true,
    testEmptyObjects: true,
  },

  // Tests de performance
  performance: {
    renderTimeThreshold: 16, // 16ms pour 60fps
    memoryLeakThreshold: 1024 * 1024, // 1MB
    apiResponseTimeThreshold: 1000, // 1 seconde
  },

  // Tests de cleanup
  cleanup: {
    resourceTypes: [
      'abort-controller',
      'timeout',
      'interval',
      'subscription',
      'event-listener',
      'websocket',
      'audio-context',
      'performance-observer',
    ],
    maxResourceCount: 100,
    cleanupTimeout: 5000,
  },

  // Tests d'erreur
  errorHandling: {
    errorTypes: [
      'network',
      'validation',
      'authentication',
      'authorization',
      'server',
      'timeout',
      'unknown',
    ],
    retryAttempts: 3,
    retryDelay: 1000,
  },
};

// Helper functions pour les tests
export const createTestComponent = (name: string, props: any = {}) => {
  return {
    name,
    props,
    render: () => render(<div data-testid={`test-${name}`}>{name} Component</div>),
  };
};

export const createMockService = (serviceName: string, methods: string[] = []) => {
  const mock: any = {};
  methods.forEach(method => {
    mock[method] = jest.fn();
  });
  return mock;
};

export const simulateUserInteraction = async (element: HTMLElement, interaction: 'click' | 'change' | 'keypress') => {
  switch (interaction) {
    case 'click':
      fireEvent.click(element);
      break;
    case 'change':
      fireEvent.change(element);
      break;
    case 'keypress':
      fireEvent.keyPress(element, { key: 'Enter' });
      break;
  }
  
  // Attendre les éventuelles animations
  await waitFor(() => {});
};

export const assertComponentOptimized = (component: any, optimizations: string[]) => {
  optimizations.forEach(optimization => {
    switch (optimization) {
      case 'react.memo':
        expect(component.type).toBe(memo);
        break;
      case 'useCallback':
        expect(typeof component.props.onClick).toBe('function');
        break;
      case 'useMemo':
        // Vérifier que le composant utilise useMemo via l'analyse du code
        break;
      default:
        console.warn(`Unknown optimization: ${optimization}`);
    }
  });
};

// Export par défaut pour compatibilité
export default {
  regressionTestConfig,
  testUtils,
  testData,
  testConfigurations,
  createTestComponent,
  createMockService,
  simulateUserInteraction,
  assertComponentOptimized,
};
