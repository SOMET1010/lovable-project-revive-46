#!/usr/bin/env node

/**
 * Script de vérification des fuites mémoire
 * Analyse le code source à la recherche de patterns pouvant causer des fuites mémoire
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns à rechercher
const MEMORY_LEAK_PATTERNS = [
  {
    name: 'setInterval sans cleanup',
    pattern: /setInterval\s*\(/g,
    severity: 'high',
    suggestion: 'Assurez-vous de clearInterval dans useEffect cleanup'
  },
  {
    name: 'setTimeout sans cleanup',
    pattern: /setTimeout\s*\(/g,
    severity: 'medium',
    suggestion: 'Utilisez clearTimeout dans useEffect cleanup si nécessaire'
  },
  {
    name: 'addEventListener sans cleanup',
    pattern: /addEventListener\s*\(/g,
    severity: 'high',
    suggestion: 'Utilisez removeEventListener dans useEffect cleanup'
  },
  {
    name: 'Subscriptions sans cleanup',
    pattern: /(subscribe|watch|observe)\s*\(/g,
    severity: 'high',
    suggestion: 'Assurez-vous de unsubcribe/unwatch dans cleanup'
  },
  {
    name: 'Async operations non gérées',
    pattern: /await\s+(?!Promise\.all|Promise\.race)/g,
    severity: 'medium',
    suggestion: 'Vérifiez que toutes les async operations sont properly gérées'
  }
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  MEMORY_LEAK_PATTERNS.forEach(({ name, pattern, severity, suggestion }) => {
    const matches = content.match(pattern);
    if (matches) {
      const lines = content.split('\n');
      const lineNumbers = [];

      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          lineNumbers.push(index + 1);
        }
      });

      issues.push({
        name,
        severity,
        count: matches.length,
        lines: lineNumbers,
        suggestion
      });
    }
  });

  return issues;
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        try {
          const issues = checkFile(fullPath);
          if (issues.length > 0) {
            results.push({
              file: fullPath,
              issues
            });
          }
        } catch (error) {
          console.error(`Erreur lors de l'analyse du fichier ${fullPath}:`, error.message);
        }
      }
    }
  }

  scan(dir);
  return results;
}

// Analyse des arguments
const args = process.argv.slice(2);
const checkFileOnly = args.includes('--file');
const targetDir = args.find(arg => !arg.startsWith('--')) || 'src';

console.log('🔍 Analyse des fuites mémoire...\n');

if (checkFileOnly) {
  // Mode analyse de fichier spécifique
  const filePath = args.find(arg => !arg.startsWith('--') && arg !== '--file');
  if (!filePath || !fs.existsSync(filePath)) {
    console.error('❌ Fichier non spécifié ou introuvable');
    process.exit(1);
  }

  const issues = checkFile(filePath);
  if (issues.length > 0) {
    console.log(`📁 ${filePath}`);
    issues.forEach(issue => {
      console.log(`  ⚠️  ${issue.name} (${issue.severity}) - ${issue.count} occurence(s)`);
      console.log(`    Lignes: ${issue.lines.join(', ')}`);
      console.log(`    💡 ${issue.suggestion}\n`);
    });
  } else {
    console.log(`✅ Aucune fuite mémoire détectée dans ${filePath}`);
  }
} else {
  // Mode scan de répertoire
  const results = scanDirectory(targetDir);

  if (results.length > 0) {
    console.log(`📊 Rapport d'analyse pour le répertoire: ${targetDir}\n`);

    let totalIssues = 0;
    let highSeverityCount = 0;

    results.forEach(({ file, issues }) => {
      console.log(`📁 ${file}`);
      issues.forEach(issue => {
        totalIssues += issue.count;
        if (issue.severity === 'high') highSeverityCount += issue.count;

        console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.name} (${issue.severity}) - ${issue.count} occurence(s)`);
        if (issue.lines.length <= 5) {
          console.log(`    Lignes: ${issue.lines.join(', ')}`);
        } else {
          console.log(`    Lignes: ${issue.lines.slice(0, 3).join(', ')} ... (${issue.lines.length - 3} autres)`);
        }
        console.log(`    💡 ${issue.suggestion}\n`);
      });
    });

    console.log('📈 Résumé:');
    console.log(`  • Total des problèmes: ${totalIssues}`);
    console.log(`  • Problèmes critiques: ${highSeverityCount}`);
    console.log(`  • Fichiers affectés: ${results.length}`);

    if (highSeverityCount > 0) {
      console.log('\n❌ Des fuites mémoire critiques ont été détectées!');
      process.exit(1);
    } else {
      console.log('\n⚠️  Des problèmes potentiels ont été détectés. Veuillez vérifier.');
    }
  } else {
    console.log(`✅ Aucune fuite mémoire détectée dans ${targetDir}`);
  }
}