// Tests unitaires pour les composants Agency Dashboard
import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  AgencyDashboard,
  AgencyHeader,
  AgencySidebar,
  AgencyPropertiesSection,
  AgencyClientsSection,
  AgencyTransactionsSection,
  AgencyTeamSection
} from '@/components/dashboard/agency';

describe('Agency Dashboard Components', () => {
  const mockProps = {
    agencyName: 'Test Immobilier',
    userName: 'Test User',
    userRole: 'manager' as const
  };

  test('AgencyDashboard renders correctly', () => {
    render(<AgencyDashboard {...mockProps} />);
    expect(screen.getByText('Test Immobilier')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Direction')).toBeInTheDocument();
  });

  test('AgencyHeader displays correctly', () => {
    const mockNotifications = [
      {
        id: 1,
        type: 'property',
        title: 'Test notification',
        message: 'Test message',
        time: '1 min',
        priority: 'high' as const
      }
    ];

    render(
      <AgencyHeader 
        agencyName="Test Agency"
        userName="Test User"
        notifications={mockNotifications}
        onMenuClick={jest.fn()}
        roleInfo={{ style: 'test-style', label: 'Test Role' }}
      />
    );

    expect(screen.getByText('Test Agency')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('AgencySidebar navigation works', () => {
    const mockOnSectionChange = jest.fn();
    
    render(
      <AgencySidebar 
        activeSection="properties"
        onSectionChange={mockOnSectionChange}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Équipe')).toBeInTheDocument();
  });

  test('AgencyPropertiesSection renders properties grid', () => {
    render(<AgencyPropertiesSection agencyName="Test Agency" />);
    expect(screen.getByText('Portfolio Propriétés')).toBeInTheDocument();
    expect(screen.getByText('Ajouter propriété')).toBeInTheDocument();
  });

  test('AgencyClientsSection renders client management', () => {
    render(<AgencyClientsSection />);
    expect(screen.getByText('Gestion des Clients')).toBeInTheDocument();
    expect(screen.getByText('Ajouter client')).toBeInTheDocument();
  });

  test('AgencyTransactionsSection renders transaction history', () => {
    render(<AgencyTransactionsSection />);
    expect(screen.getByText('Transactions & Commissions')).toBeInTheDocument();
    expect(screen.getByText('Nouvelle transaction')).toBeInTheDocument();
  });

  test('AgencyTeamSection renders team management', () => {
    render(<AgencyTeamSection />);
    expect(screen.getByText('Gestion de l\'Équipe')).toBeInTheDocument();
    expect(screen.getByText('Ajouter membre')).toBeInTheDocument();
  });
});

/*
Tests de performance et intégrations :
- Test du responsive design
- Test des interactions utilisateur
- Test des filtres et recherches
- Test des graphiques et métriques
- Test des exports de données
- Test des notifications en temps réel
*/