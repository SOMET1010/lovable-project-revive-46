# Plan de Structure de Contenu - Refonte MONTOITVPROD

## 1. Inventaire des Matériaux

### Architecture Actuelle Identifiée

**Pages Principales (80+ pages organisées par features):**

**Public (Non-authentifié):**
- HomePage (hero + recherche + propriétés populaires)
- SearchPropertiesPage (résultats de recherche)
- PropertyDetailPage (détails propriété)
- Auth/Inscription/Connexion
- Pages informationnelles (About, FAQ, Help, How It Works, Contact, Privacy, Terms)

**Dashboards par rôle:**
- Tenant Dashboard (locataire)
- Owner Dashboard (propriétaire)
- Agency Dashboard (agence)
- Admin Dashboard (administrateur)
- Trust Agent Dashboard (agent de confiance)

**Features par rôle:**
- **Tenant (19 pages):** Recherche, Favoris, Visites, Candidatures, Contrats, Paiements, Maintenance, Recommandations, Score
- **Owner (6 pages):** Gestion propriétés, Contrats, Maintenance, Analytics
- **Agency (5 pages):** Propriétés, Équipe, Commissions, Registration
- **Admin (13 pages):** Utilisateurs, Rôles, Monitoring, Configuration, API Keys, CEV Management
- **Trust Agent (4 pages):** Médiation, Modération, Validation, Analytics
- **Verification (5 pages):** Demande CEV (Certification ANSUT), Certificats

**Messaging & Notifications:**
- Messages, Notifications, Préférences

**Disputes:**
- Créer litige, Mes litiges, Détails litiges

### Composants UI Existants

**Navigation:**
- HeaderPremium, FooterPremium
- Breadcrumb
- PageHeader (mini-hero interne avec gradients)

**Éléments de recherche:**
- HeroSpectacular (homepage hero avec diaporama)
- QuickSearch, SearchFilters, SearchResults
- VoiceSearch, EnhancedSearch

**Cards & Affichage:**
- PropertyCard, FeatureCard, CityCard, ProfileCard
- Card (default, bordered, elevated)
- MetricCard (analytics)

**Formulaires & Inputs:**
- Button, Input, FileUpload
- PhoneInput, OTPInput
- Modal

**Data Visualization:**
- Charts (BarChart, TimeSeriesChart, FunnelChart, GeographicHeatmap)
- PropertyMap, PropertyComparison

**Messaging:**
- Chatbot, NotificationCenter, ChatMessage

### Assets Visuels
- Images hero (4 images: hero1-4.jpg)
- Icons Lucide React (SVG)
- Patterns SVG (PageHeader backgrounds)

## 2. Structure du Site

**Type:** Multi-Page Application (MPA)

**Justification:**
- 80+ pages distinctes
- 6 types d'utilisateurs différents avec besoins spécifiques
- Multiples flows complexes (recherche, candidature, contrat, paiement, médiation)
- Richesse de contenu et fonctionnalités très diversifiées
- Besoin de SEO pour pages publiques

## 3. Architecture des Pages - Mapping de Refonte

### A. PAGES PUBLIQUES (Non-authentifiées)

#### Page 1: Homepage (`/`)

**Objectif:** Convertir visiteurs en utilisateurs actifs (recherche propriétés)

**Content Mapping:**

| Section | Pattern de Design | Source de Données | Contenu à Extraire | Asset Visuel |
|---------|-------------------|-------------------|--------------------|--------------| 
| Hero Moderne | Hero Pattern (§3.1) | `src/features/property/components/HeroSpectacular.tsx` | Titre "Trouvez votre logement en toute confiance" + baseline | hero1.jpg (image statique unique) |
| Formulaire Recherche | Search Input Pattern (§3.5) | `HeroSpectacular.tsx` L114-186 | Champs: Ville, Type, Prix max | - |
| Statistiques Clés | Metric Cards Grid (§3.2) | Données statistiques actuelles | 4 métriques: Propriétés, Villes, Utilisateurs, Transactions | - |
| Propriétés Populaires | Property Card Grid | API propriétés | Grille 3 colonnes propriétés featured | Images propriétés |
| Comment ça marche | Feature Cards (3 colonnes) | `HowItWorksPage.tsx` | 3 étapes processus | - |
| CTA Final | CTA Section | - | "Commencez votre recherche" | - |

#### Page 2: Recherche de Propriétés (`/recherche`)

**Objectif:** Permettre recherche et filtrage efficace

**Content Mapping:**

