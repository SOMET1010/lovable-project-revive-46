import React, { useState } from 'react';
import { Application, ApplicationStatus, STATUS_CONFIGS, StatusAction, UserRole } from './types';

interface StatusActionsProps {
  application: Application;
  userRole: UserRole;
  onStatusChange: (newStatus: ApplicationStatus, reason?: string, comment?: string) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Composant des actions contextuelles selon le statut et le rôle
 */
export const StatusActions: React.FC<StatusActionsProps> = ({
  application,
  userRole,
  onStatusChange,
  onCancel,
  className = ''
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    status: ApplicationStatus;
    reason?: string;
    comment?: string;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const currentConfig = STATUS_CONFIGS[application.status];
  const allowedTransitions = currentConfig.transitionTo || [];

  // Actions disponibles selon le statut et le rôle
  const getAvailableActions = (): StatusAction[] => {
    const actions: StatusAction[] = [];

    // Actions du propriétaire
    if (userRole === 'proprietaire') {
      if (application.status === 'en_attente') {
        actions.push({
          id: 'start_review',
          label: 'Commencer l\'examen',
          action: () => handleStatusChange('en_cours'),
          variant: 'primary',
          icon: '🔄'
        });
        actions.push({
          id: 'reject',
          label: 'Refuser directement',
          action: () => handleStatusChange('refusee'),
          variant: 'danger',
          icon: '❌'
        });
      }
      
      if (application.status === 'en_cours') {
        actions.push({
          id: 'accept',
          label: 'Accepter la candidature',
          action: () => handleStatusChange('acceptee'),
          variant: 'primary',
          icon: '✅'
        });
        actions.push({
          id: 'reject',
          label: 'Refuser la candidature',
          action: () => handleStatusChange('refusee'),
          variant: 'danger',
          icon: '❌'
        });
      }
    }

    // Actions du candidat
    if (userRole === 'candidat') {
      if (application.status === 'en_attente' || application.status === 'en_cours') {
        actions.push({
          id: 'cancel',
          label: 'Annuler ma candidature',
          action: () => handleStatusChange('annulee'),
          variant: 'secondary',
          icon: '🚫'
        });
      }
    }

    // Actions de l'admin (tous statuts)
    if (userRole === 'admin') {
      allowedTransitions.forEach(status => {
        const config = STATUS_CONFIGS[status];
        actions.push({
          id: `admin_${status}`,
          label: config.label,
          action: () => handleStatusChange(status),
          variant: status === 'refusee' || status === 'annulee' ? 'danger' : 'primary',
          icon: config.icon
        });
      });
    }

    return actions;
  };

  const handleStatusChange = (newStatus: ApplicationStatus, customReason?: string, customComment?: string) => {
    if (newStatus === 'refusee' || newStatus === 'annulee') {
      setSelectedAction({ 
        status: newStatus,
        reason: customReason,
        comment: customComment
      });
      setShowConfirmation(true);
    } else {
      onStatusChange(newStatus, customReason, customComment);
    }
  };

  const confirmStatusChange = () => {
    if (selectedAction) {
      onStatusChange(selectedAction.status, reason, comment);
      setShowConfirmation(false);
      setSelectedAction(null);
      setReason('');
      setComment('');
    }
  };

  const cancelStatusChange = () => {
    setShowConfirmation(false);
    setSelectedAction(null);
    setReason('');
    setComment('');
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p style={{ color: 'var(--text-muted)' }}>
          Aucune action disponible pour ce statut
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 
        className="text-lg font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Actions disponibles
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableActions.map(action => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={action.disabled}
            className={`
              flex items-center gap-3 p-4 rounded-lg border transition-all duration-200
              ${action.variant === 'primary' 
                ? 'border-transparent hover:shadow-lg hover:scale-105' 
                : action.variant === 'danger'
                ? 'border-transparent hover:shadow-lg hover:scale-105'
                : 'border-neutral-300 hover:shadow-md'
              }
              ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              backgroundColor: action.variant === 'primary' 
                ? 'var(--color-primary-500)'
                : action.variant === 'danger'
                ? 'var(--color-semantic-error)'
                : 'var(--color-background-surface)',
              color: action.variant !== 'secondary' ? 'var(--text-inverse)' : 'var(--text-primary)'
            }}
          >
            <span className="text-xl" aria-hidden="true">
              {action.icon}
            </span>
            <span className="font-semibold">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Modal de confirmation pour les actions critiques */}
      {showConfirmation && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full space-y-4"
            style={{ backgroundColor: 'var(--color-background-page)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {STATUS_CONFIGS[selectedAction.status].icon}
              </span>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Confirmer le changement de statut
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)' }}>
              Êtes-vous sûr de vouloir passer au statut "{STATUS_CONFIGS[selectedAction.status].label}" ?
              {selectedAction.status === 'refusee' && (
                <span className="block mt-2 text-sm">
                  Cette action est irréversible.
                </span>
              )}
              {selectedAction.status === 'annulee' && (
                <span className="block mt-2 text-sm">
                  Vous pourrez soumettre une nouvelle candidature si nécessaire.
                </span>
              )}
            </p>

            <div className="space-y-3">
              <div>
                <label 
                  htmlFor="reason"
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Motif (obligatoire)
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background-page)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  required
                >
                  <option value="">Sélectionnez un motif</option>
                  {selectedAction.status === 'refusee' && (
                    <>
                      <option value="candidature_incomplete">Candidature incomplète</option>
                      <option value="profil_incompatible">Profil incompatible</option>
                      <option value="capacites_financieres_insuffisantes">Capacités financières insuffisantes</option>
                      <option value="documents_insuffisants">Documents insuffisants</option>
                      <option value="autre">Autre</option>
                    </>
                  )}
                  {selectedAction.status === 'annulee' && (
                    <>
                      <option value="changement_situation">Changement de situation</option>
                      <option value="autre_bien_choisi">Autre bien choisi</option>
                      <option value="conditions_modifiees">Conditions modifiées</option>
                      <option value="autre">Autre</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label 
                  htmlFor="comment"
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Commentaire (optionnel)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg border resize-none"
                  style={{
                    backgroundColor: 'var(--color-background-page)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Ajoutez un commentaire pour compléter le motif..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelStatusChange}
                className="flex-1 py-3 px-4 rounded-lg border transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-background-surface)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-secondary)'
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={!reason}
                className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                style={{
                  backgroundColor: selectedAction.status === 'refusee' 
                    ? 'var(--color-semantic-error)'
                    : 'var(--color-neutral-500)',
                  color: 'var(--text-inverse)'
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informations sur les actions disponibles */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-primary-50)' }}>
        <h4 
          className="text-sm font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          ℹ️ Informations
        </h4>
        <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <li>• Les changements de statut sont tracés dans l'historique</li>
          <li>• Un email de notification est envoyé à chaque changement</li>
          {userRole === 'proprietaire' && (
            <>
              <li>• Vous pouvez examiner la candidature avant de décider</li>
              <li>• Les candidatures acceptées sont automatiquement préparées pour la signature</li>
            </>
          )}
          {userRole === 'candidat' && (
            <>
              <li>• Vous pouvez annuler votre candidature à tout moment</li>
              <li>• Une annulation ne vous empêche pas de postuler de nouveau</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};