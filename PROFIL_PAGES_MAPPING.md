# Mapping des Pages Profil

## 👤 **Pages Locataire** (/locataire/*)

### 📄 **EnhancedProfilePage** (nouvelle)
- **Route** : `/locataire/profil` → `EnhancedProfilePage.tsx`
- **Layout** : `TenantDashboardLayout` avec sidebar locataire
- **Onglets disponibles** :
  - **Informations** : Nom, téléphone, ville, bio, adresse
  - **Vérifications** : Email, ONECI, CNAM, intégration ONECIForm
  - **Historique** : Locations passées, candidatures, contrats
  - **Documents** : Justificatif de domicile, relevés bancaires
  - **Statistiques** : Score de confiance, score locataire

- **Fonctionnalités** :
  - ✅ Photo de profil avec upload
  - ✅ Score locataire affiché
  - ✅ Statuts de vérification
  - ✅ Intégration ONECI pour vérification
  - ✅ Historique locataire
  - ✅ Documents à télécharger

### 📄 **ProfilePage** (original)
- **Route** : `/profil` → `ProfilePage.tsx` (routé via TenantSidebarLayout)
- **Layout** : Dynamique selon le rôle (Tenant ou Owner)
- **Fonctionnalités** : Version plus simple du profil

---

## 👔 **Pages Propriétaire** (/proprietaire/*)

### 📄 **OwnerProfilePage** (nouvelle)
- **Route** : `/proprietaire/profil` → `OwnerProfilePage.tsx`
- **Layout** : `OwnerDashboardLayout` avec sidebar propriétaire
- **Onglets disponibles** :
  - **Informations** : Nom, téléphone, ville, bio, adresse
  - **Agence** : Nom, logo, description (si agence)
  - **Vérifications** : Email, ONECI, CNAM
  - **Statistiques** : Biens publiés, revenus, score confiance
  - **Métadonnées** : Si propriétaire agence

- **Fonctionnalités** :
  - ✅ Photo de profil et logo agence
  - ✅ Score de confiance
  - ✅ Informations agence (si applicable)
  - ✅ Statistiques propriétaire
  - ✅ Gestion des métadonnées
  - ✅ Support propriétaire individuel et agence

---

## 🏢 **Pages Agence** (/agences/*)

### 📄 **AgencyProfilePage** (nouvelle)
- **Route** : `/agences/profil` → `AgencyProfilePage.tsx`
- **Layout** : `AgencyDashboardLayout` avec sidebar agence
- **Onglets disponibles** :
  - **Informations** : Nom, téléphone, ville, bio, adresse
  - **Agence** : Nom, logo, description, site web
  - **Contact** : Téléphone agence, email agence
  - **Vérifications** : Email, ONECI, CNAM
  - **Statistiques** : Biens gérés, mandats, revenus, score confiance

- **Fonctionnalités** :
  - ✅ Photo de profil et logo agence
  - ✅ Informations complètes d'agence
  - ✅ Contact agence séparé
  - ✅ Site web agence
  - ✅ Statistiques détaillées
  - ✅ Score de confiance spécifique

---

## 🎯 **Caractéristiques Communes**

### **Design Cohérent**
- **Header photo** avec upload
- **Informations de base** dans tous les profils
- **Système de vérification** (Email, ONECI, CNAM)
- **Scores et statistiques** adaptés au rôle
- **Onglets contextuels** selon le type d'utilisateur

### **Layouts Appropriés**
- **Locataire** : `TenantDashboardLayout`
- **Propriétaire** : `OwnerDashboardLayout`
- **Agence** : `AgencyDashboardLayout`

### **Fonctionnalités Étendues**
- **Upload d'images** : Avatar et logo (pour agences)
- **Vérification ONECI** : Intégration directe
- **Historique et statistiques** : Spécifiques au rôle
- **Documents** : Justificatifs, relevés bancaires, etc.

## 📱 **Routes et Accès**

### **Route principale de profil**
- `/profil` → Route universelle qui redirige selon le type d'utilisateur
- Plus besoin de redirections manuelles dans les sidebars

### **Routes spécifiques**
- `/locataire/profil` → Profil locataire amélioré
- `/proprietaire/profil` → Profil propriétaire complet
- `/agences/profil` → Profil agence professionnel

## ✅ **Avantages**

1. **Expérience Utilisateur** : Chaque type d'utilisateur a une expérience adaptée
2. **Cohérence Visuelle** : Même design de base, avec adaptations spécifiques
3. **Fonctionnalités Pertinentes** : Chaque profil montre les informations pertinentes pour son rôle
4. **Centralisation** : Toutes les fonctionnalités de profil utilisent les mêmes composants de base
5. **Extensibilité** : Facile à ajouter de nouveaux onglets ou fonctionnalités

## 🔄 **Utilisation Composants**

Toutes les pages profil réutilisent :
- `Input` et `Button` du shared/ui
- `toast` pour les notifications
- `supabase` pour la gestion des données
- `STORAGE_BUCKETS` pour les uploads
- `formatAddress` pour les adresses