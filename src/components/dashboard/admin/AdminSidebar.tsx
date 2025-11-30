<<<<<<< HEAD
import React from 'react';
import { 
  X,
  BarChart3, 
  Users, 
  Home, 
  Settings, 
  Shield,
  Database,
  Activity,
  UserCheck,
  Building,
  TrendingUp,
  LogOut,
  AlertTriangle,
  Crown,
  Monitor,
  Wifi
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onClose
}) => {
  const menuItems = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Métriques et statistiques globales',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
=======
/**
 * Admin Sidebar - Navigation complète administrateur avec accès étendu
 */

interface AdminSidebarProps {
  collapsed: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
  alertsCount: number;
}

export function AdminSidebar({ collapsed, activeSection, onSectionChange, alertsCount }: AdminSidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      description: 'Dashboard principal et métriques',
      badge: null,
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
    },
    {
      id: 'users',
      label: 'Utilisateurs',
<<<<<<< HEAD
      icon: Users,
      description: 'Gestion des comptes et rôles',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
=======
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      description: 'Gestion complète des comptes',
      badge: null,
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
    },
    {
      id: 'properties',
      label: 'Propriétés',
<<<<<<< HEAD
      icon: Home,
      description: 'Gestion des biens immobiliers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'system',
      label: 'Système',
      icon: Settings,
      description: 'Configuration et maintenance',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
=======
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: 'Modération et validation',
      badge: alertsCount > 0 ? alertsCount : null,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: 'Suivi financier et paiements',
      badge: null,
    },
    {
      id: 'reports',
      label: 'Rapports & Analytics',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Export et analyses avancées',
      badge: null,
    },
    {
      id: 'system',
      label: 'Système & Logs',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Configuration et monitoring',
      badge: null,
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Configuration globale',
      badge: null,
    },
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
  ];

  const quickActions = [
    {
      label: 'Nouvel Utilisateur',
<<<<<<< HEAD
      icon: UserCheck,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 hover:bg-primary-100'
    },
    {
      label: 'Valider Propriété',
      icon: Building,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      label: 'Sauvegarde',
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    }
  ];

  const systemStatus = [
    {
      label: 'Base de données',
      status: 'online',
      color: 'text-semantic-success'
    },
    {
      label: 'API Service',
      status: 'online',
      color: 'text-semantic-success'
    },
    {
      label: 'Notifications',
      status: 'warning',
      color: 'text-semantic-warning'
    },
    {
      label: 'Logs',
      status: 'online',
      color: 'text-semantic-success'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary-500 rounded-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-neutral-900">ANSUT</h2>
                <p className="text-sm text-neutral-700">Administration</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-neutral-700 hover:text-primary-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Navigation Principale
              </h3>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200
                      ${isActive 
                        ? `${item.bgColor} ${item.color} border-l-4 border-current` 
                        : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? item.color : ''}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? item.color : 'text-neutral-900'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Actions Rapides
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      className={`
                        w-full flex items-center px-3 py-2 text-left rounded-lg text-sm
                        transition-colors duration-200 ${action.bgColor}
                      `}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${action.color}`} />
                      <span className={action.color}>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Status */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                État Système
              </h3>
              <div className="space-y-3">
                {systemStatus.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        service.status === 'online' ? 'bg-semantic-success' :
                        service.status === 'warning' ? 'bg-semantic-warning' : 'bg-semantic-error'
                      }`}></div>
                      <span className="text-sm text-neutral-700">{service.label}</span>
                    </div>
                    <Activity className={`w-3 h-3 ${service.color}`} />
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            {/* System Health Card */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-900">Santé Système</p>
                  <p className="text-xs text-primary-700">Excellent - 98.7%</p>
                </div>
                <div className="p-2 bg-primary-500 rounded-lg">
                  <Monitor className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="bg-primary-200 rounded-full h-1">
                  <div className="bg-primary-500 h-1 rounded-full" style={{ width: '98.7%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button className="w-full flex items-center px-3 py-2 text-left text-sm text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors duration-200">
                <Shield className="w-4 h-4 mr-3" />
                Sécurité
              </button>
              <button className="w-full flex items-center px-3 py-2 text-left text-sm text-neutral-700 hover:text-semantic-error hover:bg-red-50 rounded-lg transition-colors duration-200">
                <LogOut className="w-4 h-4 mr-3" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
=======
      icon: '👤',
      action: () => console.log('Nouvel utilisateur'),
    },
    {
      label: 'Validation Rapide',
      icon: '✅',
      action: () => console.log('Validation rapide'),
    },
    {
      label: 'Rapport Express',
      icon: '📊',
      action: () => console.log('Rapport express'),
    },
  ];

  return (
    <aside className={`
      fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background-page border-r border-neutral-100 
      transition-all duration-300 ease-out z-40
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className="flex flex-col h-full">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-h6 font-bold text-text-primary">MONTOITVPROD</h2>
                <p className="text-xs text-neutral-500">Administration</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                ${activeSection === item.id 
                  ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                  : 'text-text-secondary hover:bg-neutral-50 hover:text-text-primary'
                }
              `}
              title={collapsed ? item.label : ''}
            >
              <div className={`
                ${activeSection === item.id ? 'text-primary-600' : 'text-neutral-500'}
              `}>
                {item.icon}
              </div>
              
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="bg-semantic-error text-white text-xs px-2 py-1 rounded-full font-semibold min-w-[20px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-t border-neutral-100">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Actions Rapides
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-neutral-50 hover:text-text-primary rounded-lg transition-colors"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* System Status */}
        {!collapsed && (
          <div className="p-4 border-t border-neutral-100">
            <div className="bg-success-50 border border-success-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-success-700">Système Opérationnel</span>
              </div>
              <div className="text-xs text-success-600 space-y-1">
                <div>Uptime: 98.5%</div>
                <div>Dernière MAJ: Il y a 2h</div>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-neutral-100">
          <button
            onClick={() => {}} // Will be handled by parent
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-neutral-50 transition-colors"
            title={collapsed ? 'Développer' : 'Réduire'}
          >
            <svg 
              className={`h-5 w-5 text-neutral-500 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
