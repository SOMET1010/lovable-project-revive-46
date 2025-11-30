// Intégration des composants de statut dans les dashboards existants
import React, { useState, useEffect } from 'react';
import {
  ApplicationStatus,
  StatusWorkflow,
  StatusActions,
  StatusHistory,
  StatusBadge,
  type Application,
  type ApplicationStatus,
  type UserRole,
  type StatusChange
} from '@/components/applications';

// Exemple d'intégration dans le dashboard propriétaire
export const OwnerApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les candidatures reçues
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications?role=owner');
      const data = await response.json();
      setApplications(data.applications);
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    reason?: string,
    comment?: string
  ) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, reason, comment })
      });

      if (response.ok) {
        // Mise à jour locale optimiste
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId
              ? {
                  ...app,
                  status: newStatus,
                  updatedAt: new Date(),
                  statusHistory: [
                    ...app.statusHistory,
                    {
                      id: Date.now().toString(),
                      status: newStatus,
                      changedAt: new Date(),
                      changedBy: 'current_user_id',
                      reason,
                      comment
                    }
                  ]
                }
              : app
          )
        );

        // Notification de succès
        showNotification('Statut mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      showNotification('Erreur lors du changement de statut', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // Intégrer avec votre système de notifications existant
    console.log(`${type}: ${message}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Candidatures reçues
        </h1>
        <div className="flex items-center gap-2">
          <StatusBadge status="en_attente" />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {applications.filter(app => app.status === 'en_attente').length} en attente
          </span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Aucune candidature pour le moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map(application => (
            <div
              key={application.id}
              className="p-6 rounded-lg border transition-all hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-background-surface)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {application.propertyTitle}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Candidature #{application.id}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <ApplicationStatus
                application={application}
                showDescription={true}
                showHistory={false}
              />

              <StatusActions
                application={application}
                userRole="proprietaire"
                onStatusChange={(newStatus, reason, comment) =>
                  handleStatusChange(application.id, newStatus, reason, comment)
                }
              />

              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <button
                  onClick={() => {
                    // Ouvrir un modal avec plus de détails
                    openApplicationDetails(application);
                  }}
                  className="text-sm underline hover:no-underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Voir tous les détails →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Exemple d'intégration dans le dashboard candidat
export const CandidateApplicationsList: React.FC = () => {
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const response = await fetch('/api/applications?role=candidate');
      const data = await response.json();
      setMyApplications(data.applications);
    } catch (error) {
      console.error('Erreur lors du chargement de mes candidatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    reason?: string,
    comment?: string
  ) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, reason, comment })
      });

      if (response.ok) {
        setMyApplications(prev =>
          prev.map(app =>
            app.id === applicationId
              ? {
                  ...app,
                  status: newStatus,
                  updatedAt: new Date(),
                  statusHistory: [
                    ...app.statusHistory,
                    {
                      id: Date.now().toString(),
                      status: newStatus,
                      changedAt: new Date(),
                      changedBy: 'current_user_id',
                      reason,
                      comment
                    }
                  ]
                }
              : app
          )
        );

        showNotification('Candidature annulée avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      showNotification('Erreur lors de l\'annulation', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type}: ${message}`);
  };

  const openApplicationDetails = (application: Application) => {
    // Naviguer vers la page de détail
    window.location.href = `/applications/${application.id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Mes candidatures
        </h1>
        <button className="px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)'
                }}>
          + Nouvelle candidature
        </button>
      </div>

      {myApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏠</div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Vous n'avez pas encore soumis de candidature
          </p>
          <button className="mt-4 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-inverse)'
                  }}>
            Parcourir les biens
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {myApplications.map(application => (
            <div
              key={application.id}
              className="p-6 rounded-lg border transition-all hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-background-surface)' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne 1: Statut et infos de base */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <StatusBadge status={application.status} size="md" />
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {application.propertyTitle}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Candidature #{application.id}
                      </p>
                    </div>
                  </div>
                  
                  <ApplicationStatus
                    application={application}
                    showDescription={true}
                    showHistory={false}
                  />
                </div>

                {/* Colonne 2: Workflow visuel */}
                <div>
                  <StatusWorkflow
                    currentStatus={application.status}
                    completedStatuses={getCompletedStatuses(application)}
                  />
                </div>

                {/* Colonne 3: Actions et historique */}
                <div>
                  <StatusActions
                    application={application}
                    userRole="candidat"
                    onStatusChange={(newStatus, reason, comment) =>
                      handleStatusChange(application.id, newStatus, reason, comment)
                    }
                  />
                  
                  <div className="mt-4">
                    <StatusHistory
                      history={application.statusHistory}
                      showFilters={false}
                      maxVisibleItems={3}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end" 
                   style={{ borderColor: 'var(--border-primary)' }}>
                <button
                  onClick={() => openApplicationDetails(application)}
                  className="px-4 py-2 text-sm rounded-lg border transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--color-background-page)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  Voir tous les détails →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Exemple d'intégration dans le dashboard admin
export const AdminApplicationsManagement: React.FC = () => {
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllApplications();
  }, []);

  const fetchAllApplications = async () => {
    try {
      const response = await fetch('/api/applications?role=admin');
      const data = await response.json();
      setAllApplications(data.applications);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletedStatuses = (application: Application): ApplicationStatus[] => {
    const historyStatuses = application.statusHistory.map(h => h.status);
    const currentIndex = historyStatuses.indexOf(application.status);
    return historyStatuses.slice(0, currentIndex);
  };

  const filteredApplications = filter === 'all' 
    ? allApplications 
    : allApplications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Gestion des candidatures
        </h1>
        
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ApplicationStatus | 'all')}
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-background-page)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="acceptee">Acceptées</option>
            <option value="refusee">Refusées</option>
            <option value="annulee">Annulées</option>
          </select>
          
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {filteredApplications.length} candidature{filteredApplications.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Vue tableau pour l'admin */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>ID</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>Propriété</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>Candidat</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>Statut</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>Date</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map(application => (
              <tr key={application.id} 
                  className="border-b hover:bg-opacity-50 transition-all"
                  style={{ borderColor: 'var(--border-secondary)' }}>
                <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  #{application.id}
                </td>
                <td className="p-4">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {application.propertyTitle}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {application.candidateName}
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge status={application.status} />
                </td>
                <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Intl.DateTimeFormat('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).format(application.updatedAt)}
                </td>
                <td className="p-4">
                  <button className="text-sm underline hover:no-underline"
                          style={{ color: 'var(--accent-primary)' }}>
                    Gérer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Aucune candidature ne correspond aux filtres sélectionnés
          </p>
        </div>
      )}
    </div>
  );
};

// Fonctions utilitaires
const openApplicationDetails = (application: Application) => {
  window.location.href = `/applications/${application.id}`;
};

const getCompletedStatuses = (application: Application): ApplicationStatus[] => {
  const historyStatuses = application.statusHistory.map(h => h.status);
  const currentIndex = historyStatuses.indexOf(application.status);
  return historyStatuses.slice(0, currentIndex);
};

// Export des composants d'intégration
export {
  OwnerApplicationsList,
  CandidateApplicationsList,
  AdminApplicationsManagement
};