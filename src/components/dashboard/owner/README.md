# Dashboard Owner - Mon Toit

Dashboard complet pour les propriétaires de biens immobiliers, basé sur un design moderne et minimaliste avec la couleur principale #FF6C2F.

## 🏠 Vue d'ensemble

Le Dashboard Owner permet aux propriétaires de gérer efficacement leurs propriétés en location, leurs locataires, leurs finances et les demandes de maintenance.

## 📁 Structure des fichiers

```
src/components/dashboard/owner/
├── OwnerDashboard.tsx                 # Composant principal du dashboard
├── OwnerHeader.tsx                    # En-tête avec notifications et profil
├── OwnerSidebar.tsx                   # Barre latérale de navigation
├── OwnerDashboardDemo.tsx             # Composant de démonstration
├── index.ts                           # Exports centralisés
├── README.md                          # Documentation
└── sections/
    ├── OwnerPropertiesSection.tsx     # Gestion des propriétés
    ├── OwnerTenantsSection.tsx        # Gestion des locataires
    ├── OwnerFinancesSection.tsx       # Gestion financière
    └── OwnerMaintenanceSection.tsx    # Maintenance et entretien
```

## 🚀 Utilisation

### Import de base

```typescript
import { OwnerDashboard } from '@/components/dashboard/owner';

function App() {
  return (
    <OwnerDashboard 
      userName="Marie DUPONT"
      userAvatar="/images/owner-avatar.jpg"
      ownerLevel="professionnel"
    />
  );
}
```

### Import de démonstration

```typescript
import { OwnerDashboardDemo } from '@/components/dashboard/owner';

function Demo() {
  return <OwnerDashboardDemo />;
}
```

### Import des sections individuelles

```typescript
import { 
  OwnerPropertiesSection,
  OwnerTenantsSection,
  OwnerFinancesSection,
  OwnerMaintenanceSection 
} from '@/components/dashboard/owner';

// Utilisation dans un autre dashboard
function CustomDashboard() {
  return (
    <div>
      <OwnerPropertiesSection />
      {/* Autres sections... */}
    </div>
  );
}
```

## 🎨 Fonctionnalités principales

### Propriétés (OwnerPropertiesSection)
- **Portfolio complet** : Vue d'ensemble de toutes les propriétés
- **Statuts multiples** : Louée, Vacante, En maintenance, En négociation
- **Métriques de performance** : Candidatures, visites, taux d'occupation
- **Gestion détaillée** : Photos, descriptions, caractéristiques
- **Revenus tracking** : Suivi des revenus par propriété

### Locataires (OwnerTenantsSection)
- **Profils complets** : Informations de contact et historique
- **Gestion des baux** : Dates de début/fin, statuts
- **Historique des paiements** : Suivi de la ponctualité
- **Communication** : Contact direct avec les locataires
- **Évaluations** : Notes et commentaires sur les locataires

### Finances (OwnerFinancesSection)
- **Revenus/Charges** : Vue d'ensemble mensuelle et annuelle
- **Graphiques** : Évolution des revenus et répartition des dépenses
- **Export de données** : Fonctionnalités d'export pour comptable
- **Métriques clés** : Marge nette, taux de croissance
- **Transactions** : Historique détaillé des mouvements

### Maintenance (OwnerMaintenanceSection)
- **Demandes tracking** : Suivi des demandes par priorité et statut
- **Planification** : Calendrier des interventions
- **Prestataires** : Gestion des partenaires techniques
- **Coûts** : Estimation et suivi des coûts réels
- **Historique** : Archive des réparations et interventions

## 🎯 Design et UX

### Principes de design
- **Minimalisme moderne** : Interface épurée et intuitive
- **Couleur principale** : #FF6C2F (orange premium)
- **Accessibilité** : Contrastes WCAG AAA respectés
- **Responsive** : Adaptatif mobile/desktop
- **Cohérence** : Basé sur le système de design existant

### Navigation
- **Sidebar intuitive** : Navigation claire par sections
- **Breadcrumbs** : Orientation utilisateur
- **Actions rapides** : Boutons d'action contextuelle
- **Notifications** : Système d'alertes temps réel

## 📊 Données mock

Le dashboard utilise des données mock réalistes pour la démonstration :

### Propriétés
- 8 propriétés au total
- Taux d'occupation : 75%
- Revenus mensuels : 2,850,000 FCFA
- Mix : Villas, Appartements, Studios, Maisons

### Locataires
- Profils complets avec historique de paiement
- Note moyenne : 4.5/5
- Taux de ponctualité : 95%+

### Finances
- Croissance mensuelle : +8.5%
- Marge nette : 88.6%
- Répartition des charges équilibrée

### Maintenance
- Système de priorités (Urgent → Faible)
- Statuts détaillés (Nouveau → Terminé)
- Prestataires partenaires qualifiés

## 🔧 Personnalisation

### Thème
Les couleurs utilisent le système de tokens CSS existant :
- `primary-600` : #FF6C2F (couleur principale)
- `semantic-success/error/warning/info` : Couleurs fonctionnelles
- `neutral-*` : Échelle de gris

### Données
Remplacer les données mock par des appels API dans :
- Services de données
- Hooks personnalisés (useOwnerData, etc.)
- Store management (Zustand, Redux, etc.)

## 🚀 Développement

### Scripts de test
```bash
# Démarrer la démo
npm run dev

# Build
npm run build

# Tests
npm run test
```

### Composants de support
Le dashboard utilise les composants UI existants :
- `Button`, `Input`, `Card` du système de design
- Icons Lucide React
- Système de grid responsive

## 📱 Responsive

- **Mobile** : Sidebar coulissante, layout stacké
- **Tablet** : Grilles adaptatives, navigation optimisée
- **Desktop** : Sidebar fixe, layout multi-colonnes

## 🔒 Sécurité

- Validation des données côté client
- Sanitisation des entrées utilisateur
- Gestion des états de chargement
- Erreurs gracieusement gérées

## 📈 Performance

- Lazy loading des sections
- Optimisation des re-rendus
- Bundle splitting automatique
- Images optimisées

## 🎉 Prêt pour la production

Le dashboard est entièrement prêt pour l'intégration :
- Code TypeScript typé
- Architecture modulaire
- Documentation complète
- Tests possibles
- Accessible et responsive

---

**Créé pour Mon Toit** - Plateforme immobilière de référence 🚀