/**
 * Modal d'historique des versions avec timeline visuelle
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, Search, Download, Trash2, Tag, 
  GitBranch, CheckCircle, AlertCircle, Clock,
  Plus, Minus, Edit3, Shield, Database, Layout, Code
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useVersioning } from '../hooks/useVersioning';
import type { ProjectVersion, ChangeType, ChangeCategory } from '../types/versioning.types';

interface VersionHistoryModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompare?: (versionA: string, versionB: string) => void;
  onRestore?: (versionId: string) => void;
}

const CHANGE_TYPE_CONFIG: Record<ChangeType, { label: string; color: string; icon: React.ReactNode }> = {
  major: { label: 'Majeur', color: 'bg-red-500', icon: <AlertCircle className="h-3 w-3" /> },
  breaking: { label: 'Breaking', color: 'bg-red-600', icon: <AlertCircle className="h-3 w-3" /> },
  minor: { label: 'Mineur', color: 'bg-blue-500', icon: <Plus className="h-3 w-3" /> },
  feature: { label: 'Feature', color: 'bg-green-500', icon: <Plus className="h-3 w-3" /> },
  patch: { label: 'Patch', color: 'bg-gray-500', icon: <Edit3 className="h-3 w-3" /> },
  fix: { label: 'Fix', color: 'bg-yellow-500', icon: <CheckCircle className="h-3 w-3" /> },
  refactor: { label: 'Refactor', color: 'bg-purple-500', icon: <Code className="h-3 w-3" /> },
  initial: { label: 'Initial', color: 'bg-emerald-500', icon: <GitBranch className="h-3 w-3" /> },
};

const CATEGORY_ICONS: Record<ChangeCategory, React.ReactNode> = {
  structure: <Database className="h-3 w-3" />,
  data: <Database className="h-3 w-3" />,
  logic: <Code className="h-3 w-3" />,
  ui: <Layout className="h-3 w-3" />,
  security: <Shield className="h-3 w-3" />,
};

export function VersionHistoryModal({
  projectId,
  open,
  onOpenChange,
  onCompare,
  onRestore,
}: VersionHistoryModalProps) {
  const { versions, currentVersion, stats, isLoading, exportHistory, setFilter, filter } = useVersioning(projectId);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleSelectForCompare = (versionId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2 && onCompare) {
      onCompare(selectedForCompare[0], selectedForCompare[1]);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: fr });
  };

  const getChangeSummary = (version: ProjectVersion) => {
    const summary = version.change_summary;
    if (!summary) return null;
    
    const parts = [];
    if (summary.added?.length) parts.push(`+${summary.added.length}`);
    if (summary.modified?.length) parts.push(`~${summary.modified.length}`);
    if (summary.removed?.length) parts.push(`-${summary.removed.length}`);
    
    return parts.join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des Versions
            {stats && (
              <Badge variant="secondary" className="ml-2">
                {stats.total_versions} versions
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Barre d'outils */}
        <div className="flex items-center gap-2 pb-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une version..."
              className="pl-9"
              value={filter.search || ''}
              onChange={(e) => setFilter({ search: e.target.value })}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportHistory()}
          >
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </Button>

          {selectedForCompare.length === 2 && (
            <Button size="sm" onClick={handleCompare}>
              Comparer
            </Button>
          )}
        </div>

        {/* Timeline des versions */}
        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune version enregistrée
            </div>
          ) : (
            <div className="relative">
              {/* Ligne de timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              {versions.map((version, index) => {
                const config = CHANGE_TYPE_CONFIG[version.change_type] || CHANGE_TYPE_CONFIG.patch;
                const isSelected = selectedForCompare.includes(version.id);
                const isCurrent = version.is_current;
                
                return (
                  <div
                    key={version.id}
                    className={`relative pl-10 pb-6 ${isSelected ? 'bg-primary/5 -mx-2 px-12 rounded-lg' : ''}`}
                  >
                    {/* Point de timeline */}
                    <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${config.color} text-white`}>
                      {config.icon}
                    </div>
                    
                    {/* Carte de version */}
                    <div className={`p-4 rounded-lg border ${isCurrent ? 'border-primary bg-primary/5' : 'bg-card'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">
                              {version.version_number}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                            {isCurrent && (
                              <Badge className="bg-primary text-primary-foreground text-xs">
                                Actuelle
                              </Badge>
                            )}
                            {version.is_checkpoint && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Checkpoint
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1">
                            {version.auto_description || version.manual_notes || 'Aucune description'}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(version.created_at)}
                            </span>
                            
                            {getChangeSummary(version) && (
                              <span className="font-mono">
                                {getChangeSummary(version)}
                              </span>
                            )}
                            
                            {version.impact_score > 0 && (
                              <span>
                                Impact: {version.impact_score}/100
                              </span>
                            )}
                          </div>
                          
                          {/* Tags */}
                          {version.tags && version.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {version.tags.map(tag => (
                                <Badge
                                  key={tag.id}
                                  style={{ backgroundColor: tag.tag_color }}
                                  className="text-white text-xs"
                                >
                                  <Tag className="h-2 w-2 mr-1" />
                                  {tag.tag_name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant={isSelected ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleSelectForCompare(version.id)}
                          >
                            {isSelected ? 'Sélectionné' : 'Comparer'}
                          </Button>
                          
                          {!isCurrent && onRestore && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRestore(version.id)}
                            >
                              Restaurer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default VersionHistoryModal;
