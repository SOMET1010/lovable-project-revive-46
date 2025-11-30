import React, { useState } from 'react';
import { StatusChange, STATUS_CONFIGS } from './types';
import { StatusBadge } from './StatusBadge';

interface StatusHistoryProps {
  history: StatusChange[];
  showFilters?: boolean;
  maxVisibleItems?: number;
  className?: string;
}

/**
 * Composant d'affichage de l'historique des changements de statut
 */
export const StatusHistory: React.FC<StatusHistoryProps> = ({
  history,
  showFilters = true,
  maxVisibleItems = 10,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Trier l'historique par date décroissante
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  // Filtrer l'historique
  const filteredHistory = filterStatus === 'all' 
    ? sortedHistory 
    : sortedHistory.filter(item => item.status === filterStatus);

  // Limiter l'affichage initial
  const visibleHistory = expanded 
    ? filteredHistory 
    : filteredHistory.slice(0, maxVisibleItems);

  // Obtenir les statuts uniques pour les filtres
  const uniqueStatuses = Array.from(new Set(history.map(item => item.status)));

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  if (history.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-4">📋</div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Aucun historique de statut disponible
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* En-tête avec filtres */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Historique des statuts
            <span 
              className="ml-2 text-sm font-normal"
              style={{ color: 'var(--text-secondary)' }}
            >
              ({history.length} changement{history.length > 1 ? 's' : ''})
            </span>
          </h3>
          
          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <label 
              htmlFor="status-filter"
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Filtrer :
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 text-sm rounded-lg border"
              style={{
                backgroundColor: 'var(--color-background-page)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">Tous les statuts</option>
              {uniqueStatuses.map(status => {
                const config = STATUS_CONFIGS[status as keyof typeof STATUS_CONFIGS];
                return (
                  <option key={status} value={status}>
                    {config.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Liste de l'historique */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {visibleHistory.map((change, index) => {
          const config = STATUS_CONFIGS[change.status];
          const isLatest = index === 0;
          
          return (
            <div
              key={change.id}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${isLatest ? 'border-l-4' : ''}
                ${className || ''}
              `}
              style={{
                backgroundColor: 'var(--color-background-surface)',
                borderColor: isLatest ? config.borderColor : 'var(--border-primary)',
                borderLeftColor: isLatest ? config.borderColor : undefined
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <StatusBadge status={change.status} size="sm" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {config.label}
                    </h4>
                    {isLatest && (
                      <span 
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: 'var(--text-inverse)'
                        }}
                      >
                        Dernier
                      </span>
                    )}
                  </div>
                  
                  {change.comment && (
                    <p 
                      className="text-sm mb-2 p-2 rounded"
                      style={{ 
                        backgroundColor: 'var(--color-primary-50)',
                        color: 'var(--text-primary)' 
                      }}
                    >
                      💬 {change.comment}
                    </p>
                  )}
                  
                  {change.reason && (
                    <p 
                      className="text-xs mb-2 p-2 rounded"
                      style={{ 
                        backgroundColor: 'var(--color-neutral-100)',
                        color: 'var(--text-secondary)' 
                      }}
                    >
                      📝 Motif : {change.reason}
                    </p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs">
                    <div 
                      className="flex items-center gap-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      👤 Modifié par {change.changedBy}
                    </div>
                    <div 
                      className="flex items-center gap-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      📅 {formatDate(change.changedAt)}
                    </div>
                    <div 
                      className="flex items-center gap-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      ⏰ {formatRelativeTime(change.changedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton d'expansion */}
      {!expanded && filteredHistory.length > maxVisibleItems && (
        <div className="text-center">
          <button
            onClick={() => setExpanded(true)}
            className="px-4 py-2 text-sm rounded-lg border transition-all hover:shadow-md"
            style={{
              backgroundColor: 'var(--color-background-surface)',
              borderColor: 'var(--border-primary)',
              color: 'var(--accent-primary)'
            }}
          >
            Voir {filteredHistory.length - maxVisibleItems} changement{filteredHistory.length - maxVisibleItems > 1 ? 's' : ''} supplémentaire{filteredHistory.length - maxVisibleItems > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {expanded && (
        <div className="text-center">
          <button
            onClick={() => setExpanded(false)}
            className="px-4 py-2 text-sm rounded-lg border transition-all hover:shadow-md"
            style={{
              backgroundColor: 'var(--color-background-surface)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-secondary)'
            }}
          >
            Réduire
          </button>
        </div>
      )}
    </div>
  );
};