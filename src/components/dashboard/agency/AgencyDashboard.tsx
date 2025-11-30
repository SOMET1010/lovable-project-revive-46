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
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgencyDashboard;