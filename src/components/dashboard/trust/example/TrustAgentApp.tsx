import React, { useState } from 'react';
import TrustAgentDashboard from './components/dashboard/trust/TrustAgentDashboard';
import { Shield, Award, FileText, Home } from 'lucide-react';

const TrustAgentApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'list'>('dashboard');

  // Exemple de navigation pour intégrer le Trust Agent Dashboard
  const navigationItems = [
    {
      id: 'trust',
      label: 'Trust Agent ANSUT',
      icon: Shield,
      component: 'dashboard',
      description: 'Plateforme de certification immobilière'
    },
    {
      id: 'properties',
      label: 'Mes Propriétés',
      icon: Home,
      component: 'list',
      description: 'Gestion des biens immobiliers'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      component: 'list',
      description: 'Centre de documentation'
    },
    {
      id: 'certifications',
      label: 'Certifications',
      icon: Award,
      component: 'list',
      description: 'Suivi des certifications'
    }
  ];

  return (
    <div className="min-h-screen bg-background-page">
      {/* Navigation simple pour la démo */}
      <nav className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">
              MONTOITVPROD - ANSUT
            </h1>
            <div className="flex space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.component;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.component as 'dashboard' | 'list')}
                    className={`
                      flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${isActive 
                        ? 'bg-primary-600 text-white' 
                        : 'text-neutral-700 hover:bg-neutral-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main>
        {currentView === 'dashboard' ? (
          <TrustAgentDashboard
            userName="Agent Jean MUKENDI"
            userAvatar="/images/agent-avatar.jpg"
            agentLevel="senior"
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Section en développement
              </h2>
              <p className="text-neutral-700 mb-6">
                Cette section sera développée dans une prochaine itération.
              </p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Retour au Dashboard ANSUT
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrustAgentApp;