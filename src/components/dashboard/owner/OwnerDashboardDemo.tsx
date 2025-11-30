import React from 'react';
import { OwnerDashboard } from './index';

/**
 * Démonstration du Dashboard Owner
 * 
 * Ce composant montre comment utiliser le dashboard propriétaire
 * avec des données mock réalistes
 */
const OwnerDashboardDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <OwnerDashboard 
        userName="Marie DUPONT"
        userAvatar="/images/owner-avatar.jpg"
        ownerLevel="professionnel"
      />
    </div>
  );
};

export default OwnerDashboardDemo;