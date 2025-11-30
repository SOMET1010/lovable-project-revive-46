/**
 * Admin Dashboard - Modern Minimalism Premium
 * Interface administrative complète et puissante pour MONTOITVPROD
 */

import { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminStatsSection } from './sections/AdminStatsSection';
import { AdminUsersSection } from './sections/AdminUsersSection';
import { AdminPropertiesSection } from './sections/AdminPropertiesSection';
import { AdminTransactionsSection } from './sections/AdminTransactionsSection';
import { AdminReportsSection } from './sections/AdminReportsSection';

// Types pour les données du dashboard admin
export interface AdminDashboardData {
  admin: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    permissions: string[];
  };
  stats: {
    totalUsers: number;
    totalProperties: number;
    totalTransactions: number;
    systemUptime: string;
    monthlyGrowth: {
      users: number;
      properties: number;
      transactions: number;
      revenue: number;
    };
    criticalAlerts: number;
    pendingModerations: number;
  };
  systemAlerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recentActivity: {
    users: Array<{
      id: string;
      full_name: string;
      email: string;
      user_type: 'tenant' | 'owner' | 'agency';
      status: 'active' | 'suspended' | 'banned';
      last_activity: string;
      registration_date: string;
    }>;
    properties: Array<{
      id: string;
      title: string;
      owner_name: string;
      status: 'en_attente' | 'valide' | 'rejete' | 'suspendu';
      created_at: string;
      city: string;
    }>;
    transactions: Array<{
      id: string;
      type: 'paiement' | 'commission' | 'abonnement';
      amount: number;
      user_name: string;
      status: 'pending' | 'completed' | 'failed' | 'cancelled';
      created_at: string;
    }>;
  };
}

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
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
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockData: AdminDashboardData = {
        admin: {
          id: 'admin-001',
          full_name: 'Admin Système',
          email: 'admin@montoitvprod.com',
          role: 'Super Admin',
          permissions: ['users', 'properties', 'transactions', 'reports', 'settings'],
        },
        stats: {
          totalUsers: 2847,
          totalProperties: 1156,
          totalTransactions: 567,
          systemUptime: '98.5%',
          monthlyGrowth: {
            users: 23,
            properties: 15,
            transactions: 31,
            revenue: 18,
          },
          criticalAlerts: 3,
          pendingModerations: 12,
        },
        systemAlerts: [
          {
            id: 'alert-001',
            type: 'error',
            message: 'Pics d\\'erreur sur l\\'API de paiement',
            timestamp: '2025-11-30T16:30:00Z',
            severity: 'high',
          },
          {
            id: 'alert-002',
            type: 'warning',
            message: 'Capacité serveur proche de 80%',
            timestamp: '2025-11-30T15:45:00Z',
            severity: 'medium',
          },
          {
            id: 'alert-003',
            type: 'info',
            message: 'Sauvegarde quotidienne terminée',
            timestamp: '2025-11-30T02:00:00Z',
            severity: 'low',
          },
        ],
        recentActivity: {
          users: [
            {
              id: 'user-001',
              full_name: 'Marie Kouassi',
              email: 'marie.kouassi@email.com',
              user_type: 'tenant',
              status: 'active',
              last_activity: '2025-11-30T17:45:00Z',
              registration_date: '2025-11-15T10:30:00Z',
            },
            {
              id: 'user-002',
              full_name: 'Jean-Baptiste Yao',
              email: 'jb.yao@email.com',
              user_type: 'owner',
              status: 'active',
              last_activity: '2025-11-30T16:20:00Z',
              registration_date: '2025-10-22T14:15:00Z',
            },
            {
              id: 'user-003',
              full_name: 'Immobilière Premier',
              email: 'contact@immopremier.ci',
              user_type: 'agency',
              status: 'suspended',
              last_activity: '2025-11-29T09:30:00Z',
              registration_date: '2025-09-10T08:00:00Z',
            },
          ],
          properties: [
            {
              id: 'prop-001',
              title: 'Villa moderne Cocody Riviera',
              owner_name: 'Jean-Baptiste Yao',
              status: 'en_attente',
              created_at: '2025-11-30T14:30:00Z',
              city: 'Cocody',
            },
            {
              id: 'prop-002',
              title: 'Appartement 3 pièces Plateau',
              owner_name: 'Marie Kouassi',
              status: 'valide',
              created_at: '2025-11-29T16:45:00Z',
              city: 'Abidjan Plateau',
            },
            {
              id: 'prop-003',
              title: 'Studio meublé Yopougon',
              owner_name: 'Pierre N\\'Guessan',
              status: 'rejete',
              created_at: '2025-11-28T11:20:00Z',
              city: 'Yopougon',
            },
          ],
          transactions: [
            {
              id: 'txn-001',
              type: 'paiement',
              amount: 250000,
              user_name: 'Marie Kouassi',
              status: 'completed',
              created_at: '2025-11-30T17:15:00Z',
            },
            {
              id: 'txn-002',
              type: 'commission',
              amount: 15000,
              user_name: 'Jean-Baptiste Yao',
              status: 'pending',
              created_at: '2025-11-30T16:50:00Z',
            },
            {
              id: 'txn-003',
              type: 'abonnement',
              amount: 50000,
              user_name: 'Immobilière Premier',
              status: 'failed',
              created_at: '2025-11-30T15:30:00Z',
            },
          ],
        },
      };
      
      setDashboardData(mockData);
    } catch (err) {
      setError('Erreur lors du chargement du dashboard admin');
      console.error('Erreur dashboard admin:', err);
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
          <p className="text-neutral-600 font-medium">Chargement du dashboard administrateur...</p>
          <p className="text-neutral-500 text-sm mt-2">Initialisation des données système</p>
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
          <h3 className="text-h4 font-bold text-text-primary mb-3">Erreur système</h3>
          <p className="text-body text-text-secondary mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="btn-primary w-full"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header administrateur */}
      <AdminHeader 
        admin={dashboardData?.admin}
        alerts={dashboardData?.systemAlerts || []}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex">
        {/* Sidebar administrateur */}
        <AdminSidebar 
          collapsed={sidebarCollapsed}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          alertsCount={dashboardData?.stats.criticalAlerts || 0}
        />

        {/* Contenu principal */}
        <main className={`
          flex-1 transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
          pt-16 min-h-screen
        `}>
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Section statistiques système */}
              <AdminStatsSection 
                stats={dashboardData?.stats}
                alerts={dashboardData?.systemAlerts || []}
                loading={loading}
              />

              {/* Navigation des sections admin */}
              <div className="flex flex-wrap gap-2 p-2 bg-background-page rounded-xl border border-neutral-100">
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', icon: '📊', badge: null },
                  { id: 'users', label: 'Utilisateurs', icon: '👥', badge: dashboardData?.stats.totalUsers },
                  { id: 'properties', label: 'Propriétés', icon: '🏠', badge: dashboardData?.stats.pendingModerations },
                  { id: 'transactions', label: 'Transactions', icon: '💳', badge: dashboardData?.stats.totalTransactions },
                  { id: 'reports', label: 'Rapports', icon: '📈', badge: null },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${activeSection === section.id 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-text-secondary hover:bg-neutral-100'
                      }
                    `}
                  >
                    <span className="text-sm">{section.icon}</span>
                    <span className="hidden sm:inline">{section.label}</span>
                    {section.badge && (
                      <span className="ml-1 bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-semibold">
                        {section.badge > 999 ? '999+' : section.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Contenu des sections */}
              {activeSection === 'overview' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <AdminUsersSection 
                    users={dashboardData?.recentActivity.users || []}
                    showHeader={true}
                  />
                  <AdminPropertiesSection 
                    properties={dashboardData?.recentActivity.properties || []}
                    showHeader={true}
                  />
                </div>
              )}

              {activeSection === 'users' && (
                <AdminUsersSection 
                  users={dashboardData?.recentActivity.users || []}
                />
              )}

              {activeSection === 'properties' && (
                <AdminPropertiesSection 
                  properties={dashboardData?.recentActivity.properties || []}
                />
              )}

              {activeSection === 'transactions' && (
                <AdminTransactionsSection 
                  transactions={dashboardData?.recentActivity.transactions || []}
                />
              )}

              {activeSection === 'reports' && (
                <AdminReportsSection 
                  stats={dashboardData?.stats}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}