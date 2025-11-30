import React from 'react';
import { ApplicationStatus, Application, STATUS_CONFIGS } from './types';
import { StatusBadge } from './StatusBadge';

interface ApplicationStatusProps {
  application: Application;
  showDescription?: boolean;
  showHistory?: boolean;
  onStatusClick?: (status: ApplicationStatus) => void;
  className?: string;
}

/**
 * Composant principal d'affichage du statut d'une candidature
 */
export const ApplicationStatusComponent: React.FC<ApplicationStatusProps> = ({
  application,
  showDescription = true,
  showHistory = false,
  onStatusClick,
  className = ''
}) => {
  const currentConfig = STATUS_CONFIGS[application.status];
  
  const handleStatusClick = () => {
    if (onStatusClick) {
      onStatusClick(application.status);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Statut principal */}
      <div 
        className="flex items-center gap-4 p-4 rounded-lg border border-neutral-200"
        style={{ backgroundColor: 'var(--color-background-surface)' }}
      >
        <div className="flex-shrink-0">
          <StatusBadge 
            status={application.status} 
            size="lg" 
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {currentConfig.label}
            </h3>
            {onStatusClick && (
              <button
                onClick={handleStatusClick}
                className="text-sm underline hover:no-underline transition-all"
                style={{ color: 'var(--accent-primary)' }}
                aria-label="Détails du statut"
              >
                Détails
              </button>
            )}
          </div>
          
          {showDescription && (
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {currentConfig.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-3 text-xs">
            <span 
              className="flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              📅 Déposé le {formatDate(application.submittedAt)}
            </span>
            <span 
              className="flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              🔄 Mis à jour le {formatDate(application.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Progression si définie */}
      {application.currentStep && application.totalSteps && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-primary-50)' }}>
          <div className="flex items-center justify-between mb-2">
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Progression du dossier
            </span>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {application.currentStep} / {application.totalSteps}
            </span>
          </div>
          <div 
            className="w-full h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-neutral-200)' }}
          >
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'var(--accent-primary)',
                width: `${(application.currentStep / application.totalSteps) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Historique des statuts (optionnel) */}
      {showHistory && application.statusHistory.length > 0 && (
        <div className="space-y-2">
          <h4 
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Historique des changements
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {application.statusHistory.map((change, index) => {
              const changeConfig = STATUS_CONFIGS[change.status];
              return (
                <div
                  key={change.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-background-surface)' }}
                >
                  <StatusBadge status={change.status} size="sm" />
                  <div className="flex-1">
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {changeConfig.label}
                    </p>
                    {change.comment && (
                      <p 
                        className="text-xs mt-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {change.comment}
                      </p>
                    )}
                    <p 
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Par {change.changedBy} le {formatDate(change.changedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};