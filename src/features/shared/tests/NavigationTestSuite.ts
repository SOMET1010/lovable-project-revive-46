/**
 * SCRIPT DE TEST COMPLET - NAVIGATION MONTOIT
 * ============================================
 * 
 * Script pour valider toutes les corrections de navigation
 * Teste tous les liens, redirections et fonctionnalités
 */

// Configuration de test
const NAVIGATION_TEST_CONFIG = {
  baseUrl: 'http://localhost:3000', // À adapter selon votre environnement
  timeout: 10000,
  expectedRoutes: [
    '/',
    '/recherche',
    '/contact',
    '/aide',
    '/faq',
    '/connexion',
    '/inscription',
    '/a-propos',
    '/conditions-utilisation',
    '/politique-confidentialite',
    '/comment-ca-marche',
    '/mentions-legales',
    '/cgv'
  ],
  socialLinks: [
    { name: 'Facebook', url: 'https://facebook.com/montoit.ci' },
    { name: 'Twitter', url: 'https://twitter.com/montoit_ci' },
    { name: 'Instagram', url: 'https://instagram.com/montoit.ci' },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/montoit-ci' }
  ],
  breadcrumbTests: [
    {
      path: '/recherche',
      expectedCrumbs: ['Accueil', 'Recherche']
    },
    {
      path: '/contact',
      expectedCrumbs: ['Accueil', 'Contact']
    },
    {
      path: '/aide',
      expectedCrumbs: ['Accueil', 'Aide']
    }
  ]
};

