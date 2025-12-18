/**
 * Service de détection intelligente des changements
 * Analyse les différences entre deux versions d'un projet
 */

import type {
  Change,
  ChangeAnalysis,
  ChangeCategory,
  ChangeType,
  ChangeSummary,
  ImpactLevel,
} from '../types/versioning.types';

// Poids des catégories pour le calcul d'impact
const CATEGORY_WEIGHTS: Record<ChangeCategory, number> = {
  security: 1.5,
  structure: 1.3,
  logic: 1.2,
  data: 1.0,
  ui: 0.8,
};

// Poids des types de changements
const CHANGE_TYPE_WEIGHTS = {
  added: 1.0,
  modified: 0.8,
  removed: 1.2,
};

/**
 * Génère un ID unique pour un changement
 */
function generateChangeId(): string {
  return `chg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Détermine la catégorie d'un changement basé sur le chemin
 */
function categorizeChange(path: string): ChangeCategory {
  const lowerPath = path.toLowerCase();
  
  if (lowerPath.includes('security') || lowerPath.includes('rls') || lowerPath.includes('policy') || lowerPath.includes('auth')) {
    return 'security';
  }
  if (lowerPath.includes('model') || lowerPath.includes('schema') || lowerPath.includes('table') || lowerPath.includes('column')) {
    return 'structure';
  }
  if (lowerPath.includes('function') || lowerPath.includes('trigger') || lowerPath.includes('action') || lowerPath.includes('rule')) {
    return 'logic';
  }
  if (lowerPath.includes('view') || lowerPath.includes('component') || lowerPath.includes('ui') || lowerPath.includes('menu')) {
    return 'ui';
  }
  return 'data';
}

/**
 * Compare deux objets et retourne les différences
 */
function deepCompare(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  basePath: string = ''
): Change[] {
  const changes: Change[] = [];
  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  for (const key of allKeys) {
    const path = basePath ? `${basePath}.${key}` : key;
    const oldValue = oldObj?.[key];
    const newValue = newObj?.[key];

    if (oldValue === undefined && newValue !== undefined) {
      // Ajout
      changes.push({
        id: generateChangeId(),
        type: 'added',
        category: categorizeChange(path),
        path,
        description: `Ajout de "${key}"`,
        newValue,
        impactScore: calculateSingleChangeImpact('added', categorizeChange(path)),
      });
    } else if (oldValue !== undefined && newValue === undefined) {
      // Suppression
      changes.push({
        id: generateChangeId(),
        type: 'removed',
        category: categorizeChange(path),
        path,
        description: `Suppression de "${key}"`,
        oldValue,
        impactScore: calculateSingleChangeImpact('removed', categorizeChange(path)),
      });
    } else if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
      // Comparaison récursive pour les objets
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            id: generateChangeId(),
            type: 'modified',
            category: categorizeChange(path),
            path,
            description: `Modification de "${key}" (tableau)`,
            oldValue,
            newValue,
            impactScore: calculateSingleChangeImpact('modified', categorizeChange(path)),
          });
        }
      } else {
        changes.push(
          ...deepCompare(
            oldValue as Record<string, unknown>,
            newValue as Record<string, unknown>,
            path
          )
        );
      }
    } else if (oldValue !== newValue) {
      // Modification simple
      changes.push({
        id: generateChangeId(),
        type: 'modified',
        category: categorizeChange(path),
        path,
        description: `Modification de "${key}"`,
        oldValue,
        newValue,
        impactScore: calculateSingleChangeImpact('modified', categorizeChange(path)),
      });
    }
  }

  return changes;
}

/**
 * Calcule l'impact d'un seul changement
 */
function calculateSingleChangeImpact(
  type: 'added' | 'modified' | 'removed',
  category: ChangeCategory
): number {
  const baseScore = 10;
  return Math.round(baseScore * CHANGE_TYPE_WEIGHTS[type] * CATEGORY_WEIGHTS[category]);
}

/**
 * Calcule le score d'impact global
 */
export function calculateImpactScore(changes: Change[]): number {
  if (changes.length === 0) return 0;
  
  const totalScore = changes.reduce((sum, change) => sum + change.impactScore, 0);
  // Normaliser entre 0 et 100
  return Math.min(100, Math.round(totalScore / changes.length * (1 + Math.log10(changes.length + 1))));
}

/**
 * Détermine le niveau d'impact
 */
export function getImpactLevel(score: number): ImpactLevel {
  if (score >= 80) return 'critical';
  if (score >= 50) return 'major';
  if (score >= 25) return 'medium';
  return 'minor';
}

/**
 * Détermine le type de changement basé sur l'analyse
 */
export function determineChangeType(changes: Change[]): ChangeType {
  if (changes.length === 0) return 'patch';

  const hasSecurityChanges = changes.some(c => c.category === 'security');
  const hasStructureChanges = changes.some(c => c.category === 'structure' && c.type !== 'modified');
  const hasBreakingChanges = changes.some(c => c.type === 'removed' && (c.category === 'structure' || c.category === 'security'));

  if (hasBreakingChanges) return 'breaking';
  if (hasSecurityChanges && hasStructureChanges) return 'major';
  if (hasStructureChanges) return 'feature';
  if (changes.every(c => c.type === 'modified' && c.category === 'ui')) return 'refactor';
  if (changes.length <= 3) return 'fix';
  
  return 'minor';
}

/**
 * Génère une description automatique des changements
 */
export function generateDescription(changes: Change[]): string {
  if (changes.length === 0) return 'Aucun changement détecté';

  const added = changes.filter(c => c.type === 'added');
  const modified = changes.filter(c => c.type === 'modified');
  const removed = changes.filter(c => c.type === 'removed');

  const parts: string[] = [];

  if (added.length > 0) {
    const categories = [...new Set(added.map(c => c.category))];
    parts.push(`+${added.length} ajout${added.length > 1 ? 's' : ''} (${categories.join(', ')})`);
  }

  if (modified.length > 0) {
    parts.push(`~${modified.length} modification${modified.length > 1 ? 's' : ''}`);
  }

  if (removed.length > 0) {
    parts.push(`-${removed.length} suppression${removed.length > 1 ? 's' : ''}`);
  }

  return parts.join(', ') || 'Mise à jour mineure';
}

/**
 * Génère un résumé des changements
 */
export function generateSummary(changes: Change[]): ChangeSummary {
  return {
    added: changes.filter(c => c.type === 'added').map(c => c.path),
    modified: changes.filter(c => c.type === 'modified').map(c => c.path),
    removed: changes.filter(c => c.type === 'removed').map(c => c.path),
    total_changes: changes.length,
  };
}

/**
 * Catégorise les changements par type
 */
function categorizeChanges(changes: Change[]): Record<ChangeCategory, Change[]> {
  return {
    structure: changes.filter(c => c.category === 'structure'),
    data: changes.filter(c => c.category === 'data'),
    logic: changes.filter(c => c.category === 'logic'),
    ui: changes.filter(c => c.category === 'ui'),
    security: changes.filter(c => c.category === 'security'),
  };
}

/**
 * Détecte automatiquement les changements entre deux spécifications
 */
export function detectChanges(
  oldSpec: Record<string, unknown>,
  newSpec: Record<string, unknown>
): ChangeAnalysis {
  const changes = deepCompare(oldSpec, newSpec);
  const impactScore = calculateImpactScore(changes);
  const changeType = determineChangeType(changes);
  const categories = categorizeChanges(changes);

  return {
    type: changeType,
    impactScore,
    impactLevel: getImpactLevel(impactScore),
    categories,
    summary: generateSummary(changes),
    description: generateDescription(changes),
    details: changes,
  };
}

/**
 * Analyse rapide pour déterminer si des changements significatifs existent
 */
export function hasSignificantChanges(
  oldSpec: Record<string, unknown>,
  newSpec: Record<string, unknown>,
  threshold: number = 10
): boolean {
  const analysis = detectChanges(oldSpec, newSpec);
  return analysis.impactScore >= threshold;
}

/**
 * Exporte l'analyse en format lisible
 */
export function formatAnalysisReport(analysis: ChangeAnalysis): string {
  const lines: string[] = [
    `# Rapport d'Analyse des Changements`,
    ``,
    `## Résumé`,
    `- **Type de changement**: ${analysis.type}`,
    `- **Score d'impact**: ${analysis.impactScore}/100 (${analysis.impactLevel})`,
    `- **Total des modifications**: ${analysis.summary.total_changes}`,
    ``,
    `## Description`,
    analysis.description,
    ``,
  ];

  for (const [category, changes] of Object.entries(analysis.categories)) {
    if (changes.length > 0) {
      lines.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)} (${changes.length})`);
      for (const change of changes) {
        lines.push(`- [${change.type.toUpperCase()}] ${change.description}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}
