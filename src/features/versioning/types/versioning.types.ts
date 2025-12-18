/**
 * Types pour le système de versioning intelligent
 */

// Types de changements
export type ChangeType = 
  | 'major' 
  | 'minor' 
  | 'patch' 
  | 'breaking' 
  | 'feature' 
  | 'fix' 
  | 'refactor' 
  | 'initial';

// Types de tags
export type TagType = 
  | 'release' 
  | 'milestone' 
  | 'stable' 
  | 'backup' 
  | 'custom' 
  | 'production' 
  | 'beta';

// Catégorie de changement
export type ChangeCategory = 
  | 'structure' 
  | 'data' 
  | 'logic' 
  | 'ui' 
  | 'security';

// Niveau d'impact
export type ImpactLevel = 'minor' | 'medium' | 'major' | 'critical';

// Structure d'un changement individuel
export interface Change {
  id: string;
  type: 'added' | 'modified' | 'removed';
  category: ChangeCategory;
  path: string;
  description: string;
  oldValue?: unknown;
  newValue?: unknown;
  impactScore: number;
}

// Résumé des changements
export interface ChangeSummary {
  added: string[];
  modified: string[];
  removed: string[];
  total_changes: number;
}

// Version du projet
export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: string;
  version_major: number;
  version_minor: number;
  version_patch: number;
  change_type: ChangeType;
  impact_score: number;
  change_summary: ChangeSummary;
  auto_description: string | null;
  manual_notes: string | null;
  specification_snapshot: Record<string, unknown>;
  custom_files: Record<string, unknown>;
  changes_structure: Change[];
  changes_data: Change[];
  changes_logic: Change[];
  changes_ui: Change[];
  changes_security: Change[];
  created_by: string | null;
  is_checkpoint: boolean;
  is_current: boolean;
  created_at: string;
  tags?: VersionTag[];
}

// Tag de version
export interface VersionTag {
  id: string;
  version_id: string;
  tag_name: string;
  tag_type: TagType;
  tag_color: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

// Analyse de changement
export interface ChangeAnalysis {
  type: ChangeType;
  impactScore: number;
  impactLevel: ImpactLevel;
  categories: {
    structure: Change[];
    data: Change[];
    logic: Change[];
    ui: Change[];
    security: Change[];
  };
  summary: ChangeSummary;
  description: string;
  details: Change[];
}

// Résultat de diff entre versions
export interface VersionDiff {
  versionA: ProjectVersion;
  versionB: ProjectVersion;
  changes: Change[];
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
  impactScore: number;
  impactLevel: ImpactLevel;
  categorySummary: Record<ChangeCategory, number>;
}

// Options de création de version
export interface CreateVersionOptions {
  specification: Record<string, unknown>;
  changeType?: ChangeType;
  description?: string;
  isCheckpoint?: boolean;
  customFiles?: Record<string, unknown>;
  manualNotes?: string;
}

// Options de restauration
export interface RestoreOptions {
  createBackup?: boolean;
  partialRestore?: boolean;
  componentsToRestore?: ChangeCategory[];
}

// Statistiques de version
export interface VersionStats {
  total_versions: number;
  current_version: string | null;
  checkpoints_count: number;
  tagged_versions: number;
  first_version_date: string | null;
  last_version_date: string | null;
  change_types: {
    major: number;
    minor: number;
    patch: number;
  };
}

// Filtre pour l'historique
export interface VersionHistoryFilter {
  changeType?: ChangeType[];
  dateFrom?: Date;
  dateTo?: Date;
  hasTag?: boolean;
  isCheckpoint?: boolean;
  search?: string;
}

// État du store de versioning
export interface VersioningState {
  versions: ProjectVersion[];
  currentVersion: ProjectVersion | null;
  selectedVersions: [string | null, string | null];
  diffResult: VersionDiff | null;
  isLoading: boolean;
  error: string | null;
  filter: VersionHistoryFilter;
}

// Actions du store
export interface VersioningActions {
  setVersions: (versions: ProjectVersion[]) => void;
  setCurrentVersion: (version: ProjectVersion | null) => void;
  setSelectedVersions: (versions: [string | null, string | null]) => void;
  setDiffResult: (diff: VersionDiff | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: Partial<VersionHistoryFilter>) => void;
  clearDiff: () => void;
  reset: () => void;
}

// Changelog entry
export interface ChangelogEntry {
  version: string;
  date: string;
  type: ChangeType;
  description: string;
  changes: {
    added: string[];
    modified: string[];
    removed: string[];
  };
}
