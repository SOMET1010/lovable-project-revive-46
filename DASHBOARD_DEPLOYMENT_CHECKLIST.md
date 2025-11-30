# Checklist de Déploiement - Dashboard Utilisateur MONTOIT

## Pré-déploiement

### 1. Migration Base de Données
- [ ] Fichier de migration créé: `supabase/migrations/20251130000000_add_search_history_table.sql`
- [ ] Migration appliquée sur Supabase (via CLI ou Dashboard)
- [ ] Table `search_history` créée et visible dans Supabase
- [ ] RLS policies actives sur `search_history`
- [ ] Fonction `add_search_to_history()` créée
- [ ] Fonction `cleanup_old_search_history()` créée

### 2. Vérification des Tables Existantes
- [ ] Table `profiles` existe
- [ ] Table `property_favorites` existe
- [ ] Table `property_alerts` existe
- [ ] Table `notifications` existe
- [ ] Toutes les RLS policies sont actives

### 3. Variables d'Environnement
- [ ] `VITE_SUPABASE_URL` configurée
- [ ] `VITE_SUPABASE_ANON_KEY` configurée
- [ ] Bucket storage `user-content` créé pour avatars

### 4. Code Source
- [ ] Tous les fichiers créés sont présents
- [ ] Aucune erreur TypeScript
- [ ] Routes configurées correctement
- [ ] Design tokens importés

## Déploiement

### 5. Build
```bash
cd /path/to/MONTOITVPROD
pnpm install
pnpm build
```
- [ ] Build réussi sans erreurs
- [ ] Dossier `dist/` créé
- [ ] Taille du build raisonnable

### 6. Tests Locaux (Développement)
```bash
pnpm dev
```
- [ ] Application démarre sans erreur
- [ ] Aucune erreur dans la console
- [ ] Route `/dashboard` accessible
- [ ] Redirection si non connecté

### 7. Déploiement sur Bolt/Hébergement
- [ ] Dossier `dist/` déployé
- [ ] Variables d'env configurées sur l'hébergement
- [ ] Application accessible en production

## Post-déploiement

### 8. Tests Fonctionnels en Production

#### Connexion
- [ ] Un utilisateur peut se connecter
- [ ] Redirection automatique fonctionne

#### Section Profil
- [ ] Profil s'affiche correctement
- [ ] Modification du profil fonctionne
- [ ] Upload d'avatar fonctionne
- [ ] Photo s'affiche après upload

#### Section Favoris
- [ ] Liste des favoris s'affiche
- [ ] Retrait d'un favori fonctionne
- [ ] Lien vers propriété fonctionne
- [ ] Message "Aucun favori" s'affiche si liste vide

#### Section Historique
- [ ] Historique s'affiche
- [ ] Relancer une recherche fonctionne
- [ ] Suppression d'un élément fonctionne
- [ ] Effacer tout l'historique fonctionne

#### Section Notifications
- [ ] Notifications s'affichent
- [ ] Filtre "Toutes/Non lues" fonctionne
- [ ] Marquer comme lu fonctionne
- [ ] Marquer tout comme lu fonctionne

#### Statistiques
- [ ] Les chiffres s'affichent correctement
- [ ] Favoris: compte correct
- [ ] Recherches: compte correct
- [ ] Alertes: compte correct
- [ ] Notifications: compte correct

### 9. Tests Responsive

#### Mobile (< 768px)
- [ ] Navigation par onglets fonctionne
- [ ] Grilles s'adaptent (1 colonne)
- [ ] Avatar visible dans header
- [ ] Boutons accessibles (min 44px)

#### Tablet (768px - 1024px)
- [ ] Grilles 2 colonnes
- [ ] Navigation horizontale
- [ ] Stats sur 2 lignes

#### Desktop (> 1024px)
- [ ] Grilles 3 colonnes pour favoris
- [ ] Stats sur 1 ligne (4 colonnes)
- [ ] Layout complet visible

### 10. Tests de Sécurité
- [ ] Utilisateur ne peut voir que ses propres données
- [ ] Accès non authentifié redirige vers login
- [ ] Upload d'avatar limite 5MB respectée
- [ ] RLS bloque accès aux données d'autres users

### 11. Tests de Performance
- [ ] Chargement initial < 3s
- [ ] Pas de requêtes infinies
- [ ] Images optimisées
- [ ] Pas de memory leaks

## Intégrations Optionnelles

### 12. Historique de Recherche Automatique
Pour remplir automatiquement l'historique, modifier la page de recherche:

```typescript
// Dans src/features/tenant/pages/SearchPropertiesPage.tsx
import { addSearchToHistory } from '@/services/userDashboardService';

// Après recherche réussie
const handleSearch = async () => {
  const results = await searchProperties(filters);
  
  // Ajouter à l'historique
  if (user) {
    await addSearchToHistory(filters, results.length);
  }
};
```

- [ ] Intégration ajoutée dans page de recherche
- [ ] Historique se remplit automatiquement lors des recherches

### 13. Boutons Favoris dans Cards
Ajouter bouton favori dans les PropertyCard:

```typescript
import { addToFavorites, removeFromFavorites } from '@/services/userDashboardService';
```

- [ ] Bouton favori ajouté aux PropertyCard
- [ ] Toggle favori fonctionne

### 14. Lien Dashboard dans Navigation
Ajouter lien dans Header/Navigation:

```typescript
<Link to="/dashboard">Mon Dashboard</Link>
```

- [ ] Lien ajouté dans navigation principale
- [ ] Lien visible uniquement si connecté

## Problèmes Courants et Solutions

### Migration échoue
**Problème**: Erreur lors de l'application de la migration
**Solution**: 
- Vérifier permissions Supabase
- Vérifier que table n'existe pas déjà
- Exécuter manuellement via SQL Editor

### Données ne s'affichent pas
**Problème**: Sections vides alors que données existent
**Solution**:
- Vérifier RLS policies
- Vérifier que user_id correspond
- Console browser pour voir erreurs

### Upload avatar échoue
**Problème**: Erreur lors upload photo
**Solution**:
- Créer bucket `user-content` dans Supabase Storage
- Vérifier RLS policies du bucket
- Vérifier taille fichier < 5MB

### Route 404
**Problème**: /dashboard retourne 404
**Solution**:
- Vérifier route dans `routes.tsx`
- Redémarrer serveur dev
- Vérifier build inclut les fichiers

## Validation Finale

- [ ] Dashboard accessible en production
- [ ] Toutes les sections fonctionnent
- [ ] Aucune erreur console
- [ ] Design cohérent avec le reste du site
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Sécurité validée

## Notes de Version

**Version**: 1.0.0  
**Date**: 2025-11-30  
**Auteur**: Matrix Agent  
**Status**: Production Ready  

## Contact Support

En cas de problème:
1. Vérifier cette checklist
2. Consulter DASHBOARD_USER_README.md
3. Vérifier console browser + logs Supabase
4. Contacter support MONTOIT

---

**Note**: Cette checklist doit être complétée avant de considérer le dashboard comme déployé en production.
