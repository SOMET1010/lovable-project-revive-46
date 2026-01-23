# 📘 Guide Utilisateur Complet - Mon Toit

## Table des Matières

1. [Authentification](#1-authentification)
2. [Système de Rôles](#2-système-de-rôles)
3. [Dashboards par Rôle](#3-dashboards-par-rôle)
4. [Trust Agent (Tiers de Confiance)](#4-trust-agent-tiers-de-confiance)
5. [NeoFace - Vérification Biométrique](#5-neoface---vérification-biométrique)
6. [Publication de Propriété](#6-publication-de-propriété)
7. [Fonctionnalités Métier](#7-fonctionnalités-métier)
8. [Sécurité & Vérification](#8-sécurité--vérification)
9. [Paiements & Contrats](#9-paiements--contrats)
10. [Notifications & Communications](#10-notifications--communications)

---

## 1. Authentification

### Méthodes de Connexion

Mon Toit privilégie l'authentification par **téléphone** (SMS/OTP), adaptée au marché ivoirien où l'email est peu utilisé.

| Méthode | Description | Recommandé |
|---------|-------------|------------|
| **Téléphone + OTP** | Code SMS à usage unique | ✅ Primaire |
| **Email + Mot de passe** | Authentification classique | Secondaire |

### Flux d'Inscription par Téléphone

```
┌─────────────────────────────────────────────────────────────┐
│              INSCRIPTION PAR TÉLÉPHONE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SAISIE                                                   │
│     └─ Nom complet + Numéro de téléphone                    │
│     └─ Format: +225 07 XX XX XX XX                          │
│                                                              │
│  2. ENVOI OTP                                                │
│     └─ Code 6 chiffres envoyé par SMS                       │
│     └─ Fournisseur: InTouch API                             │
│     └─ Validité: 5 minutes                                  │
│                                                              │
│  3. VÉRIFICATION                                             │
│     └─ Saisie du code OTP                                   │
│     └─ Création du compte si valide                         │
│                                                              │
│  4. COMPLÉTION PROFIL                                        │
│     └─ Redirection vers /completer-profil                   │
│     └─ Type d'utilisateur (locataire/propriétaire/agence)   │
│     └─ Informations complémentaires                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Flux de Connexion

```
┌─────────────────────────────────────────────────────────────┐
│                    CONNEXION                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📱 PAR TÉLÉPHONE                                            │
│     └─ Numéro → OTP SMS → Connexion                         │
│                                                              │
│  📧 PAR EMAIL                                                │
│     └─ Email + Mot de passe → Connexion                     │
│                                                              │
│  🔄 REDIRECTION POST-CONNEXION                               │
│     └─ DashboardRouter analyse le profil                    │
│     └─ Redirige vers le dashboard approprié                 │
│        • Admin → /admin                                     │
│        • Trust Agent → /trust-agent/dashboard               │
│        • Propriétaire → /dashboard/proprietaire             │
│        • Agence → /dashboard/agence                         │
│        • Locataire → /dashboard/locataire                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Système de Rôles

### Architecture Multi-Rôle Dynamique

Mon Toit implémente un **système de rôles contextuels** permettant d'être locataire ET propriétaire simultanément.

```
┌─────────────────────────────────────────────────────────────┐
│                 UTILISATEUR: Konan Yao                       │
├─────────────────────────────────────────────────────────────┤
│  🏠 EST PROPRIÉTAIRE ?                                       │
│  └─ Vérifie: properties.owner_id = user.id                  │
│     → 2 propriétés trouvées ✓                               │
│                                                              │
│  🔑 EST LOCATAIRE ?                                          │
│  └─ Vérifie: lease_contracts.tenant_id = user.id            │
│     → 1 bail actif trouvé ✓                                 │
│                                                              │
│  📊 RÉSULTAT: isOwner: true │ isTenant: true                │
└─────────────────────────────────────────────────────────────┘
```

### Types de Rôles

| Rôle | Description | Détection |
|------|-------------|-----------|
| **Locataire** | Cherche et loue des biens | Bail actif dans `lease_contracts` |
| **Propriétaire** | Possède des biens à louer | Propriétés dans `properties` |
| **Agence** | Gère des biens pour des tiers | Entrée dans `agencies` |
| **Admin** | Administre la plateforme | Rôle `admin` dans `user_roles` |
| **Trust Agent** | Vérifie et modère | Rôle `trust_agent` dans `user_roles` |

---

## 2. Dashboards par Rôle

### 🔑 Dashboard Locataire (`/dashboard/locataire`)

**Accès:** Utilisateurs avec bail actif ou en recherche

| Section | Fonctionnalité |
|---------|----------------|
| **Mon Profil** | Informations personnelles, score locataire |
| **Mes Locations** | Baux actifs, historique des locations |
| **Mes Paiements** | Historique, effectuer un paiement, quittances |
| **Mes Visites** | Visites planifiées, historique |
| **Maintenance** | Signaler un problème, suivi des demandes |
| **Mon Score** | Trust Score détaillé, améliorer son score |
| **Favoris** | Propriétés sauvegardées |
| **Messages** | Communication avec propriétaires/agences |

### 🏠 Dashboard Propriétaire (`/dashboard/proprietaire`)

**Accès:** Utilisateurs possédant des propriétés

| Section | Fonctionnalité |
|---------|----------------|
| **Vue d'ensemble** | Stats propriétés, revenus, taux d'occupation |
| **Mes Propriétés** | Gérer, ajouter, modifier des biens |
| **Mes Contrats** | Baux actifs, créer/résilier des contrats |
| **Candidatures** | Applications reçues, accepter/refuser |
| **Paiements** | Loyers reçus, retards, relances |
| **Maintenance** | Demandes des locataires, interventions |
| **Documents** | Contrats, quittances, états des lieux |

### 🏢 Dashboard Agence (`/dashboard/agence`)

**Accès:** Comptes agence vérifiés

| Section | Fonctionnalité |
|---------|----------------|
| **Tableau de bord** | KPIs, objectifs, performance |
| **Équipe** | Gestion des agents, attributions |
| **Propriétés Gérées** | Biens sous mandat |
| **Mandats** | Contrats de gestion, commissions |
| **Transactions** | Revenus, commissions, historique |
| **Candidatures** | Dossiers locataires à traiter |
| **Rapports** | Analytics, exports |

### 🛡️ Dashboard Admin (`/admin`)

**Accès:** Rôle `admin` dans `user_roles`

| Section | Route | Fonctionnalité |
|---------|-------|----------------|
| **Tableau de bord** | `/admin/tableau-de-bord` | Stats plateforme |
| **Utilisateurs** | `/admin/utilisateurs` | Gestion des comptes |
| **Trust Agents** | `/admin/trust-agents` | Gérer les agents de confiance |
| **Validation Docs** | `/admin/validation-documents` | Valider propriétés |
| **Clés API** | `/admin/api-keys` | Intégrations externes |
| **Services** | `/admin/service-providers` | Fournisseurs |
| **Monitoring** | `/admin/service-monitoring` | État des services |
| **CEV/ONECI** | `/admin/cev-management` | Certificats |
| **Démo** | `/admin/demo-rapide` | Données de test |

---

## 3. Trust Agent (Tiers de Confiance)

### Définition

Le **Trust Agent** (ou Tiers de Confiance) est un rôle spécial chargé de :
- Vérifier les propriétés sur le terrain
- Réaliser les états des lieux
- Médier les litiges entre locataires et propriétaires
- Valider les documents officiels

### Dashboard Trust Agent (`/trust-agent`)

| Section | Route | Fonctionnalité |
|---------|-------|----------------|
| **Dashboard** | `/trust-agent/dashboard` | Vue d'ensemble des missions |
| **Modération** | `/trust-agent/moderation` | Valider/rejeter les annonces |
| **Médiation** | `/trust-agent/mediation` | Gérer les litiges |
| **Analytiques** | `/trust-agent/analytics` | Performance, statistiques |

### Workflow des Missions CEV

```
┌────────────────────────────────────────────────────────────┐
│                    MISSION CEV                              │
├────────────────────────────────────────────────────────────┤
│ 1. CRÉATION                                                 │
│    └─ Admin/Système crée une mission (cev_missions)        │
│                                                             │
│ 2. ATTRIBUTION                                              │
│    └─ Assignée à un Trust Agent (assigned_agent_id)        │
│                                                             │
│ 3. PLANIFICATION                                            │
│    └─ Agent fixe une date (scheduled_date)                 │
│                                                             │
│ 4. VISITE TERRAIN                                           │
│    └─ Vérification: photos, documents, checklist           │
│                                                             │
│ 5. RAPPORT                                                  │
│    └─ État des lieux (etat_lieux_report)                   │
│    └─ Photos avant/après                                   │
│                                                             │
│ 6. VALIDATION                                               │
│    └─ Statut → completed                                   │
│    └─ +40 points Trust Score pour le propriétaire          │
└────────────────────────────────────────────────────────────┘
```

### Types de Missions

| Type | Description |
|------|-------------|
| `verification` | Vérification initiale d'une propriété |
| `etat_lieux_entree` | État des lieux d'entrée |
| `etat_lieux_sortie` | État des lieux de sortie |
| `inspection` | Inspection périodique |
| `mediation` | Intervention pour litige |

### Gestion des Litiges

```
┌────────────────────────────────────────────────────────────┐
│                    WORKFLOW LITIGE                          │
├────────────────────────────────────────────────────────────┤
│ 1. SIGNALEMENT                                              │
│    └─ Locataire ou propriétaire ouvre un litige            │
│    └─ Catégorie: paiement, maintenance, comportement...    │
│                                                             │
│ 2. ATTRIBUTION                                              │
│    └─ Assigné à un Trust Agent senior                      │
│                                                             │
│ 3. MÉDIATION                                                │
│    └─ Échanges via dispute_messages                        │
│    └─ Collecte des preuves (evidence)                      │
│                                                             │
│ 4. RÉSOLUTION                                               │
│    └─ Décision: accord, arbitrage, escalade               │
│    └─ Satisfaction des parties notée                       │
│                                                             │
│ 5. CLÔTURE                                                  │
│    └─ Statut → resolved                                    │
│    └─ Impact sur Trust Scores                              │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Fonctionnalités Métier

### Cycle de Vie d'une Propriété

```
CRÉATION → VÉRIFICATION → PUBLICATION → CANDIDATURES → CONTRAT → OCCUPATION
    │           │              │              │            │          │
    └─ Brouillon└─ Trust Agent └─ Visible     └─ Scoring   └─ Signé   └─ Actif
```

### Processus de Candidature

1. **Locataire postule** → Formulaire + documents
2. **Scoring automatique** → Trust Score calculé
3. **Propriétaire examine** → Accepte/refuse
4. **Visite planifiée** → Si accepté
5. **Contrat créé** → Après visite réussie
6. **Signature électronique** → CryptoNeo
7. **État des lieux** → Trust Agent

### Système de Scoring

| Facteur | Points | Description |
|---------|--------|-------------|
| **NeoFace** | 60 pts | Vérification biométrique |
| **Validation Admin** | 40 pts | Documents validés par Trust Agent |
| **Total** | 100 pts | Trust Score global |

---

## 5. NeoFace - Vérification Biométrique

### Présentation

**NeoFace** est le système de vérification d'identité biométrique de Mon Toit. Il compare une photo de CNI (Carte Nationale d'Identité) avec un selfie en temps réel pour confirmer l'identité de l'utilisateur.

### Architecture du Système

```
┌─────────────────────────────────────────────────────────────┐
│                    NEOFACE WORKFLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ÉTAPE 1: UPLOAD CNI                                         │
│  └─ Photo recto de la CNI                                   │
│  └─ Validation client (face-api.js)                         │
│     • Visage détecté ?                                      │
│     • Taille suffisante (>3% de l'image) ?                  │
│                                                              │
│  ÉTAPE 2: DÉTECTION DE VIE (LIVENESS)                        │
│  └─ Caméra frontale activée                                 │
│  └─ 4 défis aléatoires parmi:                               │
│     • Cligner des yeux (blink)                              │
│     • Tourner la tête à gauche (turn_left)                  │
│     • Tourner la tête à droite (turn_right)                 │
│     • Lever la tête (look_up)                               │
│  └─ Timer 10 secondes par défi                              │
│                                                              │
│  ÉTAPE 3: TEST ANTI-REFLET (Flash)                           │
│  └─ Écran flashe couleur aléatoire (blanc/vert/rouge)       │
│  └─ Mesure delta luminosité sur le visage                   │
│  └─ Distingue peau réelle vs écran/photo                    │
│                                                              │
│  ÉTAPE 4: COMPARAISON                                        │
│  └─ Selfie capturé envoyé à l'API NeoFace                   │
│  └─ Comparaison avec photo CNI                              │
│  └─ Seuil de correspondance: 85%                            │
│                                                              │
│  ÉTAPE 5: RÉSULTAT                                           │
│  └─ Score ≥ 60 → Vérifié ✓ (+60 pts Trust Score)           │
│  └─ Score < 60 → Échec (nouvelle tentative possible)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Système Anti-Fraude

| Menace | Détection | Pénalité Score |
|--------|-----------|----------------|
| **Photo statique** | Variance EAR < 0.005 (yeux immobiles) | -50 pts |
| **Deepfake** | Variance rotation < 2.0° (mouvement linéaire) | -20 pts |
| **Injection vidéo** | Gaps de détection > 3 frames | -30 pts |
| **Écran/Projection** | Delta flash insuffisant | -10 pts |
| **Temps excessif** | Complétion trop lente | -10 pts |

### Calcul du Liveness Score

```
┌─────────────────────────────────────────────────────────────┐
│              LIVENESS SCORE (0-100)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Score initial: 100 points                                  │
│                                                              │
│  DÉDUCTIONS:                                                 │
│  - Yeux statiques (EAR variance < 0.005)    → -50 pts       │
│  - Mouvement linéaire (yaw variance < 2.0)  → -20 pts       │
│  - Gaps de détection (> 3 frames)           → -30 pts       │
│  - Échec test flash                          → -10 pts       │
│  - Temps excessif                            → -10 pts       │
│                                                              │
│  SEUIL DE VALIDATION: Score ≥ 60                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Interface Utilisateur Premium

| Élément | Description |
|---------|-------------|
| **Guide Ovale** | Cadre animé pour positionner le visage |
| **Timer Circulaire** | SVG vert→rouge, 10 secondes par défi |
| **Barre de Progression** | Chargement du modèle face-api.js |
| **Animation Succès** | Cercles concentriques + confettis |

### Stockage des Données

| Donnée | Table | Champ |
|--------|-------|-------|
| URL Selfie | `facial_verification_attempts` | `selfie_url` |
| URL Document | `facial_verification_attempts` | `document_url` |
| Score Matching | `facial_verification_attempts` | `matching_score` |
| Statut | `facial_verification_attempts` | `status` |
| Liveness détecté | `facial_verification_attempts` | `is_live` |

---

## 6. Publication de Propriété

### Workflow en 3 Phases

```
┌─────────────────────────────────────────────────────────────┐
│           PUBLICATION DE PROPRIÉTÉ                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ══════════════════════════════════════════════════════════ │
│  PHASE 1: DÉTAILS DE LA PROPRIÉTÉ                            │
│  ══════════════════════════════════════════════════════════ │
│                                                              │
│  Étape 1: Informations de base                              │
│  └─ Type (appartement, maison, studio...)                   │
│  └─ Titre et description                                    │
│  └─ Nombre de pièces, surface                               │
│                                                              │
│  Étape 2: Localisation                                       │
│  └─ Adresse complète                                        │
│  └─ Ville, quartier, commune                                │
│  └─ Coordonnées GPS (optionnel)                             │
│                                                              │
│  Étape 3: Prix et conditions                                 │
│  └─ Loyer mensuel (FCFA)                                    │
│  └─ Caution                                                 │
│  └─ Charges incluses ou non                                 │
│                                                              │
│  ══════════════════════════════════════════════════════════ │
│  PHASE 2: VÉRIFICATION D'IDENTITÉ                            │
│  ══════════════════════════════════════════════════════════ │
│                                                              │
│  Étape 4: Upload CNI                                         │
│  └─ Photo de la pièce d'identité                            │
│  └─ Déclenche automatiquement NeoFace                       │
│                                                              │
│  Étape 5: Vérification biométrique                           │
│  └─ Liveness detection (défis)                              │
│  └─ Comparaison CNI ↔ Selfie                                │
│  └─ Score ≥ 85% requis                                      │
│                                                              │
│  ══════════════════════════════════════════════════════════ │
│  PHASE 3: DOCUMENTS & SOUMISSION                             │
│  ══════════════════════════════════════════════════════════ │
│                                                              │
│  Étape 6: Documents complémentaires                          │
│  └─ Titre de propriété (obligatoire)                        │
│  └─ Justificatif de domicile                                │
│  └─ Mandat de gestion (si agence)                           │
│                                                              │
│  Étape 7: Soumission                                         │
│  └─ Statut → 'en_verification'                              │
│  └─ Notification envoyée aux admins                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Validation Administrative

```
┌─────────────────────────────────────────────────────────────┐
│        VALIDATION PAR ADMIN (/admin/validation-documents)   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 PROPRIÉTÉS EN ATTENTE                                    │
│  └─ Liste des propriétés status='en_verification'           │
│                                                              │
│  🔍 EXAMEN DES DOCUMENTS                                     │
│  └─ CNI du propriétaire                                     │
│  └─ Titre de propriété                                      │
│  └─ Résultat NeoFace                                        │
│                                                              │
│  ✅ APPROBATION                                              │
│  └─ Statut → 'disponible'                                   │
│  └─ Propriété visible publiquement                          │
│  └─ +40 pts Trust Score propriétaire                        │
│  └─ Notification au propriétaire                            │
│                                                              │
│  ❌ REJET                                                    │
│  └─ Statut → 'rejete'                                       │
│  └─ Motif du rejet stocké                                   │
│  └─ Notification au propriétaire                            │
│  └─ Possibilité de resoumettre                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Statuts de Propriété

| Statut | Description | Visibilité |
|--------|-------------|------------|
| `brouillon` | En cours de création | Propriétaire seul |
| `en_verification` | Soumise, en attente validation | Propriétaire + Admin |
| `disponible` | Validée, publiée | Public |
| `louee` | Occupée par un locataire | Public (marquée) |
| `rejete` | Refusée par admin | Propriétaire seul |
| `archivee` | Retirée du marché | Propriétaire seul |

---

## 8. Fonctionnalités Métier

### Cycle de Vie d'une Propriété

```
CRÉATION → VÉRIFICATION → PUBLICATION → CANDIDATURES → CONTRAT → OCCUPATION
    │           │              │              │            │          │
    └─ Brouillon└─ NeoFace     └─ Visible     └─ Scoring   └─ Signé   └─ Actif
              └─ Admin
```

### Processus de Candidature

```
┌─────────────────────────────────────────────────────────────┐
│              CANDIDATURE LOCATAIRE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DÉCOUVERTE                                               │
│     └─ Recherche sur /recherche                             │
│     └─ Consultation détails propriété                       │
│     └─ Ajout aux favoris (optionnel)                        │
│                                                              │
│  2. CANDIDATURE                                              │
│     └─ Formulaire de candidature                            │
│     └─ Documents: CNI, bulletins salaire, contrat travail   │
│     └─ Informations garant (si requis)                      │
│                                                              │
│  3. SCORING AUTOMATIQUE                                      │
│     └─ Trust Score calculé                                  │
│     └─ Historique locatif vérifié                           │
│     └─ Solvabilité évaluée                                  │
│                                                              │
│  4. EXAMEN PROPRIÉTAIRE                                      │
│     └─ Notification nouvelle candidature                    │
│     └─ Consultation du dossier + score                      │
│     └─ Décision: accepter / refuser                         │
│                                                              │
│  5. SI ACCEPTÉ                                               │
│     └─ Planification visite                                 │
│     └─ Visite du bien                                       │
│     └─ Création du contrat                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Système de Scoring Global

| Facteur | Points | Description |
|---------|--------|-------------|
| **NeoFace** | 60 pts | Vérification biométrique réussie |
| **Validation Admin** | 40 pts | Documents validés par admin/Trust Agent |
| **Total** | 100 pts | Trust Score global |

### Niveaux de Confiance

| Score | Niveau | Badge | Signification |
|-------|--------|-------|---------------|
| 0-30 | Non vérifié | 🔴 | Aucune vérification |
| 31-60 | Partiel | 🟡 | NeoFace seul ou docs seuls |
| 61-80 | Vérifié | 🟢 | NeoFace + docs basiques |
| 81-100 | Très fiable | ⭐ | Vérification complète |

---

## 9. Paiements & Contrats

### Moyens de Paiement Mobile Money

| Opérateur | Logo | Disponibilité |
|-----------|------|---------------|
| **Orange Money** | 🟠 | Tout le pays |
| **MTN Mobile Money** | 🟡 | Tout le pays |
| **Moov Money** | 🔵 | Tout le pays |
| **Wave** | 🌊 | Zones urbaines |

### Architecture du Système de Paiement

```
┌────────────────────────────────────────────────────────────┐
│              SYSTÈME DE PAIEMENT MON TOIT                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 PAIEMENT PONCTUEL                                       │
│  └─ Locataire initie le paiement                           │
│  └─ Choix de l'opérateur Mobile Money                      │
│  └─ Validation OTP sur téléphone                           │
│  └─ Confirmation instantanée                               │
│                                                             │
│  🔄 PAIEMENT RÉCURRENT (Prélèvement Automatique)           │
│  └─ Autorisation préalable du locataire                    │
│  └─ CRON quotidien vérifie les échéances                   │
│  └─ Débit automatique le jour J                            │
│  └─ Jusqu'à 3 tentatives en cas d'échec                    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Intégration InTouch API

Mon Toit utilise **InTouch** comme passerelle de paiement :

| Fonctionnalité | Description |
|----------------|-------------|
| **Collecte** | Réception des paiements locataires |
| **Disbursement** | Transfert aux propriétaires |
| **SMS/WhatsApp** | Notifications automatiques |

### Cycle de Paiement Mensuel

```
┌─────────────────────────────────────────────────────────────┐
│                  CYCLE DE PAIEMENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  J-5  📱 Rappel SMS/WhatsApp                                │
│       "Votre loyer de 150 000 FCFA est dû dans 5 jours"    │
│                                                              │
│  J-3  📱 Second rappel                                       │
│       "N'oubliez pas votre paiement dans 3 jours"          │
│                                                              │
│  J    💰 Jour d'échéance                                    │
│       - Prélèvement auto si autorisé                        │
│       - Ou rappel pour paiement manuel                      │
│                                                              │
│  J+1  ⚠️ Premier retard                                     │
│       "Votre paiement est en retard. Pénalités applicables" │
│                                                              │
│  J+X  📈 Pénalités cumulées                                 │
│       0.5% par jour (plafond 10% du loyer)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Calcul des Pénalités de Retard

```
┌─────────────────────────────────────────────────────────────┐
│  FORMULE PÉNALITÉS                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pénalité = Loyer × (0.5% × Jours de retard)               │
│                                                              │
│  Exemple: Loyer 150 000 FCFA, 10 jours de retard           │
│  Pénalité = 150 000 × 0.005 × 10 = 7 500 FCFA              │
│                                                              │
│  ⚠️ PLAFOND: Maximum 10% du loyer mensuel                   │
│  Exemple: Max 15 000 FCFA pour un loyer de 150 000 FCFA    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Quittances et Reçus

| Document | Génération | Envoi |
|----------|------------|-------|
| **Quittance PDF** | Automatique après paiement | Email + SMS |
| **Numéro de reçu** | Format: `REC-YYYYMMDD-XXXX` | Dans la quittance |
| **Historique** | Accessible dans `/mes-paiements` | Téléchargeable |

### Tableau de Bord Paiements (Propriétaire)

| Indicateur | Description |
|------------|-------------|
| **Revenus du mois** | Total des loyers perçus |
| **Impayés** | Montant des retards en cours |
| **Taux de recouvrement** | % des loyers payés à temps |
| **Prochaines échéances** | Paiements attendus |

### Signature Électronique CryptoNeo

```
┌─────────────────────────────────────────────────────────────┐
│              SIGNATURE ÉLECTRONIQUE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📄 Documents signables:                                    │
│     • Contrats de bail                                      │
│     • États des lieux (entrée/sortie)                       │
│     • Avenants au contrat                                   │
│     • Mandats de gestion (agences)                          │
│                                                              │
│  ✍️ Processus:                                              │
│     1. Génération du document PDF                           │
│     2. Envoi via CryptoNeo API                              │
│     3. Notification aux signataires                         │
│     4. Signature via OTP mobile                             │
│     5. Document certifié retourné                           │
│                                                              │
│  ✅ Valeur légale:                                          │
│     Conforme à la réglementation UEMOA                      │
│     Horodatage certifié                                     │
│     Archivage sécurisé                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Notifications & Communications

### Canaux de Communication

| Canal | Usage | Fournisseur |
|-------|-------|-------------|
| **SMS** | Rappels paiement, OTP | InTouch (principal) |
| **WhatsApp** | Notifications enrichies | InTouch |
| **Email** | Documents, récapitulatifs | Brevo (fallback) |
| **In-App** | Temps réel | Supabase Realtime |

### Types de Notifications

| Événement | Destinataire | Canal |
|-----------|--------------|-------|
| Nouvelle candidature | Propriétaire | Push + Email |
| Candidature acceptée | Locataire | SMS + Email |
| Visite planifiée | Les 2 parties | SMS |
| Contrat à signer | Les 2 parties | Email + SMS |
| Paiement reçu | Propriétaire | Push |
| Paiement effectué | Locataire | SMS + PDF |
| Retard de paiement | Locataire | SMS |
| Demande maintenance | Propriétaire | Push |
| Mission assignée | Trust Agent | Email |

---

## 11. Navigation Rapide

### URLs Principales

| Dashboard | URL |
|-----------|-----|
| Locataire | `/dashboard/locataire` |
| Propriétaire | `/dashboard/proprietaire` |
| Agence | `/dashboard/agence` |
| Admin | `/admin` |
| Trust Agent | `/trust-agent/dashboard` |

### Actions Courantes

| Action | URL |
|--------|-----|
| Connexion | `/connexion` |
| Inscription | `/inscription` |
| Ajouter propriété | `/dashboard/ajouter-propriete` |
| Rechercher | `/recherche` |
| Mon profil | `/profil` |
| Mon score | `/mon-score` |
| Mes contrats | `/mes-contrats` |
| Mes paiements | `/mes-paiements` |
| Planifier visite | `/visiter/:id` |
| Vérification biométrique | `/profil?tab=verification` |

### Routes Admin

| Section | URL |
|---------|-----|
| Tableau de bord | `/admin/tableau-de-bord` |
| Utilisateurs | `/admin/utilisateurs` |
| Validation documents | `/admin/validation-documents` |
| Trust Agents | `/admin/trust-agents` |
| Clés API | `/admin/api-keys` |
| Monitoring | `/admin/service-monitoring` |

### Routes Trust Agent

| Section | URL |
|---------|-----|
| Dashboard | `/trust-agent/dashboard` |
| Modération | `/trust-agent/moderation` |
| Médiation | `/trust-agent/mediation` |
| Analytiques | `/trust-agent/analytics` |

---

## 12. Système de Favoris & Alertes

### Favoris

Les utilisateurs peuvent sauvegarder des propriétés pour les consulter ultérieurement.

| Fonctionnalité | Description |
|----------------|-------------|
| **Ajouter aux favoris** | Clic sur ❤️ sur une propriété |
| **Accès** | `/dashboard/locataire/favoris` |
| **Limite** | Illimitée |
| **Synchronisation** | Multi-appareils via compte |

### Recherches Sauvegardées

```
┌────────────────────────────────────────────────────────────┐
│               RECHERCHES SAUVEGARDÉES                       │
├────────────────────────────────────────────────────────────┤
│ 1. CRÉER UNE RECHERCHE                                      │
│    └─ Définir critères: ville, type, prix, chambres        │
│    └─ Nommer la recherche                                  │
│    └─ Activer les alertes (optionnel)                      │
│                                                             │
│ 2. STOCKAGE                                                 │
│    └─ Table: saved_searches                                │
│    └─ Champs: filters (JSON), notify_enabled               │
│                                                             │
│ 3. UTILISATION                                              │
│    └─ Réexécuter en 1 clic                                 │
│    └─ Modifier les critères                                │
└────────────────────────────────────────────────────────────┘
```

### Système d'Alertes Propriétés

```
┌────────────────────────────────────────────────────────────┐
│                 ALERTES PROPRIÉTÉS                          │
├────────────────────────────────────────────────────────────┤
│ 📊 LIMITE: 5 alertes actives par utilisateur               │
│                                                             │
│ WORKFLOW:                                                   │
│ 1. Utilisateur crée une alerte avec critères               │
│ 2. CRON job `check-property-alerts` s'exécute              │
│ 3. Compare nouvelles propriétés aux critères               │
│ 4. Envoie notification si match trouvé                     │
│                                                             │
│ CANAUX DE NOTIFICATION:                                     │
│ • Push notification (in-app)                               │
│ • Email (si activé)                                        │
│ • SMS (propriétés premium uniquement)                      │
│                                                             │
│ TABLE: property_alerts                                      │
│ └─ user_id, criteria (JSON), is_active, last_triggered     │
└────────────────────────────────────────────────────────────┘
```

---

## 13. Planification de Visites

### Types de Visites

| Type | Description | Disponibilité |
|------|-------------|---------------|
| **Physique** | Visite sur place avec propriétaire/agent | Par défaut |
| **Vidéo** | Appel vidéo guidé | Sur demande |
| **Virtuelle 360°** | Visite autonome pré-enregistrée | Si disponible |

### Workflow Complet

```
┌────────────────────────────────────────────────────────────┐
│                 PLANIFICATION DE VISITE                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ÉTAPE 1: DEMANDE                                           │
│  └─ Locataire clique "Planifier une visite"                │
│  └─ Route: /visiter/:propertyId                            │
│  └─ Choisit date/heure parmi créneaux disponibles          │
│                                                             │
│  ÉTAPE 2: NOTIFICATION PROPRIÉTAIRE                         │
│  └─ SMS + Email + Push                                     │
│  └─ 24h pour confirmer ou proposer alternative             │
│                                                             │
│  ÉTAPE 3: CONFIRMATION                                      │
│  └─ Statut → confirmed                                     │
│  └─ QR Code généré pour le locataire                       │
│  └─ Rappel J-1 aux deux parties                            │
│                                                             │
│  ÉTAPE 4: JOUR J                                            │
│  └─ Rappel 2h avant                                        │
│  └─ Locataire scanne QR Code à l'arrivée                   │
│  └─ Confirmation de présence                               │
│                                                             │
│  ÉTAPE 5: POST-VISITE                                       │
│  └─ Demande de feedback                                    │
│  └─ Possibilité de candidater directement                  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Gestion des Annulations

| Délai | Action | Conséquence |
|-------|--------|-------------|
| > 24h avant | Annulation libre | Aucune pénalité |
| < 24h avant | Annulation avec motif | Alerte propriétaire |
| No-show | Non-présentation | -5 pts Trust Score |
| Report | Proposition nouvelle date | Aucune pénalité |

### Calendrier Locataire

**Accès:** `/dashboard/locataire/calendrier`

| Vue | Description |
|-----|-------------|
| **Agenda** | Toutes les visites planifiées |
| **Historique** | Visites passées avec notes |
| **À venir** | Prochaines 7 jours |

---

## 14. Demandes de Maintenance

### Processus de Signalement

```
┌────────────────────────────────────────────────────────────┐
│                 DEMANDE DE MAINTENANCE                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 ÉTAPE 1: SIGNALEMENT                                    │
│  └─ Route: /dashboard/locataire/maintenance                │
│  └─ Catégorie: plomberie, électricité, serrurerie...       │
│  └─ Description du problème                                │
│  └─ Photos (max 5)                                         │
│  └─ Niveau d'urgence: normal, urgent, critique             │
│                                                             │
│  📤 ÉTAPE 2: TRANSMISSION                                   │
│  └─ Notification propriétaire instantanée                  │
│  └─ Copie agence (si sous mandat)                          │
│  └─ Statut: pending                                        │
│                                                             │
│  👷 ÉTAPE 3: ATTRIBUTION                                    │
│  └─ Propriétaire assigne un prestataire                    │
│  └─ Ou utilise MonArtisan (marketplace)                    │
│  └─ Date d'intervention planifiée                          │
│                                                             │
│  🔧 ÉTAPE 4: INTERVENTION                                   │
│  └─ Prestataire effectue les travaux                       │
│  └─ Photos avant/après                                     │
│  └─ Rapport d'intervention                                 │
│                                                             │
│  ✅ ÉTAPE 5: CLÔTURE                                        │
│  └─ Locataire confirme la résolution                       │
│  └─ Évaluation du prestataire                              │
│  └─ Statut: completed                                      │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Catégories de Maintenance

| Catégorie | Exemples | Urgence par défaut |
|-----------|----------|-------------------|
| **Plomberie** | Fuite, WC bouché | Urgent |
| **Électricité** | Panne, disjoncteur | Critique |
| **Serrurerie** | Clé cassée, porte bloquée | Critique |
| **Chauffage/Clim** | Panne AC, pas d'eau chaude | Normal |
| **Menuiserie** | Fenêtre cassée, porte abîmée | Normal |
| **Ménage** | Nettoyage professionnel | Normal |
| **Autre** | Divers | Normal |

### Statuts de Suivi

| Statut | Description |
|--------|-------------|
| `pending` | En attente de prise en charge |
| `acknowledged` | Vu par le propriétaire |
| `assigned` | Prestataire assigné |
| `scheduled` | Date d'intervention fixée |
| `in_progress` | Travaux en cours |
| `completed` | Résolu |
| `cancelled` | Annulé |

---

## 15. Historique Locatif

### Données Enregistrées

| Information | Source | Impact Trust Score |
|-------------|--------|-------------------|
| **Baux précédents** | lease_contracts | +5 pts/bail complet |
| **Paiements** | payments | +10 pts si 0 retard |
| **Évaluations reçues** | reviews | +/- selon note |
| **Litiges** | disputes | -20 pts si responsable |
| **Durée moyenne** | Calcul automatique | Stabilité valorisée |

### Affichage pour Propriétaires

```
┌────────────────────────────────────────────────────────────┐
│          HISTORIQUE LOCATIF - Konan Yao                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 STATISTIQUES                                            │
│  └─ 3 locations précédentes                                │
│  └─ Durée moyenne: 18 mois                                 │
│  └─ Taux de paiement à temps: 95%                          │
│  └─ 0 litige                                               │
│                                                             │
│  ⭐ ÉVALUATIONS (anonymisées)                               │
│  └─ "Locataire exemplaire" - 5/5                           │
│  └─ "Paiements ponctuels" - 4/5                            │
│  └─ "Bon entretien du logement" - 5/5                      │
│                                                             │
│  🏆 BADGES                                                  │
│  └─ 🎯 Ponctuel (95%+ paiements à temps)                   │
│  └─ 🏠 Stable (>12 mois en moyenne)                        │
│  └─ ✨ Soigneux (bonnes évaluations entretien)             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 16. Gestion des Mandats (Agence)

### Types de Mandats

| Type | Description | Permissions |
|------|-------------|-------------|
| **Gestion complète** | Tout inclus | Toutes les permissions |
| **Location seule** | Recherche locataires | Candidatures, visites, contrats |
| **Vente seule** | Mise en vente | Publication, négociation |

### Workflow de Signature

```
┌────────────────────────────────────────────────────────────┐
│                 SIGNATURE DE MANDAT                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CRÉATION                                                │
│     └─ Agence crée le mandat                               │
│     └─ Définit: scope, commissions, permissions            │
│     └─ Table: agency_mandates                              │
│                                                             │
│  2. ENVOI AU PROPRIÉTAIRE                                   │
│     └─ Notification + lien de signature                    │
│     └─ Route: /signer-mandat/:mandateId                    │
│                                                             │
│  3. SIGNATURE ÉLECTRONIQUE                                  │
│     └─ Propriétaire signe via CryptoNeo                    │
│     └─ owner_signed_at renseigné                           │
│                                                             │
│  4. CONTRE-SIGNATURE                                        │
│     └─ Agence signe à son tour                             │
│     └─ agency_signed_at renseigné                          │
│                                                             │
│  5. ACTIVATION                                              │
│     └─ Statut: active                                      │
│     └─ Permissions appliquées                              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Permissions Granulaires

| Permission | Description |
|------------|-------------|
| `can_view_properties` | Voir les propriétés |
| `can_create_properties` | Ajouter des propriétés |
| `can_edit_properties` | Modifier les propriétés |
| `can_delete_properties` | Supprimer des propriétés |
| `can_view_applications` | Voir les candidatures |
| `can_manage_applications` | Accepter/refuser candidatures |
| `can_create_leases` | Créer des contrats |
| `can_view_financials` | Voir les revenus |
| `can_manage_maintenance` | Gérer la maintenance |
| `can_manage_documents` | Gérer les documents |
| `can_communicate_tenants` | Contacter les locataires |

### Système de Commissions

```
┌────────────────────────────────────────────────────────────┐
│                 CALCUL COMMISSIONS                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 EXEMPLE: Loyer 250,000 FCFA                             │
│                                                             │
│  Commission agence: 8% = 20,000 FCFA                        │
│  └─ Part agence: 70% = 14,000 FCFA                         │
│  └─ Part agent: 30% = 6,000 FCFA                           │
│                                                             │
│  STOCKAGE:                                                  │
│  └─ Table: agency_transactions                             │
│  └─ Champs: gross_amount, agency_share, agent_share        │
│                                                             │
│  VALIDATION:                                                │
│  └─ Transaction créée à chaque paiement de loyer           │
│  └─ Statut pending → validated par comptabilité            │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Gestion d'Équipe

| Fonctionnalité | Description |
|----------------|-------------|
| **Agents** | Liste des agents de l'agence |
| **Attributions** | Assigner des propriétés à des agents |
| **Objectifs** | Définir des targets mensuels/annuels |
| **Performance** | Suivi KPIs par agent |
| **Commission Split** | Répartition personnalisée |

---

## 17. Gestion des Candidatures Avancée

### Workflow Propriétaire

```
┌────────────────────────────────────────────────────────────┐
│              GESTION CANDIDATURES                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📥 RÉCEPTION                                               │
│  └─ Nouvelle candidature reçue                             │
│  └─ Notification push + email                              │
│  └─ Route: /dashboard/proprietaire/candidatures            │
│                                                             │
│  📊 EXAMEN                                                  │
│  └─ Voir profil complet du candidat                        │
│  └─ Trust Score, historique, documents                     │
│  └─ Garant(s) associé(s) si applicable                     │
│                                                             │
│  ✅ ACTIONS DISPONIBLES                                     │
│  └─ Accepter → Planifier visite                            │
│  └─ Refuser → Motif obligatoire                            │
│  └─ Mettre en attente → Revenir plus tard                  │
│  └─ Demander infos → Message au candidat                   │
│                                                             │
│  🏠 POST-VISITE                                             │
│  └─ Confirmer l'acceptation                                │
│  └─ Créer contrat directement                              │
│  └─ Lien: /dashboard/creer-contrat?applicationId=xxx       │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Notifications Automatiques

| Événement | Destinataire | Message |
|-----------|--------------|---------|
| Candidature reçue | Propriétaire | "Nouvelle candidature de [Nom]" |
| Candidature acceptée | Locataire | "Votre candidature a été acceptée !" |
| Candidature refusée | Locataire | "Candidature refusée: [motif]" |
| Visite planifiée | Les deux | "Visite confirmée le [date]" |
| Contrat prêt | Les deux | "Contrat à signer disponible" |

---

## 18. Création de Contrats

### Depuis une Candidature

```
┌────────────────────────────────────────────────────────────┐
│                 CRÉATION DE CONTRAT                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  PRÉREQUIS:                                                 │
│  └─ Candidature acceptée                                   │
│  └─ Visite effectuée (recommandé)                          │
│  └─ Locataire vérifié (Trust Score ≥ 60)                   │
│                                                             │
│  ÉTAPE 1: SÉLECTION                                         │
│  └─ Route: /dashboard/creer-contrat                        │
│  └─ Choisir propriété + locataire (pré-rempli si depuis    │
│     candidature)                                           │
│                                                             │
│  ÉTAPE 2: PARAMÈTRES DU BAIL                                │
│  └─ Date de début                                          │
│  └─ Durée: 6, 12, 24 ou 36 mois                            │
│  └─ Loyer mensuel                                          │
│  └─ Caution (généralement 2 mois)                          │
│  └─ Charges incluses ou non                                │
│                                                             │
│  ÉTAPE 3: GÉNÉRATION PDF                                    │
│  └─ Edge function: generate-lease-pdf                      │
│  └─ Template: lease_templates                              │
│  └─ Articles pré-définis + clauses personnalisées          │
│                                                             │
│  ÉTAPE 4: SIGNATURE ÉLECTRONIQUE                            │
│  └─ Envoi via CryptoNeo                                    │
│  └─ Propriétaire signe en premier                          │
│  └─ Locataire reçoit lien de signature                     │
│  └─ Double signature → Contrat actif                       │
│                                                             │
│  ÉTAPE 5: ACTIVATION                                        │
│  └─ Statut: active                                         │
│  └─ Paiements récurrents configurés                        │
│  └─ Notifications activées                                 │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Structure du Contrat PDF

| Article | Contenu |
|---------|---------|
| **Article 1** | Désignation des parties |
| **Article 2** | Description du bien |
| **Article 3** | Durée et conditions |
| **Article 4** | Loyer et charges |
| **Article 5** | Caution et garanties |
| **Article 6** | Obligations des parties |
| **Annexes** | État des lieux, diagnostics |

---

## 19. Intelligence Artificielle (SUTA)

### Présentation

**SUTA** (Assistant Intelligent Mon Toit) est un chatbot IA intégré à la plateforme, propulsé par **Lovable AI** (Google Gemini).

### Capacités

```
┌────────────────────────────────────────────────────────────┐
│                    SUTA - ASSISTANT IA                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 RECHERCHE INTELLIGENTE                                  │
│  └─ "Trouve-moi un 3 pièces à Cocody < 200k FCFA"          │
│  └─ Analyse les critères en langage naturel                │
│  └─ Propose des propriétés correspondantes                 │
│                                                             │
│  🛡️ CONSEIL ANTI-ARNAQUE                                    │
│  └─ "Cette annonce est-elle fiable ?"                      │
│  └─ Analyse les signaux d'alerte                           │
│  └─ Vérifie le Trust Score du propriétaire                 │
│                                                             │
│  📚 AIDE CONTEXTUELLE                                       │
│  └─ "Comment fonctionne la vérification ?"                 │
│  └─ "Quels documents pour une candidature ?"               │
│  └─ Répond aux questions sur Mon Toit                      │
│                                                             │
│  📊 RECOMMANDATIONS                                         │
│  └─ Suggestions personnalisées selon l'historique          │
│  └─ Propriétés similaires à celles consultées              │
│  └─ Alertes sur opportunités                               │
│                                                             │
│  💬 CONVERSATION NATURELLE                                  │
│  └─ Comprend le français ivoirien                          │
│  └─ Contexte de conversation maintenu                      │
│  └─ Réponses en temps réel (streaming)                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Architecture Technique

| Composant | Technologie |
|-----------|-------------|
| **Modèle** | google/gemini-2.5-flash |
| **Gateway** | Lovable AI Gateway |
| **Edge Function** | ai-chatbot |
| **Stockage conversations** | chatbot_conversations, chatbot_messages |
| **Streaming** | SSE (Server-Sent Events) |

### Accès

| Méthode | Description |
|---------|-------------|
| **Bulle flottante** | Présente sur toutes les pages |
| **Page dédiée** | `/chatbot` ou `/assistant` |
| **Intégration recherche** | Suggestions dans la barre de recherche |

---

## 20. États des Lieux Détaillé

### Types d'États des Lieux

| Type | Moment | Responsable |
|------|--------|-------------|
| **Entrée** | Début de bail | Trust Agent + Locataire + Propriétaire |
| **Sortie** | Fin de bail | Trust Agent + Locataire + Propriétaire |
| **Intermédiaire** | Inspection périodique | Trust Agent |

### Processus Complet

```
┌────────────────────────────────────────────────────────────┐
│                 ÉTAT DES LIEUX                              │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 PLANIFICATION                                           │
│  └─ Mission CEV créée                                      │
│  └─ Trust Agent assigné                                    │
│  └─ Date/heure fixée avec toutes les parties               │
│                                                             │
│  📸 RÉALISATION                                             │
│  └─ Visite pièce par pièce                                 │
│  └─ Photos systématiques                                   │
│  └─ Checklist normalisée:                                  │
│     • Sols, murs, plafonds                                 │
│     • Menuiseries, vitres                                  │
│     • Plomberie, électricité                               │
│     • Équipements (cuisine, SDB)                           │
│     • Extérieurs si applicable                             │
│                                                             │
│  📝 RAPPORT                                                 │
│  └─ Document PDF généré                                    │
│  └─ Photos annotées                                        │
│  └─ Observations détaillées                                │
│  └─ Compteurs relevés                                      │
│                                                             │
│  ✍️ SIGNATURES                                              │
│  └─ Signature électronique Trust Agent                     │
│  └─ Signature Propriétaire                                 │
│  └─ Signature Locataire                                    │
│  └─ Document archivé dans inventory_reports                │
│                                                             │
│  📊 IMPACT                                                  │
│  └─ +40 points Trust Score propriétaire                    │
│  └─ Base pour retenue caution (sortie)                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Comparaison Entrée/Sortie

| Élément | État entrée | État sortie | Différence |
|---------|-------------|-------------|------------|
| Peinture salon | Bon | Usure normale | OK |
| Robinet cuisine | Neuf | Fuite | Réparation à charge locataire |
| Parquet chambre | Bon | Rayures | Retenue caution possible |

---

## 21. Certifications

### Certification Utilisateur

| Niveau | Critères | Badge |
|--------|----------|-------|
| **Basique** | Email vérifié | 🔵 |
| **Vérifié** | NeoFace validé (60 pts) | 🟢 |
| **Certifié** | Documents admin validés (+40 pts) | 🏆 |

### Certification Propriété

```
┌────────────────────────────────────────────────────────────┐
│             CERTIFICATION PROPRIÉTÉ                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ DOCUMENTS VALIDÉS                                       │
│  └─ Titre de propriété                                     │
│  └─ Attestation de résidence                               │
│  └─ Taxe foncière à jour                                   │
│                                                             │
│  ✅ VÉRIFICATION TERRAIN                                    │
│  └─ Mission CEV effectuée                                  │
│  └─ Photos conformes à l'annonce                           │
│  └─ Adresse confirmée                                      │
│                                                             │
│  ✅ PROPRIÉTAIRE VÉRIFIÉ                                    │
│  └─ NeoFace validé                                         │
│  └─ CNI correspondante au titre                            │
│                                                             │
│  🏆 BADGE OBTENU: "Propriété Certifiée ANSUT"              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 22. Réseau de Prestataires (MonArtisan)

### Présentation

**MonArtisan** est le marketplace intégré de prestataires de services pour la maintenance et les travaux.

### Catégories de Prestataires

| Catégorie | Services | Délai moyen |
|-----------|----------|-------------|
| **Plomberie** | Fuites, débouchage, installation | 2-4h |
| **Électricité** | Pannes, installation, dépannage | 2-4h |
| **Serrurerie** | Ouverture, changement serrure | 1-2h |
| **Climatisation** | Installation, maintenance, réparation | 24h |
| **Ménage** | Nettoyage, désinfection | 24h |
| **Peinture** | Rafraîchissement, rénovation | 48h+ |
| **Déménagement** | Transport, manutention | Sur devis |

### Workflow MonArtisan

```
┌────────────────────────────────────────────────────────────┐
│                    MONARTISAN                               │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  1. DEMANDE                                                 │
│     └─ Créée depuis maintenance ou directement             │
│     └─ Edge function: monartisan-request                   │
│                                                             │
│  2. MATCHING                                                │
│     └─ Algorithme trouve prestataires disponibles          │
│     └─ Critères: localisation, spécialité, notes           │
│                                                             │
│  3. DEVIS                                                   │
│     └─ Prestataires envoient leurs propositions            │
│     └─ Comparaison prix/délai/notes                        │
│                                                             │
│  4. SÉLECTION                                               │
│     └─ Client choisit un prestataire                       │
│     └─ Paiement sécurisé (Mobile Money)                    │
│                                                             │
│  5. INTERVENTION                                            │
│     └─ Prestataire effectue le travail                     │
│     └─ Confirmation par le client                          │
│                                                             │
│  6. ÉVALUATION                                              │
│     └─ Note sur 5 étoiles                                  │
│     └─ Commentaire optionnel                               │
│     └─ Impact sur classement prestataire                   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 23. Feature Flags (Admin)

### Présentation

Les **Feature Flags** permettent d'activer/désactiver des fonctionnalités sans redéploiement.

### Configuration Actuelle

| Feature | Statut | Description |
|---------|--------|-------------|
| `CNAM_VERIFICATION` | ❌ Désactivé | Vérification CNAM (hors périmètre) |
| `ONECI_VERIFICATION` | ✅ Activé | Vérification ONECI/SNEDAI |
| `FACE_VERIFICATION` | ✅ Activé | Biométrie NeoFace |
| `ADVANCED_SEARCH` | ✅ Activé | Recherche avancée |
| `AI_SEARCH` | ❌ Désactivé | Recherche IA (en développement) |
| `MAP_SEARCH` | ✅ Activé | Recherche par carte |
| `COMMERCIAL_PROPERTIES` | ❌ Désactivé | Biens commerciaux |
| `RESIDENTIAL_PROPERTIES` | ✅ Activé | Biens résidentiels |
| `MOBILE_MONEY_PAYMENT` | ✅ Activé | Paiement Mobile Money |
| `CARD_PAYMENT` | ❌ Désactivé | Paiement carte (à venir) |
| `CRYPTONEO_SIGNATURE` | ✅ Activé | Signature électronique |
| `SUTA_CHATBOT` | ✅ Activé | Assistant IA |
| `EMAIL_NOTIFICATIONS` | ✅ Activé | Notifications email |
| `SMS_NOTIFICATIONS` | ❌ Désactivé | Notifications SMS (à venir) |
| `WHATSAPP_NOTIFICATIONS` | ✅ Activé | OTP WhatsApp |

### Interface Admin

**Accès:** `/admin/feature-flags`

| Action | Description |
|--------|-------------|
| **Toggle** | Activer/désactiver une feature |
| **Config** | Paramètres avancés (JSON) |
| **Historique** | Qui a changé quoi et quand |

---

## 24. Règles Business (Admin)

### Présentation

Les **Business Rules** définissent les paramètres métier configurables.

### Exemples de Règles

| Catégorie | Règle | Valeur |
|-----------|-------|--------|
| **Pénalités** | Retard de paiement (% par jour) | 0.5% |
| **Pénalités** | Maximum pénalité | 10% du loyer |
| **Commissions** | Commission agence par défaut | 8% |
| **Limites** | Alertes max par utilisateur | 5 |
| **Limites** | Images max par propriété | 10 |
| **Scoring** | Seuil NeoFace | 85% |
| **Scoring** | Points NeoFace | 60 pts |
| **Scoring** | Points validation admin | 40 pts |
| **Délais** | Validité OTP | 5 min |
| **Délais** | Rappel paiement J- | 3 jours |

### Table

```sql
business_rules
├── id
├── rule_key (unique)
├── rule_name
├── category
├── rule_type (number, boolean, json)
├── value_number
├── value_boolean
├── value_json
├── min_value
├── max_value
├── is_enabled
└── description
```

---

## 25. Analytics & Reporting (Admin)

### KPIs Plateforme

```
┌────────────────────────────────────────────────────────────┐
│                TABLEAU DE BORD ADMIN                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 UTILISATEURS                                            │
│  └─ Total inscrits: 12,450                                 │
│  └─ Actifs (30j): 3,200                                    │
│  └─ Nouveaux (7j): 145                                     │
│  └─ Taux vérification: 78%                                 │
│                                                             │
│  🏠 PROPRIÉTÉS                                              │
│  └─ Total publiées: 1,234                                  │
│  └─ En attente validation: 23                              │
│  └─ Taux occupation: 89%                                   │
│                                                             │
│  💰 TRANSACTIONS                                            │
│  └─ Volume mensuel: 45M FCFA                               │
│  └─ Loyers perçus: 892                                     │
│  └─ Taux recouvrement: 94%                                 │
│                                                             │
│  ⚖️ LITIGES                                                 │
│  └─ Ouverts: 12                                            │
│  └─ Résolus (30j): 34                                      │
│  └─ Temps moyen résolution: 4.2 jours                      │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Rapports Automatiques

| Rapport | Fréquence | Destinataires |
|---------|-----------|---------------|
| **Synthèse quotidienne** | Tous les jours | Admin |
| **Rapport mensuel** | 1er du mois | Direction |
| **Alertes anomalies** | Temps réel | Admin + DevOps |
| **Performances agents** | Hebdomadaire | Managers agences |

### Edge Functions Analytics

| Function | Description |
|----------|-------------|
| `generate-monthly-report` | Génère le rapport PDF mensuel |
| `service-health-check` | Vérifie l'état des services |
| `analyze-market-trends` | Analyse tendances du marché |

---

## 26. Système de Garants

### Présentation

Le **garant** est une personne qui se porte caution pour un locataire, garantissant le paiement du loyer en cas de défaillance.

### Workflow Complet

```
┌────────────────────────────────────────────────────────────┐
│                 SYSTÈME DE GARANT                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  1. INVITATION                                              │
│     └─ Locataire invite un garant (email/téléphone)        │
│     └─ Lien d'invitation envoyé                            │
│                                                             │
│  2. INSCRIPTION GARANT                                      │
│     └─ Garant crée un compte Mon Toit                      │
│     └─ Type de compte: "garant"                            │
│                                                             │
│  3. VÉRIFICATION BIOMÉTRIQUE                                │
│     └─ NeoFace obligatoire (CNI + selfie)                  │
│     └─ Seuil: 85% minimum                                  │
│                                                             │
│  4. INFORMATIONS FINANCIÈRES                                │
│     └─ Profession                                          │
│     └─ Employeur                                           │
│     └─ Revenu mensuel                                      │
│     └─ Ratio revenu/loyer vérifié (>3x recommandé)         │
│                                                             │
│  5. DOCUMENTS                                               │
│     └─ CNI (obligatoire)                                   │
│     └─ Certificat de travail                               │
│     └─ 3 derniers bulletins de salaire                     │
│     └─ Relevé bancaire récent                              │
│                                                             │
│  6. CALCUL SCORE GARANT                                     │
│     └─ Score indépendant du locataire                      │
│     └─ Visible par le propriétaire                         │
│                                                             │
│  7. ASSOCIATION                                             │
│     └─ Garant lié à la candidature                         │
│     └─ Signature engagement de caution                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Impact sur Candidature

| Score Garant | Impact Candidature |
|--------------|-------------------|
| ≥ 80 | Très favorable |
| 60-79 | Favorable |
| 40-59 | Neutre |
| < 40 | Défavorable |

---

## 27. Géolocalisation & Cartes

### Fonctionnalités

| Fonctionnalité | Description | Technologie |
|----------------|-------------|-------------|
| **Carte propriétés** | Affichage des biens sur carte | Mapbox |
| **Géocodage** | Adresse → Coordonnées | geocode-address |
| **Recherche par zone** | Dessiner une zone sur la carte | Mapbox Draw |
| **Itinéraire** | Calculer le trajet vers une propriété | Mapbox Directions |
| **Points d'intérêt** | Écoles, commerces, transports à proximité | Mapbox POI |

### Configuration

```
┌────────────────────────────────────────────────────────────┐
│                   MAPBOX INTEGRATION                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📍 GÉOCODAGE                                               │
│  └─ Edge function: geocode-address                         │
│  └─ Convertit adresse textuelle en lat/lng                 │
│  └─ Stocké dans properties.location                        │
│                                                             │
│  🗺️ AFFICHAGE CARTE                                         │
│  └─ Composant: MapSearch.tsx                               │
│  └─ Style: mapbox://styles/mapbox/streets-v12             │
│  └─ Marqueurs clusterisés pour performance                 │
│                                                             │
│  🔍 RECHERCHE PAR ZONE                                      │
│  └─ Outil de dessin polygone                               │
│  └─ Filtre propriétés dans la zone                         │
│  └─ Rayons prédéfinis: 5km, 10km, 20km, 50km              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Paramètres Géolocalisation

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `defaultRadius` | 5 km | Rayon de recherche par défaut |
| `radiusOptions` | 5, 10, 20, 50 km | Options disponibles |
| `timeout` | 10 000 ms | Timeout géolocalisation |
| `maxAge` | 300 000 ms | Cache position (5 min) |

---

## 28. Glossaire Complet

| Terme | Définition |
|-------|------------|
| **ANSUT** | Agence Nationale du Service Universel des Télécommunications |
| **CEV** | Certificat d'Enregistrement Vérifiable (mission terrain) |
| **CNI** | Carte Nationale d'Identité |
| **CryptoNeo** | Fournisseur de signature électronique certifiée |
| **EAR** | Eye Aspect Ratio - ratio d'ouverture des yeux pour détection de clignement |
| **Feature Flag** | Interrupteur pour activer/désactiver une fonctionnalité |
| **Garant** | Personne se portant caution pour un locataire |
| **InTouch** | Passerelle SMS et Mobile Money (Orange, MTN, Moov, Wave) |
| **Liveness** | Détection de vie - vérification que l'utilisateur est réellement présent |
| **Mandat** | Contrat de délégation de gestion entre propriétaire et agence |
| **MonArtisan** | Marketplace de prestataires de services intégré |
| **NeoFace** | Système de vérification biométrique faciale |
| **OTP** | One-Time Password - code à usage unique pour authentification |
| **RLS** | Row Level Security - sécurité au niveau des lignes (Supabase) |
| **SUTA** | Assistant IA intégré à Mon Toit |
| **Trust Agent** | Tiers de confiance chargé des vérifications terrain et médiation |
| **Trust Score** | Score de confiance utilisateur (0-100 points) |
| **UEMOA** | Union Économique et Monétaire Ouest Africaine |

---

## 29. Navigation Rapide

### URLs Principales

| Dashboard | URL |
|-----------|-----|
| Locataire | `/dashboard/locataire` |
| Propriétaire | `/dashboard/proprietaire` |
| Agence | `/dashboard/agence` |
| Admin | `/admin` |
| Trust Agent | `/trust-agent/dashboard` |

### Actions Courantes

| Action | URL |
|--------|-----|
| Connexion | `/connexion` |
| Inscription | `/inscription` |
| Ajouter propriété | `/dashboard/ajouter-propriete` |
| Rechercher | `/recherche` |
| Mon profil | `/profil` |
| Mon score | `/mon-score` |
| Mes contrats | `/mes-contrats` |
| Mes paiements | `/mes-paiements` |
| Planifier visite | `/visiter/:id` |
| Vérification biométrique | `/profil?tab=verification` |
| Mes favoris | `/dashboard/locataire/favoris` |
| Ma maintenance | `/dashboard/locataire/maintenance` |
| Mon calendrier | `/dashboard/locataire/calendrier` |
| Chatbot SUTA | `/chatbot` |

### Routes Admin

| Section | URL |
|---------|-----|
| Tableau de bord | `/admin/tableau-de-bord` |
| Utilisateurs | `/admin/utilisateurs` |
| Validation documents | `/admin/validation-documents` |
| Trust Agents | `/admin/trust-agents` |
| Clés API | `/admin/api-keys` |
| Monitoring | `/admin/service-monitoring` |
| Feature Flags | `/admin/feature-flags` |

### Routes Trust Agent

| Section | URL |
|---------|-----|
| Dashboard | `/trust-agent/dashboard` |
| Modération | `/trust-agent/moderation` |
| Médiation | `/trust-agent/mediation` |
| Analytiques | `/trust-agent/analytics` |

---

*Documentation complète Mon Toit v2.0*  
*Plateforme immobilière sécurisée - Côte d'Ivoire*  
*Dernière mise à jour: Janvier 2026*  
*Sections: 29 | Lignes: ~1600*