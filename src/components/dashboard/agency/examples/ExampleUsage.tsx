// Exemple d'utilisation du Dashboard Agency
import React from 'react';
import { AgencyDashboard } from '@/components/dashboard/agency';

const ExampleAgencyApp: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AgencyDashboard 
        agencyName="Immobilier Premium Abidjan"
        userName="Marie KOUASSI"
        userRole="manager"
        userAvatar="/images/agency-manager.jpg"
      />
    </div>
  );
};

export default ExampleAgencyApp;

/*
Usage dans une application React :

1. Importer le dashboard :
   import { AgencyDashboard } from '@/components/dashboard/agency';

2. Utiliser avec les props :
   <AgencyDashboard 
     agencyName="Nom de votre agence"
     userName="Nom de l'utilisateur"
     userRole="director" | "manager" | "agent"
     userAvatar="/path/to/avatar.jpg"
   />

3. Sections disponibles :
   - properties : Gestion du portfolio propriétés
   - clients : Base de données clients
   - transactions : Suivi commissions et revenus  
   - team : Gestion équipe et performances

4. Fonctionnalités incluses :
   ✓ Interface responsive (desktop/tablet/mobile)
   ✓ Données mock réalistes pour la Côte d'Ivoire
   ✓ Métriques temps réel et analytics
   ✓ Gestion complète des propriétés
   ✓ CRM clients intégré
   ✓ Suivi transactions et commissions
   ✓ Gestion équipe et formations
   ✓ Navigation intuitive avec sidebar
   ✓ Design system cohérent (#FF6C2F)
*/