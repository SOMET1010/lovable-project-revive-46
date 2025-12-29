# MonToit

Plateforme immobilière complète pour la location de biens en France, connectant locataires, propriétaires et agences immobilières.

---

## Table des matières

1. [Présentation du projet](#présentation-du-projet)
2. [Architecture technique](#architecture-technique)
3. [Acteurs de la plateforme](#acteurs-de-la-plateforme)
4. [Fonctionnalités par acteur](#fonctionnalités-par-acteur)
   - [Locataires](#fonctionnalités-locataires)
   - [Propriétaires](#fonctionnalités-propriétaires)
   - [Agences Immobilières](#fonctionnalités-agences-immobilières)
   - [Administrateurs](#fonctionnalités-administrateurs)
   - [Agents de Confiance](#fonctionnalités-agents-de-confiance)
   - [Modérateurs](#fonctionnalités-modérateurs)
5. [Fonctionnalités transverses](#fonctionnalités-transverses)
6. [Sécurité et conformité](#sécurité-et-conformité)
7. [Intégrations externes](#intégrations-externes)

---

## Présentation du projet

MonToit est une plateforme web moderne et accessible qui facilite la mise en relation entre les différents acteurs du marché locatif français. Elle offre une expérience utilisateur fluide, sécurisée et complète pour gérer l'ensemble du processus de location, de la recherche de bien à la signature électronique des contrats.

### Objectifs

- Simplifier la recherche de logement pour les locataires
- Faciliter la gestion locative pour les propriétaires
- Professionnaliser la gestion immobilière pour les agences
- Sécuriser les transactions et les contrats
- Offrir une expérience mobile de qualité

---

## Architecture technique

### Stack technologique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 18.3.1 avec TypeScript |
| Routage | React Router 6.30.1 avec lazy loading |
| État global | Zustand 4.5.7 + TanStack Query 5.90.5 |
| Styles | Tailwind CSS 3.4.1 avec design tokens personnalisés |
| Base de données | Supabase (PostgreSQL) |
| Authentification | Supabase Auth |
| Cartographie | Mapbox GL et Leaflet |
| Graphiques | Recharts |
| Mobile | Capacitor (PWA) |

### Patterns architecturaux

- Structure modulaire par fonctionnalité
- Lazy loading pour optimisation des performances
- Contrôle d'accès basé sur les rôles (RBAC)
- Conformité WCAG AA pour l'accessibilité
- Design responsive mobile-first

---

## Acteurs de la plateforme

MonToit définit **6 types d'utilisateurs** distincts :

| Acteur | Rôle |
|--------|------|
| **Locataire** | Utilisateur recherchant un logement à louer |
| **Propriétaire** | Particulier possédant des biens à louer |
| **Agence Immobilière** | Professionnel gérant des biens pour le compte de propriétaires |
| **Administrateur** | Gestionnaire de la plateforme avec accès complet |
| **Agent de Confiance** | Agent spécialisé dans les vérifications et inspections |
| **Modérateur** | Responsable de la modération du contenu |

---

## Fonctionnalités par acteur

## Fonctionnalités Locataires

### Recherche et exploration

- **Moteur de recherche avancé** avec filtres multi-critères (localisation, prix, surface, type de bien)
- **Vue cartographique interactive** pour visualiser les biens sur une carte
- **Filtres personnalisables** (nombre de pièces, équipements, accessibilité PMR)
- **Système de favoris** pour sauvegarder les biens intéressants
- **Alertes recherche** pour être notifié des nouvelles offres correspondantes
- **Navigation fluide** avec pagination et chargement infini

### Candidatures et visites

- **Dépôt de candidatures** en ligne avec lettre de motivation personnalisée
- **Gestion de documents** (pièces d'identité, justificatifs de revenus, garant)
- **Planification de visites** avec choix de créneaux horaires
- **Suivi des candidatures** en temps réel (en attente, acceptée, refusée)
- **Historique des visites** effectuées et à venir
- **Communication directe** avec propriétaires/agents via messagerie intégrée

### Contrat et paiement

- **Signature électronique** des baux via Cryptoneo
- **Visualisation des contrats** avec historique des versions
- **Paiement en ligne** du loyer (Mobile Money, virement bancaire)
- **Historique des paiements** avec reçus téléchargeables
- **Prélèvement automatique** optionnel
- **Gestion des charges** et rappels de paiement

### Vie du locataire

- **Demandes de maintenance** pour les réparations
- **Suivi des demandes** (statut, intervenant, délai)
- **Accès aux documents** (contrat, quittances, diagnostics)
- **Messagerie intégrée** avec le propriétaire/gestionnaire
- **Système d'évaluation** du bien et du propriétaire
- **Historique locatif** pour constituer un dossier de confiance

### Profil et vérification

- **Profil complet** avec informations personnelles et situation
- **Système de vérification** d'identité et de solvabilité
- **Score de confiance** basé sur l'historique
- **Gestion des documents** vérifiés
- **Tableau de bord personnel** récapitulatif

---

## Fonctionnalités Propriétaires

### Gestion des biens

- **Création d'annonces** détaillées avec photos et vidéos
- **Description complète** des caractéristiques (surface, pièces, équipements)
- **Gestion des photos** avec galerie et tri
- **Statut des biens** (disponible, occupé, en cours de location)
- **Modification/suppression** des annonces
- **Duplicata d'annonce** pour les biens similaires
- **Statistiques de vue** des annonces

### Gestion des candidatures

- **Réception des candidatures** avec notifications
- **Consultation des dossiers** complets des candidats
- **Vérification des documents** fournis
- **Acceptation/refus** des candidatures avec message personnalisé
- **Gestion des listes d'attente**
- **Comparaison des profils** de candidats
- **Historique des candidatures** par bien

### Gestion des locations

- **Création et envoi** des contrats de bail
- **Signature électronique** avec suivi des signatures
- **Gestion des cautions** et dépôts de garantie
- **Suivi des paiements** de loyer
- **Émission de reçus** et quittances automatiques
- **Gestion des augmentations** de loyer
- **Fin de bail** et état des lieux

### Communication et visites

- **Messagerie intégrée** avec les locataires
- **Organisation de visites** avec planning
- **Gestion des créneaux** de disponibilité
- **Rappels automatiques** de visite
- **Messages groupés** pour plusieurs candidats

### Maintenance et interventions

- **Réception des demandes** de maintenance
- **Suivi des interventions** (statut, coût, intervenant)
- **Gestion des prestataires** et artisans
- **Historique des réparations** par bien
- **Budget de maintenance** annuel

### Analytics et reporting

- **Tableau de bord** synthétique de tous les biens
- **Taux d'occupation** par bien et global
- **Revenus locatifs** et historiques
- **Performance des annonces** (vues, candidatures)
- **Calendrier des échéances** (paiements, fins de bail)
- **Export de rapports** (PDF, Excel)

### Collaboration avec agences

- **Gestion des mandats** de gestion
- **Sélection d'agences** partenaires
- **Suivi des commissions**
- **Partage de documents** sécurisé
- **Contrats de mandat** électroniques

---

## Fonctionnalités Agences Immobilières

### Portefeuille biens

- **Gestion centralisée** de tous les biens gérés
- **Vue par propriétaire** avec portefeuille associé
- **Ajout massif** de biens avec import
- **Gestion des mandats** (location, vente, gestion)
- **Renouvellement des mandats** avec alertes
- **Documents associés** par bien
- **États des lieux** numériques

### Gestion des propriétaires

- **Fiche propriétaire** complète avec portefeuille
- **Contrats de mandat** dématérialisés
- **Suivi des revenus** générés par propriétaire
- **Rapports périodiques** automatiques
- **Messagerie dédiée**
- **Documents contractuels** sécurisés
- **Historique des relations**

### Gestion des locataires

- **Base locataires** centralisée
- **Dossiers de candidature** complets
- **Vérifications d'identité** et solvabilité
- **Historique des paiements** par locataire
- **Suivi des contrats** en cours
- **Communications groupées** ou individuelles
- **Gestion des renouvellements** de bail

### Processus de location

- **Pipeline de candidatures** avec kanban
- **Traitement groupé** des candidatures
- **Génération automatique** des documents de bail
- **Workflow de validation** personnalisable
- **Suivi des états des lieux** (entrée/sortie)
- **Gestion des cautions** et restitutions

### Équipe et agents

- **Gestion de l'équipe** d'agents immobiliers
- **Attribution des biens** par agent
- **Suivi des performances** individuelles
- **Commissionnement** automatique
- **Planning des interventions**
- **Formation et onboarding**
- **Droits et permissions** par rôle

### Commissions et facturation

- **Calcul automatique** des commissions
- **Taux personnalisables** par bien/propriétaire
- **Facturation automatique** des honoraires
- **Suivi des règlements**
- **Rapports de commissionnement**
- **Export comptable**

### Marketing et communication

- **Diffusion d'annonces** sur portails partenaires
- **Gestion des campagnes** promotionnelles
- **Création de visuels** professionnels
- **Communication automatique** avec prospects
- **Newsletters** et mailing ciblé
- **Statistiques marketing** (ROI, conversion)

### Reporting et analytics

- **Tableau de bord agence** complet
- **KPIs personnalisables** (occupation, rendement, satisfaction)
- **Rapports automatisés** (quotidiens, hebdo, mensuels)
- **Comparatifs de performance** (périodes, agents)
- **Prévisions** de revenus et trésorerie
- **Export multi-formats**

### Outils collaboratifs

- **Espace collaboratif** par dossier
- **Partage de documents** interne
- **Commentaires et annotations**
- **Tâches et rappels**
- **Calendrier partagé**
- **Journal d'activités**

---

## Fonctionnalités Administrateurs

### Gestion des utilisateurs

- **Vue globale** de tous les utilisateurs inscrits
- **Création et modification** de comptes
- **Attribution de rôles** (admin, modérateur, agent de confiance)
- **Suspension/bannissement** de comptes
- **Vérification manuelle** d'identité
- **Export des données** utilisateur (RGPD)
- **Historique des actions** par utilisateur

### Configuration plateforme

- **Paramètres généraux** de la plateforme
- **Gestion des fonctionnalités** (feature flags)
- **Configuration des emails** et notifications
- **Personnalisation des textes** et messages
- **Gestion des langues** et traductions
- **Configuration des paiements**
- **Paramètres de sécurité**

### Modération et contenu

- **Modération des annonces** (validation, rejet)
- **Gestion des signalements** d'utilisateurs
- **Suppression de contenu** non conforme
- **Gestion des avis** et commentaires
- **Politique de modération** personnalisable
- **Règles automatisées** de modération

### Analytics et monitoring

- **Statistiques globales** de la plateforme
- **Métriques d'utilisation** (inscriptions, connexions)
- **Performance technique** (temps de réponse, erreurs)
- **Analyse du comportement** utilisateur
- **Rapports d'activité** automatisés
- **Alertes et monitoring** en temps réel
- **Logs d'audit** complets

### Support et assistance

- **Gestion des tickets** support
- **Messagerie avec utilisateurs**
- **Base de connaissance** et FAQ
- **Réponses automatiques** et templates
- **Suivi des satisfactions**
- **Escalation des problèmes**

### Gestion financière

- **Vue des transactions** plateforme
- **Commissionnement plateforme**
- **Rapports financiers**
- **Gestion des abonnements** et frais
- **Export comptable**
- **Rapprochements bancaires**

### Conformité et légal

- **Gestion du consentement** (RGPD)
- **Politique de confidentialité**
- **Conditions d'utilisation**
- **Gestion des cookies**
- **Archivage légal** des documents
- **Rapports de conformité**

---

## Fonctionnalités Agents de Confiance

### Vérifications

- **Inspection de biens** (CEV - Contrôle d'État des Lieux)
- **Vérification d'identité** des locataires
- **Validation des documents** fournis
- **Contrôle de solvabilité**
- **Visite de conformité** des biens
- **Photographie officielle** des états des lieux

### Certification

- **Émission de certificats** de conformité
- **Rapports d'inspection** détaillés
- **Attestation de vérification** documentaire
- **Certification de photos** d'état des lieux
- **Apostilles et signatures** numériques

### Missions

- **Tableau de bord des missions** assignées
- **Planification des interventions**
- **Guides et checklists** par type de mission
- **Capture de preuves** (photos, notes)
- **Compte-rendu automatique** de visite
- **Suivi des paiements** de missions

### Communication

- **Coordination avec parties** (propriétaire, locataire, agence)
- **Partage sécurisé** des rapports
- **Messagerie dédiée**
- **Notifications de missions**

---

## Fonctionnalités Modérateurs

### Modération de contenu

- **Validation des annonces** avant publication
- **Contrôle des photos** et descriptions
- **Détection de contenus** frauduleux ou interdits
- **Suppression d'annonces** non conformes
- **Avertissements aux utilisateurs**
- **Signalements automatiques**

### Gestion des litiges

- **Réception des plaintes** utilisateurs
- **Médiation entre parties**
- **Collecte de preuves** et témoignages
- **Décision de résolution**
- **Sanctions appropriées**
- **Suivi des récidives**

### Qualité et conformité

- **Respect des chartes** et conditions
- **Vérification des prix** et annonces suspectes
- **Contrôle des messages** et commentaires
- **Analyse des tendances** de modération
- **Amélioration continue** des règles

---

## Fonctionnalités transverses

### Authentification et sécurité

- **Inscription multi-profils** avec parcours adapté
- **Connexion email/mot de passe**
- **Connexion sociale** (Google, Facebook)
- **Réinitialisation de mot de passe**
- **Vérification d'email**
- **Double authentification** (2FA)
- **Reconnexion automatique** sécurisée
- **Déconnexion de tous les appareils**

### Messagerie

- **Messagerie interne** instantanée
- **Organisation par conversations**
- **Notifications en temps réel**
- **Pièces jointes** (documents, photos)
- **Historique complet** des échanges
- **Marquage lu/non-lu**
- **Recherche dans les messages**

### Notifications

- **Notifications push** (mobile et navigateur)
- **Notifications email**
- **Notifications SMS** (pour les urgences)
- **Préférences de notification** personnalisables
- **Centre de notifications** avec historique
- **Catégorisation** des notifications

### Documents

- **Stockage sécurisé** des documents
- **Organisation par dossier**
- **Partage sécurisé** avec expiration
- **Visualisation en ligne** (PDF, images)
- **Téléchargement et impression**
- **Versioning** des documents
- **Signature électronique** intégrée

### Paiements

- **Paiement en ligne** sécurisé
- **Multi-méthodes** (Mobile Money, carte, virement)
- **Prélèvements automatiques**
- **Gestion des mandats** de prélèvement
- **Remboursements** et annulations
- **Historique complet** avec reçus
- **Relevés fiscaux** annuels

### Évaluations et avis

- **Système d'évaluation** (5 étoiles)
- **Avis textuels** avec modération
- **Profils notés** (locataire, propriétaire, agence)
- **Biens notés**
- **Commentaires modérés**
- **Historique des évaluations**

### Recherche et alertes

- **Recherche avancée** multi-critères
- **Sauvegarde des recherches**
- **Alertes email** nouvelles offres
- **Comparaison de biens**
- **Vue carte et liste**
- **Filtres rapides**

### Accessibilité

- **Interface WCAG AA** conforme
- **Navigation clavier** complète
- **Lecteur d'écran** compatible
- **Contrastes ajustés**
- **Polices redimensionnables**
- **Descriptions alternatives** (images)

### Mobile

- **Application mobile** (iOS et Android)
- **Interface responsive** tous écrans
- **Fonctionnalités offline** limitées
- **Notifications push** mobile
- **Authentification biométrique**

---

## Sécurité et conformité

### Sécurité

- **Chiffrement des données** (SSL/TLS)
- **Row Level Security** (RLS) en base de données
- **Protection contre XSS, CSRF**
- **Rate limiting** API
- **Validation des entrées** serveur et client
- **Logs d'audit** complets
- **Tests de sécurité** réguliers

### Conformité

- **RGPD** conforme (consentement, droit à l'oubli, export)
- **Loi anti-blanchiment** (KYC)
- **Droit locatif** français
- **Archivage légal** des documents
- **Politique de confidentialité**
- **Conditions d'utilisation**

---

## Intégrations externes

| Service | Utilisation |
|---------|-------------|
| **Supabase** | Base de données, authentification, temps réel |
| **Cryptoneo** | Signature électronique des contrats |
| **Mapbox/Leaflet** | Cartographie et géolocalisation |
| **Intouch/Brevo** | Notifications SMS et email |
| **Azure** | Reconnaissance faciale, traduction, synthèse vocale |
| **jsPDF** | Génération de documents PDF |
| **Recharts** | Graphiques et visualisations |

---

## Structure des routes

```
/                           # Routes publiques
├── /recherche              # Recherche de biens
├── /propriete/:id          # Détail d'un bien
├── /connexion              # Authentification
├── /inscription            # Inscription
├── /dashboard              # Redirection intelligente par rôle
│
├── /locataire              # Espace locataire
│   ├── /recherche          # Recherche personnalisée
│   ├── /favoris            # Biens favoris
│   ├── /candidatures       # Mes candidatures
│   ├── /visites            # Mes visites
│   ├── /contrats           # Mes contrats
│   ├── /paiements          # Mes paiements
│   ├── /maintenance        # Demandes de maintenance
│   └── /messages           # Messagerie
│
├── /proprietaire           # Espace propriétaire
│   ├── /biens              # Gestion des biens
│   ├── /candidatures       # Candidatures reçues
│   ├── /contrats           # Contrats en cours
│   ├── /paiements          # Revenus locatifs
│   ├── /maintenance        # Demandes de maintenance
│   ├── /agences            # Gestion des mandats
│   └── /messages           # Messagerie
│
├── /agences                # Espace agence
│   ├── /tableau-de-bord    # Dashboard agence
│   ├── /biens              # Portefeuille biens
│   ├── /proprietaires      # Propriétaires gérés
│   ├── /locataires         # Locataires suivis
│   ├── /candidatures       # Pipeline candidatures
│   ├── /contrats           # Gestion des baux
│   ├── /equipe             # Gestion de l'équipe
│   ├── /commissions        # Suivi des commissions
│   └── /rapports           # Reporting
│
├── /moderator              # Espace modérateur
│   ├── /annonces           # Modération des annonces
│   ├── /signalements       # Signalements utilisateurs
│   ├── /litiges            # Gestion des litiges
│   └── /statistiques       # Stats de modération
│
└── /admin                  # Espace administrateur
    ├── /utilisateurs       # Gestion des utilisateurs
    ├── /plateforme         # Configuration
    ├── /moderation         # Outils de modération
    ├── /analytics          # Statistiques globales
    ├── /support            # Gestion du support
    ├── /finances           # Vue financière
    └── /conformite         # Conformité et légal
```

---

*Pour toute question ou contribution à ce projet, merci de contacter l'équipe de développement.*
