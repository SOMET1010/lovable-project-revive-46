# Checklist de Déploiement - Gestionnaire de Propriétés Propriétaires

## Vue d'ensemble

Cette checklist garantit un déploiement sans erreur du Gestionnaire de Propriétés Propriétaires (Sprint 3) sur MONTOIT.

**Date**: 2025-11-30  
**Sprint**: 3 - Property Manager  
**Composants**: EditPropertyPage.tsx + Routes + Documentation

---

## Pré-déploiement

### 1. Vérification de l'environnement

- [ ] Node.js version ≥ 18.x
- [ ] pnpm installé globalement
- [ ] Variables d'environnement configurées:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Accès au repository GitHub: https://github.com/SOMET1010/MONTOITVPROD

### 2. Vérification des dépendances

```bash
cd /workspace/MONTOITVPROD
pnpm install
```

- [ ] Aucune erreur de dépendances
- [ ] React Router DOM installé
- [ ] Lucide React installé
- [ ] TypeScript types à jour

### 3. Vérification de la base de données

**Tables requises:**
- [ ] `properties` existe
- [ ] `property_views` existe
- [ ] `property_statistics` existe
- [ ] `rental_applications` existe
- [ ] `profiles` existe

**Colonnes critiques dans `properties`:**
- [ ] `images` (text[])
- [ ] `main_image` (text)
- [ ] `owner_id` (uuid)
- [ ] `status` (text)

**Fonctions SQL:**
- [ ] `get_owner_dashboard_stats(uuid)` existe
- [ ] `get_property_conversion_rate(uuid)` existe

**Vérification:**
```sql
-- Exécuter dans Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties';
```

### 4. Vérification du stockage Supabase

**Bucket: `property-images`**
- [ ] Bucket existe
- [ ] Accès public configuré
- [ ] Politiques RLS correctes:

```sql
-- Vérifier les politiques
SELECT policyname, permissive, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

**Politiques attendues:**
- [ ] `Owners can upload property images` (INSERT)
- [ ] `Public can view property images` (SELECT)
- [ ] `Owners can delete their property images` (DELETE)

---

## Code et fichiers

### 1. Nouveaux fichiers créés

- [ ] `/src/features/owner/pages/EditPropertyPage.tsx` (773 lignes)
- [ ] `/docs/OWNER_PROPERTY_MANAGER_README.md` (766 lignes)
- [ ] `/docs/OWNER_DEPLOYMENT_CHECKLIST.md` (ce fichier)

### 2. Fichiers modifiés

- [ ] `/src/app/routes.tsx` - Ajout route EditPropertyPage
- [ ] `/src/shared/config/routes.config.ts` - Constante route (si modifié)

### 3. Vérification du code

**EditPropertyPage.tsx:**
- [ ] Imports corrects (pas de chemins cassés)
- [ ] Types Database importés
- [ ] Composants UI (Button) importés
- [ ] Icônes Lucide importées
- [ ] AuthProvider utilisé correctement

**Routes:**
```typescript
// Vérifier dans routes.tsx
{
  path: '/dashboard/propriete/:id/modifier',
  element: <EditPropertyPage />,
}
```

- [ ] Route configurée avec paramètre `:id`
- [ ] Import du composant présent
- [ ] Lazy loading configuré (si applicable)

---

## Build et Tests

### 1. Build de production

```bash
cd /workspace/MONTOITVPROD
pnpm run build
```

**Vérifications:**
- [ ] Build réussi sans erreurs
- [ ] Aucun warning TypeScript critique
- [ ] Taille du bundle raisonnable
- [ ] Fichiers générés dans `/dist`

**Erreurs TypeScript à corriger:**
```
Si erreurs de type:
1. Vérifier database.types.ts est à jour
2. Regénérer les types: supabase gen types typescript
3. Vérifier imports des types
```

### 2. Tests locaux

```bash
pnpm run dev
```

**Scénarios de test obligatoires:**

#### Test 1: Chargement de la page d'édition
- [ ] Naviguer vers `/dashboard/proprietaire`
- [ ] Cliquer sur "Modifier" pour une propriété existante
- [ ] URL change vers `/dashboard/propriete/{id}/modifier`
- [ ] Loader s'affiche pendant le chargement
- [ ] Formulaire se charge avec données pré-remplies
- [ ] Images existantes s'affichent

#### Test 2: Vérification de propriété
- [ ] Copier l'URL d'édition d'une propriété
- [ ] Se déconnecter et se reconnecter avec un autre utilisateur
- [ ] Accéder à l'URL copiée
- [ ] Système bloque l'accès avec message d'erreur
- [ ] Redirection vers le dashboard

#### Test 3: Suppression d'images existantes
- [ ] Survoler une image existante
- [ ] Cliquer sur l'icône de corbeille
- [ ] Image devient opaque (marquée pour suppression)
- [ ] Bouton "Restaurer" apparaît
- [ ] Cliquer sur "Restaurer"
- [ ] Image redevient normale

#### Test 4: Ajout de nouvelles images
- [ ] Cliquer sur "Ajouter des photos"
- [ ] Sélectionner 1-3 images
- [ ] Prévisualisations s'affichent dans "Nouvelles images"
- [ ] Survoler une nouvelle image
- [ ] Cliquer sur X pour supprimer
- [ ] Image disparaît de la prévisualisation

#### Test 5: Limite de 10 images
- [ ] Propriété avec 8 images existantes
- [ ] Tenter d'ajouter 3 nouvelles images
- [ ] Message d'erreur: "Maximum 10 images au total"
- [ ] Aucune nouvelle image ajoutée
- [ ] Supprimer 2 images existantes
- [ ] Pouvoir ajouter 3 nouvelles images (total: 6+3=9)

#### Test 6: Modification du formulaire
- [ ] Modifier le titre
- [ ] Modifier la description
- [ ] Changer le statut (disponible → loué)
- [ ] Modifier le loyer
- [ ] Cocher/décocher des équipements
- [ ] Cliquer sur "Enregistrer les modifications"
- [ ] Message de succès s'affiche
- [ ] Redirection vers dashboard après 2 secondes

#### Test 7: Persistance des modifications
- [ ] Après redirection, revenir sur la propriété modifiée
- [ ] Cliquer à nouveau sur "Modifier"
- [ ] Vérifier que toutes les modifications sont sauvegardées
- [ ] Nouvelles images sont dans "Images actuelles"
- [ ] Images supprimées n'apparaissent plus
- [ ] Champs modifiés contiennent les nouvelles valeurs

#### Test 8: Gestion des erreurs
- [ ] Vider le champ "Titre" (obligatoire)
- [ ] Cliquer sur "Enregistrer"
- [ ] Message d'erreur: "Veuillez remplir tous les champs obligatoires"
- [ ] Formulaire n'est pas soumis

#### Test 9: Upload réel vers Supabase
- [ ] Ajouter 2 nouvelles images
- [ ] Soumettre le formulaire
- [ ] Vérifier dans Supabase Storage → property-images
- [ ] Nouveaux fichiers présents avec format: `{propertyId}_{timestamp}_{random}.{ext}`
- [ ] URLs publiques fonctionnelles

#### Test 10: Suppression réelle du Storage
- [ ] Noter les URLs des images à supprimer
- [ ] Marquer 2 images pour suppression
- [ ] Soumettre le formulaire
- [ ] Vérifier dans Supabase Storage
- [ ] Fichiers supprimés n'existent plus
- [ ] URLs retournent 404

### 3. Tests de navigation

- [ ] Dashboard → Ajouter propriété → Fonctionnel
- [ ] Dashboard → Modifier propriété → Fonctionnel
- [ ] Dashboard → Voir stats → Fonctionnel
- [ ] Édition → Annuler → Retour dashboard
- [ ] Édition → Enregistrer → Retour dashboard

### 4. Tests responsive

**Mobile (375px):**
- [ ] Formulaire lisible
- [ ] Grille d'images: 2 colonnes
- [ ] Boutons accessibles
- [ ] Pas de défilement horizontal

**Tablet (768px):**
- [ ] Grille d'images: 4 colonnes
- [ ] Formulaire en 2 colonnes
- [ ] Navigation fluide

**Desktop (1920px):**
- [ ] Layout centré avec max-width
- [ ] Toutes les fonctionnalités visibles
- [ ] Espacement optimal

---

## Supabase

### 1. Row Level Security (RLS)

**Vérifier les politiques sur `properties`:**

```sql
-- Doit retourner une politique
SELECT policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'properties';
```

**Politique attendue:**
```sql
CREATE POLICY "Owners can manage their properties"
ON properties FOR ALL
USING (auth.uid() = owner_id);
```

- [ ] Politique existe
- [ ] Utilise `auth.uid() = owner_id`
- [ ] S'applique à SELECT, INSERT, UPDATE, DELETE

### 2. Storage Policies

**Vérifier dans Supabase Dashboard → Storage → property-images → Policies:**

- [ ] **INSERT**: authenticated users can upload
  ```sql
  bucket_id = 'property-images' AND auth.role() = 'authenticated'
  ```

- [ ] **SELECT**: public can view
  ```sql
  bucket_id = 'property-images'
  ```

- [ ] **DELETE**: owners can delete their images
  ```sql
  bucket_id = 'property-images' AND auth.role() = 'authenticated'
  ```

### 3. Migrations

```bash
# Vérifier que toutes les migrations sont appliquées
supabase migration list
```

- [ ] `20251029172620_add_dashboard_analytics_tables.sql` - Applied
- [ ] Aucune migration en attente

---

## Git et déploiement

### 1. Commit des changements

```bash
cd /workspace/MONTOITVPROD

