# 📘 Guide Utilisateur Complet - Mon Toit

## Table des Matières

1. [Système de Rôles](#1-système-de-rôles)
2. [Dashboards par Rôle](#2-dashboards-par-rôle)
3. [Trust Agent (Tiers de Confiance)](#3-trust-agent-tiers-de-confiance)
4. [Fonctionnalités Métier](#4-fonctionnalités-métier)
5. [Sécurité & Vérification](#5-sécurité--vérification)
6. [Paiements & Contrats](#6-paiements--contrats)

---

## 1. Système de Rôles

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

## 5. Sécurité & Vérification

### Méthodes de Vérification

| Méthode | Description | Points |
|---------|-------------|--------|
| **NeoFace** | Comparaison CNI/Selfie | 60 |
| **Documents** | Validation par Trust Agent | 40 |

### Niveaux de Confiance

| Score | Niveau | Badge |
|-------|--------|-------|
| 0-30 | Non vérifié | 🔴 |
| 31-60 | Partiellement vérifié | 🟡 |
| 61-80 | Vérifié | 🟢 |
| 81-100 | Très fiable | ⭐ |

---

## 6. Paiements & Contrats

### Moyens de Paiement

- **Orange Money**
- **MTN Mobile Money**
- **Moov Money**
- **Wave**

### Signature Électronique

Intégration **CryptoNeo** pour :
- Signature des baux
- États des lieux
- Avenants

### Pénalités de Retard

```
Formule: montant × (taux_pénalité / 100) × jours_retard
Plafond: penalty_cap (défini dans le contrat)
```

---

## Navigation Rapide

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
| Ajouter propriété | `/dashboard/ajouter-propriete` |
| Rechercher | `/recherche` |
| Mon score | `/mon-score` |
| Mes contrats | `/mes-contrats` |
| Mes paiements | `/mes-paiements` |

---

*Documentation générée pour Mon Toit - Plateforme immobilière Côte d'Ivoire*