<<<<<<< HEAD
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

=======
# Owner Dashboard - Documentation

## Vue d'ensemble

Le Owner Dashboard est un tableau de bord moderne et épuré conçu pour les propriétaires immobiliers de la plateforme MONTOITVPROD. Il permet une gestion complète du portefeuille immobilier avec un style "Modern Minimalism Premium".

## Fonctionnalités principales

### 📊 Statistiques (OwnerStatsSection)
- **KPIs principaux** : 12 propriétés, 8 occupées, 425k FCFA revenus/mois, 95% taux d'occupation
- **Graphiques** : Revenus mensuels sur 6 mois, taux d'occupation trimestriel
- **Indicateurs visuels** : Statut Bon, À améliorer, Critique avec badges colorés
- **Progression animée** : Barres de progression avec valeurs en temps réel

### 🏠 Gestion des Propriétés (OwnerPropertiesSection)
- **Grille responsive** : 2 colonnes desktop, 1 mobile
- **Cards détaillées** : Titre, adresse, statut (Occupé, Libre, Maintenance), prix mensuel
- **Actions rapides** : Voir détails, Modifier, Ajouter photos
- **Filtres avancés** : Par statut, prix, ville
- **Tenant info** : Affichage des locataires actuels pour les propriétés occupées

### 👥 Gestion des Locataires (OwnerTenantsSection)
- **Liste complète** : Nom, propriété, loyer, échéance, contact
- **Actions interactives** : Contacter, Voir détails, Relancer paiement
- **Statuts dynamiques** : Actif, En retard, Fin de contrat
- **Alertes intelligentes** : Contrats expirant dans 30 jours, paiements en retard

### 📝 Candidatures Reçues (OwnerApplicationsSection)
- **Tableau complet** : Candidat, propriété, date, statut, score de qualification
- **Actions directes** : Accepter, Refuser, Demander documents supplémentaires
- **Filtres par statut** : Nouvelles, En cours, Décidées
- **Système de scoring** : Évaluation automatique avec badges de qualité

### 💳 Revenus & Paiements (OwnerPaymentsSection)
- **Suivi détaillé** : Locataire, propriété, montant, date, statut de paiement
- **Statuts multiples** : Reçu, En attente, En retard
- **Actions automatisées** : Confirmer réception, Envoyer relances
- **Analytics** : Total revenus mensuels et annuels avec projections

## Architecture technique

### Structure des fichiers
```
src/components/dashboard/owner/
├── OwnerDashboard.tsx                 # Composant principal
├── OwnerHeader.tsx                    # En-tête avec navigation
├── OwnerSidebar.tsx                   # Navigation latérale
├── sections/
│   ├── OwnerStatsSection.tsx          # Statistiques et KPIs
│   ├── OwnerPropertiesSection.tsx     # Gestion des propriétés
│   ├── OwnerTenantsSection.tsx        # Gestion des locataires
│   ├── OwnerApplicationsSection.tsx   # Candidatures reçues
│   └── OwnerPaymentsSection.tsx       # Revenus et paiements
├── index.ts                           # Exports centralisés
└── README.md                          # Documentation
```

### Design System
- **Couleurs** : Primary #FF6C2F, neutres 50-900, sémantiques (success, error, warning, info)
- **Typographie** : Inter, tailles 12px-64px, poids 400-700
- **Espacement** : Système 8pt (8px, 16px, 24px, 32px, etc.)
- **Border radius** : 12px, 16px, 24px, 9999px (full)
- **Ombres** : sm, base, md, lg, focus avec élévation progressive

### Composants réutilisés
- **Badge** : Variantes (success, warning, error, info, outline), tailles (small, medium, large)
- **Progress** : Valeurs 0-100, variantes de couleur, animation optionnelle
- **Table** : Colonnes configurables, tri, pagination, actions par ligne

## Responsive Design

### Breakpoints
- **Mobile** : < 640px - Menu hamburger, layout stack, cards pleine largeur
- **Tablet** : 768px-1023px - Navigation bottom, grille 2 colonnes
- **Desktop** : > 1024px - Sidebar fixe, grille complète, toutes fonctionnalités

### Adaptations mobiles
- **Sidebar** : Collapse automatique en icônes
- **Navigation** : Boutons avec icônes + labels courts
- **Tableaux** : Scroll horizontal avec headers fixes
- **Actions** : Boutons pleine largeur sur mobile

