# Prompt d'Audit des Interfaces par Rôle - MonToit

## Contexte

L'application MonToit est une plateforme de location immobilière avec plusieurs rôles utilisateurs :

- **Locataire** (tenant) : peut rechercher des propriétés, postuler, gérer ses contrats et paiements
- **Propriétaire** (owner) : peut ajouter/gérer des propriétés, gérer les candidatures et contrats
- **Agence** (agency) : peut gérer des mandats, propriétés pour plusieurs propriétaires
- **Administrateur** (admin) : accès complet à la plateforme, gestion des utilisateurs, monitoring
- **Agent de confiance** (trust_agent) : vérification des propriétés et utilisateurs

## Objectif de l'Audit

Réaliser un audit complet des interfaces frontend pour chaque rôle, vérifier la cohérence avec les opérations CRUD backend, identifier les incohérences et proposer des corrections.

## Étapes de l'Audit

### 1. Cartographie des Interfaces par Rôle

#### Rôle : Administrateur

**Routes identifiées** (src/app/routes/adminRoutes.tsx) :

- `/admin/tableau-de-bord` - Dashboard admin
- `/admin/utilisateurs` - Gestion utilisateurs
- `/admin/gestion-roles` - Gestion des rôles
- `/admin/api-keys` - Gestion des clés API
- `/admin/regles-metier` - Règles métier
- `/admin/cev-management` - Gestion CEV
- `/admin/trust-agents` - Gestion des agents de confiance
- `/admin/analytics` - Analytics
- `/admin/properties` - Propriétés (vue admin)
- `/admin/transactions` - Transactions
- `/admin/service-monitoring` - Monitoring des services
- `/admin/logs` - Logs système
- `/admin/service-providers` - Fournisseurs de services
- `/admin/service-configuration` - Configuration des services
- `/admin/test-data-generator` - Générateur de données de test
- `/admin/feature-flags` - Feature flags

**Vérifications nécessaires** :

- Chaque route possède-t-elle une page frontend fonctionnelle ?
- Les permissions backend (RLS) correspondent-elles aux restrictions frontend ?
- Les opérations CRUD (Create, Read, Update, Delete) sont-elles implémentées pour chaque entité ?

#### Rôle : Propriétaire

**Routes identifiées** (src/app/routes/ownerRoutes.tsx) :

- `/proprietaire/dashboard` - Dashboard propriétaire
- `/proprietaire/ajouter-propriete` - Ajout de propriété
- `/proprietaire/creer-contrat` - Création de contrat
- `/proprietaire/contrats` - Liste des contrats
- `/proprietaire/mes-biens` - Mes propriétés
- `/proprietaire/profil` - Profil
- `/proprietaire/candidatures` - Candidatures reçues
- `/proprietaire/mes-mandats` - Mes mandats (partagé avec agences)
- `/proprietaire/messages` - Messagerie
- `/proprietaire/visites` - Gestion des visites

**Vérifications CRUD pour les propriétés** :

- **Create** : Formulaire d'ajout (AddPropertyPage.tsx) → API `propertyApi.create()`
- **Read** : Page "Mes biens" → API `propertyApi.getByOwnerId()`
- **Update** : Édition de propriété → API `propertyApi.update()`
- **Delete** : Suppression de propriété → API `propertyApi.delete()`

**Incohérences identifiées** :

1. Mapping des champs : Le frontend envoie `monthly_rent` mais la table `properties` utilise `price` (ligne 456 de AddPropertyPage.tsx)
2. Champ `address` : Frontend envoie string, backend attend JSONB `{street: "..."}`

#### Rôle : Locataire

**Routes identifiées** (src/app/routes/tenantRoutes.tsx) :

- `/locataire/dashboard` - Dashboard locataire
- `/locataire/favoris` - Propriétés favorites
- `/locataire/mes-candidatures` - Mes candidatures
- `/locataire/mes-visites` - Mes visites
- `/locataire/mes-contrats` - Mes contrats
- `/locataire/mes-paiements` - Historique des paiements
- `/locataire/maintenance` - Demandes de maintenance
- `/locataire/mon-score` - Score locataire
- `/locataire/visiter/:id` - Planifier une visite
- `/locataire/candidature/:id` - Postuler à une propriété
- `/locataire/contrat/:id` - Détail du contrat
- `/locataire/signer-bail/:id` - Signer un bail
- `/locataire/effectuer-paiement` - Effectuer un paiement

**Vérifications CRUD pour les candidatures** :

- **Create** : Postuler à une propriété → API `applications` table
- **Read** : Voir ses candidatures → Filtrage par `applicant_id`
- **Update** : Modifier une candidature ? (non typique)
- **Delete** : Annuler une candidature

#### Rôle : Agence

**Routes identifiées** (src/app/routes/agencyRoutes.tsx) :

