/**
 * Store Zustand pour la gestion de l'état du versioning
 */

import { create } from 'zustand';
import type {
  ProjectVersion,
  VersionDiff,
  VersionHistoryFilter,
  VersioningState,
  VersioningActions,
} from '../types/versioning.types';

const initialFilter: VersionHistoryFilter = {};

const initialState: VersioningState = {
  versions: [],
  currentVersion: null,
  selectedVersions: [null, null],
  diffResult: null,
  isLoading: false,
  error: null,
  filter: initialFilter,
};

export const useVersioningStore = create<VersioningState & VersioningActions>((set) => ({
  ...initialState,

  setVersions: (versions: ProjectVersion[]) => set({ versions }),

  setCurrentVersion: (version: ProjectVersion | null) => set({ currentVersion: version }),

  setSelectedVersions: (versions: [string | null, string | null]) =>
    set({ selectedVersions: versions }),

  setDiffResult: (diff: VersionDiff | null) => set({ diffResult: diff }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  setFilter: (filter: Partial<VersionHistoryFilter>) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  clearDiff: () => set({ diffResult: null, selectedVersions: [null, null] }),

  reset: () => set(initialState),
}));

// Sélecteurs pour optimiser les re-renders
export const selectVersions = (state: VersioningState) => state.versions;
export const selectCurrentVersion = (state: VersioningState) => state.currentVersion;
export const selectSelectedVersions = (state: VersioningState) => state.selectedVersions;
export const selectDiffResult = (state: VersioningState) => state.diffResult;
export const selectIsLoading = (state: VersioningState) => state.isLoading;
export const selectError = (state: VersioningState) => state.error;
export const selectFilter = (state: VersioningState) => state.filter;

// Sélecteur pour les versions filtrées
export const selectFilteredVersions = (state: VersioningState): ProjectVersion[] => {
  const { versions, filter } = state;

  return versions.filter((version) => {
    // Filtre par type de changement
    if (filter.changeType && filter.changeType.length > 0) {
      if (!filter.changeType.includes(version.change_type)) {
        return false;
      }
    }

    // Filtre par date de début
    if (filter.dateFrom) {
      if (new Date(version.created_at) < filter.dateFrom) {
        return false;
      }
    }

    // Filtre par date de fin
    if (filter.dateTo) {
      if (new Date(version.created_at) > filter.dateTo) {
        return false;
      }
    }

    // Filtre par présence de tags
    if (filter.hasTag !== undefined) {
      const hasTags = version.tags && version.tags.length > 0;
      if (filter.hasTag !== hasTags) {
        return false;
      }
    }

    // Filtre par checkpoint
    if (filter.isCheckpoint !== undefined) {
      if (filter.isCheckpoint !== version.is_checkpoint) {
        return false;
      }
    }

    // Filtre par recherche textuelle
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesVersion = version.version_number.toLowerCase().includes(searchLower);
      const matchesDescription = version.auto_description?.toLowerCase().includes(searchLower);
      const matchesNotes = version.manual_notes?.toLowerCase().includes(searchLower);
      const matchesTags = version.tags?.some(t => 
        t.tag_name.toLowerCase().includes(searchLower)
      );
      
      if (!matchesVersion && !matchesDescription && !matchesNotes && !matchesTags) {
        return false;
      }
    }

    return true;
  });
};
