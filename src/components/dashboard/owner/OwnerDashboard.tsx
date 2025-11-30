/**
 * Owner Dashboard - Modern Minimalism Premium
 * Refonte complète pour les propriétaires avec design system unifié
 */

import { useState, useEffect } from 'react';
import { OwnerHeader } from './OwnerHeader';
import { OwnerSidebar } from './OwnerSidebar';
import { OwnerStatsSection } from './sections/OwnerStatsSection';
import { OwnerPropertiesSection } from './sections/OwnerPropertiesSection';
import { OwnerTenantsSection } from './sections/OwnerTenantsSection';
import { OwnerApplicationsSection } from './sections/OwnerApplicationsSection';
import { OwnerPaymentsSection } from './sections/OwnerPaymentsSection';

// Types pour les données du dashboard propriétaire
export interface OwnerDashboardData {
  user: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    company?: string;
  };
  stats: {
    totalProperties: number;
    occupiedProperties: number;
    monthlyRevenue: number;
    occupancyRate: number;
    yearlyGrowth: {
      revenue: number;
      occupancy: number;
      applications: number;
    };
  };
  properties: Array<{
    id: string;
    title: string;
    address: string;
    city: string;
    monthly_rent: number;
    status: 'occupé' | 'libre' | 'maintenance';
    images: string[];
    tenant?: {
      name: string;
      phone: string;
      lease_end: string;
    };
  }>;
  tenants: Array<{
    id: string;
    name: string;
    property_title: string;
    property_city: string;
    monthly_rent: number;
    lease_end: string;
    phone: string;
    status: 'actif' | 'en_retard' | 'fin_contrat';
    payment_status: 'à_jour' | 'en_retard' | 'reçu';
  }>;
  applications: Array<{
    id: string;
    candidate_name: string;
    candidate_email: string;
    property_title: string;
    property_city: string;
    monthly_rent: number;
    status: 'nouveau' | 'en_cours' | 'accepté' | 'refusé';
    score: number;
    applied_at: string;
  }>;
  payments: Array<{
    id: string;
    tenant_name: string;
    property_title: string;
    amount: number;
    due_date: string;
    paid_date?: string;
    status: 'reçu' | 'en_attente' | 'en_retard';
    month: string;
  }>;
}