- `/agences/dashboard` - Dashboard agence
- `/agences/mandats` - Liste des mandats
- `/agences/mandats/:id` - Détail mandat
- `/agences/signer-mandat/:id` - Signer mandat
- `/agences/biens` - Gestion des biens
- `/agences/ajouter-bien` - Ajouter un bien
- `/agences/profil` - Profil agence
- `/agences/candidatures` - Candidatures
- `/agences/contrats` - Contrats
- `/agences/creer-contrat` - Créer contrat
- `/agences/messages` - Messagerie
- `/agences/visites` - Visites
- `/agences/analytics` - Analytics
- `/agences/calendrier` - Calendrier

#### Rôle : Agent de Confiance

**Routes identifiées** (src/app/routes/trustAgentRoutes.tsx) :

- `/trust-agent/dashboard` - Dashboard
- `/trust-agent/calendar` - Calendrier
- `/trust-agent/missions` - Liste des missions
- `/trust-agent/mission/:id` - Détail mission
- `/trust-agent/photos/:id` - Vérification photos
- `/trust-agent/documents/:id` - Validation documents
- `/trust-agent/etat-des-lieux/:id` - État des lieux
- `/trust-agent/certifications/users` - Utilisateurs certifiés
- `/trust-agent/certifications/users/certify` - Certifier utilisateur
- `/trust-agent/certification/:id` - Détail certification
- `/trust-agent/certifications/properties` - Certification propriétés
- `/trust-agent/history` - Historique

### 2. Vérification Backend/Frontend CRUD

Pour chaque entité principale, vérifier :

#### Entité : Propriétés (properties)

**Table backend** : `properties` (src/lib/database.types.ts)
**API frontend** : `propertyApi` (src/features/property/services/property.api.ts)
**Opérations** :

- ✅ `getAll()` - Lecture avec filtres
- ✅ `getById()` - Lecture par ID
- ✅ `getByOwnerId()` - Lecture par propriétaire
- ✅ `create()` - Création
- ✅ `update()` - Mise à jour
- ✅ `delete()` - Suppression
- ✅ `search()` - Recherche texte
- ✅ `count()` - Comptage

**Incohérences** :

1. Champ `price` vs `monthly_rent` : L'API utilise `price` mais le frontend utilise `monthly_rent` dans le formulaire (mappage fait ligne 456)
2. Champ `address` : Type JSONB vs string
3. Champ `property_category` : Valeurs 'residentiel'/'commercial' vs 'residential'/'commercial' dans le formulaire

#### Entité : Candidatures (applications)

**Table backend** : `applications` et `rental_applications` (doublon ?)
**API frontend** : À vérifier - recherche de service dédié
**Opérations nécessaires** :

- Créer candidature (locataire)
- Lire candidatures (propriétaire/agence)
- Mettre à jour statut (propriétaire/agence)
- Supprimer candidature (locataire)

#### Entité : Contrats (leases)

**Table backend** : `leases`
**API frontend** : Service `contractService` (src/services/contracts/contractService.ts)
**Opérations** :

- Créer contrat (propriétaire/agence)
- Signer contrat (locataire)
- Mettre à jour statut
- Résilier contrat

#### Entité : Paiements (payments)

**Table backend** : `payments`
**API frontend** : À vérifier
**Opérations** :

- Créer paiement (locataire)
- Confirmer paiement (système)
- Historique des paiements

### 3. Vérification des Permissions par Rôle (RLS vs Frontend)

**Règles RLS à vérifier** (dans Supabase) :

1. `profiles` : Chaque utilisateur ne voit que son propre profil
2. `properties` :
   - Les propriétaires voient leurs propres propriétés
   - Les agences voient les propriétés de leurs mandats
   - Les locataires voient toutes les propriétés publiques (status='disponible')
   - Les admins voient toutes les propriétés
3. `applications` :
   - Les locataires voient leurs propres candidatures
   - Les propriétaires voient les candidatures pour leurs propriétés
   - Les agences voient les candidatures pour les propriétés qu'elles gèrent
4. `leases` :
   - Les locataires voient leurs propres contrats
   - Les propriétaires voient les contrats de leurs propriétés
   - Les agences voient les contrats des propriétés qu'elles gèrent

**Vérification frontend** :

- Les composants `ProtectedRoute` utilisent-ils les bons `allowedRoles` ?
- Les redirections en cas d'accès non autorisé sont-elles implémentées ?
- Les pages affichent-elles uniquement les données autorisées ?

### 4. Checklist d'Audit Détaillée

Pour chaque rôle et chaque page :

#### Page : Ajout de propriété (`/proprietaire/ajouter-propriete`)

- [ ] Le formulaire envoie-t-il les données au bon endpoint ?
- [ ] Les champs obligatoires backend sont-ils tous présents ?
- [ ] La validation frontend correspond-elle aux contraintes base de données ?
- [ ] Les erreurs backend sont-elles correctement affichées ?
- [ ] L'utilisateur est-il redirigé après succès ?
- [ ] Les images sont-elles uploadées correctement ?

#### Page : Liste des propriétés (`/proprietaire/mes-biens`)

- [ ] L'API `getByOwnerId` est-elle appelée avec le bon `owner_id` ?
- [ ] Les données affichées correspondent-elles au schéma backend ?
- [ ] Les actions (éditer, supprimer) fonctionnent-elles ?
- [ ] La pagination est-elle implémentée si nécessaire ?
- [ ] Les filtres fonctionnent-ils avec l'API ?

