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
```tsx
import { AgencyDashboard } from '@/components/dashboard/agency';

function App() {
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