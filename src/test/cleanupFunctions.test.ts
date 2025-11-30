/**
 * Tests pour vérifier les cleanup functions robustes
 */

import { cleanupRegistry, useCleanupRegistry } from '@/lib/cleanupRegistry';

// Mock pour les tests
const mockComponent = 'TestComponent';
const mockDescription = 'Test cleanup function';

// Test 1: Création et cleanup d'AbortController
export async function testAbortControllerCleanup() {
  console.log('🧪 Test: AbortController Cleanup');
  
  const cleanup = useCleanupRegistry(mockComponent);
  
  // Créer un AbortController
  const controller = cleanup.createAbortController('test-abort', mockDescription);
  
  // Vérifier qu'il existe
  const stats = cleanupRegistry.getStats();
  const initialCount = stats.byType['abort-controller'];
  
  console.log(`Initial abort controllers: ${initialCount}`);
  
  // Cleanup du composant
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  const finalCount = finalStats.byType['abort-controller'];
  
  console.log(`Final abort controllers: ${finalCount}`);
  
  // Vérification
  if (initialCount > 0 && finalCount === 0) {
    console.log('✅ AbortController cleanup SUCCESS');
    return true;
  } else {
    console.log('❌ AbortController cleanup FAILED');
    return false;
  }
}

// Test 2: Création et cleanup de timeout
export async function testTimeoutCleanup() {
  console.log('🧪 Test: Timeout Cleanup');
  
  const cleanup = useCleanupRegistry(mockComponent);
  let executed = false;
  
  // Créer un timeout
  cleanup.createTimeout(
    'test-timeout',
    () => { executed = true; },
    1000,
    mockDescription
  );
  
  const stats = cleanupRegistry.getStats();
  const initialCount = stats.byType['timeout'];
  
  console.log(`Initial timeouts: ${initialCount}`);
  
  // Attendre un peu
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Cleanup du composant
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  const finalCount = finalStats.byType['timeout'];
  
  console.log(`Final timeouts: ${finalCount}`);
  console.log(`Timeout executed: ${executed}`);
  
  // Vérification
  if (initialCount > 0 && finalCount === 0 && !executed) {
    console.log('✅ Timeout cleanup SUCCESS');
    return true;
  } else {
    console.log('❌ Timeout cleanup FAILED');
    return false;
  }
}

// Test 3: Création et cleanup d'interval
export async function testIntervalCleanup() {
  console.log('🧪 Test: Interval Cleanup');
  
  const cleanup = useCleanupRegistry(mockComponent);
  let callCount = 0;
  
  // Créer un interval
  cleanup.createInterval(
    'test-interval',
    () => { callCount++; },
    100,
    mockDescription
  );
  
  const stats = cleanupRegistry.getStats();
  const initialCount = stats.byType['interval'];
  
  console.log(`Initial intervals: ${initialCount}`);
  
  // Attendre quelques cycles
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Cleanup du composant
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  const finalCount = finalStats.byType['interval'];
  
  console.log(`Final intervals: ${finalCount}`);
  console.log(`Interval called ${callCount} times`);
  
  // Vérification
  if (initialCount > 0 && finalCount === 0 && callCount > 0) {
    console.log('✅ Interval cleanup SUCCESS');
    return true;
  } else {
    console.log('❌ Interval cleanup FAILED');
    return false;
  }
}

// Test 4: Création et cleanup de subscription
export async function testSubscriptionCleanup() {
  console.log('🧪 Test: Subscription Cleanup');
  
  const cleanup = useCleanupRegistry(mockComponent);
  let unsubscribed = false;
  
  // Créer une subscription
  cleanup.addSubscription(
    'test-subscription',
    () => { unsubscribed = true; },
    mockDescription
  );
  
  const stats = cleanupRegistry.getStats();
  const initialCount = stats.byType['subscription'];
  
  console.log(`Initial subscriptions: ${initialCount}`);
  
  // Cleanup du composant
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  const finalCount = finalStats.byType['subscription'];
  
  console.log(`Final subscriptions: ${finalCount}`);
  console.log(`Subscription unsubscribed: ${unsubscribed}`);
  
  // Vérification
  if (initialCount > 0 && finalCount === 0 && unsubscribed) {
    console.log('✅ Subscription cleanup SUCCESS');
    return true;
  } else {
    console.log('❌ Subscription cleanup FAILED');
    return false;
  }
}