#### Page : Dashboard admin (`/admin/tableau-de-bord`)

- [ ] Les statistiques utilisent-elles les fonctions RPC backend (`get_platform_stats`) ?
- [ ] Les graphiques reçoivent-ils des données valides ?
- [ ] Les alertes système sont-elles réelles ou mockées ?
- [ ] Les liens vers les autres pages admin fonctionnent-ils ?

#### Page : Candidatures locataire (`/locataire/mes-candidatures`)

- [ ] L'API filtre-t-elle par `applicant_id` ?
- [ ] Les statuts sont-ils cohérents avec l'enum `ApplicationStatus` ?
- [ ] Les actions (annuler, modifier) sont-elles implémentées ?

### 5. Tests à Réaliser

#### Tests manuels par rôle :

1. **Connectez-vous en tant que locataire** :
   - Vérifiez que vous ne pouvez pas accéder à `/proprietaire/ajouter-propriete`
   - Vérifiez que vous pouvez postuler à une propriété
   - Vérifiez que vous voyez seulement vos propres candidatures

2. **Connectez-vous en tant que propriétaire** :
   - Vérifiez que vous pouvez ajouter une propriété
   - Vérifiez que vous voyez seulement vos propriétés
   - Vérifiez que vous pouvez gérer les candidatures pour vos propriétés

3. **Connectez-vous en tant qu'admin** :
   - Vérifiez que vous voyez toutes les propriétés
   - Vérifiez que vous pouvez modifier/supprimer n'importe quelle propriété
   - Vérifiez que les pages de monitoring fonctionnent

#### Tests d'intégration CRUD :

1. **Cycle complet propriété** :
   - Créer une propriété (POST)
   - Lire la propriété créée (GET)
   - Modifier la propriété (PATCH)
   - Supprimer la propriété (DELETE)

2. **Cycle complet candidature** :
   - Locataire postule (POST)
   - Propriétaire voit la candidature (GET)
   - Propriétaire change le statut (PATCH)
   - Locataire voit le statut mis à jour (GET)

### 6. Rapport d'Incohérences à Corriger

#### Incohérences critiques identifiées :

1. **Mapping champ prix** :
   - **Problème** : Le frontend utilise `monthly_rent` mais la base de données utilise `price`
   - **Solution** : Standardiser sur un seul nom (recommandé : `monthly_rent` dans la table)
   - **Impact** : Requiert migration de base de données

2. **Type de champ address** :
   - **Problème** : Frontend envoie string, backend attend JSONB
   - **Solution** : Convertir l'adresse en JSONB `{street: "..."}` dans l'API
   - **Impact** : Correction dans `propertyApi.create()`

3. **Doublon de tables** :
   - **Problème** : Tables `applications` et `rental_applications` semblent dupliquées
   - **Solution** : Consolider en une seule table
   - **Impact** : Requiert refactorisation importante

4. **Permissions manquantes** :
   - **Problème** : Certaines pages n'ont pas de vérification de rôle frontend
   - **Solution** : Ajouter `ProtectedRoute` sur toutes les routes sensibles
   - **Impact** : Sécurité améliorée

5. **API incomplète** :
   - **Problème** : Pas d'API dédiée pour les candidatures
   - **Solution** : Créer `applicationApi` avec CRUD complet
   - **Impact** : Meilleure maintenabilité

### 7. Recommandations d'Amélioration

1. **Documentation des APIs** :
   - Créer un fichier OpenAPI/Swagger pour toutes les endpoints
   - Documenter les paramètres, retours et erreurs

2. **Tests automatisés** :
   - Implémenter des tests E2E pour chaque flux utilisateur
   - Tests d'intégration pour les APIs
   - Tests de permissions par rôle

3. **Monitoring** :
   - Ajouter des logs d'audit pour les opérations sensibles
   - Surveiller les erreurs de permission dans les logs

4. **Refactorisation** :
   - Unifier les services API par domaine (property, application, lease, payment)
   - Standardiser les réponses d'erreur
   - Implémenter un système de cache cohérent

## Instructions pour l'Auditeur

1. **Examiner chaque fichier de route** pour s'assurer que toutes les pages existent
2. **Vérifier chaque appel API** dans les pages correspondantes
3. **Comparer les schémas frontend/backend** pour chaque entité
4. **Tester les permissions** en se connectant avec différents rôles
5. **Documenter les incohérences** dans un tableau
6. **Prioriser les corrections** par impact et complexité
7. **Proposer un plan de correction** avec estimations

## Livrables Attendus

1. **Rapport d'audit** détaillé avec :
   - Liste des interfaces par rôle
   - État des opérations CRUD (complètes/partielles/manquantes)
   - Incohérences identifiées
   - Recommandations de correction

2. **Matrice de conformité** :
   - Tableau croisé Rôle × Opération × Entité
   - Statut (OK, Partiel, KO, Manquant)

3. \*\*
