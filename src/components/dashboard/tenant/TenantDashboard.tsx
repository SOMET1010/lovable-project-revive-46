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
          </div>
        </main>
      </div>
    </div>
  );
}