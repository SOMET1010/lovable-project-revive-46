# 🧪 PLAN DE TEST COMPLET - MONTOIT

## 📊 **Vue d'Ensemble**
- **Modules fonctionnels:** 10
- **Rôles utilisateurs:** 4 (Locataire, Propriétaire, Tiers de Confiance, Admin)
- **Pages:** 80+
- **Intégrations:** 15 services externes
- **Statut global:** 14 Epics - 100% Complétés

---

## 🎯 **PLAN DE TEST STRUCTURÉ**

### **PHASE 1 - MODULES CRITIQUES** 🔴
*Priorité absolue - Fonctionnalités de base*

#### **1️⃣ MODULE AUTHENTIFICATION & PROFIL** (6 pages)
**🔍 Tests à effectuer:**
- [ ] Inscription multi-étapes (email + sélection profil)
- [ ] Connexion email/mot de passe
- [ ] Connexion OAuth (Google, Facebook)
- [ ] 2FA via SMS ou email
- [ ] Gestion profil (modification, photo)
- [ ] Vérification identité ANSUT (NNI + upload CNI)
- [ ] Vérification faciale biométrique (NeoFace)

#### **2️⃣ MODULE RECHERCHE & DÉCOUVERTE** (5 pages)
**🔍 Tests à effectuer:**
- [ ] Recherche avancée (filtres multiples)
- [ ] Carte interactive Mapbox
- [ ] Recherche vocale (Azure Speech)
- [ ] Recherche par photo
- [ ] Recherche sémantique (Gemini/DeepSeek)
- [ ] Recommandations IA
- [ ] Favoris & Alertes
- [ ] Détails propriété
- [ ] Planification visites avec QR code

#### **3️⃣ MODULE CANDIDATURE & VÉRIFICATION** (4 pages)
**🔍 Tests à effectuer:**
- [ ] Formulaire candidature complet
- [ ] Score locataire (0-100)
- [ ] Upload documents obligatoires
- [ ] Vérification biométrique (selfie + vivacité)
- [ ] Vérification NNI via API ONECI
- [ ] Comparaison faciale (NeoFace)

#### **4️⃣ MODULE CONTRATS & SIGNATURE** (6 pages)
**🔍 Tests à effectuer:**
- [ ] Création contrat (template Code Civil)
- [ ] Signature électronique CEV (6 étapes)
- [ ] Validation ANSUT + cachet électronique
- [ ] Gestion contrats (consultation, téléchargement)
- [ ] Renouvellement bail
- [ ] Résiliation bail (préavis + état des lieux)

#### **5️⃣ MODULE PAIEMENTS** (3 pages)
**🔍 Tests à effectuer:**
- [ ] Paiement loyer (automatique + manuel)
- [ ] Mobile Money (Orange, MTN, Moov, Wave)
- [ ] Carte bancaire + virement
- [ ] Gestion caution (séquestre + restitution)
- [ ] Historique & reçus PDF
- [ ] Rappels automatiques (7j/30j)

---

### **PHASE 2 - MODULES IMPORTANTS** 🟡
*Fonctionnalités avancées*

#### **6️⃣ MODULE MAINTENANCE** (2 pages)
**🔍 Tests à effectuer:**
- [ ] Demandes maintenance (photos/vidéos + niveau urgence)
- [ ] Suivi interventions temps réel
- [ ] Assignation prestataire
- [ ] Évaluation service

#### **7️⃣ MODULE COMMUNICATION** (2 pages)
**🔍 Tests à effectuer:**
- [ ] Messagerie chiffrée bout-en-bout
- [ ] Pièces jointes (10 MB max)
- [ ] Notifications temps réel
- [ ] Configuration préférences notifications

#### **8️⃣ MODULE LITIGES & MÉDIATION** (3 pages)
**🔍 Tests à effectuer:**
- [ ] Création litige (avec preuves)
- [ ] Médiation automatique tiers confiance
- [ ] Solution proposées + réunion conciliation
- [ ] Résolution (max 30 jours)

#### **9️⃣ MODULE ADMINISTRATION** (12 pages)
**🔍 Tests à effectuer:**
- [ ] Feature flags (activation/désactivation)
- [ ] Configuration services (15 API)
- [ ] Gestion utilisateurs (rôles + suspension)
- [ ] Tiers de confiance (certification + zones)
- [ ] Certificats CEV
- [ ] Générateur données test
- [ ] Analytics globales

#### **🔟 MODULE ANALYTICS & REPORTING** (4 pages)
**🔍 Tests à effectuer:**
- [ ] Dashboards (KPIs + graphiques interactifs)
- [ ] Statistiques propriétés
- [ ] Rapports automatiques (mensuels)
- [ ] Export PDF/Excel

---

## 🎮 **SÉQUENCE DE TEST RECOMMANDÉE**

### **Étape 1: Préparation**
1. **Créer comptes test** pour chaque rôle
2. **Configurer données de test** (propriétés, utilisateurs)
3. **Activer tous les feature flags**

### **Étape 2: Parcours Utilisateur Complet**
1. **👤 LOCATAIRE:** Inscription → Recherche → Candidature → Signature → Paiement
2. **🏠 PROPRIÉTAIRE:** Publication → Gestion → Réception paiement → Maintenance
3. **🛡️ TIERS:** Validation → Médiation → Rapports
4. **⚙️ ADMIN:** Configuration → Monitoring → Analytics

### **Étape 3: Tests d'Intégration**
1. **15 services externes** un par un
2. **Workflows bout-en-bout** (inscription → contrat → paiement)
3. **Notifications** (email, SMS, push)

### **Étape 4: Tests de Performance**
1. **Chargement** des 80+ pages
2. **Bundle size** (488 KB → 156 KB gzippé)
3. **Lighthouse** (cible >90)

---

## 📋 **CHECKLIST DE TEST PAR MODULE**

### ✅ **À FAIRE AVANT CHAQUE MODULE:**
- [ ] Prendre captures d'écran
- [ ] Vérifier console développeur (0 erreur)
- [ ] Tester responsive design
- [ ] Valider vitesse de chargement
- [ ] Documenter bogues trouvés

### ✅ **CRITÈRES DE SUCCÈS:**
- [ ] **Fonctionnalité:** 100% opérationnelle
- [ ] **UI/UX:** Intuitive et responsive  
- [ ] **Performance:** < 3 secondes de chargement
- [ ] **Intégrations:** Tous les services connectés
- [ ] **Sécurité:** Authentification + chiffrement OK

---

## 🚀 **COMMENÇONS !**

**Par quelle fonctionnalité souhaitez-vous commencer le test ?**

**Options disponibles:**
1. **🔐 Authentification** (inscription/connexion)
2. **🔍 Recherche propriétés** (carte + filtres)
3. **📄 Candidature locataire** (formulaire + vérification)
4. **💰 Paiements** (Mobile Money + bancaire)
5. **📝 Signature électronique** (contrats CEV)
6. **🎯 Autre module** (précisez lequel)