## Données et état

### Types TypeScript
```typescript
interface OwnerDashboardData {
  user: {
    full_name: string;
    email: string;
    company?: string;
  };
  stats: {
    totalProperties: number;
    occupiedProperties: number;
    monthlyRevenue: number;
    occupancyRate: number;
    yearlyGrowth: { revenue: number; occupancy: number; applications: number };
  };
  properties: Property[];
  tenants: Tenant[];
  applications: Application[];
  payments: Payment[];
}
```

### Gestion d'état
- **Loading** : Animations de chargement pour chaque section
- **Error handling** : Messages d'erreur avec retry automatique
- **Real-time updates** : Structure prête pour les WebSockets
- **Performance** : Lazy loading des sections non critiques

## Accessibilité

### Conformité WCAG AAA
- **Contraste** : 16.5:1 pour texte principal, 8.6:1 pour texte secondaire
- **Focus** : Anneaux de focus visibles (3px orange)
- **Navigation clavier** : Tous les éléments interactifs accessibles
- **Aria labels** : Descriptions complètes pour les lecteurs d'écran

### Optimisations
- **Screen readers** : Roles et labels appropriés
- **Reduced motion** : Respect des préférences utilisateur
- **High contrast** : Mode disponible pour malvoyants
- **Font scaling** : Support zoom jusqu'à 200%

## Performance

### Optimisations implémentées
- **Code splitting** : Chaque section chargée à la demande
- **Image optimization** : Formats modernes, lazy loading
- **Animation performance** : GPU acceleration, transforms 3D
- **Bundle size** : Tree shaking automatique, composants modulaires

### Métriques cibles
- **First Paint** : < 1.5s
- **Interactive** : < 2.5s
- **Bundle size** : < 100KB total
- **Lighthouse Score** : > 90 sur tous les critères

## Intégration

### Utilisation basique
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
```typescript
import { OwnerDashboard } from '@/components/dashboard/owner';

function App() {
<<<<<<< HEAD
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
=======
  return <OwnerDashboard />;
}
```

### Personnalisation
```typescript
import { 
  OwnerDashboard, 
  OwnerStatsSection,
  OwnerPropertiesSection 
} from '@/components/dashboard/owner';

// Utilisation de sections individuelles
function CustomDashboard() {
  return (
    <div>
      <OwnerHeader user={user} />
      <OwnerStatsSection stats={stats} />
      <OwnerPropertiesSection properties={properties} />
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
    </div>
  );
}
```

<<<<<<< HEAD
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
=======
### Styling personnalisé
```scss
// Variables CSS personnalisables
:root {
  --owner-dashboard-primary: #FF6C2F;
  --owner-dashboard-spacing: 32px;
  --owner-dashboard-radius: 16px;
}
```

## Tests et qualité

### Tests recommandés
- **Unit tests** : Composants isolés avec Jest
- **Integration tests** : Flux complets avec Cypress
- **E2E tests** : Scénarios utilisateur avec Playwright
- **A11y tests** : Conformité WCAG avec axe-core

### Code quality
- **ESLint** : Règles strictes, auto-fix activé
- **Prettier** : Format automatique, consistent styling
- **TypeScript** : Types stricts, 0 erreur de compilation
- **Husky** : Pre-commit hooks, quality gates

## Déploiement

### Environment variables
```env
VITE_OWNER_API_URL=https://api.montoit.com/owner
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
```

### Build optimisé
```bash
# Production build
npm run build

# Analyse du bundle
npm run analyze

# Tests avec couverture
npm run test:coverage
```

## Maintenance

### Changelog
- Version 1.0.0 : Implementation complète
- Version 1.1.0 : Optimisations performance (planned)
- Version 1.2.0 : Nouvelles fonctionnalités (planned)

### Roadmap
- **Q1 2025** : Intégration API temps réel
- **Q2 2025** : Notifications push intelligentes
- **Q3 2025** : Analytics avancées et rapports
- **Q4 2025** : IA pour recommandations automatiques

---

## Support

Pour toute question technique ou demande de fonctionnalité, contactez l'équipe de développement MONTOITVPROD.

**Créé avec ❤️ pour une expérience propriétaire exceptionnelle**
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
