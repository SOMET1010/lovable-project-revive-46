#!/usr/bin/env node

/**
 * Script de validation automatique des memory leaks
 * Analyse le code pour détecter les patterns à risque
 */

const fs = require('fs');
const path = require('path');

class MemoryLeakDetector {
  constructor() {
    this.issues = [];
    this.hooksDir = 'src/hooks';
    this.featuresHooksDir = 'src/features/*/hooks';
    this.allowedPatterns = [
      'useCallback',
      'useMemo',
      'useRef'
    ];
  }

  /**
   * Analyse tous les hooks pour détecter les memory leaks
   */
  async analyzeAllHooks() {
    console.log('🔍 Analyse des hooks pour détecter les memory leaks...\n');

    // Analyser les hooks principaux
    await this.analyzeDirectory(this.hooksDir);
    
    // Analyser les hooks dans les features
    await this.analyzeFeaturesHooks();

    // Afficher le rapport
    this.generateReport();
  }

  /**
   * Analyse un répertoire de hooks
   */
  async analyzeDirectory(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        if (file.endsWith('.ts')) {
          const filePath = path.join(dirPath, file);
          await this.analyzeFile(filePath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Impossible d'analyser ${dirPath}:`, error.message);
    }
  }

  /**
   * Analyse les hooks dans les features
   */
  async analyzeFeaturesHooks() {
    try {
      const featuresPath = 'src/features';
      if (!fs.existsSync(featuresPath)) return;

      const features = fs.readdirSync(featuresPath);
      
      for (const feature of features) {
        const hooksPath = path.join(featuresPath, feature, 'hooks');
        if (fs.existsSync(hooksPath)) {
          await this.analyzeDirectory(hooksPath);
        }
      }
    } catch (error) {
      console.warn('⚠️  Erreur lors de l\'analyse des features:', error.message);
    }
  }

  /**
   * Analyse un fichier spécifique
   */
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative('.', filePath);

      console.log(`📄 Analyse: ${relativePath}`);

      // Vérifier les patterns problématiques
      this.checkUseEffectPatterns(content, relativePath);
      this.checkIntervalPatterns(content, relativePath);
      this.checkEventListenerPatterns(content, relativePath);
      this.checkAbortController(content, relativePath);
      this.checkCleanupPatterns(content, relativePath);
      
    } catch (error) {
      console.warn(`⚠️  Erreur lors de l'analyse de ${filePath}:`, error.message);
    }
  }

  /**
   * Vérifier les patterns useEffect
   */
  checkUseEffectPatterns(content, filePath) {
    const useEffectRegex = /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?},\s*\[([^\]]*)\]\s*\)/g;
    const cleanupRegex = /return\s*\(\s*\)\s*=>\s*{[\s\S]*?}/;

    let match;
    const useEffects = [];

    while ((match = useEffectRegex.exec(content)) !== null) {
      useEffects.push({
        code: match[0],
        dependencies: match[1]
      });
    }

    for (const useEffect of useEffects) {
      const hasCleanup = cleanupRegex.test(useEffect.code);
      
      if (!hasCleanup && this.shouldHaveCleanup(useEffect.code)) {
        this.issues.push({
          file: filePath,
          type: 'MISSING_CLEANUP',
          severity: 'HIGH',
          message: 'useEffect sans fonction de cleanup détecté',
          code: useEffect.code.substring(0, 100) + '...'
        });
      }
    }
  }

  /**
   * Vérifier les patterns setInterval/setTimeout
   */
  checkIntervalPatterns(content, filePath) {
    const intervalPatterns = [
      /setInterval\s*\(/g,
      /setTimeout\s*\(/g,
      /addEventListener\s*\(/g
    ];

    for (const pattern of intervalPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const context = this.getContextAround(content, match.index);
        
        // Vérifier s'il y a un cleanup correspondant
        const hasCleanup = this.hasCorrespondingCleanup(content, match.index);
        
        if (!hasCleanup) {
          this.issues.push({
            file: filePath,
            type: 'UNMANAGED_TIMER',
            severity: 'HIGH',
            message: `${pattern.source.split('\\s')[0]} sans cleanup détecté`,
            code: context
          });
        }
      }
    }
  }

  /**
   * Vérifier l'utilisation d'AbortController
   */
  checkAbortController(content, filePath) {
    const hasFetch = /fetch\s*\(/.test(content);
    const hasSupabaseFrom = /supabase\s*\.\s*from\s*\(/.test(content);
    const hasAbortController = /AbortController/.test(content);

    if ((hasFetch || hasSupabaseFrom) && !hasAbortController) {
      this.issues.push({
        file: filePath,
        type: 'MISSING_ABORTCONTROLLER',
        severity: 'MEDIUM',
        message: 'Requête async sans AbortController détectée',
        recommendation: 'Considérer l\'utilisation d\'AbortController pour les requêtes asynchrones'
      });
    }
  }

  /**
   * Vérifier les patterns de cleanup
   */
  checkCleanupPatterns(content, filePath) {
    const cleanupPatterns = [
      /clearInterval\s*\(/g,
      /clearTimeout\s*\(/g,
      /removeEventListener\s*\(/g,
      /\.disconnect\s*\(\s*\)/g,
      /\.unsubscribe\s*\(\s*\)/g,
      /\.abort\s*\(\s*\)/g
    ];

    const hasUseEffect = /useEffect/.test(content);
    const hasCleanup = cleanupPatterns.some(pattern => pattern.test(content));

    if (hasUseEffect && !hasCleanup) {
      this.issues.push({
        file: filePath,
        type: 'NO_CLEANUP_PATTERN',
        severity: 'LOW',
        message: 'useEffect détecté sans patterns de cleanup évidents'
      });
    }
  }

  /**
   * Vérifier si un useEffect devrait avoir un cleanup
   */
  shouldHaveCleanup(code) {
    const problematicPatterns = [
      /setInterval/,
      /setTimeout/,
      /addEventListener/,
      /fetch\s*\(/,
      /supabase\s*\.\s*channel/,
      /PerformanceObserver/,
      /\.subscribe\s*\(/
    ];

    return problematicPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Obtenir le contexte autour d'une position
   */
  getContextAround(content, index, contextSize = 100) {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(content.length, index + contextSize);
    return content.substring(start, end);
  }

  /**
   * Vérifier s'il y a un cleanup correspondant
   */
  hasCorrespondingCleanup(content, timerIndex) {
    const afterTimer = content.substring(timerIndex, timerIndex + 1000);
    
    const cleanupPatterns = [
      /clearInterval/,
      /clearTimeout/,
      /removeEventListener/,
      /return\s*\(\s*\)\s*=>/,
      /unsubscribe/,
      /abort/
    ];

    return cleanupPatterns.some(pattern => pattern.test(afterTimer));
  }

  /**
   * Générer le rapport final
   */
  generateReport() {
    console.log('\n📊 RAPPORT D\'ANALYSE DES MEMORY LEAKS\n');
    console.log('═'.repeat(60));

    if (this.issues.length === 0) {
      console.log('✅ AUCUN MEMORY LEAK DÉTECTÉ !');
      console.log('🎉 Tous les hooks sont conformes aux bonnes pratiques.');
      return;
    }

    // Grouper par sévérité
    const bySeverity = this.issues.reduce((acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    }, {});

    // Afficher par sévérité
    const severityOrder = ['HIGH', 'MEDIUM', 'LOW'];
    
    for (const severity of severityOrder) {
      const issues = bySeverity[severity];
      if (!issues) continue;

      const icon = severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`\n${icon} ${severity} (${issues.length} problème${issues.length > 1 ? 's' : ''}):`);

      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.file}`);
        console.log(`     ${issue.message}`);
        if (issue.recommendation) {
          console.log(`     💡 ${issue.recommendation}`);
        }
        console.log('');
      });
    }

    // Statistiques
    console.log('\n📈 STATISTIQUES:');
    console.log(`Total des problèmes: ${this.issues.length}`);
    console.log(`Fichiers affectés: ${new Set(this.issues.map(i => i.file)).size}`);
    console.log(`Types de problèmes:`);

    const byType = this.issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('1. Corriger tous les problèmes HIGH en priorité');
    console.log('2. Ajouter des AbortController pour les requêtes async');
    console.log('3. Vérifier que tous les useEffect ont des cleanup functions');
    console.log('4. Utiliser le guide: MEMORY_LEAKS_PREVENTION_GUIDE.md');

    // Commandes utiles
    console.log('\n🛠️  COMMANDES UTILES:');
    console.log('npm run test:memory     # Lancer les tests de validation');
    console.log('npm run type-check      # Vérifier les types TypeScript');
    console.log('npm run lint            # Lancer ESLint');
  }

  /**
   * Analyser un fichier spécifique (commande directe)
   */
  async analyzeSpecificFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier non trouvé: ${filePath}`);
      return;
    }

    console.log(`🔍 Analyse spécifique: ${filePath}`);
    this.issues = [];
    await this.analyzeFile(filePath);
    this.generateReport();
  }
}

// ============================================================================
// INTERFACE EN LIGNE DE COMMANDE
// ============================================================================

const args = process.argv.slice(2);
const detector = new MemoryLeakDetector();

async function main() {
  try {
    if (args.length === 0) {
      // Analyse complète
      await detector.analyzeAllHooks();
    } else if (args[0] === '--file' || args[0] === '-f') {
      // Analyse d'un fichier spécifique
      const filePath = args[1];
      if (!filePath) {
        console.error('❌ Veuillez spécifier un fichier: --file <chemin>');
        process.exit(1);
      }
      await detector.analyzeSpecificFile(filePath);
    } else if (args[0] === '--help' || args[0] === '-h') {
      showHelp();
    } else {
      console.error('❌ Option non reconnue. Utilisez --help pour voir les options.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🔍 Memory Leak Detector - MonToit

USAGE:
  node check-memory-leaks.js [options]

OPTIONS:
  --file, -f <chemin>    Analyser un fichier spécifique
  --help, -h             Afficher cette aide

EXEMPLES:
  node check-memory-leaks.js                    # Analyse complète
  node check-memory-leaks.js --file src/hooks/useAsync.ts
`);
}

// ============================================================================
// EXPORT POUR TESTS
// ============================================================================

if (require.main === module) {
  main();
}

module.exports = MemoryLeakDetector;
