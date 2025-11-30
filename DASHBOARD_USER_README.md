# Dashboard Utilisateur Personnel - MONTOIT

## Vue d'ensemble

Le Dashboard Utilisateur Personnel est une interface complète permettant aux utilisateurs de gérer toutes leurs activités immobilières sur la plateforme MONTOIT.

## Fonctionnalités

### 1. Profil Utilisateur
- Visualisation et modification du profil
- Upload de photo de profil
- Gestion des informations personnelles (nom, téléphone, ville, adresse, bio)
- Indicateur de vérification du profil

### 2. Favoris
- Liste des propriétés favorites
- Ajout/suppression de favoris
- Notes personnelles sur chaque favori
- Accès rapide aux détails des propriétés

### 3. Historique de Recherche
- Historique des 100 dernières recherches
- Relancer une recherche précédente
- Visualisation des critères de recherche
- Nombre de résultats par recherche
- Suppression d'éléments ou effacement complet

### 4. Notifications
- Centre de notifications unifié
- Filtrage (toutes/non lues)
- Marquage comme lu
- Notifications pour:
  - Nouvelles propriétés correspondant aux alertes
  - Changements de prix
  - Messages
  - Visites
  - Contrats
  - Paiements

### 5. Statistiques
- Total des favoris
- Total des recherches
- Alertes actives
- Notifications non lues

## Architecture Technique

### Fichiers créés

#### Migration SQL
- `supabase/migrations/20251130000000_add_search_history_table.sql`
  - Table `search_history` pour l'historique
  - Fonction `add_search_to_history()` pour ajouts
  - Fonction `cleanup_old_search_history()` pour maintenir max 100 entrées
  - RLS policies pour sécurité

#### Services
- `src/services/userDashboardService.ts`
  - `getUserProfile()` - Récupérer le profil
  - `updateUserProfile()` - Mettre à jour le profil
  - `uploadAvatar()` - Upload photo
  - `getSearchHistory()` - Historique recherches
  - `addSearchToHistory()` - Ajouter recherche
  - `getFavorites()` - Récupérer favoris
  - `addToFavorites()` - Ajouter favori
  - `removeFromFavorites()` - Supprimer favori
  - `getNotifications()` - Récupérer notifications
  - `markNotificationAsRead()` - Marquer comme lu
  - `getDashboardStats()` - Statistiques dashboard

#### Pages et Composants
- `src/features/dashboard/pages/DashboardPage.tsx` - Page principale
- `src/features/dashboard/components/`
  - `DashboardStats.tsx` - Affichage statistiques
  - `ProfileSection.tsx` - Section profil
  - `FavoritesSection.tsx` - Section favoris
  - `SearchHistorySection.tsx` - Section historique
  - `NotificationsSection.tsx` - Section notifications

#### Routes
- `COMMON.DASHBOARD: '/dashboard'` ajouté dans `routes.config.ts`
- Route protégée configurée dans `src/app/routes.tsx`

## Installation et Déploiement

### Prérequis
1. Projet MONTOIT existant
2. Supabase configuré
3. Node.js et npm/pnpm installés

### Étape 1: Appliquer la migration SQL

Vous avez deux options:

**Option A: Via Supabase CLI (Recommandé)**
```bash
cd /path/to/MONTOITVPROD
npx supabase db push
```

**Option B: Via Supabase Dashboard**
1. Allez sur dashboard.supabase.com
2. Sélectionnez votre projet MONTOIT
3. Allez dans "SQL Editor"
4. Copiez le contenu de `supabase/migrations/20251130000000_add_search_history_table.sql`
5. Exécutez la requête

### Étape 2: Installer les dépendances

```bash
cd /path/to/MONTOITVPROD
pnpm install
```

### Étape 3: Vérifier la configuration

Assurez-vous que votre fichier `.env` ou `.env.local` contient:
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

### Étape 4: Build et déploiement

**Développement local:**
```bash
pnpm dev
```

**Production (Bolt):**
```bash
pnpm build
```

Le build sera dans le dossier `dist/`. Déployez ce dossier sur Bolt ou votre hébergement.

### Étape 5: Accéder au dashboard

Une fois connecté, accédez au dashboard via:
- URL directe: `https://votre-site.com/dashboard`
- Ou ajoutez un lien dans la navigation

## Intégration avec l'historique de recherche

Pour que l'historique de recherche se remplisse automatiquement, ajoutez cette fonction dans votre page de recherche:

```typescript
import { addSearchToHistory } from '@/services/userDashboardService';

// Après une recherche réussie
const handleSearch = async (params) => {
  // Votre logique de recherche existante
  const results = await searchProperties(params);
  
  // Ajouter à l'historique
  await addSearchToHistory(params, results.length);
};
```

## Intégration avec les favoris

Pour ajouter/retirer des favoris depuis les cards de propriétés:

```typescript
import { addToFavorites, removeFromFavorites, isFavorite } from '@/services/userDashboardService';

// Vérifier si favori
const { isFavorite: isInFavorites } = await isFavorite(propertyId);

// Ajouter aux favoris
await addToFavorites(propertyId, "Ma note personnelle");

// Retirer des favoris
await removeFromFavorites(propertyId);
```

## Design System

Le dashboard utilise le design system MONTOIT existant:
- Couleur primaire: `#FF6C2F` (orange)
- Design tokens: `src/styles/design-tokens.css`
- Composants UI: `Button`, `Icon` (Lucide React)
- Classes CSS utilitaires du design system

## Responsive Design

Le dashboard est entièrement responsive:
- Mobile: Navigation par onglets, grilles simples
- Tablet: Grilles 2 colonnes
- Desktop: Grilles 3 colonnes, affichage complet

## Sécurité

- Toutes les routes sont protégées via `<ProtectedRoute>`
- Row Level Security (RLS) activé sur toutes les tables
- Les utilisateurs ne peuvent voir que leurs propres données
- Validation des uploads (taille max 5MB pour avatars)

## Tests

Pour tester le dashboard:

1. Créez un compte utilisateur
2. Effectuez quelques recherches de propriétés
3. Ajoutez des propriétés aux favoris
4. Vérifiez que tout apparaît dans le dashboard

## Dépannage

### La migration échoue
- Vérifiez que vous avez les bonnes permissions Supabase
- Vérifiez que la table `search_history` n'existe pas déjà

### Les données ne s'affichent pas
- Vérifiez que l'utilisateur est bien connecté
- Vérifiez les RLS policies dans Supabase
- Consultez la console du navigateur pour les erreurs

### Erreur 404 sur /dashboard
- Vérifiez que la route est bien ajoutée dans `routes.tsx`
- Redémarrez le serveur de développement

## Support

Pour toute question ou problème:
1. Vérifiez la console du navigateur
2. Vérifiez les logs Supabase
3. Consultez la documentation Supabase

## Améliorations futures possibles

- Graphiques de statistiques
- Export de données
- Partage de recherches
- Synchronisation entre appareils
- Notifications push
- Mode sombre

## Licence

Propriété de MONTOIT Platform
