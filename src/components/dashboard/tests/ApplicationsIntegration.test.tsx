/**
 * Tests unitaires pour l'intégration des candidatures
 * 
 * Ces tests vérifient que les composants fonctionnent correctement
 * dans différents contextes et avec différentes configurations.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  ApplicationCard, 
  ApplicationFilters, 
  ApplicationStats 
} from '../shared';
import { TenantApplicationsSection } from '../tenant';
import { OwnerApplicationsSection } from '../owner/sections';
import { AgencyApplicationsSection } from '../agency/sections';

// Mock des données de test
const mockApplication = {
  id: 1,
  propertyId: 101,
  propertyTitle: "Villa Test Cocody",
  propertyAddress: "Cocody, Riviera Golf",
  propertyType: "villa" as const,
  propertyRent: 450000,
  applicantName: "Jean Test",
  applicantEmail: "jean.test@email.com",
  applicantPhone: "+225 07 00 00 01",
  applicantAge: 30,
  applicantIncome: 800000,
  applicationDate: "2025-11-28",
  status: "en_attente" as const,
  documentsStatus: "complet" as const,
  message: "Candidature de test",
  priority: "normale" as const,
  lastUpdate: "2025-11-29",
  creditScore: 85,
  employmentType: "CDI",
  references: 2,
  files: [
    { id: 'doc1', name: 'test.pdf', type: 'pdf', size: 1000000, url: '/test.pdf' }
  ]
};

const mockStats = {
  total: 10,
  pending: 3,
  inProgress: 2,
  accepted: 4,
  rejected: 1,
  withIncompleteDocs: 2,
  withCompleteDocs: 6,
  underReview: 2,
  conversionRate: 40,
  recentActivity: [
    { date: '2025-11-29', count: 2, type: 'Test activity' }
  ]
};

const mockFilters = {
  search: '',
  status: 'all',
  documentsStatus: 'all',
  priority: 'all',
  propertyType: 'all',
  propertyAddress: '',
  dateRange: { from: '', to: '' },
  priceRange: { min: '', max: '' },
  hasVisited: null,
  creditScoreRange: { min: '', max: '' },
  sortBy: 'applicationDate',
  sortOrder: 'desc' as const
};

describe('ApplicationCard', () => {
  it('affiche correctement les informations de base', () => {
    render(
      <ApplicationCard
        application={mockApplication}
        role="owner"
      />
    );

    expect(screen.getByText('Villa Test Cocody')).toBeInTheDocument();
    expect(screen.getByText('Jean Test')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
    expect(screen.getByText('Complet')).toBeInTheDocument();
  });

  it('affiche les actions pour le rôle owner', () => {
    const mockOnViewDetails = jest.fn();
    const mockOnContact = jest.fn();

    render(
      <ApplicationCard
        application={mockApplication}
        role="owner"
        onViewDetails={mockOnViewDetails}
        onContact={mockOnContact}
      />
    );

    expect(screen.getByText('Voir')).toBeInTheDocument();
    expect(screen.getByText('Contacter')).toBeInTheDocument();
    expect(screen.getByText('Accepter')).toBeInTheDocument();
    expect(screen.getByText('Refuser')).toBeInTheDocument();
  });

  it('affiche les actions pour le rôle tenant', () => {
    render(
      <ApplicationCard
        application={mockApplication}
        role="tenant"
      />
    );

    expect(screen.getByText('Détails')).toBeInTheDocument();
    expect(screen.getByText('Suivi')).toBeInTheDocument();
  });

  it('gère la sélection en masse', () => {
    const mockOnSelect = jest.fn();

    render(
      <ApplicationCard
        application={mockApplication}
        role="owner"
        onSelect={mockOnSelect}
        showBulkActions={true}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnSelect).toHaveBeenCalledWith(mockApplication.id, true);
  });
});

describe('ApplicationFilters', () => {
  it('affiche tous les filtres de base', () => {
    const mockOnFiltersChange = jest.fn();

    render(
      <ApplicationFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        role="owner"
      />
    );

    expect(screen.getByLabelText(/statut/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/documents/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priorité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type de propriété/i)).toBeInTheDocument();
  });

  it('met à jour les filtres quand la recherche change', () => {
    const mockOnFiltersChange = jest.fn();

    render(
      <ApplicationFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        role="owner"
      />
    );

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('affiche les options spécifiques pour les owners', () => {
    render(
      <ApplicationFilters
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        role="owner"
        propertyOptions={[
          { value: 'prop1', label: 'Test Property' }
        ]}
      />
    );

    expect(screen.getByText('Propriété')).toBeInTheDocument();
  });

  it('affiche les boutons d\'export/import pour les owners', () => {
    const mockOnExport = jest.fn();
    const mockOnImport = jest.fn();

    render(
      <ApplicationFilters
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        role="owner"
        onExport={mockOnExport}
        onImport={mockOnImport}
      />
    );

    expect(screen.getByText('Exporter')).toBeInTheDocument();
    expect(screen.getByText('Importer')).toBeInTheDocument();
  });

  it('masque les boutons d\'export/import pour les tenants', () => {
    render(
      <ApplicationFilters
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        role="tenant"
      />
    );

    expect(screen.queryByText('Exporter')).not.toBeInTheDocument();
    expect(screen.queryByText('Importer')).not.toBeInTheDocument();
  });
});

describe('ApplicationStats', () => {
  it('affiche les statistiques principales', () => {
    render(
      <ApplicationStats
        stats={mockStats}
        role="owner"
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument(); // Total
    expect(screen.getByText('3')).toBeInTheDocument(); // Pending
    expect(screen.getByText('4')).toBeInTheDocument(); // Accepted
    expect(screen.getByText('1')).toBeInTheDocument(); // Rejected
  });

  it('affiche les pourcentages de conversion', () => {
    render(
      <ApplicationStats
        stats={mockStats}
        role="owner"
      />
    );

    expect(screen.getByText('40.0%')).toBeInTheDocument(); // Conversion rate
  });

  it('affiche l\'activité récente', () => {
    render(
      <ApplicationStats
        stats={mockStats}
        role="owner"
      />
    );

    expect(screen.getByText('Activité récente')).toBeInTheDocument();
    expect(screen.getByText('Test activity')).toBeInTheDocument();
  });

  it('affiche les options de période', () => {
    const mockOnTimeFrameChange = jest.fn();

    render(
      <ApplicationStats
        stats={mockStats}
        role="owner"
        onTimeFrameChange={mockOnTimeFrameChange}
      />
    );

    expect(screen.getByText('Semaine')).toBeInTheDocument();
    expect(screen.getByText('Mois')).toBeInTheDocument();
    expect(screen.getByText('Trimestre')).toBeInTheDocument();
    expect(screen.getByText('Année')).toBeInTheDocument();
  });
});

describe('TenantApplicationsSection', () => {
  it('rend le composant sans erreur', () => {
    render(
      <TenantApplicationsSection
        tenantId={1}
        tenantName="Test Tenant"
      />
    );

    expect(screen.getByText('Mes Candidatures')).toBeInTheDocument();
  });

  it('affiche le bouton de création de candidature', () => {
    render(
      <TenantApplicationsSection
        tenantId={1}
        tenantName="Test Tenant"
      />
    );

    expect(screen.getByText('Nouvelle candidature')).toBeInTheDocument();
  });

  it('affiche les statistiques pour le tenant', () => {
    render(
      <TenantApplicationsSection
        tenantId={1}
        tenantName="Test Tenant"
      />
    );

    expect(screen.getByText('Total candidatures')).toBeInTheDocument();
  });
});

describe('OwnerApplicationsSection', () => {
  it('rend le composant sans erreur', () => {
    render(
      <OwnerApplicationsSection
        ownerId={1}
        ownerName="Test Owner"
      />
    );

    expect(screen.getByText('Candidatures Reçues')).toBeInTheDocument();
  });

  it('affiche les actions en masse', () => {
    render(
      <OwnerApplicationsSection
        ownerId={1}
        ownerName="Test Owner"
      />
    );

    expect(screen.getByText('Exporter')).toBeInTheDocument();
    expect(screen.getByText('Importer')).toBeInTheDocument();
  });

  it('affiche les filtres avancés', () => {
    render(
      <OwnerApplicationsSection
        ownerId={1}
        ownerName="Test Owner"
      />
    );

    expect(screen.getByText('Filtres')).toBeInTheDocument();
  });
});

describe('AgencyApplicationsSection', () => {
  it('rend le composant sans erreur', () => {
    render(
      <AgencyApplicationsSection
        agencyId={1}
        agencyName="Test Agency"
      />
    );

    expect(screen.getByText('Gestion des Candidatures')).toBeInTheDocument();
  });

  it('affiche les statistiques par agent', () => {
    render(
      <AgencyApplicationsSection
        agencyId={1}
        agencyName="Test Agency"
      />
    );

    expect(screen.getByText('Performance par agent')).toBeInTheDocument();
  });

  it('affiche les actions rapides', () => {
    render(
      <AgencyApplicationsSection
        agencyId={1}
        agencyName="Test Agency"
      />
    );

    expect(screen.getByText('Actions rapides')).toBeInTheDocument();
    expect(screen.getByText('Assigner agent')).toBeInTheDocument();
    expect(screen.getByText('Validation lot')).toBeInTheDocument();
  });

  it('affiche le filtre par agent', () => {
    render(
      <AgencyApplicationsSection
        agencyId={1}
        agencyName="Test Agency"
      />
    );

    expect(screen.getByText('Filtrer par agent:')).toBeInTheDocument();
  });
});

// Test d'intégration - vérification que tous les composants se chargent
describe('Integration Tests', () => {
  it('charge tous les composants sans erreur', () => {
    // Ce test vérifie que l'import de tous les composants principaux fonctionne
    expect(() => {
      require('../shared');
      require('../tenant');
      require('../owner/sections');
      require('../agency/sections');
    }).not.toThrow();
  });

  it('expose toutes les interfaces TypeScript', () => {
    // Ce test vérifie que les types sont correctement définis
    const { Application, FilterOptions, ApplicationStats } = require('../types');
    
    expect(Application).toBeDefined();
    expect(FilterOptions).toBeDefined();
    expect(ApplicationStats).toBeDefined();
  });
});

// Tests de performance
describe('Performance Tests', () => {
  it('rend les composants avec un grand nombre d\'applications rapidement', () => {
    const manyApplications = Array.from({ length: 100 }, (_, i) => ({
      ...mockApplication,
      id: i + 1,
      propertyTitle: `Property ${i + 1}`
    }));

    const startTime = performance.now();
    
    // Simuler le rendu avec de nombreuses applications
    const { container } = render(
      <div>
        {manyApplications.map(app => (
          <ApplicationCard
            key={app.id}
            application={app}
            role="owner"
          />
        ))}
      </div>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Le rendu ne devrait pas prendre plus de 100ms pour 100 éléments
    expect(renderTime).toBeLessThan(100);
    expect(container.children.length).toBe(100);
  });
});

// Tests d'accessibilité
describe('Accessibility Tests', () => {
  it('affiche des éléments avec les bons attributs ARIA', () => {
    render(
      <ApplicationCard
        application={mockApplication}
        role="owner"
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('title');
    });
  });

  it('gère correctement le focus clavier', () => {
    render(
      <ApplicationFilters
        filters={mockFilters}
        onFiltersChange={jest.fn()}
        role="owner"
      />
    );

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    searchInput.focus();
    expect(searchInput).toHaveFocus();
  });
});