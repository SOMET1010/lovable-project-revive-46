import React, { useState } from 'react';
<<<<<<< HEAD
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
  MapPin,
  Users,
  FileCheck
} from 'lucide-react';

import TrustHeader from './TrustHeader';
import TrustSidebar from './TrustSidebar';
import TrustValidationSection from './sections/TrustValidationSection';
import TrustInspectionSection from './sections/TrustInspectionSection';
import TrustReportsSection from './sections/TrustReportsSection';
import TrustUsersSection from './sections/TrustUsersSection';

interface TrustDashboardProps {
  userName?: string;
  userAvatar?: string;
  agentLevel?: 'junior' | 'senior' | 'expert';
}

const TrustDashboard: React.FC<TrustDashboardProps> = ({
  userName = "Agent Jean MUKENDI",
  userAvatar = "/images/agent-avatar.jpg",
  agentLevel = "senior"
}) => {
  const [activeSection, setActiveSection] = useState<string>('validation');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Données mock réalistes ANSUT
  const dashboardData = {
    stats: {
      totalValidations: 156,
      validatedProperties: 142,
      pendingValidations: 8,
      rejectedValidations: 6,
      conformityRate: 96,
      certificationsIssued: 142,
      averageValidationTime: 2.8,
      monthlyTrend: '+15%'
    },
    notifications: [
      {
        id: 1,
        type: 'validation',
        title: 'Validation en attente',
        message: 'Villa Bellevue - Cocody nécessite votre validation',
        time: '5 min',
        priority: 'high'
      },
      {
        id: 2,
        type: 'inspection',
        title: 'Inspection programmée',
        message: 'Appartement Riviera - Inspection à 14h30',
        time: '15 min',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'user',
        title: 'Utilisateur à vérifier',
        message: 'Nouveau dossier KYC - M. KOUASSI Jean',
        time: '30 min',
        priority: 'medium'
      },
      {
        id: 4,
        type: 'report',
        title: 'Rapport d\'inspection',
        message: 'Rapport Villa Cocody prêt pour validation',
        time: '1h',
        priority: 'low'
      }
    ]
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'validation':
        return <TrustValidationSection />;
      case 'inspection':
        return <TrustInspectionSection />;
      case 'reports':
        return <TrustReportsSection />;
      case 'users':
        return <TrustUsersSection />;
=======
import { TrustHeader } from './TrustHeader';
import { TrustSidebar } from './TrustSidebar';
import { TrustValidationSection } from './sections/TrustValidationSection';

interface TrustDashboardProps {
  userName?: string;
  agentLevel?: 'junior' | 'senior' | 'expert';
}

export function TrustDashboard({ 
  userName = "Agent ANSUT", 
  agentLevel = "senior" 
}: TrustDashboardProps) {
  const [activeSection, setActiveSection] = useState('validation');

  const renderContent = () => {
    switch (activeSection) {
      case 'validation':
        return <TrustValidationSection />;
      case 'inspections':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Gestion des Inspections
            </h2>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <p className="text-neutral-600">
                Module d'inspection des propriétés en développement...
              </p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Rapports et Statistiques
            </h2>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <p className="text-neutral-600">
                Rapports de conformité et métriques ANSUT...
              </p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Validation des Utilisateurs
            </h2>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <p className="text-neutral-600">
                Validation KYC des locataires et propriétaires...
              </p>
            </div>
          </div>
        );
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
      default:
        return <TrustValidationSection />;
    }
  };

  return (
<<<<<<< HEAD
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
              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200 trust-card">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <FileCheck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Validations</p>
                    <p className="text-lg font-bold text-neutral-900">156</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200 trust-card">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-semantic-success" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Validées</p>
                    <p className="text-lg font-bold text-neutral-900">142</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200 trust-card">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Clock className="w-5 h-5 text-semantic-warning" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">En attente</p>
                    <p className="text-lg font-bold text-neutral-900">8</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200 trust-card">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-semantic-info" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Conformité</p>
                    <p className="text-lg font-bold text-neutral-900">96%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Section Content */}
            {renderActiveSection()}
          </div>
=======
    <div className="min-h-screen bg-neutral-50">
      <TrustHeader userName={userName} agentLevel={agentLevel} />
      <div className="flex">
        <TrustSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 ml-64">
          {renderContent()}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
        </main>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default TrustDashboard;
=======
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
