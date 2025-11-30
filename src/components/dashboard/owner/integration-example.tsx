import React from 'react';
import { OwnerDashboard } from './index';

/**
 * Exemples d'intégration du Dashboard Owner
 */

// Exemple 1: Intégration dans une page dédiée
export const OwnerDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <OwnerDashboard 
        userName="Marie DUPONT"
        userAvatar="/images/owner-avatar.jpg"
        ownerLevel="professionnel"
      />
    </div>
  );
};

// Exemple 2: Dashboard avec état de chargement
export const OwnerDashboardWithState: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    // Simulation du chargement des données utilisateur
    const loadUserData = async () => {
      setIsLoading(true);
      // API call ici
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserData({
        name: "Jean-Baptiste KOUASSI",
        avatar: "/images/jb-avatar.jpg",
        level: "expert" as const
      });
      setIsLoading(false);
    };
    
    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Erreur de chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <OwnerDashboard 
      userName={userData.name}
      userAvatar={userData.avatar}
      ownerLevel={userData.level}
    />
  );
};

// Exemple 3: Utilisation des sections individuelles
export const CustomOwnerView: React.FC = () => {
  const [activeView, setActiveView] = React.useState<'properties' | 'tenants' | 'finances' | 'maintenance'>('properties');

  const renderActiveView = () => {
    switch (activeView) {
      case 'properties':
        // Import dynamique pour optimiser les performances
        const { OwnerPropertiesSection } = require('./sections/OwnerPropertiesSection');
        return <OwnerPropertiesSection />;
      case 'tenants':
        const { OwnerTenantsSection } = require('./sections/OwnerTenantsSection');
        return <OwnerTenantsSection />;
      case 'finances':
        const { OwnerFinancesSection } = require('./sections/OwnerFinancesSection');
        return <OwnerFinancesSection />;
      case 'maintenance':
        const { OwnerMaintenanceSection } = require('./sections/OwnerMaintenanceSection');
        return <OwnerMaintenanceSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header personnalisé */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-neutral-900">Mon Toit - Propriétaire</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveView('properties')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'properties' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Propriétés
              </button>
              <button
                onClick={() => setActiveView('tenants')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'tenants' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Locataires
              </button>
              <button
                onClick={() => setActiveView('finances')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'finances' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Finances
              </button>
              <button
                onClick={() => setActiveView('maintenance')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'maintenance' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Maintenance
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>
    </div>
  );
};

// Exemple 4: Dashboard avec thème personnalisé
export const OwnerDashboardThemed: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50">
      <OwnerDashboard 
        userName="Sophie TRAORE"
        userAvatar="/images/sophie-avatar.jpg"
        ownerLevel="expert"
      />
    </div>
  );
};

// Exemple 5: Configuration pour différents types d'utilisateurs
export const OwnerDashboardConfigurable: React.FC<{
  userType: 'particulier' | 'professionnel' | 'expert';
  showAdvanced?: boolean;
}> = ({ userType, showAdvanced = true }) => {
  const getUserData = (type: typeof userType) => {
    switch (type) {
      case 'particulier':
        return {
          name: "Pierre NDRI",
          avatar: "/images/pierre-avatar.jpg",
          level: 'particulier' as const,
          title: "Propriétaire Particulier",
          features: ['basic']
        };
      case 'professionnel':
        return {
          name: "Marie DUPONT",
          avatar: "/images/marie-avatar.jpg",
          level: 'professionnel' as const,
          title: "Gestionnaire Professionnel",
          features: ['basic', 'professional']
        };
      case 'expert':
        return {
          name: "Dr. Jean KOUASSI",
          avatar: "/images/jean-avatar.jpg",
          level: 'expert' as const,
          title: "Expert Immobilier",
          features: ['basic', 'professional', 'expert']
        };
    }
  };

  const userData = getUserData(userType);

  return (
    <div className="min-h-screen">
      {/* Header personnalisé selon le type */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-neutral-900">{userData.title}</h1>
            <p className="text-neutral-600">Bienvenue {userData.name}</p>
          </div>
        </div>
      </div>

      <OwnerDashboard 
        userName={userData.name}
        userAvatar={userData.avatar}
        ownerLevel={userData.level}
      />
    </div>
  );
};

export default {
  OwnerDashboardPage,
  OwnerDashboardWithState,
  CustomOwnerView,
  OwnerDashboardThemed,
  OwnerDashboardConfigurable
};