/**
 * DemoApplication - Page de démonstration du système de candidature
 * Cette page montre toutes les fonctionnalités et peut être utilisée pour les tests
 */

import React, { useState } from 'react';
import { ApplicationForm, ApplicationProgress, ApplicationStep1, ApplicationStep2, ApplicationStep3 } from '@/components/applications';
import type { ApplicationData, DocumentFile } from '@/components/applications';

// Données de démonstration
const demoProperty = {
  id: 'demo-property-123',
  title: 'Magnifique appartement 3 pièces - Centre-ville',
  address: '123 Rue de la Paix, 75001 Paris',
  rent: 2200,
  charges: 150,
  deposit: 4400,
  surface: '75m²',
  rooms: 3,
};

const mockOnSubmit = async (data: ApplicationData, documents: DocumentFile[]) => {
  console.log('=== DEMO: Soumission de candidature ===');
  console.log('Propriété:', demoProperty);
  console.log('Données candidat:', data);
  console.log('Documents:', documents);
  
  // Simulation d'un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Ici vous pourriez rediriger vers une page de confirmation
  alert('Candidature soumise avec succès ! (Démo)');
};

const mockOnSave = async (data: Partial<ApplicationData>) => {
  console.log('=== DEMO: Sauvegarde automatique ===', data);
  // Simulation de sauvegarde
};

export function DemoApplication() {
  const [currentDemo, setCurrentDemo] = useState<'full' | 'step1' | 'step2' | 'step3' | 'progress'>('full');
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    dateOfBirth: '1990-05-15',
    nationality: 'Française',
    address: '123 Rue de la République',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    employmentStatus: 'employed',
    employerName: 'TechCorp',
    jobTitle: 'Développeur',
    monthlyIncome: 4500,
    employmentDuration: '3 ans',
    hasGuarantor: false,
    guarantorFirstName: '',
    guarantorLastName: '',
    guarantorEmail: '',
    guarantorPhone: '',
  });

  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const DemoNav = () => (
    <div className="bg-background-surface border-b border-neutral-200 mb-8">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          🎭 Démonstration - Système de Candidature MONTOIT
        </h1>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCurrentDemo('full')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentDemo === 'full' 
                ? 'bg-primary-500 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Formulaire Complet
          </button>
          
          <button
            onClick={() => setCurrentDemo('progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentDemo === 'progress' 
                ? 'bg-primary-500 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Barre de Progression
          </button>
          
          <button
            onClick={() => setCurrentDemo('step1')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentDemo === 'step1' 
                ? 'bg-primary-500 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Étape 1 - Infos Personnelles
          </button>
          
          <button
            onClick={() => setCurrentDemo('step2')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentDemo === 'step2' 
                ? 'bg-primary-500 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Étape 2 - Documents
          </button>
          
          <button
            onClick={() => setCurrentDemo('step3')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentDemo === 'step3' 
                ? 'bg-primary-500 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Étape 3 - Validation
          </button>
        </div>
      </div>
    </div>
  );

  const PropertyInfo = () => (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-primary-800 mb-4">
        🏠 Propriété de démonstration
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-medium text-primary-700">Titre:</span>
          <p className="text-primary-600">{demoProperty.title}</p>
        </div>
        
        <div>
          <span className="font-medium text-primary-700">Adresse:</span>
          <p className="text-primary-600">{demoProperty.address}</p>
        </div>
        
        <div>
          <span className="font-medium text-primary-700">Loyer:</span>
          <p className="text-primary-600">{demoProperty.rent}€ / mois + {demoProperty.charges}€ charges</p>
        </div>
        
        <div>
          <span className="font-medium text-primary-700">Caractéristiques:</span>
          <p className="text-primary-600">{demoProperty.surface} - {demoProperty.rooms} pièces</p>
        </div>
      </div>
    </div>
  );

  const DemoProgress = () => {
    const [currentStep, setCurrentStep] = useState(2);
    const totalSteps = 3;

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Format par défaut</h3>
          <ApplicationProgress 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            variant="default"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Format détaillé</h3>
          <ApplicationProgress 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            variant="detailed"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Format compact</h3>
          <ApplicationProgress 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            variant="compact"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg disabled:opacity-50"
          >
            Étape précédente
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep === totalSteps}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50"
          >
            Étape suivante
          </button>
        </div>
      </div>
    );
  };

  const DemoStep1 = () => (
    <div className="bg-background-elevated rounded-lg shadow-base p-8">
      <ApplicationStep1
        data={applicationData}
        onChange={(data) => setApplicationData(prev => ({ ...prev, ...data }))}
        onNext={() => console.log('Étape suivante (démo)')}
        loading={false}
      />
    </div>
  );

  const DemoStep2 = () => (
    <div className="bg-background-elevated rounded-lg shadow-base p-8">
      <ApplicationStep2
        documents={documents}
        onDocumentsChange={setDocuments}
        onNext={() => console.log('Étape suivante (démo)')}
        onPrevious={() => console.log('Étape précédente (démo)')}
        loading={false}
      />
    </div>
  );

  const DemoStep3 = () => (
    <div className="bg-background-elevated rounded-lg shadow-base p-8">
      <ApplicationStep3
        applicationData={applicationData}
        documents={documents}
        onSubmit={mockOnSubmit}
        onPrevious={() => console.log('Étape précédente (démo)')}
        loading={false}
      />
    </div>
  );

  const renderCurrentDemo = () => {
    switch (currentDemo) {
      case 'progress':
        return <DemoProgress />;
      case 'step1':
        return <DemoStep1 />;
      case 'step2':
        return <DemoStep2 />;
      case 'step3':
        return <DemoStep3 />;
      default:
        return (
          <ApplicationForm
            propertyId={demoProperty.id}
            propertyTitle={demoProperty.title}
            onSubmit={mockOnSubmit}
            onSave={mockOnSave}
            initialData={applicationData}
            autoSave={true}
            autoSaveInterval={10000}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background-page">
      <DemoNav />
      
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <PropertyInfo />
        
        {renderCurrentDemo()}
        
        {/* Informations de démonstration */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-2">ℹ️ Mode Démonstration</h3>
          <div className="text-sm text-amber-700 space-y-1">
            <p>• Cette page montre toutes les fonctionnalités du système de candidature</p>
            <p>• Les données saisies ne sont pas sauvegardées réellement</p>
            <p>• Utilisez les différents onglets pour tester chaque composant individuellement</p>
            <p>• Consultez la console pour voir les logs des actions</p>
          </div>
        </div>
        
        {/* Instructions techniques */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🔧 Intégration</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Importez depuis: <code className="bg-blue-100 px-1 rounded">@/components/applications</code></p>
            <p>• TypeScript: Tous les types sont exportés</p>
            <p>• Props: Voir documentation dans README.md</p>
            <p>• Styles: Utilisent les design tokens MONTOIT</p>
          </div>
        </div>
      </div>
    </div>
  );
}