| Section | Pattern de Design | Source de Données | Contenu à Extraire | Asset Visuel |
|---------|-------------------|-------------------|--------------------|--------------| 
| Page Header | Simple Header (§3.6) | - | Titre "Recherche de propriétés" + breadcrumb | - |
| Filtres Horizontaux | Filter Tabs (§3.5) | `SearchFilters.tsx` | Filtres: Ville, Type, Prix, Chambres, Superficie | - |
| Résultats | Property Card Grid | API recherche | Liste propriétés avec pagination | Images propriétés |
| Carte Interactive | Map Embed (pleine largeur) | `PropertyMap.tsx` | Carte Mapbox avec markers | - |

#### Page 3: Détail Propriété (`/propriete/:id`)

**Objectif:** Présenter propriété en détail + inciter candidature

**Content Mapping:**

| Section | Pattern de Design | Source de Données | Contenu à Extraire | Asset Visuel |
|---------|-------------------|-------------------|--------------------|--------------| 
| Page Header | Simple Header | API propriété | Titre propriété + breadcrumb | - |
| Galerie Photos | Image Gallery (§3.7) | API propriété | Photos propriété (carousel + thumbnails) | Images propriété |
| Informations Clés | 2-Column Layout | API propriété | Gauche: Détails (chambres, superficie, prix) / Droite: Carte propriétaire | Photo propriétaire |
| Description | Text Block | API propriété | Description complète | - |
| Caractéristiques | Icon List Grid | API propriété | Équipements et caractéristiques | - |
| Localisation | Map Embed | API propriété | Carte quartier + POIs | - |
| CTA Fixe | Sticky CTA Bar | - | "Planifier une visite" + "Postuler" | - |

#### Pages 4-8: Pages Informationnelles

**Pages:** About, FAQ, Help, Contact, How It Works, Privacy Policy, Terms of Service

| Page | Pattern | Source | Contenu |
|------|---------|--------|---------|
| About | Content Page Pattern | `AboutPage.tsx` | Histoire entreprise + mission |
| FAQ | Accordion List | `FAQPage.tsx` | Questions fréquentes groupées |
| Help | Content + Search | `HelpPage.tsx` | Recherche aide + catégories |
| Contact | Form Pattern (§3.4) | `ContactPage.tsx` | Formulaire contact (Nom, Email, Tel, Sujet, Message) |
| How It Works | Feature Cards | `HowItWorksPage.tsx` | 3-4 étapes processus |
| Privacy/Terms | Legal Document | Pages respectives | Texte légal avec TOC |

### B. DASHBOARDS PAR RÔLE (Authentifiés)

#### Page 9: Tenant Dashboard (`/tableau-de-bord`)

**Objectif:** Vue d'ensemble activité locataire

**Content Mapping:**

| Section | Pattern | Source | Contenu | Asset Visuel |
|---------|---------|--------|---------|--------------|
| Header Dashboard | Dashboard Header (§3.8) | - | "Bienvenue, [Nom]" + notifications | Avatar utilisateur |
| Statistiques | Metric Cards (4 cards) | API user stats | Visites planifiées, Candidatures, Favoris, Messages | - |
| Prochaines Visites | Timeline Cards | API visites | Liste visites à venir | - |
| Propriétés Favorites | Property Card Grid (horizontal scroll) | API favoris | 3-4 propriétés favorites | Images propriétés |
| Candidatures en cours | Status Cards | API applications | Statut candidatures | - |
| Recommandations | Property Card Grid | API recommendations | Propriétés recommandées basées sur recherches | Images propriétés |

#### Page 10: Owner Dashboard (`/proprietaire/tableau-de-bord`)

**Objectif:** Gestion propriétés et contrats

**Content Mapping:**

| Section | Pattern | Source | Contenu | Asset Visuel |
|---------|---------|--------|---------|--------------|
| Header Dashboard | Dashboard Header | - | "Mes Propriétés" | Avatar |
| Statistiques | Metric Cards (4 cards) | API owner stats | Propriétés actives, Locataires, Revenus mois, Taux occupation | - |
| Propriétés Actives | Property Management Table | API propriétés | Liste propriétés avec actions (Modifier, Voir, Désactiver) | Thumbnails propriétés |
| Contrats Actifs | Contract Cards | API contrats | Contrats en cours avec dates échéance | - |
| Demandes Maintenance | Alert Cards | API maintenance | Demandes maintenance en attente | - |
| Analytics Rapides | Chart Grid | API analytics | Graphiques revenus + taux occupation | - |

#### Pages 11-15: Autres Dashboards

