/**
 * Hook principal pour le système de versioning
 */

import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useVersioningStore } from '../store/versioningStore';
import * as versionManager from '../services/versionManager';
import type {
  CreateVersionOptions,
  RestoreOptions,
  VersionStats,
  TagType,
} from '../types/versioning.types';

export function useVersioning(projectId: string | null) {
  const queryClient = useQueryClient();
  const store = useVersioningStore();

  // Query pour les versions
  const versionsQuery = useQuery({
    queryKey: ['versions', projectId],
    queryFn: () => versionManager.getVersions(projectId!),
    enabled: !!projectId,
    staleTime: 30000,
  });

  // Query pour la version actuelle
  const currentVersionQuery = useQuery({
    queryKey: ['currentVersion', projectId],
    queryFn: () => versionManager.getCurrentVersion(projectId!),
    enabled: !!projectId,
  });

  // Query pour les stats
  const statsQuery = useQuery({
    queryKey: ['versionStats', projectId],
    queryFn: () => versionManager.getVersionStats(projectId!),
    enabled: !!projectId,
    staleTime: 60000,
  });

  // Synchroniser avec le store
  useEffect(() => {
    if (versionsQuery.data) {
      store.setVersions(versionsQuery.data);
    }
  }, [versionsQuery.data]);

  useEffect(() => {
    if (currentVersionQuery.data) {
      store.setCurrentVersion(currentVersionQuery.data);
    }
  }, [currentVersionQuery.data]);

  useEffect(() => {
    store.setLoading(versionsQuery.isLoading || currentVersionQuery.isLoading);
  }, [versionsQuery.isLoading, currentVersionQuery.isLoading]);

  useEffect(() => {
    const error = versionsQuery.error || currentVersionQuery.error;
    store.setError(error ? (error as Error).message : null);
  }, [versionsQuery.error, currentVersionQuery.error]);

  // Mutation pour créer une version
  const createVersionMutation = useMutation({
    mutationFn: (options: CreateVersionOptions) =>
      versionManager.createVersion(projectId!, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['currentVersion', projectId] });
      queryClient.invalidateQueries({ queryKey: ['versionStats', projectId] });
      toast.success('Version créée avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour créer une version avec analyse
  const createVersionWithAnalysisMutation = useMutation({
    mutationFn: ({
      specification,
      options,
    }: {
      specification: Record<string, unknown>;
      options?: Omit<CreateVersionOptions, 'specification' | 'changeType'>;
    }) => versionManager.createVersionWithAnalysis(projectId!, specification, options),
    onSuccess: (version) => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['currentVersion', projectId] });
      queryClient.invalidateQueries({ queryKey: ['versionStats', projectId] });
      toast.success(`Version ${version.version_number} créée`);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour restaurer une version
  const restoreVersionMutation = useMutation({
    mutationFn: ({
      versionId,
      options,
    }: {
      versionId: string;
      options?: RestoreOptions;
    }) => versionManager.restoreVersion(versionId, options),
    onSuccess: (version) => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['currentVersion', projectId] });
      toast.success(`Version restaurée: ${version.version_number}`);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour ajouter un tag
  const addTagMutation = useMutation({
    mutationFn: ({
      versionId,
      tag,
    }: {
      versionId: string;
      tag: { tag_name: string; tag_type?: TagType; tag_color?: string; notes?: string };
    }) => versionManager.addTag(versionId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      toast.success('Tag ajouté');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour supprimer un tag
  const removeTagMutation = useMutation({
    mutationFn: (tagId: string) => versionManager.removeTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      toast.success('Tag supprimé');
    },
  });

  // Mutation pour marquer comme checkpoint
  const markAsCheckpointMutation = useMutation({
    mutationFn: ({
      versionId,
      isCheckpoint,
    }: {
      versionId: string;
      isCheckpoint?: boolean;
    }) => versionManager.markAsCheckpoint(versionId, isCheckpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
    },
  });

  // Fonction pour comparer deux versions
  const compareVersions = useCallback(
    async (versionAId: string, versionBId: string) => {
      try {
        store.setLoading(true);
        const diff = await versionManager.compareVersions(versionAId, versionBId);
        store.setDiffResult(diff);
        store.setSelectedVersions([versionAId, versionBId]);
        return diff;
      } catch (error) {
        toast.error(`Erreur de comparaison: ${(error as Error).message}`);
        throw error;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  // Fonction pour générer le changelog
  const generateChangelog = useCallback(
    async (fromVersionId?: string, toVersionId?: string) => {
      if (!projectId) return [];
      return versionManager.generateChangelog(projectId, fromVersionId, toVersionId);
    },
    [projectId]
  );

  // Fonction pour exporter l'historique
  const exportHistory = useCallback(async () => {
    if (!projectId) return '';
    try {
      const json = await versionManager.exportVersionHistory(projectId);
      // Télécharger le fichier
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `versions-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Historique exporté');
      return json;
    } catch (error) {
      toast.error(`Erreur d'export: ${(error as Error).message}`);
      throw error;
    }
  }, [projectId]);

  // Fonction pour nettoyer les anciennes versions
  const cleanupVersions = useCallback(
    async (maxVersions?: number, maxAgeDays?: number) => {
      if (!projectId) return 0;
      try {
        const deleted = await versionManager.cleanupOldVersions(
          projectId,
          maxVersions,
          maxAgeDays
        );
        queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
        queryClient.invalidateQueries({ queryKey: ['versionStats', projectId] });
        toast.success(`${deleted} version(s) supprimée(s)`);
        return deleted;
      } catch (error) {
        toast.error(`Erreur de nettoyage: ${(error as Error).message}`);
        throw error;
      }
    },
    [projectId, queryClient]
  );

  return {
    // Data
    versions: store.versions,
    currentVersion: store.currentVersion,
    stats: statsQuery.data as VersionStats | undefined,
    selectedVersions: store.selectedVersions,
    diffResult: store.diffResult,
    filter: store.filter,
    
    // Loading states
    isLoading: store.isLoading,
    isCreating: createVersionMutation.isPending,
    isRestoring: restoreVersionMutation.isPending,
    
    // Error
    error: store.error,
    
    // Actions
    createVersion: createVersionMutation.mutateAsync,
    createVersionWithAnalysis: createVersionWithAnalysisMutation.mutateAsync,
    restoreVersion: restoreVersionMutation.mutateAsync,
    addTag: addTagMutation.mutateAsync,
    removeTag: removeTagMutation.mutateAsync,
    markAsCheckpoint: markAsCheckpointMutation.mutateAsync,
    compareVersions,
    generateChangelog,
    exportHistory,
    cleanupVersions,
    
    // Store actions
    setFilter: store.setFilter,
    clearDiff: store.clearDiff,
    setSelectedVersions: store.setSelectedVersions,
    
    // Refetch
    refetch: () => {
      versionsQuery.refetch();
      currentVersionQuery.refetch();
      statsQuery.refetch();
    },
  };
}
