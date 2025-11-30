<<<<<<< HEAD
import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  TrendingUp, 
  Award, 
  Bell,
  Settings,
  User,
  ChevronRight,
  Calendar,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';

import AgencySidebar from './AgencySidebar';
import AgencyHeader from './AgencyHeader';
import AgencyPropertiesSection from './sections/AgencyPropertiesSection';
import AgencyClientsSection from './sections/AgencyClientsSection';
import AgencyTransactionsSection from './sections/AgencyTransactionsSection';
import AgencyTeamSection from './sections/AgencyTeamSection';
import AgencyApplicationsSection from './sections/AgencyApplicationsSection';

interface AgencyDashboardProps {
  agencyName?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: 'director' | 'manager' | 'agent';
}

const AgencyDashboard: React.FC<AgencyDashboardProps> = ({
  agencyName = "Immobilier Premium Abidjan",
  userName = "Marie KOUASSI",
  userAvatar = "/images/agency-manager.jpg",
  userRole = "manager"
}) => {
  const [activeSection, setActiveSection] = useState<string>('properties');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Données mock réalistes pour l'agence
  const dashboardData = {
    stats: {
      totalProperties: 245,
      activeListings: 189,
      completedTransactions: 56,
      monthlyRevenue: 18500000,
      conversionRate: 24.5,
      averageCommission: 850000,
      newClients: 12,
      clientRetention: 87,
      teamPerformance: 94,
      marketShare: 12.8
    },
    notifications: [
      {
        id: 1,
        type: 'property',
        title: 'Nouvelle propriété ajoutée',
        message: 'Villa Cocody - 6 pièces, 450M F CFA',
        time: '10 min',
        priority: 'high'
      },
      {
        id: 2,
        type: 'transaction',
        title: 'Transaction validée',
        message: 'Vente Appart Riviera - Commission 1.2M F',
        time: '1h',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'client',
        title: 'Nouveau client inscrit',
        message: 'M. BAKAYOKO recherche 3 pièces Plateau',
        time: '2h',
        priority: 'low'
      },
      {
        id: 4,
        type: 'team',
        title: 'Objectif mensuel atteint',
        message: 'L\'équipe d\'A. TRAORE dépasse ses objectifs',
        time: '4h',
        priority: 'high'
      }
    ]
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'properties':
        return <AgencyPropertiesSection agencyName={agencyName} />;
      case 'applications':
        return <AgencyApplicationsSection agencyId={1} agencyName={agencyName} />;
      case 'clients':
        return <AgencyClientsSection />;
      case 'transactions':
        return <AgencyTransactionsSection />;
      case 'team':
        return <AgencyTeamSection />;
      default:
        return <AgencyPropertiesSection agencyName={agencyName} />;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      director: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800', 
      agent: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      director: 'Directeur',
      manager: 'Responsable',
      agent: 'Agent'
    };

    return {
      style: styles[role as keyof typeof styles],
      label: labels[role as keyof typeof labels]
    };
  };

  const roleInfo = getRoleBadge(userRole);

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <AgencyHeader 
        agencyName={agencyName}
        userName={userName}
        userAvatar={userAvatar}
        userRole={userRole}
        roleInfo={roleInfo}
        notifications={dashboardData.notifications}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <AgencySidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-neutral-700 mb-8">
              <Building className="w-4 h-4" />
              <span>Agence {agencyName}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-neutral-900 font-medium">
                Dashboard Direction
              </span>
            </nav>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Building className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Propriétés</p>
                    <p className="text-lg font-bold text-neutral-900">{dashboardData.stats.totalProperties}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="w-5 h-5 text-semantic-success" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Actifs</p>
                    <p className="text-lg font-bold text-neutral-900">{dashboardData.stats.activeListings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-semantic-info" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Ventes</p>
                    <p className="text-lg font-bold text-neutral-900">{dashboardData.stats.completedTransactions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Revenus</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {(dashboardData.stats.monthlyRevenue / 1000000).toFixed(1)}M F
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Target className="w-5 h-5 text-semantic-warning" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Conversion</p>
                    <p className="text-lg font-bold text-neutral-900">{dashboardData.stats.conversionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Section Content */}
            {renderActiveSection()}
=======
/**
 * Agency Dashboard - Modern Minimalism Premium
 * Refonte complète pour les agences immobilières
 */

import { useState, useEffect } from 'react';
import { AgencyHeader } from './AgencyHeader';
import { AgencySidebar } from './AgencySidebar';
import { AgencyStatsSection } from './sections/AgencyStatsSection';
import { AgencyPropertiesSection } from './sections/AgencyPropertiesSection';
import { AgencyClientsSection } from './sections/AgencyClientsSection';
import { AgencyTeamSection } from './sections/AgencyTeamSection';
import { AgencySalesSection } from './sections/AgencySalesSection';

// Types pour les données du dashboard d'agence
export interface AgencyDashboardData {
  agency: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    logo?: string;
    description: string;
    rating: number;
    totalReviews: number;
  };
  stats: {
    totalProperties: number;
    activeMandates: number;
    monthlyRevenue: number;
    clientSatisfaction: number;
    monthlyGrowth: {
      properties: number;
      mandates: number;
      revenue: number;
      satisfaction: number;
    };
  };
  team: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    photo?: string;
    specialty: string;
    performance: number;
    propertiesCount: number;
    status: 'actif' | 'en_vacances' | 'inactif';
  }>;
  properties: Array<{
    id: string;
    title: string;
    type: 'vente' | 'location';
    price: number;
    city: string;
    status: 'disponible' | 'vendu' | 'loue' | 'suspendu';
    views: number;
    image: string;
    agentId: string;
    createdAt: string;
  }>;
  clients: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'acheteur' | 'locataire';
    status: 'prospect' | 'actif' | 'inactif';
    budget?: number;
    preferences?: string;
    lastContact?: string;
  }>;
  sales: Array<{
    id: string;
    clientName: string;
    propertyTitle: string;
    amount: number;
    commission: number;
    date: string;
    status: 'en_cours' | 'finalise' | 'annule';
    agentId: string;
  }>;
}

