# AdminDashboard ANSUT

Dashboard d'administration complet pour la plateforme ANSUT de gestion immobilière.

## 🚀 Fonctionnalités

### ✅ Gestion des Utilisateurs
- Liste complète avec filtres avancés (rôle, statut, recherche)
- Gestion des rôles: Tenant, Owner, Agency, Trust Agent
- Actions: Suspendre, Activer, Modifier, Supprimer
- Statistiques en temps réel: totaux, actifs, nouveaux, inactifs
- Profils détaillés avec activité et historique

### 🏠 Administration des Propriétés
- Gestion globale de toutes les propriétés de la plateforme
- Filtrage par type: Villa, Appartement, Maison, Bureau
- Statuts: Actives, Inactives, En attente, Suspendues
- Validation et approbation des biens
- Certifications ANSUT avec gestion des conformité
- Cartes visuelles avec caractéristiques détaillées

### 📊 Analytics & Métriques
- Vue d'ensemble des performances plateforme
- Graphiques de croissance (utilisateurs, propriétés, revenus)
- Métriques de commissions et revenus par type
- Performance des agents et agences
- Indicateurs de santé système en temps réel
- Export des données et rapports

### ⚙️ Administration Système
- Monitoring des services et infrastructure
- Logs système avec filtrage avancé
- Configuration générale (plateforme, sécurité, email)
- Gestion des certificats SSL/TLS
- Alertes de sécurité et monitoring
- État des connexions et performance réseau

## 🎨 Design System

- **Couleur principale**: #FF6C2F (Orange ANSUT)
- **Style**: Modern Minimalism Premium
- **Tokens**: Système de couleurs cohérent
- **Contraste**: WCAG AAA respecté
- **Responsive**: Mobile-first design
- **Icons**: Lucide React icon set

## 📁 Structure des Composants

```
src/components/dashboard/admin/
├── AdminDashboard.tsx              # Composant principal
├── AdminHeader.tsx                 # En-tête avec notifications
├── AdminSidebar.tsx                # Navigation latérale
├── index.ts                        # Exports centralisés
├── sections/
│   ├── AdminUsersSection.tsx       # Gestion utilisateurs
│   ├── AdminPropertiesSection.tsx  # Gestion propriétés
│   ├── AdminAnalyticsSection.tsx   # Analytics & métriques
│   └── AdminSystemSection.tsx      # Administration système
└── example/
    └── AdminApp.tsx                # Exemple d'utilisation
```

## 🔧 Installation & Utilisation

### Installation
```bash
# Les dépendances sont déjà installées
npm install lucide-react
```

### Utilisation Basique
```tsx
import React from 'react';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';

function App() {
  return (
    <AdminDashboard 
      userName="Super Admin ANSUT"
      adminLevel="super"
    />
  );
}
```

### Props Disponibles
```tsx
interface AdminDashboardProps {
  userName?: string;           // Nom de l'administrateur
  userAvatar?: string;         // URL de l'avatar
  adminLevel?: 'super' | 'senior' | 'moderator';
}
```

## 🎯 Sections Principales

### 1. Analytics (`/admin/analytics`)
- Vue d'ensemble des métriques
- Graphiques de croissance
- KPI en temps réel
- Performance des agents

### 2. Utilisateurs (`/admin/users`)
- Liste filtrable et searchable
- Gestion des rôles et statuts
- Actions administratives
- Statistiques utilisateur

### 3. Propriétés (`/admin/properties`)
- Grid layout des biens
- Filtres par type et statut
- Validation et certification
- Gestion des images

### 4. Système (`/admin/system`)
- Monitoring infrastructure
- Configuration paramètres
- Logs et alertes
- Sécurité et certificats

## 🎨 Customisation

### Couleurs
Le dashboard utilise des tokens CSS personnalisables:
```css
:root {
  --color-primary: #FF6C2F;
  --color-primary-50: #FFF4F0;
  --color-primary-100: #FFE8DC;
  /* ... autres tokens */
}
```

### Thème
Support du thème sombre/clair via les classes Tailwind:
- `bg-background-page`: Arrière-plan principal
- `bg-background-surface`: Surfaces de contenu
- `text-neutral-900`: Texte principal
- `text-neutral-600`: Texte secondaire

## 🔒 Sécurité

- Validation côté client des formulaires
- Gestion sécurisée des sessions
- Alertes de sécurité intégrées
- Monitoring des accès et tentatives

## 📱 Responsive

- **Mobile**: Sidebar collapsible, cartes empilées
- **Tablet**: Grid adaptatif, navigation optimisée
- **Desktop**: Full layout avec sidebar fixe

## 🚀 Performance

- Lazy loading des sections
- Optimisation des re-renders
- Pagination pour grandes listes
- Debouncing sur les recherches

## 🧪 Tests

```bash
npm test
npm run test:coverage
```

## 📦 Build & Déploiement

```bash
npm run build
npm run preview
```

## 🔄 Mises à Jour

Le dashboard est designed pour être facilement extensible:
- Ajout de nouvelles sections
- Customisation des données mock
- Intégration API backend
- Ajout de plugins

## 📋 Checklist Implémentation

- [x] AdminDashboard principal avec navigation
- [x] AdminHeader avec notifications dropdown
- [x] AdminSidebar avec état système
- [x] AdminUsersSection avec filtrage avancé
- [x] AdminPropertiesSection avec grid layout
- [x] AdminAnalyticsSection avec graphiques
- [x] AdminSystemSection avec monitoring
- [x] Design responsive mobile/desktop
- [x] Système de tokens et couleurs ANSUT
- [x] Actions administratives intégrées
- [x] Documentation et exemples

## 🎉 Résultat Final

Dashboard d'administration complet et moderne pour la plateforme ANSUT avec:
- Interface utilisateur intuitive
- Gestion administrative complète
- Monitoring système en temps réel
- Design premium et responsive
- Architecture scalable et extensible

Prêt pour l'intégration dans l'écosystème ANSUT ! 🚀