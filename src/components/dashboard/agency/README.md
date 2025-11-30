<<<<<<< HEAD
# Dashboard Agency - Plateforme de Gestion Immobilière

Dashboard professionnel pour les agences immobilières, développé avec React, TypeScript et Tailwind CSS selon l'architecture Modern Minimalism Premium.

## 📋 Fonctionnalités

### 🏢 Gestion des Propriétés
- **Portfolio complet** des biens de l'agence
- **Statuts avancés** : Disponibles, Loués, En maintenance, Suspendues, Vendues
- **Métriques de performance** : vues, candidatures, taux de conversion
- **Actions spécialisées** : Ajouter, Modifier, Archiver, Promouvoir
- **Vue grille et liste** avec filtres avancés
- **Recherche intelligente** par adresse, propriétaire, agent

### 👥 Gestion des Clients
- **Base de données complète** des locataires et propriétaires
- **Segmentation par profil** et besoins
- **Historique des interactions** et transactions
- **Communication intégrée** et suivi personnalisé
- **Système de scoring** client
- **Gestion des préférences** et budgets

### 💰 Transactions & Commissions
- **Suivi des revenus** et commissions de l'agence
- **Historique détaillé** des ventes/locations réussies
- **Facturation et paiements** en cours
- **Prévisions et objectifs** mensuels
- **Performance par agent**
- **Analyse des tendances** de marché

### 👔 Équipe & Ressources Humaines
- **Gestion complète** des agents de l'agence
- **Performance individuelle** et collective
- **Attribution des propriétés** et clients
- **Formations et certifications** 
- **Planning et disponibilité**
- **Objectifs et激励ations**

## 🎨 Design System

### Tokens de Couleur
```css
--primary-500: #FF6C2F     /* Couleur principale */
--primary-600: #E05519     /* Hover/Active */
--neutral-900: #171717     /* Texte principal */
--neutral-700: #404040     /* Texte secondaire */
--semantic-success: #059669 /* Success */
--semantic-error: #DC2626   /* Error */
--semantic-warning: #D97706 /* Warning */
```

### Architecture des Composants
```
src/components/dashboard/agency/
├── AgencyDashboard.tsx              # Composant principal
├── AgencyHeader.tsx                 # En-tête avec logo et badge
├── AgencySidebar.tsx                # Navigation latérale
├── index.ts                         # Export barrel
└── sections/
    ├── AgencyPropertiesSection.tsx  # Gestion des propriétés
    ├── AgencyClientsSection.tsx     # Gestion des clients  
    ├── AgencyTransactionsSection.tsx # Transactions & commissions
    └── AgencyTeamSection.tsx        # Gestion de l'équipe
```

## 🚀 Utilisation

### Installation
```bash
npm install
# ou
yarn install
```

### Composant Principal
=======
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

>>>>>>> 179702229bfc197f668a7416e325de75b344681e
```tsx
import { AgencyDashboard } from '@/components/dashboard/agency';

function App() {
<<<<<<< HEAD
  return (
    <AgencyDashboard 
      agencyName="Immobilier Premium Abidjan"
      userName="Marie KOUASSI"
      userRole="manager"
      userAvatar="/images/agency-manager.jpg"
    />
  );
}
```

### Sections Spécifiques
```tsx
import { 
  AgencyPropertiesSection,
  AgencyClientsSection,
  AgencyTransactionsSection,
  AgencyTeamSection
} from '@/components/dashboard/agency';
```

## 📊 Données Mock

Le dashboard utilise des données mock réalistes pour l'écosystème ivoirien :
- **Propriétés** : Villas Cocody, Appartements Marcory, Immeubles Plateau
- **Clients** : Particuliers et SCI avec contacts locaux (+225)
- **Agents** : Équipe multi-niveaux avec spécialisations
- **Transactions** : Commissions standard et gestion locative

## 🔧 Personnalisation

### Styles CSS
```css
/* Utilise les tokens CSS du design system */
.bg-primary-600 { background-color: var(--primary-600); }
.text-primary-600 { color: var(--primary-600); }
```

### Thèmes
Support de thèmes par variable CSS et classes Tailwind personnalisées.

## 📱 Responsive Design

- **Desktop** : Navigation sidebar complète
- **Tablet** : Layout adaptatif avec sidebar repliable
- **Mobile** : Menu hamburger et interface optimisée

## 🛠️ Technologies

- **React 18** avec hooks modernes
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **Architecture modulaire** avec composants réutilisables

## 📈 Métriques Clés

- **KPI temps réel** : Vues, conversions, commissions
- **Performance équipe** : Objectifs, satisfaction client
- **Analytics** : Tendances de vente et revenus récurrents
- **Rapports** : Export et visualisations

## 🎯 Cas d'Usage

1. **Direction d'agence** : Vue d'ensemble stratégique
2. **Responsable commercial** : Suivi des performances
3. **Agent immobilier** : Gestion de son portefeuille
4. **Administrateur** : Gestion équipe et ressources

## 🔮 Extensions Possibles

- **API backend** pour données persistantes
- **Notifications push** en temps réel
- **Chat équipe** intégré
- **Rapports PDF** automatisés
- **Intégration CRM** externe
- **Analytics avancées** avec Machine Learning

---

Développé selon les standards Modern Minimalism Premium pour une expérience utilisateur optimale dans l'immobilier ivoirien.
=======
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
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