# Vérifier les fichiers modifiés
git status

# Ajouter les nouveaux fichiers
git add src/features/owner/pages/EditPropertyPage.tsx
git add docs/OWNER_PROPERTY_MANAGER_README.md
git add docs/OWNER_DEPLOYMENT_CHECKLIST.md

# Ajouter les fichiers modifiés (si applicable)
git add src/app/routes.tsx

# Commit
git commit -m "feat: Add property edit page with image management (Sprint 3)

- Add EditPropertyPage.tsx (773 lines) with full editing functionality
- Implement advanced image management (upload, delete, restore)
- Add ownership verification (owner_id check)
- Integrate with Supabase Storage for image operations
- Add route /dashboard/propriete/:id/modifier
- Create comprehensive documentation (OWNER_PROPERTY_MANAGER_README.md)
- Add deployment checklist (OWNER_DEPLOYMENT_CHECKLIST.md)

Features:
- Edit all property fields (title, description, location, features, pricing)
- Manage existing images (view, delete, restore)
- Upload new images (max 10 total)
- Real-time preview before save
- Status management (disponible, loué, retiré)
- Validation and error handling
- Automatic redirection after save

Closes: Sprint 3 - Owner Property Manager"
```

### 2. Push vers GitHub

```bash
# Vérifier la branche actuelle
git branch

# Push vers main (ou la branche appropriée)
git push origin main
```

- [ ] Push réussi sans conflits
- [ ] Changements visibles sur GitHub
- [ ] Repository: https://github.com/SOMET1010/MONTOITVPROD

### 3. Déploiement automatique

Si CI/CD configuré (Vercel, Netlify, etc.):
- [ ] Déploiement déclenché automatiquement
- [ ] Build réussi sur la plateforme
- [ ] Variables d'environnement configurées
- [ ] URL de production mise à jour

**Vérifier les variables d'environnement sur la plateforme:**
```
VITE_SUPABASE_URL=https://[votre-projet].supabase.co
VITE_SUPABASE_ANON_KEY=[votre-clé-anon]
```

---

## Post-déploiement

### 1. Tests en production

**URL de production:** `https://[votre-domaine].com`

- [ ] Site accessible
- [ ] Page d'édition charge correctement
- [ ] Upload d'images fonctionne en production
- [ ] Suppression d'images fonctionne en production
- [ ] Modifications sont sauvegardées
- [ ] Redirection fonctionne

### 2. Vérification console

**Ouvrir DevTools → Console:**
- [ ] Aucune erreur JavaScript
- [ ] Aucune erreur 404 sur les assets
- [ ] Aucune erreur CORS
- [ ] Requêtes Supabase réussies (200 OK)

### 3. Vérification Network

