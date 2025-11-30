import React from 'react';
<<<<<<< HEAD
import { 
  X,
  BarChart3, 
  Calendar, 
  FileText, 
  Home, 
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';
=======
import { CheckCircle, AlertCircle, Clock, FileText, Users, BarChart3 } from 'lucide-react';
>>>>>>> 179702229bfc197f668a7416e325de75b344681e

interface TrustSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
<<<<<<< HEAD
  isOpen: boolean;
  onClose: () => void;
}

const TrustSidebar: React.FC<TrustSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onClose
}) => {
  const menuItems = [
    {
      id: 'validation',
      label: 'Validations',
      icon: CheckCircle,
      description: 'Propriétés à valider et conformités',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      badge: 8
    },
    {
      id: 'inspection',
      label: 'Inspections',
      icon: Calendar,
      description: 'Calendrier des inspections programmées',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: 3
=======
}

export function TrustSidebar({ activeSection, onSectionChange }: TrustSidebarProps) {
  const sections = [
    {
      id: 'validation',
      label: 'Validation Propriétés',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: AlertCircle,
      color: 'text-blue-600'
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
    },
    {
      id: 'reports',
      label: 'Rapports',
<<<<<<< HEAD
      icon: FileText,
      description: 'Statistiques et rapports de certification',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Home,
      description: 'Validation des identités et documents KYC',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: 5
    }
  ];

  const quickActions = [
    {
      label: 'Nouvelle Inspection',
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 hover:bg-primary-100'
    },
    {
      label: 'Valider Rapport',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      label: 'Émettre Certificat',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
=======
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      id: 'users',
      label: 'Validation Utilisateurs',
      icon: Users,
      color: 'text-orange-600'
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
    }
  ];

  return (
<<<<<<< HEAD
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
              <Shield className="w-8 h-8 text-primary-600" />
              <div className="ml-3">
                <h2 className="text-lg font-bold text-neutral-900">ANSUT</h2>
                <p className="text-sm text-neutral-700">Trust Agent</p>
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
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-900">Statut ANSUT</p>
                  <p className="text-xs text-primary-700">Agent Certifié</p>
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

export default TrustSidebar;
=======
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-5rem)] bg-white border-r border-neutral-200 p-6">
      <nav className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : section.color}`} />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Statut ANSUT
          </span>
        </div>
        <p className="text-xs text-green-700">
          Certification active - Validé jusqu'en 2025
        </p>
      </div>
    </aside>
  );
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
