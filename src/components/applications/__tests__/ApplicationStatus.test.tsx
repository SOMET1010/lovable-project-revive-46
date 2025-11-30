// Tests unitaires pour les composants de gestion des statuts de candidatures
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ApplicationStatus,
  StatusWorkflow,
  StatusActions,
  StatusHistory,
  StatusBadge,
  ApplicationStatusType,
  UserRole
} from './index';

// Données de test
const mockApplication = {
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
      status: 'en_attente' as ApplicationStatusType,
      changedAt: new Date('2025-11-25T10:30:00'),
      changedBy: 'candidat_jean_dupont',
      comment: 'Candidature soumise'
    },
    {
      id: 'change_2',
      status: 'en_cours' as ApplicationStatusType,
      changedAt: new Date('2025-11-26T09:15:00'),
      changedBy: 'proprietaire_marie_martin',
      comment: 'Examen démarré'
    }
  ]
};

describe('StatusBadge', () => {
  test('affiche le bon label pour chaque statut', () => {
    render(<StatusBadge status="en_attente" />);
    expect(screen.getByText('En attente')).toBeInTheDocument();

    render(<StatusBadge status="acceptee" />);
    expect(screen.getByText('Acceptée')).toBeInTheDocument();
  });

  test('affiche l\'icône par défaut', () => {
    render(<StatusBadge status="en_cours" />);
    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  test('peut masquer l\'icône', () => {
    render(<StatusBadge status="en_cours" showIcon={false} />);
    expect(screen.queryByText('🔄')).not.toBeInTheDocument();
  });

  test('respecte les différentes tailles', () => {
    const { rerender } = render(<StatusBadge status="en_cours" size="sm" />);
    let badge = screen.getByText('En cours').closest('span');
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');

    rerender(<StatusBadge status="en_cours" size="lg" />);
    badge = screen.getByText('En cours').closest('span');
    expect(badge).toHaveClass('px-4', 'py-2', 'text-base');
  });
});

describe('ApplicationStatus', () => {
  test('affiche le statut actuel', () => {
    render(<ApplicationStatus application={mockApplication} />);
    expect(screen.getByText('En cours')).toBeInTheDocument();
  });

  test('affiche la description du statut', () => {
    render(<ApplicationStatus application={mockApplication} showDescription={true} />);
    expect(screen.getByText(/En cours d'examen par le propriétaire/)).toBeInTheDocument();
  });

  test('affiche la progression si définie', () => {
    render(<ApplicationStatus application={mockApplication} />);
    expect(screen.getByText('2 / 4')).toBeInTheDocument();
  });

  test('affiche l\'historique si demandé', () => {
    render(<ApplicationStatus application={mockApplication} showHistory={true} />);
    expect(screen.getByText('Historique des changements')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  test('appelle le callback au clic sur détails', () => {
    const onStatusClick = jest.fn();
    render(
      <ApplicationStatus 
        application={mockApplication} 
        onStatusClick={onStatusClick}
      />
    );

    fireEvent.click(screen.getByText('Détails'));
    expect(onStatusClick).toHaveBeenCalledWith('en_cours');
  });
});

describe('StatusWorkflow', () => {
  test('affiche toutes les étapes du workflow', () => {
    render(<StatusWorkflow currentStatus="en_cours" />);
    
    expect(screen.getByText('En attente')).toBeInTheDocument();
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('Acceptée')).toBeInTheDocument();
  });

  test('met en évidence l\'étape actuelle', () => {
    render(<StatusWorkflow currentStatus="en_cours" />);
    
    const currentStep = screen.getByText('En cours').closest('div');
    expect(currentStep).toHaveClass('shadow-lg', 'scale-110');
  });

  test('marque les étapes complétées', () => {
    render(
      <StatusWorkflow 
        currentStatus="en_cours" 
        completedStatuses={['en_attente']} 
      />
    );
    
    const completedStep = screen.getByText('En attente').closest('div');
    expect(completedStep).toHaveClass('opacity-75');
  });

  test('affiche la progression en pourcentage', () => {
    render(<StatusWorkflow currentStatus="en_cours" />);
    expect(screen.getByText(/67%/)).toBeInTheDocument();
  });
});

describe('StatusActions', () => {
  const mockOnStatusChange = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('affiche les actions selon le rôle propriétaire', () => {
    render(
      <StatusActions
        application={mockApplication}
        userRole="proprietaire"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Accepter la candidature')).toBeInTheDocument();
    expect(screen.getByText('Refuser la candidature')).toBeInTheDocument();
  });

  test('affiche les actions selon le rôle candidat', () => {
    render(
      <StatusActions
        application={mockApplication}
        userRole="candidat"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Annuler ma candidature')).toBeInTheDocument();
  });

  test('appelle la fonction au clic sur action', () => {
    render(
      <StatusActions
        application={mockApplication}
        userRole="proprietaire"
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByText('Accepter la candidature'));
    expect(mockOnStatusChange).toHaveBeenCalledWith('acceptee', undefined, undefined);
  });

  test('affiche une confirmation pour les actions critiques', () => {
    render(
      <StatusActions
        application={mockApplication}
        userRole="proprietaire"
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByText('Refuser la candidature'));
    
    expect(screen.getByText('Confirmer le changement de statut')).toBeInTheDocument();
    expect(screen.getByLabelText('Motif (obligatoire)')).toBeInTheDocument();
  });

  test('demande un motif pour refuser une candidature', async () => {
    render(
      <StatusActions
        application={mockApplication}
        userRole="proprietaire"
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByText('Refuser la candidature'));
    
    const reasonSelect = screen.getByLabelText('Motif (obligatoire)');
    fireEvent.change(reasonSelect, { target: { value: 'profil_incompatible' } });
    
    const confirmButton = screen.getByText('Confirmer');
    expect(confirmButton).not.toBeDisabled();
    
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(
        'refusee', 
        'profil_incompatible', 
        undefined
      );
    });
  });
});

describe('StatusHistory', () => {
  test('affiche l\'historique trié par date décroissante', () => {
    render(<StatusHistory history={mockApplication.statusHistory} />);
    
    const changes = screen.getAllByRole('listitem');
    expect(changes[0]).toHaveTextContent('En cours'); // Plus récent
    expect(changes[1]).toHaveTextContent('En attente'); // Plus ancien
  });

  test('permet de filtrer par statut', () => {
    render(
      <StatusHistory 
        history={mockApplication.statusHistory} 
        showFilters={true} 
      />
    );

    const filterSelect = screen.getByLabelText('Filtrer :');
    fireEvent.change(filterSelect, { target: { value: 'en_attente' } });
    
    expect(screen.getByText('En attente')).toBeInTheDocument();
    expect(screen.queryByText('En cours')).not.toBeInTheDocument();
  });

  test('limite le nombre d\'éléments affichés', () => {
    const manyChanges = Array.from({ length: 15 }, (_, i) => ({
      id: `change_${i}`,
      status: 'en_attente' as ApplicationStatusType,
      changedAt: new Date(2025, 10, 25, 10, 30 - i),
      changedBy: `user_${i}`,
      comment: `Changement ${i}`
    }));

    render(<StatusHistory history={manyChanges} maxVisibleItems={5} />);
    
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Voir 10 changement supplémentaire')).toBeInTheDocument();
  });

  test('permet d\'étendre la liste', () => {
    const manyChanges = Array.from({ length: 15 }, (_, i) => ({
      id: `change_${i}`,
      status: 'en_attente' as ApplicationStatusType,
      changedAt: new Date(2025, 10, 25, 10, 30 - i),
      changedBy: `user_${i}`,
      comment: `Changement ${i}`
    }));

    render(<StatusHistory history={manyChanges} maxVisibleItems={5} />);
    
    fireEvent.click(screen.getByText('Voir 10 changement supplémentaire'));
    
    expect(screen.getAllByRole('listitem')).toHaveLength(15);
    expect(screen.getByText('Réduire')).toBeInTheDocument();
  });

  test('affiche un message si aucun historique', () => {
    render(<StatusHistory history={[]} />);
    expect(screen.getByText('Aucun historique de statut disponible')).toBeInTheDocument();
  });
});

// Tests d'accessibilité
describe('Accessibilité', () => {
  test('StatusBadge a les attributs ARIA appropriés', () => {
    render(<StatusBadge status="en_cours" />);
    const badge = screen.getByText('En cours').closest('span');
    expect(badge).toHaveAttribute('aria-label', 'Statut: En cours');
  });

  test('StatusActions utilise les boutons sémantiques', () => {
    render(
      <StatusActions
        application={mockApplication}
        userRole="proprietaire"
        onStatusChange={jest.fn()}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('StatusHistory utilise les listes sémantiques', () => {
    render(<StatusHistory history={mockApplication.statusHistory} />);
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(mockApplication.statusHistory.length);
  });
});

// Tests de performance
describe('Performance', () => {
  test('ne re-rend pas inutilement avec les mêmes props', () => {
    const { rerender } = render(<StatusBadge status="en_cours" />);
    const badge = screen.getByText('En cours');
    
    rerender(<StatusBadge status="en_cours" />);
    
    expect(screen.getByText('En cours')).toBe(badge);
  });

  test('StatusWorkflow gère bien les grands historiques', () => {
    const largeHistory = Array.from({ length: 100 }, (_, i) => ({
      id: `change_${i}`,
      status: 'en_attente' as ApplicationStatusType,
      changedAt: new Date(2025, 10, 25, 10, 30 - i),
      changedBy: `user_${i}`
    }));

    const startTime = performance.now();
    render(<StatusHistory history={largeHistory} maxVisibleItems={10} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Moins de 100ms
  });
});

// Tests d'intégration
describe('Intégration', () => {
  test('tous les composants fonctionnent ensemble', () => {
    const handleStatusChange = jest.fn();
    
    render(
      <div>
        <StatusBadge status={mockApplication.status} />
        <ApplicationStatus application={mockApplication} />
        <StatusWorkflow currentStatus={mockApplication.status} />
        <StatusActions
          application={mockApplication}
          userRole="proprietaire"
          onStatusChange={handleStatusChange}
        />
        <StatusHistory history={mockApplication.statusHistory} />
      </div>
    );

    // Vérifier que tous les éléments sont présents
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('Workflow de Candidature')).toBeInTheDocument();
    expect(screen.getByText('Actions disponibles')).toBeInTheDocument();
    expect(screen.getByText('Historique des statuts')).toBeInTheDocument();
  });
});

// Export pour les tests
export {
  mockApplication
};