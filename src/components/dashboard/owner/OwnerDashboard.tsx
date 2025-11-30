import React, { useState } from 'react';
import { 
  Building, 
  Calendar, 
  FileText, 
  Home, 
  Users,
  DollarSign,
  Wrench,
  Bell,
  Settings,
  User,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin
} from 'lucide-react';

import OwnerSidebar from './OwnerSidebar';
import OwnerHeader from './OwnerHeader';
import OwnerPropertiesSection from './sections/OwnerPropertiesSection';
import OwnerTenantsSection from './sections/OwnerTenantsSection';
import OwnerFinancesSection from './sections/OwnerFinancesSection';
import OwnerMaintenanceSection from './sections/OwnerMaintenanceSection';

interface OwnerDashboardProps {
  userName?: string;
  userAvatar?: string;
  ownerLevel?: 'particulier' | 'professionnel' | 'expert';
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  userName = "Marie DUPONT",
  userAvatar = "/images/owner-avatar.jpg",
  ownerLevel = "professionnel"
}) => {
  const [activeSection, setActiveSection] = useState<string>('properties');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Données mock réalistes pour les propriétaires
  const dashboardData = {
    stats: {
      totalProperties: 8,
      occupiedProperties: 6,
      vacantProperties: 1,
      maintenanceProperties: 1,
      occupancyRate: 75,
      monthlyRevenue: 2850000,
      averageRent: 475000,
      monthlyExpenses: 325000,
      yearlyGrowth: '+8.5%'
    },
    notifications: [
      {
        id: 1,
        type: 'payment',
        title: 'Loyer reçu',
        message: 'Villa Cocody - Paiement de 450 000 FCFA reçu',
        time: '5 min',
        priority: 'high'
      },
      {
        id: 2,
        type: 'maintenance',
        title: 'Demande de maintenance',
        message: 'Appartement Riviera - Réparation plomberie',
        time: '30 min',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'tenant',
        title: 'Nouveau candidat',
        message: 'Villa Bellevue - 3 candidatures reçues',
        time: '1h',
        priority: 'medium'
      },
      {
        id: 4,
        type: 'vacant',
        title: 'Propriété vacante',
        message: 'Studio Plateau - Relance candidats nécessaire',
        time: '2h',
        priority: 'high'
      }
    ]
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'properties':
        return <OwnerPropertiesSection />;
      case 'tenants':
        return <OwnerTenantsSection />;
      case 'finances':
        return <OwnerFinancesSection />;
      case 'maintenance':
        return <OwnerMaintenanceSection />;
      default:
        return <OwnerPropertiesSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <OwnerHeader 
        userName={userName}
        userAvatar={userAvatar}
        ownerLevel={ownerLevel}
        notifications={dashboardData.notifications}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <OwnerSidebar 
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
              <Home className="w-4 h-4" />
              <span>Mon Toit</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-neutral-900 font-medium">
                Dashboard Propriétaire
              </span>
            </nav>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Building className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Propriétés</p>
                    <p className="text-lg font-bold text-neutral-900">8</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="w-5 h-5 text-semantic-success" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Occupées</p>
                    <p className="text-lg font-bold text-neutral-900">6</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-semantic-info" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Revenus</p>
                    <p className="text-lg font-bold text-neutral-900">2.8M</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-semantic-warning" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Taux d'occupation</p>
                    <p className="text-lg font-bold text-neutral-900">75%</p>
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

export default OwnerDashboard;