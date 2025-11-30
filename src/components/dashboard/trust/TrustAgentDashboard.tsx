import React, { useState } from 'react';
import { 
  Shield, 
  Calendar, 
  FileText, 
  Home, 
  Award, 
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

import TrustSidebar from './TrustSidebar';
import TrustHeader from './TrustHeader';
import TrustStatsSection from './sections/TrustStatsSection';
import TrustInspectionsSection from './sections/TrustInspectionsSection';
import TrustReportsSection from './sections/TrustReportsSection';
import TrustPropertiesSection from './sections/TrustPropertiesSection';
import TrustDocumentsSection from './sections/TrustDocumentsSection';

interface TrustAgentDashboardProps {
  userName?: string;
  userAvatar?: string;
  agentLevel?: 'junior' | 'senior' | 'expert';
}

const TrustAgentDashboard: React.FC<TrustAgentDashboardProps> = ({
  userName = "Agent Jean MUKENDI",
  userAvatar = "/images/agent-avatar.jpg",
  agentLevel = "senior"
}) => {
  const [activeSection, setActiveSection] = useState<string>('stats');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Données mock réalistes ANSUT
  const dashboardData = {
    stats: {
      totalInspections: 34,
      validatedReports: 28,
      pendingValidation: 2,
      conformityRate: 98,
      certificationsIssued: 26,
      averageValidationTime: 3.2,
      weeklyInspections: [5, 8, 6, 9, 12, 7, 4],
      monthlyTrend: '+12%'
    },
    notifications: [
      {
        id: 1,
        type: 'inspection',
        title: 'Inspection programmée',
        message: 'Villa Bellevue - Cocody à 14h30',
        time: '15 min',
        priority: 'high'
      },
      {
        id: 2,
        type: 'validation',
        title: 'Rapport en attente',
        message: 'Rapport Appart Riviera - Validation requise',
        time: '1h',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'certification',
        title: 'Certification expirée',
        message: 'Certificat Villa Cocody - Renouvellement nécessaire',
        time: '2h',
        priority: 'high'
      }
    ]
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'stats':
        return <TrustStatsSection data={dashboardData.stats} />;
      case 'inspections':
        return <TrustInspectionsSection />;
      case 'reports':
        return <TrustReportsSection />;
      case 'properties':
        return <TrustPropertiesSection />;
      case 'documents':
        return <TrustDocumentsSection />;
      default:
        return <TrustStatsSection data={dashboardData.stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <TrustHeader 
        userName={userName}
        userAvatar={userAvatar}
        agentLevel={agentLevel}
        notifications={dashboardData.notifications}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <TrustSidebar 
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
              <span>ANSUT</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-neutral-900 font-medium">
                Dashboard Agent de Confiance
              </span>
            </nav>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Inspections</p>
                    <p className="text-lg font-bold text-neutral-900">34</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-semantic-success" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Validées</p>
                    <p className="text-lg font-bold text-neutral-900">28</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Clock className="w-5 h-5 text-semantic-warning" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">En attente</p>
                    <p className="text-lg font-bold text-neutral-900">2</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-semantic-info" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Conformité</p>
                    <p className="text-lg font-bold text-neutral-900">98%</p>
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

export default TrustAgentDashboard;