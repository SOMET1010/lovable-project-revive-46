import React, { useState } from 'react';
import { TrustHeader } from './TrustHeader';
import { TrustSidebar } from './TrustSidebar';
import { TrustValidationSection } from './sections/TrustValidationSection';

interface TrustDashboardProps {
  userName?: string;
  agentLevel?: 'junior' | 'senior' | 'expert';
}

export function TrustDashboard({ 
  userName = "Agent ANSUT", 
  agentLevel = "senior" 
}: TrustDashboardProps) {
  const [activeSection, setActiveSection] = useState('validation');

  const renderContent = () => {
    switch (activeSection) {
      case 'validation':
        return <TrustValidationSection />;
      case 'inspections':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Gestion des Inspections
            </h2>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <p className="text-neutral-600">
                Module d'inspection des propriétés en développement...
              </p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Rapports et Statistiques
            </h2>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <p className="text-neutral-600">
                Rapports de conformité et métriques ANSUT...
              </p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Validation des Utilisateurs
            </h2>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <p className="text-neutral-600">
                Validation KYC des locataires et propriétaires...
              </p>
            </div>
          </div>
        );
      default:
        return <TrustValidationSection />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TrustHeader userName={userName} agentLevel={agentLevel} />
      <div className="flex">
        <TrustSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 ml-64">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}