export function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState<OwnerDashboardData | null>(null);
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
      // Pour l'instant, données mock réalistes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: OwnerDashboardData = {
        user: {
          id: '1',
          full_name: 'Marie Kouassi',
          email: 'marie.kouassi@email.com',
          phone: '+225 01 23 45 67',
          company: 'Kouassi Immobilier',
        },
        stats: {
          totalProperties: 12,
          occupiedProperties: 8,
          monthlyRevenue: 425000,
          occupancyRate: 95,
          yearlyGrowth: {
            revenue: 18,
            occupancy: 5,
            applications: 32,
          },
        },
        properties: [
          {
            id: '1',
            title: 'Villa Moderne Cocody',
            address: 'Rue des Jardins 15',
            city: 'Cocody',
            monthly_rent: 85000,
            status: 'occupé',
            images: ['villa1.jpg', 'villa2.jpg'],
            tenant: {
              name: 'Jean-Baptiste Yao',
              phone: '+225 07 12 34 56',
              lease_end: '2026-03-15',
            },
          },
          {
            id: '2',
            title: 'Appartement 3 pièces Plateau',
            address: 'Boulevard Lagunaire 42',
            city: 'Abidjan Plateau',
            monthly_rent: 75000,
            status: 'occupé',
            images: ['app1.jpg'],
            tenant: {
              name: 'Fatou Diabaté',
              phone: '+225 05 98 76 54',
              lease_end: '2026-01-30',
            },
          },
          {
            id: '3',
            title: 'Studio Abidjan Centre',
            address: 'Rue Monoprix 8',
            city: 'Abidjan Centre',
            monthly_rent: 45000,
            status: 'libre',
            images: ['studio1.jpg', 'studio2.jpg'],
          },
          {
            id: '4',
            title: 'Villa Familiale Bingerville',
            address: 'Quartier Résidentiel 25',
            city: 'Bingerville',
            monthly_rent: 95000,
            status: 'maintenance',
            images: ['villa3.jpg'],
          },
        ],
        tenants: [
          {
            id: '1',
            name: 'Jean-Baptiste Yao',
            property_title: 'Villa Moderne Cocody',
            property_city: 'Cocody',
            monthly_rent: 85000,
            lease_end: '2026-03-15',
            phone: '+225 07 12 34 56',
            status: 'actif',
            payment_status: 'à_jour',
          },
          {
            id: '2',
            name: 'Fatou Diabaté',
            property_title: 'Appartement 3 pièces Plateau',
            property_city: 'Abidjan Plateau',
            monthly_rent: 75000,
            lease_end: '2026-01-30',
            phone: '+225 05 98 76 54',
            status: 'actif',
            payment_status: 'en_retard',
          },
          {
            id: '3',
            name: 'Aminata Touré',
            property_title: 'Maison 4 pièces Yopougon',
            property_city: 'Yopougon',
            monthly_rent: 55000,
            lease_end: '2025-12-31',
            phone: '+225 03 45 67 89',
            status: 'fin_contrat',
            payment_status: 'reçu',
          },
        ],
        applications: [
          {
            id: '1',
            candidate_name: 'Paul Kouadio',
            candidate_email: 'paul.kouadio@email.com',
            property_title: 'Studio Abidjan Centre',
            property_city: 'Abidjan Centre',
            monthly_rent: 45000,
            status: 'nouveau',
            score: 85,
            applied_at: '2025-11-28',
          },
          {
            id: '2',
            candidate_name: 'Aïssa Ouedraogo',
            candidate_email: 'aissa.ouedraogo@email.com',
            property_title: 'Villa Familiale Bingerville',
            property_city: 'Bingerville',
            monthly_rent: 95000,
            status: 'en_cours',
            score: 92,
            applied_at: '2025-11-25',
          },
          {
            id: '3',
            candidate_name: 'Koffi Mensah',
            candidate_email: 'koffi.mensah@email.com',
            property_title: 'Villa Moderne Cocody',
            property_city: 'Cocody',
            monthly_rent: 85000,
            status: 'accepté',
            score: 78,
            applied_at: '2025-11-20',
          },
        ],
        payments: [
          {
            id: '1',
            tenant_name: 'Jean-Baptiste Yao',
            property_title: 'Villa Moderne Cocody',
            amount: 85000,
            due_date: '2025-11-30',
            paid_date: '2025-11-28',
            status: 'reçu',
            month: 'Novembre 2025',
          },
          {
            id: '2',
            tenant_name: 'Fatou Diabaté',
            property_title: 'Appartement 3 pièces Plateau',
            amount: 75000,
            due_date: '2025-11-30',
            status: 'en_retard',
            month: 'Novembre 2025',
          },
          {
            id: '3',
            tenant_name: 'Jean-Baptiste Yao',
            property_title: 'Villa Moderne Cocody',
            amount: 85000,
            due_date: '2025-12-31',
            status: 'en_attente',
            month: 'Décembre 2025',
          },
        ],
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
      <OwnerHeader 
        user={dashboardData?.user}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex">
        {/* Sidebar fixe */}
        <OwnerSidebar 
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
              <OwnerStatsSection 
                stats={dashboardData?.stats}
                loading={loading}
              />

              {/* Navigation des sections */}
              <div className="flex flex-wrap gap-2 p-2 bg-background-page rounded-xl border border-neutral-100">
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
                  { id: 'properties', label: 'Propriétés', icon: '🏠' },
                  { id: 'tenants', label: 'Locataires', icon: '👥' },
                  { id: 'applications', label: 'Candidatures', icon: '📝' },
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
                  <OwnerPropertiesSection 
                    properties={dashboardData?.properties || []}
                    showHeader={true}
                  />
                  <OwnerApplicationsSection 
                    applications={dashboardData?.applications || []}
                    showHeader={true}
                  />
                </div>
              )}

              {activeSection === 'properties' && (
                <OwnerPropertiesSection 
                  properties={dashboardData?.properties || []}
                />
              )}

              {activeSection === 'tenants' && (
                <OwnerTenantsSection 
                  tenants={dashboardData?.tenants || []}
                />
              )}

              {activeSection === 'applications' && (
                <OwnerApplicationsSection 
                  applications={dashboardData?.applications || []}
                />
              )}

              {activeSection === 'payments' && (
                <OwnerPaymentsSection 
                  payments={dashboardData?.payments || []}
                  monthlyRevenue={dashboardData?.stats.monthlyRevenue || 0}
                  yearlyRevenue={dashboardData?.stats.monthlyRevenue * 12 || 0}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}