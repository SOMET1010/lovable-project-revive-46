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
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des comptes et rôles',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      id: 'properties',
      label: 'Propriétés',
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
  ];

  const quickActions = [
    {
      label: 'Nouvel Utilisateur',
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