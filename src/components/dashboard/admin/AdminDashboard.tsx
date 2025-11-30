import React, { useState } from 'react';
import { 
  Crown, 
  Calendar, 
  Users, 
  Home, 
  BarChart3, 
  Settings, 
  Bell,
  Shield,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database,
  Activity,
  UserCheck,
  Building
} from 'lucide-react';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminUsersSection from './sections/AdminUsersSection';
import AdminPropertiesSection from './sections/AdminPropertiesSection';
import AdminAnalyticsSection from './sections/AdminAnalyticsSection';
import AdminSystemSection from './sections/AdminSystemSection';

interface AdminDashboardProps {
  userName?: string;
  userAvatar?: string;
  adminLevel?: 'super' | 'senior' | 'moderator';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userName = "Administrateur ANSUT",
  userAvatar = "/images/admin-avatar.jpg",
  adminLevel = "super"
}) => {
  const [activeSection, setActiveSection] = useState<string>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Données mock réalistes pour l'administration
  const dashboardData = {
    stats: {
      totalUsers: 2456,
      activeUsers: 1834,
      newUsers: 142,
      inactiveUsers: 324,
      totalProperties: 1892,
      activeProperties: 1456,
      pendingProperties: 89,
      suspendedProperties: 23,
      totalRevenue: 45670000,
      monthlyGrowth: '+18%',
      commissionRate: 2.5,
      platformHealth: 98.7
    },
    notifications: [
      {
        id: 1,
        type: 'user',
        title: 'Nouvel utilisateur',
        message: 'Nouvelle agence immobilière enregistrée - Immo Plus SARL',
        time: '5 min',
        priority: 'high'
      },
      {
        id: 2,
        type: 'property',
        title: 'Propriété en attente',
        message: 'Villa Abidjan - Validation requise pour conformité ANSUT',
        time: '12 min',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'system',
        title: 'Alerte système',
        message: 'Sauvegarde automatique terminée - Base de données optimisée',
        time: '1h',
        priority: 'low'
      },
      {
        id: 4,
        type: 'security',
        title: 'Tentative d\'intrusion',
        message: '5 tentatives de connexion échouées détectées - IP bloquée',
        time: '2h',
        priority: 'high'
      }
    ]
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return <AdminUsersSection />;
      case 'properties':
        return <AdminPropertiesSection />;
      case 'analytics':
        return <AdminAnalyticsSection data={dashboardData.stats} />;
      case 'system':
        return <AdminSystemSection />;
      default:
        return <AdminAnalyticsSection data={dashboardData.stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <AdminHeader 
        userName={userName}
        userAvatar={userAvatar}
        adminLevel={adminLevel}
        notifications={dashboardData.notifications}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
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
              <Shield className="w-4 h-4" />
              <span>ANSUT</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-neutral-900 font-medium">
                Administration Système
              </span>
            </nav>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Utilisateurs</p>
                    <p className="text-lg font-bold text-neutral-900">{dashboardData.stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <UserCheck className="w-5 h-5 text-semantic-success" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Actifs</p>
                    <p className="text-lg font-bold text-neutral-900">{dashboardData.stats.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Home className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Propriétés</p>
                    <p className="text-lg font-bold text-neutral-900">{dashboardData.stats.totalProperties}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Building className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">En attente</p>
                    <p className="text-lg font-bold text-neutral-900">{dashboardData.stats.pendingProperties}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Croissance</p>
                    <p className="text-lg font-bold text-semantic-success">{dashboardData.stats.monthlyGrowth}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-surface rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-neutral-700">Santé</p>
                    <p className="text-lg font-bold text-semantic-success">{dashboardData.stats.platformHealth}%</p>
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

export default AdminDashboard;