// Test 5: EventListener cleanup
export async function testEventListenerCleanup() {
  console.log('🧪 Test: EventListener Cleanup');
  
  const cleanup = useCleanupRegistry(mockComponent);
  let listenerCalled = false;
  
  const testElement = document.createElement('div');
  document.body.appendChild(testElement);
  
  // Créer un event listener
  cleanup.addEventListener(
    'test-listener',
    testElement,
    'click',
    () => { listenerCalled = true; },
    false,
    mockDescription
  );
  
  const stats = cleanupRegistry.getStats();
  const initialCount = stats.byType['event-listener'];
  
  console.log(`Initial event listeners: ${initialCount}`);
  
  // Cleanup du composant
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  const finalCount = finalStats.byType['event-listener'];
  
  // Nettoyer l'élément de test
  document.body.removeChild(testElement);
  
  console.log(`Final event listeners: ${finalCount}`);
  console.log(`Listener called: ${listenerCalled}`);
  
  // Vérification
  if (initialCount > 0 && finalCount === 0) {
    console.log('✅ EventListener cleanup SUCCESS');
    return true;
  } else {
    console.log('❌ EventListener cleanup FAILED');
    return false;
  }
}

// Test 6: PerformanceObserver cleanup
export async function testPerformanceObserverCleanup() {
  console.log('🧪 Test: PerformanceObserver Cleanup');
  
  if (!('PerformanceObserver' in window)) {
    console.log('⚠️ PerformanceObserver not available, skipping test');
    return true;
  }
  
  const cleanup = useCleanupRegistry(mockComponent);
  let observerDisconnected = false;
  
  // Créer un PerformanceObserver
  const observer = new PerformanceObserver(() => {});
  
  // Mock disconnect pour tester
  const originalDisconnect = observer.disconnect.bind(observer);
  observer.disconnect = () => {
    observerDisconnected = true;
    originalDisconnect();
  };
  
  cleanup.addPerformanceObserver(
    'test-observer',
    observer,
    mockDescription
  );
  
  const stats = cleanupRegistry.getStats();
  const initialCount = stats.byType['performance-observer'];
  
  console.log(`Initial performance observers: ${initialCount}`);
  
  // Cleanup du composant
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  const finalCount = finalStats.byType['performance-observer'];
  
  console.log(`Final performance observers: ${finalCount}`);
  console.log(`Observer disconnected: ${observerDisconnected}`);
  
  // Vérification
  if (initialCount > 0 && finalCount === 0 && observerDisconnected) {
    console.log('✅ PerformanceObserver cleanup SUCCESS');
    return true;
  } else {
    console.log('❌ PerformanceObserver cleanup FAILED');
    return false;
  }
}

// Test 7: AudioContext cleanup
export async function testAudioContextCleanup() {
  console.log('🧪 Test: AudioContext Cleanup');
  
  const cleanup = useCleanupRegistry(mockComponent);
  let contextClosed = false;
  
  // Mock AudioContext
  const mockAudioContext = {
    state: 'running',
    close: async () => {
      contextClosed = true;
      mockAudioContext.state = 'closed';
    }
  };
  
  cleanup.addAudioContext(
    'test-audio-context',
    mockAudioContext as AudioContext,
    mockDescription
  );
  
  const stats = cleanupRegistry.getStats();
  const initialCount = stats.byType['audio-context'];
  
  console.log(`Initial audio contexts: ${initialCount}`);
  
  // Cleanup du composant
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  const finalCount = finalStats.byType['audio-context'];
  
  console.log(`Final audio contexts: ${finalCount}`);
  console.log(`AudioContext closed: ${contextClosed}`);
  
  // Vérification
  if (initialCount > 0 && finalCount === 0 && contextClosed) {
    console.log('✅ AudioContext cleanup SUCCESS');
    return true;
  } else {
    console.log('❌ AudioContext cleanup FAILED');
    return false;
  }
}

// Test 8: Nettoyage global
export async function testGlobalCleanup() {
  console.log('🧪 Test: Global Cleanup');
  
  const cleanup1 = useCleanupRegistry('Component1');
  const cleanup2 = useCleanupRegistry('Component2');
  
  // Créer des ressources dans différents composants
  cleanup1.createAbortController('abort1', 'Test 1');
  cleanup1.createTimeout('timeout1', () => {}, 1000, 'Test 1');
  
  cleanup2.createAbortController('abort2', 'Test 2');
  cleanup2.createInterval('interval2', () => {}, 1000, 'Test 2');
  
  const stats = cleanupRegistry.getStats();
  const initialTotal = stats.totalResources;
  
  console.log(`Initial total resources: ${initialTotal}`);
  
  // Nettoyage global
  const cleanedCount = cleanupRegistry.cleanupAll();
  
  const finalStats = cleanupRegistry.getStats();
  const finalTotal = finalStats.totalResources;
  
  console.log(`Cleaned resources: ${cleanedCount}`);
  console.log(`Final total resources: ${finalTotal}`);
  
  // Vérification
  if (initialTotal > 0 && finalTotal === 0 && cleanedCount === initialTotal) {
    console.log('✅ Global cleanup SUCCESS');
    return true;
  } else {
    console.log('❌ Global cleanup FAILED');
    return false;
  }
}