export function AgencyDashboard() {
  const [dashboardData, setDashboardData] = useState<AgencyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockData: AgencyDashboardData = {
        agency: {
          id: '1',
          name: 'MonToit Premium Immobilier',
          email: 'contact@montoit-pro.com',
          phone: '+225 07 12 34 56 78',
          address: 'Boulevard Lagunaire, Cocody, Abidjan',
          description: 'Votre partenaire immobilier de confiance depuis 2015',
          rating: 4.8,
          totalReviews: 124,
        },
        stats: {
          totalProperties: 45,
          activeMandates: 28,
          monthlyRevenue: 1200000,
          clientSatisfaction: 92,
          monthlyGrowth: {
            properties: 12,
            mandates: 8,
            revenue: 15,
            satisfaction: 3,
          },
        },
        team: [
          {
            id: '1',
            name: 'Marie Kouadio',
            role: 'Directrice',
            email: 'marie.kouadio@montoit-pro.com',
            phone: '+225 07 11 22 33 44',
            specialty: 'Villas haut de gamme',
            performance: 95,
            propertiesCount: 12,
            status: 'actif',
          },
          {
            id: '2',
            name: 'Jean-Baptiste Assi',
            role: 'Agent Senior',
            email: 'jb.assi@montoit-pro.com',
            phone: '+225 07 22 33 44 55',
            specialty: 'Appartements & Studios',
            performance: 88,
            propertiesCount: 15,
            status: 'actif',
          },
          {
            id: '3',
            name: 'Fatou Camara',
            role: 'Agent Commercial',
            email: 'fatou.camara@montoit-pro.com',
            phone: '+225 07 33 44 55 66',
            specialty: 'Locations meublées',
            performance: 92,
            propertiesCount: 8,
            status: 'actif',
          },
          {
            id: '4',
            name: 'Paul Yacé',
            role: 'Agent Junior',
            email: 'paul.yace@montoit-pro.com',
            phone: '+225 07 44 55 66 77',
            specialty: 'Maisons familiales',
            performance: 76,
            propertiesCount: 6,
            status: 'en_vacances',
          },
          {
            id: '5',
            name: 'Aïcha Traoré',
            role: 'Responsable Locative',
            email: 'aicha.traore@montoit-pro.com',
            phone: '+225 07 55 66 77 88',
            specialty: 'Gestion locative',
            performance: 90,
            propertiesCount: 4,
            status: 'actif',
          },
        ],
        properties: [
          {
            id: '1',
            title: 'Villa moderne 5 pièces Cocody',
            type: 'vente',
            price: 85000000,
            city: 'Cocody',
            status: 'disponible',
            views: 127,
            image: '/images/villa-cocody-1.jpg',
            agentId: '1',
            createdAt: '2025-11-15',
          },
          {
            id: '2',
            title: 'Appartement 3 pièces Riviera',
            type: 'location',
            price: 180000,
            city: 'Riviera',
            status: 'disponible',
            views: 89,
            image: '/images/appartement-riviera-1.jpg',
            agentId: '2',
            createdAt: '2025-11-20',
          },
          {
            id: '3',
            title: 'Studio meublé Plateau',
            type: 'location',
            price: 120000,
            city: 'Plateau',
            status: 'vendu',
            views: 156,
            image: '/images/studio-plateau-1.jpg',
            agentId: '3',
            createdAt: '2025-11-10',
          },
          // Ajout de données mock supplémentaires pour atteindre 45 propriétés
          ...Array.from({ length: 42 }, (_, i) => ({
            id: `prop-${i + 4}`,
            title: `Propriété ${i + 4} ${['Villas', 'Appartements', 'Studios', 'Bureaux'][i % 4]} ${['Cocody', 'Plateau', 'Riviera', 'Yopougon'][i % 4]}`,
            type: (['vente', 'location'] as const)[i % 2],
            price: 50000000 + (i * 2000000),
            city: ['Cocody', 'Plateau', 'Riviera', 'Yopougon'][i % 4],
            status: (['disponible', 'vendu', 'loue', 'suspendu'] as const)[i % 4],
            views: 50 + (i * 3),
            image: `/images/property-${i + 4}.jpg`,
            agentId: `${(i % 5) + 1}`,
            createdAt: `2025-11-${String(1 + (i % 30)).padStart(2, '0')}`,
          })),
        ],
        clients: [
          {
            id: '1',
            name: 'Michel Kouassi',
            email: 'michel.kouassi@email.com',
            phone: '+225 05 11 22 33 44',
            type: 'acheteur',
            status: 'prospect',
            budget: 50000000,
            preferences: 'Villa 4-5 pièces, Cocody',
            lastContact: '2025-11-28',
          },
          {
            id: '2',
            name: 'Sarah Diabaté',
            email: 'sarah.diabate@email.com',
            phone: '+225 07 22 33 44 55',
            type: 'locataire',
            status: 'actif',
            budget: 200000,
            preferences: 'Appartement 2 pièces meublé',
            lastContact: '2025-11-25',
          },
          // Ajout de données mock supplémentaires pour atteindre 28 clients
          ...Array.from({ length: 26 }, (_, i) => ({
            id: `client-${i + 3}`,
            name: `Client ${i + 3}`,
            email: `client${i + 3}@email.com`,
            phone: `+225 07 ${String(33 + i).padStart(2, '0')} ${String(44 + (i % 10)).padStart(2, '0')} ${String(55 + (i % 20)).padStart(2, '0')}`,
            type: (['acheteur', 'locataire'] as const)[i % 2],
            status: (['prospect', 'actif', 'inactif'] as const)[i % 3],
            budget: 50000000 + (i * 5000000),
            preferences: [`Appartement ${2 + (i % 3)} pièces`, `Villa ${3 + (i % 4)} pièces`, `Studio meublé`][i % 3],
            lastContact: `2025-11-${String(20 + (i % 10)).padStart(2, '0')}`,
          })),
        ],
        sales: [
          {
            id: '1',
            clientName: 'Robert N\'Guessan',
            propertyTitle: 'Villa Cocody Riviera',
            amount: 75000000,
            commission: 3750000,
            date: '2025-11-25',
            status: 'finalise',
            agentId: '1',
          },
          {
            id: '2',
            clientName: 'Aminata Touré',
            propertyTitle: 'Appartement Yopougon',
            amount: 65000000,
            commission: 3250000,
            date: '2025-11-20',
            status: 'en_cours',
            agentId: '2',
          },
          // Ajout de données mock supplémentaires
          ...Array.from({ length: 15 }, (_, i) => ({
            id: `sale-${i + 3}`,
            clientName: `Acheteur ${i + 3}`,
            propertyTitle: `Propriété ${i + 3}`,
            amount: 40000000 + (i * 5000000),
            commission: (40000000 + (i * 5000000)) * 0.05,
            date: `2025-11-${String(10 + (i * 3)).padStart(2, '0')}`,
            status: (['en_cours', 'finalise', 'annule'] as const)[i % 3],
            agentId: `${(i % 5) + 1}`,
          })),
        ],
      };
      
      setDashboardData(mockData);
    } catch (err) {
      setError('Erreur lors du chargement du dashboard de l\'agence');
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Chargement du dashboard agence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-background-page p-8 rounded-2xl shadow-elevated max-w-md text-center">
          <div className="text-semantic-error mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-h4 font-bold text-text-primary mb-3">Erreur de chargement</h3>
          <p className="text-body text-text-secondary mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="btn-primary w-full"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header fixe */}
      <AgencyHeader 
        agency={dashboardData?.agency}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex">
        {/* Sidebar fixe */}
        <AgencySidebar 
          collapsed={sidebarCollapsed}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Contenu principal */}
        <main className={`
          flex-1 transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
          pt-16 min-h-screen
        `}>
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Section statistiques toujours visible */}
              <AgencyStatsSection 
                stats={dashboardData?.stats}
                loading={loading}
              />

              {/* Navigation des sections */}
              <div className="flex flex-wrap gap-2 p-2 bg-background-page rounded-xl border border-neutral-100">
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
                  { id: 'properties', label: 'Propriétés', icon: '🏠' },
                  { id: 'clients', label: 'Clients', icon: '👥' },
                  { id: 'team', label: 'Équipe', icon: '👨‍💼' },
                  { id: 'sales', label: 'Ventes', icon: '💰' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${activeSection === section.id 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-text-secondary hover:bg-neutral-100'
                      }
                    `}
                  >
                    <span className="text-sm">{section.icon}</span>
                    <span className="hidden sm:inline">{section.label}</span>
                  </button>
                ))}
              </div>

              {/* Contenu des sections */}
              {activeSection === 'overview' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <AgencyPropertiesSection 
                    properties={dashboardData?.properties.slice(0, 6) || []}
                    showHeader={true}
                  />
                  <AgencySalesSection 
                    sales={dashboardData?.sales.slice(0, 6) || []}
                    showHeader={true}
                  />
                </div>
              )}

              {activeSection === 'properties' && (
                <AgencyPropertiesSection 
                  properties={dashboardData?.properties || []}
                />
              )}

              {activeSection === 'clients' && (
                <AgencyClientsSection 
                  clients={dashboardData?.clients || []}
                />
              )}

              {activeSection === 'team' && (
                <AgencyTeamSection 
                  team={dashboardData?.team || []}
                />
              )}

              {activeSection === 'sales' && (
                <AgencySalesSection 
                  sales={dashboardData?.sales || []}
                />
              )}
            </div>
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
          </div>
        </main>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default AgencyDashboard;
=======
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
