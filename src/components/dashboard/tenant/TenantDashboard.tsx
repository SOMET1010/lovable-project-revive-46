<<<<<<< HEAD
import React, { useState } from 'react';
import {
  Home,
  User,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  UserCircle,
  ChevronDown,
  MessageSquare,
  Calendar,
  Building,
  Heart,
  Star,
  Bell as NotificationIcon
} from 'lucide-react';
import TenantApplicationsSection from './sections/TenantApplicationsSection';

interface TenantDashboardProps {
  tenantId: number;
  tenantName: string;
  onLogout?: () => void;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({
  tenantId,
  tenantName,
  onLogout
}) => {
  const [activeSection, setActiveSection] = useState('applications');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: 'status',
      title: 'Candidature acceptée',
      message: 'Votre candidature pour Villa Bellevue a été acceptée!',
      date: '2025-11-29',
      read: false
    },
    {
      id: 2,
      type: 'document',
      title: 'Documents manquants',
      message: 'Veuillez compléter vos documents pour Appartement Riviera',
      date: '2025-11-28',
      read: false
    }
  ]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'applications', label: 'Mes Candidatures', icon: FileText, count: 4 },
    { id: 'properties', label: 'Propriétés Favorites', icon: Heart, count: 8 },
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: 2 },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'applications':
        return (
          <TenantApplicationsSection
            tenantId={tenantId}
            tenantName={tenantName}
          />
        );
      case 'properties':
        return (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Propriétés Favorites</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      case 'profile':
        return (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Mon Profil</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      case 'messages':
        return (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Messages</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Calendrier</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Paramètres</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center ml-4 lg:ml-0">
              <Home className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-neutral-900">LocatHub</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-3 p-2 hover:bg-neutral-100 rounded-lg">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {tenantName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900">{tenantName}</p>
                  <p className="text-xs text-neutral-500">Locataire</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* User Info */}
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">
                    {tenantName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">{tenantName}</h2>
                  <p className="text-sm text-neutral-600">Locataire</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                          activeSection === item.id
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="flex-1">{item.label}</span>
                        {item.count && (
                          <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${
                            activeSection === item.id
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Besoin d'aide?</h3>
                <p className="text-xs text-blue-700 mb-3">
                  Consultez notre guide ou contactez le support.
                </p>
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Centre d'aide
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {renderContent()}
=======
/**
 * Tenant Dashboard - Modern Minimalism Premium
 * Refonte complète avec design system unifié
 */

import { useState, useEffect } from 'react';
import { TenantHeader } from './TenantHeader';
import { TenantSidebar } from './TenantSidebar';
import { TenantStatsSection } from './sections/TenantStatsSection';
import { TenantFavoritesSection } from './sections/TenantFavoritesSection';
import { TenantApplicationsSection } from './sections/TenantApplicationsSection';
import { TenantVisitsSection } from './sections/TenantVisitsSection';
import { TenantPaymentsSection } from './sections/TenantPaymentsSection';

// Types pour les données du dashboard
export interface TenantDashboardData {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
  };
  stats: {
    propertiesViewed: number;
    applicationsSubmitted: number;
    visitsScheduled: number;
    paymentsMade: number;
    monthlyGrowth: {
      properties: number;
      applications: number;
      visits: number;
      payments: number;
    };
  };
  recentActivity: {
    visits: Array<{
      id: string;
      property_title: string;
      property_city: string;
      visit_date: string;
      visit_time: string;
      status: 'en_attente' | 'confirmee' | 'annulee' | 'terminee';
    }>;
    applications: Array<{
      id: string;
      property_title: string;
      property_city: string;
      monthly_rent: number;
      status: 'en_attente' | 'acceptee' | 'refusee' | 'en_cours';
      created_at: string;
    }>;
  };
}

export function TenantDashboard() {
  const [dashboardData, setDashboardData] = useState<TenantDashboardData | null>(null);
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
      // TODO: Implémenter l'appel API réel
      // Pour l'instant, données mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: TenantDashboardData = {
        user: {
          id: '1',
          full_name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '+225 07 00 00 00 00',
        },
        stats: {
          propertiesViewed: 24,
          applicationsSubmitted: 8,
          visitsScheduled: 3,
          paymentsMade: 12,
          monthlyGrowth: {
            properties: 15,
            applications: 25,
            visits: 10,
            payments: 5,
          },
        },
        recentActivity: {
          visits: [
            {
              id: '1',
              property_title: 'Appartement 3 pièces Cocody',
              property_city: 'Cocody',
              visit_date: '2025-12-02',
              visit_time: '14:00',
              status: 'confirmee',
            },
            {
              id: '2',
              property_title: 'Villa moderne Bingerville',
              property_city: 'Bingerville',
              visit_date: '2025-12-03',
              visit_time: '10:30',
              status: 'en_attente',
            },
          ],
          applications: [
            {
              id: '1',
              property_title: 'Studio Abidjan Plateau',
              property_city: 'Abidjan Plateau',
              monthly_rent: 150000,
              status: 'en_cours',
              created_at: '2025-11-28',
            },
            {
              id: '2',
              property_title: 'Appartement 2 pièces Yopougon',
              property_city: 'Yopougon',
              monthly_rent: 85000,
              status: 'en_attente',
              created_at: '2025-11-25',
            },
          ],
        },
      };
      
      setDashboardData(mockData);
    } catch (err) {
      setError('Erreur lors du chargement du dashboard');
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
          <p className="text-neutral-600 font-medium">Chargement de votre dashboard...</p>
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
      <TenantHeader 
        user={dashboardData?.user}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex">
        {/* Sidebar fixe */}
        <TenantSidebar 
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
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Section statistiques toujours visible */}
              <TenantStatsSection 
                stats={dashboardData?.stats}
                loading={loading}
              />

              {/* Navigation des sections */}
              <div className="flex flex-wrap gap-2 p-2 bg-background-page rounded-xl border border-neutral-100">
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
                  { id: 'favorites', label: 'Favoris', icon: '❤️' },
                  { id: 'applications', label: 'Candidatures', icon: '📝' },
                  { id: 'visits', label: 'Visites', icon: '📅' },
                  { id: 'payments', label: 'Paiements', icon: '💳' },
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TenantVisitsSection 
                    visits={dashboardData?.recentActivity.visits || []}
                    showHeader={true}
                  />
                  <TenantApplicationsSection 
                    applications={dashboardData?.recentActivity.applications || []}
                    showHeader={true}
                  />
                </div>
              )}

              {activeSection === 'favorites' && (
                <TenantFavoritesSection />
              )}

              {activeSection === 'applications' && (
                <TenantApplicationsSection 
                  applications={dashboardData?.recentActivity.applications || []}
                />
              )}

              {activeSection === 'visits' && (
                <TenantVisitsSection 
                  visits={dashboardData?.recentActivity.visits || []}
                />
              )}

              {activeSection === 'payments' && (
                <TenantPaymentsSection />
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

export default TenantDashboard;
=======
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