// Test 9: Monitoring des fuites
export async function testMemoryLeakDetection() {
  console.log('🧪 Test: Memory Leak Detection');
  
  const cleanup = useCleanupRegistry(mockComponent);
  
  // Créer beaucoup de ressources pour déclencher les alertes
  const promises = [];
  
  for (let i = 0; i < 15; i++) {
    promises.push(
      cleanup.createTimeout(`timeout-${i}`, () => {}, 1000, `Test timeout ${i}`)
    );
  }
  
  const stats = cleanupRegistry.getStats();
  
  console.log(`Timeouts created: ${stats.byType['timeout']}`);
  console.log(`Total resources: ${stats.totalResources}`);
  
  // Cleanup
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  
  console.log(`Final timeouts: ${finalStats.byType['timeout']}`);
  console.log(`Final total: ${finalStats.totalResources}`);
  
  // Vérification
  if (stats.totalResources > 0 && finalStats.totalResources === 0) {
    console.log('✅ Memory leak detection test SUCCESS');
    return true;
  } else {
    console.log('❌ Memory leak detection test FAILED');
    return false;
  }
}

// Test 10: Stats et monitoring
export async function testStatsAndMonitoring() {
  console.log('🧪 Test: Stats and Monitoring');
  
  const cleanup = useCleanupRegistry(mockComponent);
  
  // Créer différents types de ressources
  cleanup.createAbortController('abort1', 'Test');
  cleanup.createTimeout('timeout1', () => {}, 1000, 'Test');
  cleanup.createInterval('interval1', () => {}, 1000, 'Test');
  
  // Attendre un peu pour les timestamps
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const stats = cleanupRegistry.getStats();
  
  console.log('Stats:', {
    totalResources: stats.totalResources,
    byType: stats.byType,
    hasOldest: !!stats.oldestResource,
    hasNewest: !!stats.newestResource,
  });
  
  const resources = cleanupRegistry.getActiveResources();
  
  console.log(`Active resources: ${resources.length}`);
  console.log(`Resources have descriptions: ${resources.every(r => r.description)}`);
  console.log(`Resources have component: ${resources.every(r => r.component)}`);
  
  // Cleanup
  cleanup.cleanupComponent();
  
  const finalStats = cleanupRegistry.getStats();
  
  console.log(`Final total resources: ${finalStats.totalResources}`);
  
  // Vérification
  if (stats.totalResources > 0 && finalStats.totalResources === 0 && 
      resources.length === stats.totalResources) {
    console.log('✅ Stats and monitoring test SUCCESS');
    return true;
  } else {
    console.log('❌ Stats and monitoring test FAILED');
    return false;
  }
}

// Fonction principale pour exécuter tous les tests
export async function runAllCleanupTests() {
  console.log('🚀 Starting Cleanup Functions Tests');
  console.log('=====================================');
  
  const tests = [
    testAbortControllerCleanup,
    testTimeoutCleanup,
    testIntervalCleanup,
    testSubscriptionCleanup,
    testEventListenerCleanup,
    testPerformanceObserverCleanup,
    testAudioContextCleanup,
    testGlobalCleanup,
    testMemoryLeakDetection,
    testStatsAndMonitoring,
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
      console.log('---');
    } catch (error) {
      console.error(`❌ Test failed with error:`, error);
      results.push(false);
      console.log('---');
    }
  }
  
  // Résumé des résultats
  const passedTests = results.filter(r => r === true).length;
  const totalTests = results.length;
  
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
  }
  
  return {
    passed: passedTests,
    failed: totalTests - passedTests,
    total: totalTests,
    success: passedTests === totalTests
  };
}

// Export pour utilisation dans les tests
export default {
  runAllCleanupTests,
  testAbortControllerCleanup,
  testTimeoutCleanup,
  testIntervalCleanup,
  testSubscriptionCleanup,
  testEventListenerCleanup,
  testPerformanceObserverCleanup,
  testAudioContextCleanup,
  testGlobalCleanup,
  testMemoryLeakDetection,
  testStatsAndMonitoring,
};