**Ouvrir DevTools → Network:**
- [ ] Images chargées depuis Supabase Storage
- [ ] Requêtes API Supabase fonctionnelles
- [ ] Temps de chargement acceptable (< 2s)

### 4. Vérification Supabase Dashboard

**Logs → API:**
- [ ] Requêtes SELECT sur `properties` réussies
- [ ] Requêtes UPDATE sur `properties` réussies
- [ ] Pas d'erreurs RLS

**Storage → property-images:**
- [ ] Nouveaux uploads apparaissent
- [ ] Suppressions effectives
- [ ] Taille du bucket raisonnable

---

## Monitoring

### 1. Métriques à surveiller

**Performance:**
- [ ] Temps de chargement initial < 2s
- [ ] Temps de réponse API < 500ms
- [ ] Taille des images optimisée

**Utilisation:**
- [ ] Nombre de propriétés créées/modifiées
- [ ] Nombre d'uploads d'images
- [ ] Taux d'erreur < 1%

**Supabase:**
- [ ] Requêtes API dans les limites du plan
- [ ] Stockage dans les limites du plan
- [ ] Aucune erreur RLS

### 2. Logs à vérifier

**Console navigateur:**
```javascript
console.log('Propriété chargée:', property);
console.log('Images uploadées:', uploadedUrls);
console.error('Erreur upload:', err);
```

**Supabase Logs:**
- Vérifier tous les jours pendant 1 semaine
- Identifier les erreurs récurrentes
- Optimiser les requêtes lentes

---

## Rollback

### En cas de problème critique

**1. Identifier le commit à annuler:**
```bash
git log --oneline -n 5
```

**2. Revenir en arrière:**
```bash
# Option A: Revert (préféré en production)
git revert [commit-hash]
git push origin main

# Option B: Reset (uniquement si non déployé)
git reset --hard [commit-hash-avant-sprint-3]
git push origin main --force
```

**3. Redéployer:**
- Déclencher un nouveau build
- Vérifier que l'ancienne version fonctionne

**4. Documenter:**
- Créer une issue GitHub avec le problème
- Noter les étapes de reproduction
- Planifier la correction

---

## Validation finale

### Checklist de livraison

- [ ] **Code**
  - [ ] EditPropertyPage.tsx créé et fonctionnel
  - [ ] Routes configurées
  - [ ] Pas d'erreurs TypeScript
  - [ ] Build de production réussi

- [ ] **Base de données**
  - [ ] Tables existantes et correctes
  - [ ] Politiques RLS actives
  - [ ] Storage configuré

- [ ] **Tests**
  - [ ] Tous les scénarios de test passés
  - [ ] Tests responsive validés
  - [ ] Tests en production réussis

- [ ] **Documentation**
  - [ ] README complet (766 lignes)
  - [ ] Checklist de déploiement complète
  - [ ] Commentaires de code présents

- [ ] **Git**
  - [ ] Commit avec message descriptif
  - [ ] Push vers GitHub réussi
  - [ ] Historique propre

- [ ] **Déploiement**
  - [ ] Production accessible
  - [ ] Fonctionnalités opérationnelles
  - [ ] Aucune erreur critique

---

## Support

### En cas de problème

**1. Consulter la documentation:**
- `/docs/OWNER_PROPERTY_MANAGER_README.md` - Documentation complète
- Section "Dépannage" pour problèmes courants

**2. Vérifier les logs:**
- Console navigateur (F12)
- Supabase Dashboard → Logs
- Server logs (si applicable)

**3. Vérifier GitHub:**
- Issues ouvertes
- Commits récents
- Pull requests

**4. Ressources:**
- Repository: https://github.com/SOMET1010/MONTOITVPROD
- Supabase Docs: https://supabase.com/docs
- React Router: https://reactrouter.com/docs

---

## Signature de déploiement

**Déployé par:** _________________  
**Date:** 2025-11-30  
**Version:** Sprint 3 - Owner Property Manager  
**Statut:** ⬜ Prêt pour production | ⬜ Nécessite corrections

**Notes additionnelles:**
```
[Espace pour notes spécifiques au déploiement]
```

---

**Checklist générée le 2025-11-30**  
**Sprint 3 - Gestionnaire de Propriétés Complet**