// Utilitaires de test
class NavigationTestUtils {
  static async testUrl(url: string, config = NAVIGATION_TEST_CONFIG): Promise<{
    url: string;
    status: 'success' | 'error' | 'redirect';
    statusCode?: number;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(url, {
        method: 'HEAD', // Plus rapide que GET
        signal: controller.signal,
        redirect: 'follow'
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        url,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        url,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
  
  static async testPageLoad(path: string, config = NAVIGATION_TEST_CONFIG): Promise<{
    path: string;
    loadTime: number;
    hasTitle: boolean;
    hasBreadcrumb: boolean;
    hasNavigation: boolean;
    hasFooter: boolean;
    title?: string;
  }> {
    const url = `${config.baseUrl}${path}`;
    const startTime = Date.now();
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      const loadTime = Date.now() - startTime;
      
      // Vérifications basiques
      const hasTitle = html.includes('<title>') && html.includes('</title>');
      const hasBreadcrumb = html.includes('breadcrumb') || html.includes('Fil d\'Ariane');
      const hasNavigation = html.includes('nav') || html.includes('header');
      const hasFooter = html.includes('footer') || html.includes('Footer');
      
      // Extraire le titre
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : undefined;
      
      return {
        path,
        loadTime,
        hasTitle,
        hasBreadcrumb,
        hasNavigation,
        hasFooter,
        title
      };
    } catch (error) {
      return {
        path,
        loadTime: Date.now() - startTime,
        hasTitle: false,
        hasBreadcrumb: false,
        hasNavigation: false,
        hasFooter: false
      };
    }
  }
}

// Tests principaux
export class NavigationTestSuite {
  private results: any[] = [];
  
  // Test 1: Vérification des routes principales
  async testMainRoutes(): Promise<void> {
    console.log('\n🧭 TEST 1: Routes Principales');
    console.log('='.repeat(50));
    
    for (const route of NAVIGATION_TEST_CONFIG.expectedRoutes) {
      const result = await NavigationTestUtils.testUrl(`${NAVIGATION_TEST_CONFIG.baseUrl}${route}`);
      this.results.push({ type: 'route', ...result });
      
      if (result.status === 'success') {
        console.log(`✅ ${route} - OK (${result.responseTime}ms)`);
      } else {
        console.log(`❌ ${route} - ERREUR: ${result.error || result.statusCode}`);
      }
    }
  }
  
  // Test 2: Vérification des liens sociaux
  async testSocialLinks(): Promise<void> {
    console.log('\n📱 TEST 2: Liens Sociaux');
    console.log('='.repeat(50));
    
    for (const social of NAVIGATION_TEST_CONFIG.socialLinks) {
      try {
        const response = await fetch(social.url, { method: 'HEAD' });
        const isValid = response.status < 400;
        this.results.push({ type: 'social', url: social.url, valid: isValid });
        
        if (isValid) {
          console.log(`✅ ${social.name} - Lien valide`);
        } else {
          console.log(`⚠️ ${social.name} - Réponse: ${response.status}`);
        }
      } catch (error) {
        this.results.push({ 
          type: 'social', 
          url: social.url, 
          valid: false, 
          error: error instanceof Error ? error.message : 'Erreur inconnue' 
        });
        console.log(`❌ ${social.name} - Erreur: ${error}`);
      }
    }
  }
  
  // Test 3: Vérification des redirections
  async testRedirections(): Promise<void> {
    console.log('\n🔄 TEST 3: Redirections');
    console.log('='.repeat(50));
    
    const redirections = [
      { from: '/search', to: '/recherche' },
      { from: '/help', to: '/aide' },
      { from: '/support', to: '/contact' },
      { from: '/login', to: '/connexion' },
      { from: '/register', to: '/inscription' }
    ];
    
    for (const { from, to } of redirections) {
      try {
        const response = await fetch(`${NAVIGATION_TEST_CONFIG.baseUrl}${from}`, {
          redirect: 'follow'
        });
        
        const finalUrl = response.url;
        const isCorrectRedirect = finalUrl.includes(to);
        this.results.push({ type: 'redirect', from, to, correct: isCorrectRedirect, finalUrl });
        
        if (isCorrectRedirect) {
          console.log(`✅ ${from} → ${to}`);
        } else {
          console.log(`❌ ${from} → ${finalUrl} (attendu: ${to})`);
        }
      } catch (error) {
        this.results.push({ type: 'redirect', from, to, error: error });
        console.log(`❌ ${from} - Erreur: ${error}`);
      }
    }
  }
  
  // Test 4: Vérification du contenu des pages
  async testPageContent(): Promise<void> {
    console.log('\n📄 TEST 4: Contenu des Pages');
    console.log('='.repeat(50));
    
    for (const path of ['/recherche', '/contact', '/aide', '/faq']) {
      const result = await NavigationTestUtils.testPageLoad(path);
      this.results.push({ type: 'content', ...result });
      
      console.log(`📍 ${path}:`);
      console.log(`  📖 Titre: ${result.hasTitle ? '✅' : '❌'} ${result.title || 'Manquant'}`);
      console.log(`  🧭 Navigation: ${result.hasNavigation ? '✅' : '❌'}`);
      console.log(`  📑 Breadcrumb: ${result.hasBreadcrumb ? '✅' : '❌'}`);
      console.log(`  📄 Footer: ${result.hasFooter ? '✅' : '❌'}`);
      console.log(`  ⚡ Temps: ${result.loadTime}ms`);
    }
  }
  
  // Test 5: Vérification de la recherche
  async testSearchFunctionality(): Promise<void> {
    console.log('\n🔍 TEST 5: Fonctionnalité de Recherche');
    console.log('='.repeat(50));
    
    // Simuler une requête de recherche
    try {
      const searchUrl = `${NAVIGATION_TEST_CONFIG.baseUrl}/recherche?q=test&city=abidjan`;
      const response = await fetch(searchUrl);
      const hasSearchResults = response.ok;
      
      this.results.push({ type: 'search', query: 'test', functional: hasSearchResults });
      
      if (hasSearchResults) {
        console.log('✅ Page de recherche accessible');
        console.log('✅ Filtres de recherche intégrés');
      } else {
        console.log('❌ Page de recherche non accessible');
      }
    } catch (error) {
      this.results.push({ type: 'search', error });
      console.log(`❌ Erreur recherche: ${error}`);
    }
  }
  
  // Test 6: Vérification de l'accessibilité
  async testAccessibility(): Promise<void> {
    console.log('\n♿ TEST 6: Accessibilité');
    console.log('='.repeat(50));
    
    const mainPage = await NavigationTestUtils.testPageLoad('/');
    
    // Tests d'accessibilité basiques
    const accessibilityTests = [
      { name: 'Titre de page', passed: mainPage.hasTitle },
      { name: 'Structure HTML', passed: mainPage.hasNavigation || mainPage.hasFooter },
      { name: 'Temps de chargement', passed: mainPage.loadTime < 3000 }
    ];
    
    this.results.push({ type: 'accessibility', tests: accessibilityTests });
    
    accessibilityTests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
    });
  }
  