**Agency, Admin, Trust Agent Dashboards** suivent même structure:
- Header Dashboard (§3.8)
- Metric Cards (statistiques rôle-spécifiques)
- Tables de données (utilisateurs, propriétés, médiations, etc.)
- Actions rapides (boutons contextuels)

### C. FEATURES TRANSACTIONNELLES

#### Page 16: Candidature Propriété (`/candidature/:propertyId`)

**Objectif:** Soumettre candidature location

**Content Mapping:**

| Section | Pattern | Source | Contenu |
|---------|---------|--------|---------|
| Page Header | Simple Header | - | "Candidature - [Nom Propriété]" |
| Résumé Propriété | Property Summary Card | API propriété | Photo + infos clés |
| Formulaire Multi-étapes | Stepper Form (§3.4) | `ApplicationFormPage.tsx` | Étape 1: Infos perso / Étape 2: Docs / Étape 3: Revenus / Étape 4: Validation |
| Upload Documents | File Upload Zone (§3.9) | - | Zone drag-drop documents (ID, justificatifs revenus) |
| Récapitulatif | Summary Card | - | Résumé candidature avant soumission |

#### Page 17: Paiement (`/paiement/:contractId`)

**Objectif:** Effectuer paiement loyer

**Content Mapping:**

| Section | Pattern | Source | Contenu |
|---------|---------|--------|---------|
| Page Header | Simple Header | - | "Paiement du loyer" |
| Détails Contrat | Contract Summary Card | API contrat | Propriété, Montant, Date échéance |
| Méthodes Paiement | Radio Button Cards | `MobileMoneyPayment.tsx` | Mobile Money (Orange, MTN, Moov, Wave) + Carte bancaire |
| Formulaire Paiement | Form Pattern | - | Champs selon méthode choisie |
| Récapitulatif Sécurisé | Summary Card + Security Badges | - | Montant + badges sécurité |

#### Pages 18-25: Autres Features

**Contrats, Visites, Maintenance, Messages, Litiges** - Même approche:
- Page Header simple
- Formulaires ou listes selon contexte
- Tables de données avec actions
- Modals pour actions rapides

### D. ADMINISTRATION & CONFIGURATION

#### Pages 26-30: Admin Pages

**Users, Roles, Monitoring, Configuration, API Keys:**
- Layout dashboard admin (sidebar + content)
- Tables de données avec filtres
- Formulaires de configuration
- Charts de monitoring

## 4. Analyse de Contenu

**Densité d'Information:** Élevée
- 80+ pages avec fonctionnalités complexes
- Multiples rôles utilisateurs avec besoins différents
- Transactions financières sensibles (paiements, contrats)
- Données analytics et monitoring

**Équilibre du Contenu:**
- Formulaires: ~30% (candidatures, paiements, configurations)
- Données tabulaires: ~25% (listes propriétés, utilisateurs, contrats)
- Visualisations: ~15% (charts analytics, cartes géographiques)
- Contenu textuel: ~15% (pages info, descriptions)
- Messaging: ~10% (chat, notifications)
- Media: ~5% (galeries photos propriétés)

**Type de Contenu:** Mixte - Application transactionnelle data-driven

**Défis de Design Identifiés:**
1. **Cohérence cross-rôles:** Maintenir harmonie visuelle entre 6 types d'utilisateurs
2. **Clarté des actions:** Formulaires et CTA doivent être évidents (conversions critiques)
3. **Hiérarchie de l'information:** Beaucoup de données à organiser sans surcharge
4. **Performance:** Listes longues, images multiples nécessitent optimisation
5. **Confiance visuelle:** Transactions financières requièrent design professionnel rassurant

## 5. Priorités de Refonte

**Phase 1 - Pages Critiques (Impact immédiat):**
1. Homepage + Hero (première impression)
2. Recherche Propriétés (core feature)
3. Détail Propriété (conversion)
4. Tenant Dashboard (audience principale)
5. Navigation globale (Header/Footer)

**Phase 2 - Composants Système:**
1. Design tokens (couleurs, typographie, espacements)
2. Composants UI de base (Button, Input, Card)
3. Patterns de layout (Page Header, Dashboard Header)
4. Formulaires standardisés

**Phase 3 - Features Transactionnelles:**
1. Candidature
2. Paiement
3. Contrats
4. Messaging

**Phase 4 - Administration & Analytics:**
1. Dashboards rôles secondaires (Owner, Agency, Admin)
2. Analytics & Monitoring
3. Configuration & Settings

---

**Note Importante:** Cette refonte transforme MONTOITVPROD d'une plateforme visuellement "anarchique" en une application **professionnelle, cohérente et moderne** où chaque page, composant et interaction respecte les principes Modern Minimalism Premium.
