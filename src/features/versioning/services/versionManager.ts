/**
 * Service de gestion des versions
 * Création, restauration, comparaison et gestion des versions
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type {
  ProjectVersion,
  VersionTag,
  VersionStats,
  CreateVersionOptions,
  RestoreOptions,
  VersionDiff,
  ChangelogEntry,
  ChangeType,
  TagType,
  ChangeSummary,
} from '../types/versioning.types';
import { detectChanges } from './changeDetector';

/**
 * Récupère toutes les versions d'un projet
 */
export async function getVersions(projectId: string): Promise<ProjectVersion[]> {
  const { data, error } = await supabase
    .from('project_versions')
    .select(`
      *,
      tags:version_tags(*)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erreur lors de la récupération des versions: ${error.message}`);
  
  return (data || []) as unknown as ProjectVersion[];
}

/**
 * Récupère la version actuelle d'un projet
 */
export async function getCurrentVersion(projectId: string): Promise<ProjectVersion | null> {
  const { data, error } = await supabase
    .from('project_versions')
    .select(`
      *,
      tags:version_tags(*)
    `)
    .eq('project_id', projectId)
    .eq('is_current', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erreur lors de la récupération de la version actuelle: ${error.message}`);
  }
  
  return data as unknown as ProjectVersion | null;
}

/**
 * Récupère une version spécifique
 */
export async function getVersion(versionId: string): Promise<ProjectVersion | null> {
  const { data, error } = await supabase
    .from('project_versions')
    .select(`
      *,
      tags:version_tags(*)
    `)
    .eq('id', versionId)
    .single();

  if (error) throw new Error(`Erreur lors de la récupération de la version: ${error.message}`);
  
  return data as unknown as ProjectVersion | null;
}

/**
 * Crée une nouvelle version
 */
export async function createVersion(
  projectId: string,
  options: CreateVersionOptions
): Promise<ProjectVersion> {
  const { specification, changeType = 'patch', description, isCheckpoint = false, customFiles = {}, manualNotes } = options;

  // Utiliser la fonction SQL pour créer le snapshot
  const { data, error } = await supabase
    .rpc('create_version_snapshot', {
      p_project_id: projectId,
      p_specification: specification as Json,
      p_change_type: changeType,
      p_description: description,
      p_is_checkpoint: isCheckpoint,
      p_custom_files: customFiles as Json,
    });

  if (error) throw new Error(`Erreur lors de la création de la version: ${error.message}`);

  // Mettre à jour les notes manuelles si fournies
  if (manualNotes && data) {
    await supabase
      .from('project_versions')
      .update({ manual_notes: manualNotes })
      .eq('id', data);
  }

  // Récupérer la version créée
  const version = await getVersion(data as string);
  if (!version) throw new Error('Version créée mais non trouvée');
  
  return version;
}

/**
 * Crée une version avec analyse automatique des changements
 */
export async function createVersionWithAnalysis(
  projectId: string,
  newSpecification: Record<string, unknown>,
  options: Omit<CreateVersionOptions, 'specification' | 'changeType'> = {}
): Promise<ProjectVersion> {
  // Récupérer la version actuelle pour comparaison
  const currentVersion = await getCurrentVersion(projectId);
  
  let changeType: ChangeType = 'initial';
  let description = options.description || 'Version initiale';
  let changeSummary: ChangeSummary = { added: [], modified: [], removed: [], total_changes: 0 };

  if (currentVersion) {
    // Analyser les changements
    const analysis = detectChanges(
      currentVersion.specification_snapshot as Record<string, unknown>,
      newSpecification
    );
    
    changeType = analysis.type;
    description = options.description || analysis.description;
    changeSummary = analysis.summary;
  }

  // Créer la version avec les informations d'analyse
  const version = await createVersion(projectId, {
    ...options,
    specification: newSpecification,
    changeType,
    description,
  });

  // Mettre à jour le résumé des changements
  await supabase
    .from('project_versions')
    .update({ 
      change_summary: changeSummary as unknown as Json,
      auto_description: description,
    })
    .eq('id', version.id);

  return version;
}

/**
 * Restaure une version précédente
 */
export async function restoreVersion(
  versionId: string,
  options: RestoreOptions = {}
): Promise<ProjectVersion> {
  const { createBackup = true } = options;

  // Récupérer la version à restaurer
  const versionToRestore = await getVersion(versionId);
  if (!versionToRestore) throw new Error('Version non trouvée');

  // Créer une sauvegarde de la version actuelle si demandé
  if (createBackup) {
    const currentVersion = await getCurrentVersion(versionToRestore.project_id);
    if (currentVersion) {
      await supabase
        .from('project_versions')
        .update({ is_checkpoint: true })
        .eq('id', currentVersion.id);
      
      // Ajouter un tag de backup
      await addTag(currentVersion.id, {
        tag_name: `Backup avant restauration v${versionToRestore.version_number}`,
        tag_type: 'backup',
        tag_color: '#f59e0b',
      });
    }
  }

  // Créer une nouvelle version avec le contenu restauré
  const restoredVersion = await createVersion(versionToRestore.project_id, {
    specification: versionToRestore.specification_snapshot,
    changeType: 'patch',
    description: `Restauration de ${versionToRestore.version_number}`,
    customFiles: versionToRestore.custom_files,
    manualNotes: `Restauré depuis la version ${versionToRestore.version_number}`,
  });

  return restoredVersion;
}

/**
 * Compare deux versions
 */
export async function compareVersions(
  versionAId: string,
  versionBId: string
): Promise<VersionDiff> {
  const [versionA, versionB] = await Promise.all([
    getVersion(versionAId),
    getVersion(versionBId),
  ]);

  if (!versionA || !versionB) {
    throw new Error('Une ou plusieurs versions non trouvées');
  }

  const analysis = detectChanges(
    versionA.specification_snapshot,
    versionB.specification_snapshot
  );

  const categorySummary = {
    structure: analysis.categories.structure.length,
    data: analysis.categories.data.length,
    logic: analysis.categories.logic.length,
    ui: analysis.categories.ui.length,
    security: analysis.categories.security.length,
  };

  return {
    versionA,
    versionB,
    changes: analysis.details,
    addedCount: analysis.summary.added.length,
    modifiedCount: analysis.summary.modified.length,
    removedCount: analysis.summary.removed.length,
    impactScore: analysis.impactScore,
    impactLevel: analysis.impactLevel,
    categorySummary,
  };
}

/**
 * Génère le changelog entre deux versions
 */
export async function generateChangelog(
  projectId: string,
  fromVersionId?: string,
  toVersionId?: string
): Promise<ChangelogEntry[]> {
  const versions = await getVersions(projectId);
  
  // Filtrer les versions entre from et to
  let filteredVersions = versions;
  
  if (fromVersionId) {
    const fromIndex = versions.findIndex(v => v.id === fromVersionId);
    if (fromIndex >= 0) {
      filteredVersions = versions.slice(0, fromIndex + 1);
    }
  }
  
  if (toVersionId) {
    const toIndex = filteredVersions.findIndex(v => v.id === toVersionId);
    if (toIndex >= 0) {
      filteredVersions = filteredVersions.slice(toIndex);
    }
  }

  return filteredVersions.map(version => ({
    version: version.version_number,
    date: version.created_at,
    type: version.change_type,
    description: version.auto_description || version.manual_notes || 'Mise à jour',
    changes: {
      added: version.change_summary?.added || [],
      modified: version.change_summary?.modified || [],
      removed: version.change_summary?.removed || [],
    },
  }));
}

/**
 * Récupère les statistiques de version
 */
export async function getVersionStats(projectId: string): Promise<VersionStats> {
  const { data, error } = await supabase
    .rpc('get_version_stats', { p_project_id: projectId });

  if (error) throw new Error(`Erreur lors de la récupération des stats: ${error.message}`);
  
  return data as unknown as VersionStats;
}

/**
 * Ajoute un tag à une version
 */
export async function addTag(
  versionId: string,
  tag: {
    tag_name: string;
    tag_type?: TagType;
    tag_color?: string;
    notes?: string;
  }
): Promise<VersionTag> {
  const { data, error } = await supabase
    .from('version_tags')
    .insert({
      version_id: versionId,
      tag_name: tag.tag_name,
      tag_type: tag.tag_type || 'custom',
      tag_color: tag.tag_color || '#3b82f6',
      notes: tag.notes,
    })
    .select()
    .single();

  if (error) throw new Error(`Erreur lors de l'ajout du tag: ${error.message}`);
  
  return data as unknown as VersionTag;
}

/**
 * Supprime un tag
 */
export async function removeTag(tagId: string): Promise<void> {
  const { error } = await supabase
    .from('version_tags')
    .delete()
    .eq('id', tagId);

  if (error) throw new Error(`Erreur lors de la suppression du tag: ${error.message}`);
}

/**
 * Met à jour les notes manuelles d'une version
 */
export async function updateVersionNotes(
  versionId: string,
  notes: string
): Promise<void> {
  const { error } = await supabase
    .from('project_versions')
    .update({ manual_notes: notes })
    .eq('id', versionId);

  if (error) throw new Error(`Erreur lors de la mise à jour des notes: ${error.message}`);
}

/**
 * Marque une version comme checkpoint
 */
export async function markAsCheckpoint(
  versionId: string,
  isCheckpoint: boolean = true
): Promise<void> {
  const { error } = await supabase
    .from('project_versions')
    .update({ is_checkpoint: isCheckpoint })
    .eq('id', versionId);

  if (error) throw new Error(`Erreur lors du marquage: ${error.message}`);
}

/**
 * Nettoie les anciennes versions
 */
export async function cleanupOldVersions(
  projectId: string,
  maxVersions: number = 50,
  maxAgeDays: number = 180
): Promise<number> {
  const { data, error } = await supabase
    .rpc('cleanup_old_versions', {
      p_project_id: projectId,
      p_max_versions: maxVersions,
      p_max_age_days: maxAgeDays,
    });

  if (error) throw new Error(`Erreur lors du nettoyage: ${error.message}`);
  
  return data as number;
}

/**
 * Exporte l'historique des versions en JSON
 */
export async function exportVersionHistory(projectId: string): Promise<string> {
  const [versions, stats] = await Promise.all([
    getVersions(projectId),
    getVersionStats(projectId),
  ]);

  const exportData = {
    projectId,
    exportDate: new Date().toISOString(),
    stats,
    versions: versions.map(v => ({
      version_number: v.version_number,
      change_type: v.change_type,
      impact_score: v.impact_score,
      description: v.auto_description || v.manual_notes,
      is_checkpoint: v.is_checkpoint,
      created_at: v.created_at,
      tags: v.tags?.map(t => ({ name: t.tag_name, type: t.tag_type })),
      change_summary: v.change_summary,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}