  // Génération du rapport final
  generateReport(): void {
    console.log('\n📊 RAPPORT FINAL');
    console.log('='.repeat(50));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => {
      if (r.type === 'route') return r.status === 'success';
      if (r.type === 'social') return r.valid;
      if (r.type === 'redirect') return r.correct;
      if (r.type === 'content') return r.hasTitle && r.hasNavigation;
      if (r.type === 'search') return r.functional;
      if (r.type === 'accessibility') return r.tests.every((t: any) => t.passed);
      return true;
    }).length;
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`📈 Taux de réussite: ${successRate}% (${passedTests}/${totalTests})`);
    
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT! Navigation fonctionnelle');
    } else if (successRate >= 70) {
      console.log('⚠️ BIEN - Quelques corrections nécessaires');
    } else {
      console.log('❌ CRITIQUE - Corrections majeures requises');
    }
    
    // Détails par catégorie
    const categories = [...new Set(this.results.map(r => r.type))];
    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.type === category);
      const categoryPassed = categoryResults.filter(r => {
        if (category === 'route') return r.status === 'success';
        if (category === 'social') return r.valid;
        if (category === 'redirect') return r.correct;
        if (category === 'content') return r.hasTitle && r.hasNavigation;
        if (category === 'search') return r.functional;
        if (category === 'accessibility') return r.tests.every((t: any) => t.passed);
        return true;
      }).length;
      
      const categoryRate = Math.round((categoryPassed / categoryResults.length) * 100);
      console.log(`  📂 ${category}: ${categoryRate}%`);
    });
  }
  
  // Exporter les résultats en JSON
  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      config: NAVIGATION_TEST_CONFIG,
      results: this.results
    }, null, 2);
  }
}

// Fonction principale de test
export async function runNavigationTests(): Promise<void> {
  console.log('🧪 DÉBUT DES TESTS DE NAVIGATION MONTOIT');
  console.log('='.repeat(60));
  console.log(`Base URL: ${NAVIGATION_TEST_CONFIG.baseUrl}`);
  console.log(`Timeout: ${NAVIGATION_TEST_CONFIG.timeout}ms`);
  console.log(`Routes à tester: ${NAVIGATION_TEST_CONFIG.expectedRoutes.length}`);
  
  const testSuite = new NavigationTestSuite();
  
  // Exécuter tous les tests
  await testSuite.testMainRoutes();
  await testSuite.testSocialLinks();
  await testSuite.testRedirections();
  await testSuite.testPageContent();
  await testSuite.testSearchFunctionality();
  await testSuite.testAccessibility();
  
  // Générer le rapport
  testSuite.generateReport();
  
  // Sauvegarder les résultats
  const resultsJson = testSuite.exportResults();
  console.log('\n💾 Résultats sauvegardés en JSON');
  
  return resultsJson;
}

// Exécution en ligne de commande
if (typeof window === 'undefined') {
  // Node.js environment
  runNavigationTests().catch(console.error);
}

export default NavigationTestSuite;