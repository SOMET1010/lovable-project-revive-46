<<<<<<< HEAD
import React from 'react';
import { 
  X,
  Building, 
  Users, 
  TrendingUp, 
  Award,
  Plus,
  Search,
  Settings,
  LogOut,
  Building2,
  Target,
  DollarSign,
  FileText,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface AgencySidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AgencySidebar: React.FC<AgencySidebarProps> = ({
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
      description: 'Portfolio et gestion des biens',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      id: 'applications',
      label: 'Candidatures',
      icon: FileText,
      description: 'Gestion centralisée des candidatures',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: '7'
=======
/**
 * Agency Sidebar - Navigation latérale du dashboard agence
 */

interface AgencySidebarProps {
  collapsed: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AgencySidebar({ collapsed, activeSection, onSectionChange }: AgencySidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: '📊',
      description: 'Résumé de l\'activité',
    },
    {
      id: 'properties',
      label: 'Propriétés',
      icon: '🏠',
      description: 'Gestion du portefeuille',
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
    },
    {
      id: 'clients',
      label: 'Clients',
<<<<<<< HEAD
      icon: Users,
      description: 'Locataires et propriétaires',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: DollarSign,
      description: 'Commissions et revenus',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
=======
      icon: '👥',
      description: 'Base de données clients',
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
    },
    {
      id: 'team',
      label: 'Équipe',
<<<<<<< HEAD
      icon: Award,
      description: 'Gestion des agents',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
=======
      icon: '👨‍💼',
      description: 'Gestion des agents',
    },
    {
      id: 'sales',
      label: 'Ventes',
      icon: '💰',
      description: 'Suivi commercial',
    },
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
  ];

  const quickActions = [
    {
<<<<<<< HEAD
      label: 'Ajouter Propriété',
      icon: Building2,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 hover:bg-primary-100'
    },
    {
      label: 'Nouveau Client',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      label: 'Créer Transaction',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      label: 'Planifier Visite',
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100'
    }
  ];

  const performanceMetrics = [
    { label: 'Taux de Conversion', value: '24.5%', trend: '+2.3%' },
    { label: 'Temps Moyen Vente', value: '45 j', trend: '-5 j' },
    { label: 'Satisfaction Client', value: '94%', trend: '+1%' },
    { label: 'Objectif Mensuel', value: '87%', trend: '+12%' }
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
              <Building className="w-8 h-8 text-primary-600" />
              <div className="ml-3">
                <h2 className="text-lg font-bold text-neutral-900">Agence</h2>
                <p className="text-sm text-neutral-700">Dashboard</p>
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
                Gestion Principale
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
            <div className="border-t border-neutral-200 pt-6 mb-6">
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

            {/* Performance Metrics */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Performance
              </h3>
              <div className="space-y-3">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="bg-neutral-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-neutral-600">{metric.label}</p>
                      <span className="text-xs font-medium text-semantic-success">{metric.trend}</span>
                    </div>
                    <p className="text-sm font-bold text-neutral-900">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-900">Objectif Mensuel</p>
                  <p className="text-xs text-primary-700">87% • 2.6M F / 3M F</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button className="w-full flex items-center px-3 py-2 text-left text-sm text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors duration-200">
                <Settings className="w-4 h-4 mr-3" />
                Paramètres
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

export default AgencySidebar;
=======
      label: 'Ajouter propriété',
      icon: '➕',
      action: 'add_property',
    },
    {
      label: 'Nouveau client',
      icon: '👤',
      action: 'add_client',
    },
    {
      label: 'Planifier visite',
      icon: '📅',
      action: 'schedule_visit',
    },
    {
      label: 'Générer rapport',
      icon: '📈',
      action: 'generate_report',
    },
  ];

  return (
    <aside className={`
      fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background-page border-r border-neutral-100 transition-all duration-300 z-40
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className="flex flex-col h-full">
        {/* Navigation principale */}
        <nav className="flex-1 p-4 space-y-2">
          <div className={collapsed ? 'hidden' : 'block'}>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Navigation
            </h3>
          </div>
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${activeSection === item.id 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Actions rapides */}
        <div className="p-4 border-t border-neutral-100">
          <div className={collapsed ? 'hidden' : 'block'}>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Actions rapides
            </h3>
          </div>
          
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.action}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  text-text-secondary hover:bg-neutral-100 hover:text-text-primary
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
                title={collapsed ? action.label : undefined}
              >
                <span className="text-sm flex-shrink-0">{action.icon}</span>
                {!collapsed && (
                  <span className="font-medium text-sm">{action.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Statut équipe en temps réel */}
        <div className={`
          p-4 border-t border-neutral-100 bg-neutral-50/50
          ${collapsed ? 'hidden' : 'block'}
        `}>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Équipe en ligne
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Agents actifs</span>
              <span className="text-sm font-semibold text-semantic-success">4/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Visites aujourd'hui</span>
              <span className="text-sm font-semibold text-primary-500">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Prospects cette semaine</span>
              <span className="text-sm font-semibold text-primary-500">28</span>
            </div>
          </div>
        </div>

        {/* Indicateur de version */}
        <div className={`
          p-3 border-t border-neutral-100 text-center
          ${collapsed ? 'hidden' : 'block'}
        `}>
          <span className="text-xs text-text-secondary">
            Dashboard v2.0.0 - MonToitVProd
          </span>
        </div>
      </div>
    </aside>
  );
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
