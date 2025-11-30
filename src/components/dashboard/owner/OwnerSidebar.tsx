<<<<<<< HEAD
import React from 'react';
import { 
  X,
  Building, 
  Users, 
  DollarSign, 
  Wrench, 
  Home,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  User,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';

interface OwnerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onClose
}) => {
  const menuItems = [
    {
      id: 'properties',
      label: 'Propriétés',
      icon: Building,
      description: 'Mon portefeuille de biens',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      id: 'applications',
      label: 'Candidatures',
      icon: FileText,
      description: 'Candidatures reçues',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: '3'
    },
    {
      id: 'tenants',
      label: 'Locataires',
      icon: Users,
      description: 'Gestion des occupants',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'finances',
      label: 'Finances',
      icon: DollarSign,
      description: 'Revenus et charges',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
      description: 'Entretien et réparations',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const quickActions = [
    {
      label: 'Ajouter propriété',
      icon: Plus,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 hover:bg-primary-100'
    },
    {
      label: 'Voir candidatures',
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      label: 'Nouveau locataires',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    }
  ];

  const stats = [
    {
      label: 'Propriétés totales',
      value: '8',
      trend: '+1 ce mois'
    },
    {
      label: 'Taux d\'occupation',
      value: '75%',
      trend: '+2% ce mois'
    },
    {
      label: 'Revenus mensuels',
      value: '2.8M',
      trend: '+8.5% ce mois'
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
              <User className="w-8 h-8 text-primary-600" />
              <div className="ml-3">
                <h2 className="text-lg font-bold text-neutral-900">Mon Toit</h2>
                <p className="text-sm text-neutral-700">Propriétaire</p>
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
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

            {/* Quick Stats */}
            <div className="border-t border-neutral-200 pt-6 mb-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Aperçu Rapide
              </h3>
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-neutral-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-neutral-600">{stat.label}</p>
                        <p className="text-sm font-bold text-neutral-900">{stat.value}</p>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                  </div>
                ))}
              </div>
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
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-900">Performance</p>
                  <p className="text-xs text-primary-700">+8.5% ce mois</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button className="w-full flex items-center px-3 py-2 text-left text-sm text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors duration-200">
                <Settings className="w-4 h-4 mr-3" />
                Paramètres
              </button>
              <button className="w-full flex items-center px-3 py-2 text-left text-sm text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors duration-200">
                <FileText className="w-4 h-4 mr-3" />
                Documents
              </button>
              <button className="w-full flex items-center px-3 py-2 text-left text-sm text-semantic-error hover:bg-red-50 rounded-lg transition-colors duration-200">
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

export default OwnerSidebar;
=======
/**
 * Owner Sidebar - Navigation latérale du dashboard propriétaire
 */

interface OwnerSidebarProps {
  collapsed: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: '📊',
    description: 'Statistiques et aperçu général'
  },
  {
    id: 'properties',
    label: 'Mes Propriétés',
    icon: '🏠',
    description: 'Gestion de vos biens immobiliers'
  },
  {
    id: 'tenants',
    label: 'Mes Locataires',
    icon: '👥',
    description: 'Suivi des locataires actuels'
  },
  {
    id: 'applications',
    label: 'Candidatures',
    icon: '📝',
    description: 'Demandes de location reçues'
  },
  {
    id: 'payments',
    label: 'Revenus & Paiements',
    icon: '💳',
    description: 'Suivi des paiements et revenus'
  },
];

const bottomItems = [
  {
    id: 'settings',
    label: 'Paramètres',
    icon: '⚙️'
  },
  {
    id: 'help',
    label: 'Aide',
    icon: '❓'
  },
  {
    id: 'logout',
    label: 'Déconnexion',
    icon: '🚪'
  },
];

export function OwnerSidebar({ collapsed, activeSection, onSectionChange }: OwnerSidebarProps) {
  return (
    <aside className={`
      fixed left-0 top-16 bottom-0 bg-background-page border-r border-neutral-100 z-40
      transition-all duration-300 ease-out
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Navigation principale */}
      <nav className="flex flex-col h-full">
        <div className="flex-1 px-3 py-6 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                ${activeSection === item.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label}</div>
                  <div className="text-xs text-text-secondary truncate">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Séparateur */}
        {!collapsed && <hr className="mx-3 border-neutral-200" />}

        {/* Actions rapides */}
        <div className="px-3 py-4 space-y-2">
          {!collapsed && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Actions rapides
              </h3>
            </div>
          )}
          
          <button className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
            text-primary-600 hover:bg-primary-50
            ${collapsed ? 'justify-center px-2' : ''}
          `}>
            <span className="text-lg flex-shrink-0">➕</span>
            {!collapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium">Ajouter propriété</div>
              </div>
            )}
          </button>

          <button className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
            text-semantic-info hover:bg-blue-50
            ${collapsed ? 'justify-center px-2' : ''}
          `}>
            <span className="text-lg flex-shrink-0">📞</span>
            {!collapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium">Contacter support</div>
              </div>
            )}
          </button>
        </div>

        {/* Navigation du bas */}
        <div className="px-3 py-4 border-t border-neutral-100 space-y-2">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                text-text-secondary hover:bg-neutral-100 hover:text-text-primary
                ${collapsed ? 'justify-center px-2' : ''}
              `}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Indicator de section active (collapsed mode) */}
      {collapsed && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full">
          <div className="w-2 h-8 bg-primary-500 rounded-l-full"></div>
        </div>
      )}
    </aside>
  );
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
