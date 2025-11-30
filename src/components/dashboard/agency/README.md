# Agency Dashboard - Modern Minimalism Premium

## Vue d'ensemble

Dashboard moderne et épuré conçu spécifiquement pour les agences immobilières sur la plateforme MONTOITVPROD. Interface professionnelle respectant le design system Modern Minimalism Premium.

## Caractéristiques principales

### 🎨 Design System
- **Style**: Modern Minimalism Premium
- **Couleur principale**: #FF6C2F (primary-500)
- **Approche**: Épuré, fonctionnel, professionnel
- **Responsive**: Grille 12 colonnes adaptative
- **Composants**: Réutilisation Badge, Progress, Table

### 📊 Fonctionnalités

#### 1. **AgencyStatsSection** - Statistiques agence
- KPI en temps réel (45 propriétés, 28 mandats, 1.2M FCFA revenus, 92% satisfaction)
- Graphiques de performance équipe
- Évolution des ventes mensuelles vs objectifs
- Taux de conversion des prospects

#### 2. **AgencyPropertiesSection** - Portefeuille biens
- Grille responsive: 3 colonnes desktop, 2 tablet, 1 mobile
- Cards avec image, titre, prix, statut, nombre de visites
- Actions: Modifier, Publier, Suspendre, Statistiques
- Filtres avancés: type, prix, statut, ville
- 45 propriétés mock réalistes

#### 3. **AgencyClientsSection** - Gestion clients
- Liste détaillée avec informations complètes
- Actions: Voir profil, Programmer visite, Envoyer proposition
- Filtres: type (acheteur/locataire), statut, budget
- 28 clients avec données enrichies

#### 4. **AgencyTeamSection** - Équipe et agents
- Grille 4 colonnes desktop, 2 tablet, 1 mobile
- Cards agents avec photo, nom, spécialité, performance
- Statuts: Actif, En vacances, Inactif
- Classement performance, statistiques individuelles
- 5 agents avec données complètes

#### 5. **AgencySalesSection** - Ventes et revenus
- Tableau détaillé: client, propriété, montant, commission, date, statut
- Graphiques: revenus par agent, évolution mensuelle
- Statistiques: CA total, commissions, vente moyenne, taux conversion
- Actions: Voir détails, Télécharger facture, Ajouter note
- 17+ transactions avec données mock

### 🧭 Navigation

#### **AgencyHeader** - En-tête dashboard
- Logo et nom de l'agence
- Notifications équipe en temps réel
- Menu profil avec actions rapides
- Bouton toggle sidebar responsive

#### **AgencySidebar** - Navigation latérale
- Sections: Vue d'ensemble, Propriétés, Clients, Équipe, Ventes
- Actions rapides intégrées
- Indicateurs équipe en temps réel
- Collapse/expand adaptatif

### 📱 Responsive Design

- **Desktop**: Layout 2 colonnes avec sidebar fixe (w-64)
- **Tablet**: Navigation adaptative, sidebar collapse
- **Mobile**: Layout stack, menu hamburger, sidebar overlay

### 🎯 Données Mock Réalistes

- **45 propriétés**: Divers types (villas, appartements, studios, bureaux)
- **5 agents**: Avec spécialités et performances différentes
- **28 clients**: Prospects, actifs, avec budgets et préférences
- **17+ ventes**: Différents statuts et périodes
- **Statistiques**: Cohérentes avec les données métier

## Structure des fichiers

```
src/components/dashboard/agency/
├── AgencyDashboard.tsx              # Composant principal
├── AgencyHeader.tsx                 # En-tête dashboard
├── AgencySidebar.tsx                # Navigation latérale
├── sections/
│   ├── AgencyStatsSection.tsx       # Statistiques & KPI
│   ├── AgencyPropertiesSection.tsx  # Gestion propriétés
│   ├── AgencyClientsSection.tsx     # Base clients
│   ├── AgencyTeamSection.tsx        # Équipe & agents
│   └── AgencySalesSection.tsx       # Ventes & revenus
├── index.ts                         # Exports
└── README.md                        # Documentation
```

## Utilisation

```tsx
import { AgencyDashboard } from '@/components/dashboard/agency';

function App() {
  return <AgencyDashboard />;
}
```

## Variables CSS utilisées

- **Couleurs**: `var(--color-primary-500)`, `var(--color-semantic-success)`
- **Espacement**: `var(--spacing-6)`, `var(--spacing-8)`
- **Ombres**: `var(--shadow-base)`, `var(--shadow-elevated)`
- **Typographie**: `var(--font-size-body)`, `var(--font-weight-semibold)`

## Performance

- **Lazy loading**: Composants chargés à la demande
- **Optimisation**: Transitions CSS, animations fluides
- **Accessibilité**: Contrastes WCAG AAA, navigation clavier
- **SEO**: Structure sémantique HTML5

## Maintenance

### Extension facile
- Ajout de nouvelles sections dans `sections/`
- Types TypeScript centralisés
- Variables CSS pour cohérence visuelle

### Données réelles
- Remplacer mock data par appels API
- Adapter interfaces TypeScript selon backend
- Conserver structure de données existante

## Standards respectés

✅ Design System MONTOITVPROD  
✅ Responsive design 12 colonnes  
✅ Performance optimisée  
✅ Accessibilité WCAG AA/AAA  
✅ Code TypeScript strict  
✅ Architecture modulaire  

---

**Version**: 2.0.0  
**Compatible**: React 18+ / TypeScript 5+  
**Auteur**: MONTOITVPROD Team  
**Licence**: Propriétaire