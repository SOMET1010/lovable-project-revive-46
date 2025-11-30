import React, { useState } from 'react';
import {
  ApplicationStatus,
  StatusWorkflow,
  StatusHistory,
  StatusActions,
  Application,
  ApplicationStatus as ApplicationStatusType,
  UserRole,
  StatusChange
} from './index';

/**
 * Exemple d'utilisation des composants de gestion des statuts de candidatures
 */
export const ApplicationStatusExample: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('proprietaire');
  
  // Données d'exemple pour la candidature
  const exampleApplication: Application = {
    id: 'app_123',
    candidateId: 'candidate_456',
    propertyId: 'property_789',
    status: 'en_cours' as ApplicationStatusType,
    submittedAt: new Date('2025-11-25T10:30:00'),
    updatedAt: new Date('2025-11-28T14:15:00'),
    currentStep: 2,
    totalSteps: 4,
    statusHistory: [
      {
        id: 'change_1',
        status: 'en_attente',
        changedAt: new Date('2025-11-25T10:30:00'),
        changedBy: 'candidat_jean_dupont',
        comment: 'Candidature soumise avec tous les documents requis'
      },
      {
        id: 'change_2',
        status: 'en_cours',
        changedAt: new Date('2025-11-26T09:15:00'),
        changedBy: 'proprietaire_marie_martin',
        comment: 'Examen démarré - documents en cours de vérification'
      }
    ] as StatusChange[]
  };

  const handleStatusChange = (
    newStatus: ApplicationStatusType,
    reason?: string,
    comment?: string
  ) => {
    console.log('Changement de statut demandé:', {
      from: exampleApplication.status,
      to: newStatus,
      reason,
      comment
    });
    
    // Ici, vous integreriez avec votre API backend
    // Pour la démo, on simule juste un changement
    exampleApplication.status = newStatus;
    exampleApplication.updatedAt = new Date();
    
    // Ajouter à l'historique
    const newChange: StatusChange = {
      id: `change_${Date.now()}`,
      status: newStatus,
      changedAt: new Date(),
      changedBy: `user_${userRole}`,
      reason,
      comment
    };
    exampleApplication.statusHistory.push(newChange);
  };

  const handleCancel = () => {
    console.log('Annulation de candidature demandée');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Titre principal */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          🏠 Gestion des Statuts de Candidatures
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Exemple d'utilisation des composants de workflow de candidature
        </p>
        
        {/* Sélecteur de rôle pour la démo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-background-surface)' }}>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Rôle:
            </span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="px-3 py-1 rounded border text-sm"
              style={{
                backgroundColor: 'var(--color-background-page)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="proprietaire">Propriétaire</option>
              <option value="candidat">Candidat</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Statut principal */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          📋 Statut de la Candidature
        </h2>
        <ApplicationStatus
          application={exampleApplication}
          showDescription={true}
          showHistory={true}
          onStatusClick={(status) => console.log('Clic sur statut:', status)}
        />
      </section>

      {/* Section 2: Workflow visuel */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          🔄 Workflow de Candidature
        </h2>
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <StatusWorkflow
            currentStatus={exampleApplication.status}
            completedStatuses={['en_attente']}
          />
        </div>
      </section>

      {/* Section 3: Actions disponibles */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          ⚡ Actions Contextuelles
        </h2>
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <StatusActions
            application={exampleApplication}
            userRole={userRole}
            onStatusChange={handleStatusChange}
            onCancel={handleCancel}
          />
        </div>
      </section>

      {/* Section 4: Historique détaillé */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          📜 Historique Complet
        </h2>
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <StatusHistory
            history={exampleApplication.statusHistory}
            showFilters={true}
            maxVisibleItems={5}
          />
        </div>
      </section>

      {/* Section 5: Intégration Dashboard */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          🎯 Intégration Dashboard
        </h2>
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <div className="space-y-4">
            <p style={{ color: 'var(--text-secondary)' }}>
              Voici comment intégrer ces composants dans vos dashboards existants :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-primary-50)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Dashboard Propriétaire
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Liste des candidatures reçues</li>
                  <li>• StatusBadge pour chaque candidature</li>
                  <li>• StatusActions contextuelles</li>
                  <li>• Notifications de nouveaux statuts</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-primary-50)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Dashboard Candidat
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Suivi de sa candidature</li>
                  <li>• ApplicationStatus avec progression</li>
                  <li>• StatusWorkflow visuel</li>
                  <li>• StatusHistory pour transparence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Informations techniques */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          🔧 Intégration Technique
        </h2>
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <pre className="text-xs overflow-x-auto p-4 rounded" style={{ 
            backgroundColor: 'var(--color-neutral-100)',
            color: 'var(--text-primary)'
          }}>
{`// Import des composants
import { 
  ApplicationStatus, 
  StatusWorkflow, 
  StatusActions,
  StatusHistory,
  StatusBadge,
  type Application,
  type UserRole 
} from '@/components/applications';

// Utilisation basique
<ApplicationStatus 
  application={application}
  showDescription={true}
  showHistory={true}
/>

// Actions contextuelles
<StatusActions
  application={application}
  userRole="proprietaire"
  onStatusChange={handleStatusChange}
/>

// Workflow visuel
<StatusWorkflow 
  currentStatus={application.status}
  completedStatuses={['en_attente']}
/>

// Historique détaillé
<StatusHistory 
  history={application.statusHistory}
  showFilters={true}
/>

// Badge simple
<StatusBadge status={application.status} size="md" />`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default ApplicationStatusExample;