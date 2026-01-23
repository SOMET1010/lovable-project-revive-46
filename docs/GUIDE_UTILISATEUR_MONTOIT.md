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

## 12. Glossaire

| Terme | Définition |
|-------|------------|
| **CNI** | Carte Nationale d'Identité |
| **CEV** | Certificat d'Enregistrement Vérifiable |
| **CryptoNeo** | Fournisseur de signature électronique |
| **EAR** | Eye Aspect Ratio (ratio d'ouverture des yeux) |
| **InTouch** | Passerelle SMS/Mobile Money |
| **Liveness** | Détection de vie (anti-fraude) |
| **NeoFace** | Système de vérification biométrique |
| **OTP** | One-Time Password (code à usage unique) |
| **RLS** | Row Level Security (sécurité Supabase) |
| **Trust Score** | Score de confiance utilisateur (0-100) |
| **UEMOA** | Union Économique Ouest Africaine |

---

*Documentation complète Mon Toit v1.0*  
*Plateforme immobilière - Côte d'Ivoire*  
*Dernière mise à jour: Janvier 2026*