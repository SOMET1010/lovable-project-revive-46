import React from 'react';
import { TrustDashboard } from '../index';

/**
 * Exemple d'utilisation du Trust Agent Dashboard ANSUT
 * 
 * Ce composant démontre l'intégration du dashboard dans une application
 * avec différents niveaux d'agents et configurations.
 */

const TrustAgentDemo: React.FC = () => {
  // Configuration pour un agent senior
  const seniorAgentConfig = {
    userName: "Agent Jean MUKENDI",
    userAvatar: "/images/agent-avatar.jpg",
    agentLevel: "senior" as const
  };

  // Configuration pour un agent expert
  const expertAgentConfig = {
    userName: "Dr. Aya KOUASSI",
    userAvatar: "/images/expert-avatar.jpg",
    agentLevel: "expert" as const
  };

  // Configuration pour un agent junior
  const juniorAgentConfig = {
    userName: "Agent Paul YAO",
    userAvatar: "/images/junior-avatar.jpg",
    agentLevel: "junior" as const
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de démonstration */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Démonstration - Trust Agent Dashboard ANSUT
          </h1>
          
          {/* Sélecteur de niveau d'agent */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Niveau d'agent à tester :
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
                Senior
              </button>
              <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200">
                Expert
              </button>
              <button className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200">
                Junior
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard principal */}
      <TrustDashboard {...seniorAgentConfig} />

      {/* Instructions d'utilisation */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            📖 Guide d'utilisation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">🎯 Sections principales</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Validations</strong> : Propriétés à certifier</li>
                <li><strong>Inspections</strong> : Calendrier et suivi</li>
                <li><strong>Rapports</strong> : Statistiques et exports</li>
                <li><strong>Utilisateurs</strong> : Validation KYC</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">🎨 Design System</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Couleur principale : <code>#FF6C2F</code></li>
                <li>Style : Modern Minimalism Premium</li>
                <li>Responsive : Desktop, Tablet, Mobile</li>
                <li>Accessibilité : WCAG AAA</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">⚡ Fonctionnalités</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Validation propriétés avec conformités techniques</li>
                <li>Gestion inspections avec checklists</li>
                <li>Rapports avec statistiques avancées</li>
                <li>Validation KYC utilisateurs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">🔧 Intégration</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Composant principal : <code>TrustDashboard</code></li>
                <li>Sections modulaires et réutilisables</li>
                <li>Données mock réalistes</li>
                <li>Configuration flexible par props</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💻 Code d'intégration</h4>
            <pre className="text-xs text-blue-700 bg-blue-50 p-3 rounded overflow-x-auto">
{`import { TrustDashboard } from '@/components/dashboard/trust';

function MyTrustAgentPage() {
  return (
    <TrustDashboard 
      userName="Agent Jean MUKENDI"
      agentLevel="senior"
      userAvatar="/images/agent-avatar.jpg"
    />
  );
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustAgentDemo;