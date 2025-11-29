# Analyse technique approfondie de la plateforme MONTOIT (code source) — Architecture, fonctionnalités, composants, pages et flux

## Résumé exécutif et méthodologie

Mon Toit (MONTOIT) est une plateforme immobilière orientée résidentiel, conçue pour la Côte d’Ivoire, qui se positionne comme une place de marché complète unissant recherche de biens, gestion locative, signature de baux, paiement, vérification d’identité et services d’accompagnement (chatbot anti-arnaque, demandes artisan, etc.). L’analyse technique du code met en évidence une application React (TypeScript) utilisant React Router, une architecture modulaire par domaines (features), un socle Supabase (authentification, base de données, fonctions Edge), des intégrations Azure AI, un système de feature flags, ainsi qu’un ensemble riche de composants UI réutilisables. L’implémentation révèle une couverture fonctionnelle étendue et des capacités avancées (génération PDF, cache IA, observabilité via ai_usage_logs, monitoring de santé base de données), mais expose aussi des zones de risque et des dettes techniques (doublons de pages, duplications de composants, couplage fort à Supabase, tests insuffisants).

L’objectif de ce rapport est triple: cartographier l’existant (architecture, composants, pages, flux), inventorier les fonctionnalités et les intégrations, et formuler un diagnostic des forces et faiblesses avec des recommandations pragmatiques. La méthodologie s’appuie sur l’analyse des sources (structure du dépôt, routes, providers, services, composants UI), l’inspection des features flags et des configurations, ainsi que l’exploitation d’artéfacts (captures d’écran, extraits de code, logs et schémas côté client).

![Capture d’écran — Page d’accueil MONTOIT (extrait du dépôt local)](/workspace/browser/screenshots/01_page_accueil_montoit_immobilier.png)

La narration du rapport suit une progression logique: des fondamentaux (structure et architecture) vers les capacités (fonctionnalités et pages), puis vers l’orchestration (flux), la technique (services/intégrations), le diagnostic (forces/faiblesses), et enfin les recommandations priorisées.

### Périmètre et sources

L’analyse couvre le cœur applicatif frontend et les services côté client, sans inspection directe des fonctions Supabase Edge (_body函数的 non auditées_) ni des schémas de base de données (migrations non détaillées). Les références externes ne sont pas disponibles dans le périmètre, et les métriques runtime/production (temps de chargement, erreurs JS, performance route par route) ne sont pas collectées. Sont toutefois exploités: la structure du dépôt (src, features, services), la configuration des feature flags, les routes et pages, les services (paiement, IA Azure, chatbot, signature, notifications), les composants UI (cartes, recherche, verification badges, graphiques, wrappers cartes), ainsi que des artéfacts de navigation (captures d’écran) utiles à l’illustration.

---

## Architecture applicative et infrastructure

L’application repose sur React et TypeScript, avec un routage géré par React Router (createBrowserRouter). La structure du code est modulaire, organisée par domaines métiers (features) et responsabilités transverses (shared, services, hooks). Le Provider d’authentification (AuthProvider) encapsule la session et le profil (Supabase Auth + table profiles), gère les erreurs et implémente un mécanisme de récupération de profil via une RPC (ensure_my_profile_exists). Les intégrations critiques incluent Supabase (auth, base, edge functions), Azure OpenAI/Azure AI (NLP, recommandations, légal assistant, génération de descriptions), des services orientés métier (paiement Mobile Money, signature électronique, notifications, cache IA), ainsi que des utilitaires UI (map wrapper, error boundary, lazy image, skeleton). L’observabilité est facilitée par une journalisation des usages IA (ai_usage_logs) et une logique de cache (ai_cache).

![Structure du dépôt (src) — organisation par features et services](/workspace/browser/screenshots/02_src_folder_structure.png)

![Structure complète des features — couverture fonctionnelle](/workspace/browser/screenshots/04_features_complete_structure.png)

Pour cadrer l’architecture, le tableau ci-dessous résume les principaux éléments.

### Cadre architectural

| Elément | Rôle principal | Observations clés |
|---|---|---|
| Frontend (React + TypeScript) | UI/UX, routage, état client | Modularité par features; composants réutilisables; lazy loading sur pages |
| Routing (React Router) | Navigation, protection de routes | ProtectedRoute; SearchErrorBoundary; 404 intégré dans routes |
| Authentification (Supabase) | Auth, sessions, profil | AuthProvider avec retry/récupération; RPC ensure_my_profile_exists |
| Données et API | Accès aux données | Repositories (properties, leases, messages, etc.); services par domaine |
| Observabilité IA | Suivi consommation/couts IA | ai_usage_logs; cache IA (ai_cache); estimation coûts/tokens |
| Feature flags | Gating des fonctionnalités | Activation sélective par domaine (paiement, verification, IA, etc.) |
| Services transverses | Paiement, PDF, notifications, chatbot, maps | Logique métier encapsulée; intégrations Azure; utilitaires UI |

### Stack technique (frontend, données, intégrations, observabilité)

Le frontend est structuré autour de:

- React (Router, lazy/Suspense) et un ensemble de composants UI transverses (shared/ui).
- Un système de stores locaux (authStore, uiStore, paymentStore) pour l’état global.
- Des hooks dédiés (useAuth, useFeatureFlag, useMessages, useVerification, useProperties) pour la logique réutilisable.

Côté données:

- Supabase sert d’authentification, de base de données et de functions Edge; le client Supabase est configuré avec persistance de session et auto-refresh.
- Des repositories encapsulent l’accès (properties, leases, payments, messages, maintenance, application, user).

Les intégrations majeures:

- Azure OpenAI/Azure AI: orchestration IA (llmOrchestrator), assistant légal (legalAssistantService), recherche NLP (nlpSearchService), moteur de recommandations (recommendationEngine), génération de descriptions (descriptionGeneratorService).
- Services de paiement Mobile Money (détection opérateur, validation montants/téléphone, calcul frais, messages d’erreur, logos).
- Services de signature électronique (CryptoNeo), génération PDF de contrats (templates, sections, lazy generator), notifications (email/WhatsApp/OTP).
- Chatbot SUTA anti-arnaque, MonArtisan (demandes artisan), InTouch (communications), utils maps (MapWrapper, MapboxMap).

L’observabilité IA est soutenue par des tables de logs et de cache côté Supabase, avec traçabilité des coûts et des réponses.

#### Feature flags actifs et impact

La configuration des feature flags actifs est structurée par domaine. Le tableau ci-dessous présente les flags activés/désactivés, leur périmètre et l’impact sur l’expérience utilisateur.

| Domaine | Flag | État | Impact UX/Produit |
|---|---|---|---|
| Vérification d’identité | ONECI_VERIFICATION | Activé | Permet vérification ONECI/SNEDAI; renforce la confiance |
| Vérification d’identité | FACE_VERIFICATION | Activé | Biométrie faciale; étape de vérification renforcée |
| Recherche | ADVANCED_SEARCH | Activé | Filtres avancés; pertinence des résultats |
| Recherche | MAP_SEARCH | Activé | Recherche par carte; usage地图 |
| Recherche | AI_SEARCH | Désactivé | Fonction non disponible; perte de pertinence sémantique |
| Types de bien | RESIDENTIAL_PROPERTIES | Activé | Cible résidentiel; aligne le catalogue |
| Types de bien | COMMERCIAL_PROPERTIES | Désactivé | Hors périmètre actuel |
| Paiement | MOBILE_MONEY_PAYMENT | Activé | Paiements Mobile Money (Orange/MTN/Moov/Wave) |
| Paiement | CARD_PAYMENT | Désactivé | Pas de CB; dépendance aux flux Mobile Money |
| Signature | CRYPTONEO_SIGNATURE | Activé | Cachet électronique ANSUT; sécurité juridique |
| Chatbot | SUTA_CHATBOT | Activé | Assistant anti-arnaque; guidance utilisateur |
| Notifications | EMAIL_NOTIFICATIONS | Activé | Notifications email; suivi des événements |
| Notifications | SMS_NOTIFICATIONS | Désactivé | Pas de SMS; reliesur WhatsApp/OTP |
| Notifications | WHATSAPP_NOTIFICATIONS | Activé | OTP WhatsApp via InTouch; UX robuste |

### Organisation du code (src/)

La structure reflète un découpage par responsabilités:

| Dossier | Responsabilités principales | Exemples |
|---|---|---|
| app/ | Routing, layout, providers | Layout, Header/Footer, AuthProvider |
| features/ | Domaines métiers | property, auth, tenant, owner, agency, admin, trust-agent, verification, messaging, contract, payment, dispute |
| services/ | Logique métier & intégrations | paymentService, azureAIService, signatureService, chatbotService, inTouchService, notificationService |
| shared/ui | Composants UI réutilisables | Card, Button, Modal, LazyImage, ErrorBoundary, MapWrapper, charts |
| hooks/ | Hooks transverses | useAuth, useFeatureFlag, useMessages |
| stores/ | État global | authStore, uiStore, paymentStore |
| lib/ | Helpers et utilitaires | constants, helpers (pdfGenerator), analytics, sentry |

Cette organisation favorise la lisibilité et la scalabilité, tout en limitant le couplage entre domaines. Elle est renforcée par un usage de lazy loading des pages et une mise à l’écart des responsabilités transverses dans shared/.

![Structure des features (tenant, owner, agency, admin, trust-agent, verification)](/workspace/browser/screenshots/03_features_folder_structure.png)

### Authentification, sessions et profils

L’AuthProvider centralise la gestion de user/session et charge le profil depuis la table profiles, avec des stratégies de retry et un mécanisme de récupération via RPC ensure_my_profile_exists. Les cas d’erreurs (schema cache, table introuvable, permissions, profil introuvable) sont discriminés, avec messages contextuels. La persistance et l’auto-refresh des tokens Supabase assurent une UX fluide, tout en exposant le risque de dépendance forte à Supabase.

#### Auth flow (inscription, connexion, OTP, reset password)

| Etape | Service/Fonction | Point de contrôle | Gating/Roles |
|---|---|---|---|
| Inscription | signUp (Supabase Auth) | email/password + metadata (full_name, user_type, phone) | user_type par défaut locataire |
| Connexion | signInWithPassword | validations credentials | accessible à tous |
| Connexion OAuth | signInWithProvider | redirect vers /auth/callback | accessible à tous |
| OTP WhatsApp | InTouch (via flags) | envoi OTP; validation | flag WHATSAPP_NOTIFICATIONS actif |
| Reset password | Edge function (send-password-reset) | email; gestion d’erreurs | accessible à tous |
| Sélection profil | ProfileSelection | gated par ProtectedRoute | utilisateur connecté |
| Profil | Profile | mise à jour; récupération | utilisateur connecté |

Cette orchestration couvre les parcours de base, mais dépend de la disponibilité des Edge Functions pour la réinitialisation de mot de passe.

### Observabilité et observabilité IA

La plateforme implémente:

- Des logs d’usage IA (ai_usage_logs) avec service_type, operation, tokens_used, cost_fcfa, response_time_ms, success, metadata, userId.
- Un cache IA (ai_cache) pour accélérer les réponses (clé de cache, TTL, hit_count).
- Un calcul estimatif des coûts (estimateCostFcfa) par service (openai, nlp, vision, speech), utilisé pour la transparence et le pilotage.

Cela constitue une base d’observabilité utile, qui pourrait être étendue aux domaines non-IA (paiement, signature, notifications) pour une vision globale de la performance.

---

## Fonctionnalités existantes par domaine

La plateforme couvre un éventail riche: recherche et découverte, candidatures et visites, messagerie, contrats et signature, paiements, vérification et confiance, administration et rôles, ainsi que des services transverses (chatbot, artisan, notifications, cartes, analytics).

### Catalogue des features par module

| Module | Pages/Services clés | Rôles concernés | Endpoints/Repositories | Observations |
|---|---|---|---|---|
| Propriété (property) | Home, SearchProperties, PropertyDetail, Stats | Locataire, Propriétaire, Agence | propertyRepository; property.api; hooks (useProperties, useInfiniteProperties) | Recherche avancée + carte; favoris et recommandations |
| Locataire (tenant) | Favorites, SavedSearches, Recommendations, Applications, Visits, Payments, Maintenance | Locataire | repositories (leaseRepository, maintenanceRepository, paymentRepository) | Flux complet locataire; historique et résolutions |
| Propriétaire (owner) | AddProperty, CreateContract, ContractsList, Maintenance | Propriétaire, Agence | propertyRepository; contractService; contract.api | Création de contrats et annexes; suivi maintenance |
| Agence (agency) | Registration, Team, Properties, Commissions | Agence | agency.pages | Gestion d’équipe et portefeuille |
| Contrats (contract) | ContractDetail, ContractDetailEnhanced, SignLease | Locataire, Propriétaire, Agence | contract.api; useLeases; hooks | Signature électronique (CryptoNeo); génération PDF |
| Paiement (payment) | MakePayment, PaymentHistory, MobileMoneyPayment | Locataire | paymentRepository; paymentService | Détection opérateur; validation; calcul frais; erreurs |
| Vérification (verification) | RequestPage, IdentityVerification, Settings, MyCertificates, CEV | Tous | verification.api; hooks (useVerification) | ANSUT/CNAM/ONECI; badges (Ansut, CEV) |
| Messaging (messaging) | Messages, NotificationPreferences | Tous | messageRepository; messaging.api; hooks | Centre de notifications; templates de messages |
| Litiges (dispute) | MyDisputes, CreateDispute, DisputeDetail | Tous | dispute.pages | Gestion des litiges; médiations trust-agent |
| Admin (admin) | Users, UserRoles, ApiKeys, ServiceProviders, Monitoring, Configuration, TestDataGenerator, QuickDemo, CEVManagement, TrustAgents | Admin | admin.pages; dashboardExportService; apiKeyService | Administration fine; gestion clés et monitoring |
| Trust-Agent (trust-agent) | Moderation, Mediation, Analytics | Trust-Agent | trust-agent.pages; trustValidationService | Modération/analytics; validation de confiance |
| Services transverses | Chatbot SUTA, MonArtisan, InTouch, NotificationService, SignatureService | Tous | chatbotService; monartisanService; inTouchService; notificationService; signatureService | Anti-arnaque; demandes artisan; OTP WhatsApp; signature |

#### Recherche et découverte de biens

La HomePage expose une recherche rapide (QuickSearch), un carrousel (HeroSlideshow/HeroSpectacular) et des cartes de propriétés. Les filtres avancés (SearchFilters) et la recherche par carte (MapSearch) sont activées, avec affichage des résultats (SearchResults), historique de recherche (SearchHistory) et recherche vocale (VoiceSearch). Les favoris (Favorites) et recherches sauvegardées (SavedSearches) sont protégées, et des recommandations (Recommendations) sont proposées aux locataires.

![Liste des biens — vue de résultats](/workspace/browser/screenshots/02_page_liste_biens_vente.png)

![Recherche avec filtres avancés](/workspace/browser/screenshots/02_page_recherche_avec_filtres_avances.png)

Ce corpus fonctionnel répond aux besoins essentiels de découverte et d’affinement. L’absence d’un flag AI_SEARCH actif réduit toutefois la pertinence sémantique de la recherche, qui reste tributaire des filtres classiques.

##### Composants de recherche (QuickSearch, Filters, Results, Map, VoiceSearch, Comparison)

| Composant | Fonction | Intégrations | Placeholder/État |
|---|---|---|---|
| QuickSearch | Entrée de recherche rapide | hooks (useProperties) | HomePage; état loading/skeleton |
| SearchFilters | Filtres avancés | ADVANCED_SEARCH (actif) | Form; persist state |
| SearchResults | Liste des biens | useInfiniteProperties; property.api | Grid/list; lazy image |
| PropertyMap | Carte des résultats | MapWrapper; MapboxMap | Marker clustering |
| VoiceSearch | Recherche vocale | Azure Speech (services/azure) | Activation bouton |
| PropertyComparison | Comparaison de biens | UI (Card, Tabs) | Modal/panel |

#### Gestion des candidatures et visites

Les locataire peuvent postuler (ApplicationForm), consulter le détail (ApplicationDetail), planifier une visite (ScheduleVisit) et consulter ses visites (MyVisits). Les propriétaires et agences consultent les candidatures depuis leur espace. Ces parcours sont protégés et conditionnés par le rôle.

##### Pages de candidature/visites

| Page | Acteur | Données clés | Dépendances | Protection |
|---|---|---|---|---|
| ApplicationForm | Locataire | propertyId; profil | property.api; auth | ProtectedRoute |
| ApplicationDetail | Propriétaire/Agence | applicationId; candidat | repository (applicationRepository) | allowedRoles: proprietaire, agence |
| ScheduleVisit | Locataire | propertyId; créneau | messaging/notifications | ProtectedRoute |
| MyVisits | Locataire | liste visites | messages/notifications | ProtectedRoute |

#### Messagerie et notifications

La messagerie (MessagesPage) gère les échanges, avec un centre de notifications (NotificationCenter), des préférences (NotificationPreferences) et des templates (MessageTemplates). Les notifications email sont actives, WhatsApp/OTP via InTouch également; les SMS sont désactivés.

##### Systèmes de notifications

| Canal | Service | Usage | État |
|---|---|---|---|
| Email | NotificationService | Evénements clés (contrat, paiement) | ACTIVÉ |
| WhatsApp | InTouchService | OTP et alertes | ACTIVÉ |
| SMS | — | Non actif (feature flag) | DÉSACTIVÉ |

#### Contrats, leases et signature

Les propriétaires/agences créent des contrats (CreateContract), les locataires consultent leurs contrats (MyContracts), visualisent le détail (ContractDetail/ContractDetailEnhanced) et signent (SignLease). La signature électronique s’appuie sur CryptoNeo (flag actif), avec une génération de PDF (templates, sections, lazy generator) pour les annexes et aperçus.

##### Pages de contrats et signature

| Page | Rôle | Actions | Services |
|---|---|---|---|
| CreateContract | Propriétaire/Agence | Création; upload annexes | contractService; pdfSections |
| MyContracts | Locataire | Consultation historique | useLeases; contract.api |
| ContractDetail | Locataire | Détails bail | contract.api; hooks |
| ContractDetailEnhanced | Locataire | Détails enrichis | components (ContractPreview/Annexes) |
| SignLease | Locataire | Signature électronique | CryptoNeo signatureService |

#### Paiements (Mobile Money)

Le flux paiement couvre la création, l’historique, la validation, la détection d’opérateur, le calcul des frais et la gestion d’erreurs avec messages utilisateurs. Les montants et numéros de téléphone sont validés; la plateforme calcule frais opérateur, frais de plateforme, et montant locataire.

##### Règles de validation paiement

| Règle | Paramètres | Message utilisateur | Traitement |
|---|---|---|---|
| Montant min/max | 100–5 000 000 FCFA | Min/Max imposés | Refus; guidance |
| Format téléphone | 10 chiffres CI | Numéro invalide | Refus; correction |
| Détection opérateur | Prefixes CI | Opérateur non détecté | Sélection manuelle |
| Cohérence opérateur | Détection vs sélection | Ce numéro correspond à X | Ajustement; refus si incohérence |
| Calcul frais | Montant + frais plateforme | Récapitulatif | Affichage coût total |

##### Frais et opérateurs (Mobile Money)

| Opérateur | Frais (%) | Plateforme (%) | Montant total | Montant propriétaire |
|---|---|---|---|---|
| Orange Money | (PROVIDER_FEES[provider]) | PLATFORM_FEE_PERCENTAGE | base + frais opérateur + frais plateforme | base − frais plateforme |
| MTN Money | (PROVIDER_FEES[provider]) | PLATFORM_FEE_PERCENTAGE | idem | idem |
| Moov Money | (PROVIDER_FEES[provider]) | PLATFORM_FEE_PERCENTAGE | idem | idem |
| Wave | (PROVIDER_FEES[provider]) | PLATFORM_FEE_PERCENTAGE | idem | idem |

Le composant MobileMoneyPayment et le paymentRepository orchestrent l’expérience côté client, tandis que les détails de frais exacts et les endpoints de prestataires restent à documenter côté Edge Functions.

#### Vérification d’identité et confiance

La plateforme propose une demande de vérification (RequestPage), une identité via ANSUT/CNAM/ONECI (IdentityVerification), des paramètres (Settings), l’affichage des certificats (MyCertificates), ainsi que des badges de confiance (AnsutBadge, CEVBadge). Un parcours CEV (RequestCEV, CEVRequestDetail) est également présent.

##### Parcours de vérification

| Type | Composants | Pages | États | Services |
|---|---|---|---|---|
| ONECI | TrustIndicator; VerificationBadge | IdentityVerification; Settings | pending/verified/rejected | verification.api |
| FACE | Neoface/SmilelessVerification | IdentityVerification | pending/verified/rejected | azureFaceService |
| ANSUT/CNAM | EnhancedAnsutBadge; CEVBadge | MyCertificates; RequestCEV | pending/verified/rejected | certificateService; cevService |
| Paramètres | — | Settings | — | useVerification |

Ces parcours renforcent la qualité de l’écosystème et luttent contre la fraude.

#### Administration et rôles

Les capacités administratives couvrent la gestion des utilisateurs (Users, UserRoles), des clés API (ApiKeys), des prestataires de service (ServiceProviders), du monitoring (ServiceMonitoring), de la configuration (ServiceConfiguration), de la génération de données de test (TestDataGenerator), des démos (QuickDemo), du management CEV (CEVManagement) et des agents de confiance (TrustAgents). Un mécanisme de role switcher est présent pour changer de rôle.

##### Capacités admin

| Page | Rôle requis | Fonctions | Données manipulées |
|---|---|---|---|
| Users | admin | CRUD utilisateurs | profiles |
| UserRoles | admin | Gestion rôles | roles/permissions |
| ApiKeys | admin | Gestion clés API | api_keys |
| ServiceProviders | admin | Configuration prestataires | providers/config |
| ServiceMonitoring | admin | Observabilité services | logs/health |
| ServiceConfiguration | admin | Paramétrage | flags/config |
| TestDataGenerator | admin | Génération données | synthetic data |
| QuickDemo | admin | Démo rapide | demo datasets |
| CEVManagement | admin | Gérer CEV | cev_requests |
| TrustAgents | admin | Gérer agents | trust_agents |

#### Services transverses et IA

La plateforme intègre un chatbot SUTA anti-arnaque, une demande MonArtisan (bouton d’accès), des notifications multi-canal, des utilitaires de cartes (MapWrapper/MapboxMap) et des capacités IA:

- Génération de descriptions de biens (descriptionGeneratorService).
- Recommandations (recommendationEngine/recommendationService).
- Recherche NLP (nlpSearchService).
- Assistant légal (legalAssistantService).
- Détection de fraude (fraudDetectionService).
- Orchestrateur LLM (llmOrchestrator) avec cache IA et logs.

##### Fonctions IA

| Service | Usage | Inputs | Outputs | Coût estimé |
|---|---|---|---|---|
| Azure OpenAI (chat) | LLM chat; réponses texte | messages | content | tokens_used * 0.05 FCFA |
| NLP (analyse) | Sentiment/entités/langues/phrases | texte | labels/phrases | texte length * taux |
| Recommandations | Recommandations de biens | critères utilisateur | liste triée | selon usage |
| Génération descriptions | Description property | données propriété | texte | tokens * 0.05 FCFA |
| Assistant légal | Aide juridique | question | réponse | tokens * 0.05 FCFA |
| Détection fraude | Scoring risque | signaux/événements | score | service dédié |

---

## Composants UI et design system

La plateforme s’appuie sur un ensemble de composants UI modulaires:

- Cartes et contenu: Card, PropertyCard, CityCard, FeatureCard, AchievementBadges, ProfileCard, FooterCTA.
- Navigation: Breadcrumb, Tabs, LanguageSelector, ThemeToggle, Mobile menu styles.
- Feedback & états: Skeleton, LoadingStates, LazyImage, Modal, ContextualHelp, OnboardingTooltip.
- Vérification/confiance: TrustVerifiedBadge, VerificationBadge, NeofaceVerification, SmilelessVerification.
- Interactions: Button, Input, PhoneInput (modern/OTP), FileUpload, SocialShare, MapWrapper, MapboxMap.
- Graphiques: SimpleBarChart, SimpleLineChart.
- Layout: PageHeader, PageLayout, SEOHead.

##### Inventaire des composants UI

| Composant | Fonction | Usage typique | Dépendances |
|---|---|---|---|
| PropertyCard | Carte de bien | Liste/résultats | LazyImage |
| CityCard | Carte de ville | Sélection par ville | — |
| FeatureCard | Carte de fonctionnalité | Home; trust section | — |
| TrustVerifiedBadge | Badge de confiance | Profil/propriété | verification |
| VerificationBadge | Badge de vérification | Profil/propriété | verification |
| NeofaceVerification | Vérification visage | IdentityVerification | Azure Face |
| SmilelessVerification | Vérification visage (alt) | IdentityVerification | Azure Face |
| Breadcrumb | Fil d’Ariane | Navigation | routes |
| Tabs | Onglets | Vues multiples | — |
| MapWrapper | Wrapper carte | SearchProperties | Mapbox |
| LazyImage | Image lazy | Listes/galeries | — |
| Modal | Boîte modale | Comparaison/contrats | — |
| Skeleton | Loading state | Pages/data loading | — |
| PhoneInput (OTP) | Entrée téléphone/OTP | Auth/verification | OTPInput |
| FileUpload | Upload fichiers | Contrats/annexes | — |
| SocialShare | Partage social | Détails propriété | — |
| SimpleBarChart | Graphique barres | Dashboard/analytics | — |
| SimpleLineChart | Graphique lignes | Dashboard/analytics | — |

![Composants et helpers (illustratif) — structure des features](/workspace/browser/screenshots/03_features_folder_structure.png)

---

## Inventaire des pages et routes (par rôle et domaine)

La configuration des routes fait apparaît une cartographie dense, avec protection, rôles, et lazy loading.

##### Pages, routes, rôle requis, état de protection

| Chemin | Page | Rôle requis | Protection | Description |
|---|---|---|---|---|
| / | Home | Tous | Non | Page d’accueil |
| /connexion | Auth | Tous | Non | Connexion/Inscription |
| /auth | ModernAuth | Tous | Non | Authentification moderne |
| /auth/callback | Callback | Tous | Non | Callback OAuth |
| /mot-de-passe-oublie | ForgotPassword | Tous | Non | Demande reset |
| /reinitialiser-mot-de-passe | ResetPassword | Tous | Non | Reset password |
| /verification-otp | VerifyOTP | Tous | Non | Vérification OTP |
| /a-propos | About | Tous | Non | Présentation |
| /conditions-utilisation | TermsOfService | Tous | Non | Conditions |
| /politique-confidentialite | PrivacyPolicy | Tous | Non | Confidentialité |
| /mentions-legales | TermsOfService | Tous | Non | Mentions |
| /contact | Contact | Tous | Non | Contact |
| /aide | Help | Tous | Non | Aide |
| /faq | FAQ | Tous | Non | FAQ |
| /comment-ca-marche | HowItWorks | Tous | Non | Mode d’emploi |
| /ajouter-propriete | AddPropertyLanding | Tous | Non | Landing ajout bien |
| /louer-mon-bien | AddPropertyLanding | Tous | Non | Landing location |
| /choix-profil | ProfileSelection | Connecté | ProtectedRoute | Choix de profil |
| /profil | Profile | Connecté | ProtectedRoute | Profil |
| /recherche | SearchProperties | Tous | SearchErrorBoundary | Recherche |
| /propriete/:id | PropertyDetail | Tous | — | Détails bien |
| /properties/:id | PropertyDetail | Tous | — | Détails bien |
| /proprietes/:id | PropertyDetail | Tous | — | Détails bien |
| /favoris | Favorites | Connecté | ProtectedRoute | Favoris |
| /recherches-sauvegardees | SavedSearches | Connecté | ProtectedRoute | Recherches sauvegardées |
| /recommandations | Recommendations | Connecté | ProtectedRoute | Recommandations |
| /candidature/:id | ApplicationForm | Connecté | ProtectedRoute | Candidature |
| /visiter/:id | ScheduleVisit | Connecté | ProtectedRoute | Visite |
| /mes-visites | MyVisits | Connecté | ProtectedRoute | Visites |
| /messages | Messages | Connecté | ProtectedRoute | Messagerie |
| /creer-contrat/:propertyId | CreateContract | Propriétaire/Agence | ProtectedRoute (roles) | Création contrat |
| /mes-contrats | MyContracts | Connecté | ProtectedRoute | Contrats locataire |
| /tous-les-contrats | ContractsList | Connecté | ProtectedRoute | Contrats (liste globale) |
| /contrat/:id | ContractDetail | Connecté | ProtectedRoute | Détails bail |
| /bail/:id/details | ContractDetailEnhanced | Connecté | ProtectedRoute | Détails enrichis |
| /signer-bail/:id | SignLease | Connecté | ProtectedRoute | Signature |
| /bail/signer/:id | SignLease | Connecté | ProtectedRoute | Signature (route altern.) |
| /effectuer-paiement | MakePayment | Connecté | ProtectedRoute | Paiement |
| /mes-paiements | PaymentHistory | Connecté | ProtectedRoute | Historique |
| /verification | VerificationRequest | Connecté | ProtectedRoute | Demande vérification |
| /certification-ansut | IdentityVerification | Connecté | ProtectedRoute | Vérif ANSUT |
| /ansut-verification | IdentityVerification | Connecté | ProtectedRoute | Vérif ANSUT (alt) |
| /verification/parametres | VerificationSettings | Connecté | ProtectedRoute | Paramètres vérif |
| /mes-certificats | MyCertificates | Connecté | ProtectedRoute | Certificats |
| /request-cev | RequestCEV | Connecté | ProtectedRoute | Demande CEV |
| /cev-request/:id | CEVRequestDetail | Connecté | ProtectedRoute | Détail CEV |
| /dashboard/locataire | TenantDashboard | Locataire | ProtectedRoute (roles) | Tableau de bord |
| /dashboard/locataire/calendrier | TenantCalendar | Locataire | ProtectedRoute (roles) | Calendrier |
| /score-locataire | TenantScore | Locataire | ProtectedRoute (roles) | Score locataire |
| /maintenance/locataire | TenantMaintenance | Locataire | ProtectedRoute (roles) | Maintenance locataire |
| /dashboard/proprietaire | OwnerDashboard | Propriétaire | ProtectedRoute (roles) | Tableau de bord |
| /dashboard/ajouter-propriete | AddProperty | Propriétaire/Agence | ProtectedRoute (roles) | Ajout propriété |
| /add-property | AddProperty | Propriétaire/Agence | ProtectedRoute (roles) | Ajout propriété (alt) |
| /dashboard/propriete/:id/stats | PropertyStats | Propriétaire/Agence | ProtectedRoute (roles) | Stats propriété |
| /maintenance/proprietaire | OwnerMaintenance | Propriétaire | ProtectedRoute (roles) | Maintenance propriétaire |
| /dashboard/candidature/:id | ApplicationDetail | Propriétaire/Agence | ProtectedRoute (roles) | Détail candidature |
| /agence/tableau-de-bord | AgencyDashboard | Agence | ProtectedRoute (roles) | Tableau de bord |
| /agence/inscription | AgencyRegistration | Agence | ProtectedRoute | Inscription agence |
| /agence/equipe | AgencyTeam | Agence | ProtectedRoute (roles) | Équipe |
| /agence/proprietes | AgencyProperties | Agence | ProtectedRoute (roles) | Propriétés agence |
| /agence/commissions | AgencyCommissions | Agence | ProtectedRoute (roles) | Commissions |
| /maintenance/nouvelle | MaintenanceRequest | Connecté | ProtectedRoute | Nouvelle demande |
| /admin/tableau-de-bord | AdminDashboard | Admin | ProtectedRoute (roles) | Tableau de bord |
| /admin/utilisateurs | AdminUsers | Admin | ProtectedRoute (roles) | Gestion utilisateurs |
| /admin/gestion-roles | AdminUserRoles | Admin | ProtectedRoute (roles) | Gestion rôles |
| /admin/api-keys | AdminApiKeys | Admin | ProtectedRoute (roles) | Gestion clés |
| /admin/service-providers | AdminServiceProviders | Admin | ProtectedRoute (roles) | Prestataires |
| /admin/service-monitoring | AdminServiceMonitoring | Admin | ProtectedRoute (roles) | Monitoring |
| /admin/service-configuration | AdminServiceConfiguration | Admin | ProtectedRoute (roles) | Configuration |
| /admin/test-data-generator | AdminTestDataGenerator | Admin | ProtectedRoute (roles) | Générateur données |
| /admin/demo-rapide | AdminQuickDemo | Admin | ProtectedRoute (roles) | Démo |
| /admin/cev-management | AdminCEVManagement | Admin | ProtectedRoute (roles) | CEV |
| /admin/cev/:id | AdminCEVManagement | Admin | ProtectedRoute (roles) | CEV (detail) |
| /admin/trust-agents | AdminTrustAgents | Admin | ProtectedRoute (roles) | Agents confiance |
| /trust-agent/dashboard | TrustAgentDashboard | Trust-Agent | ProtectedRoute (roles) | Tableau de bord |
| /trust-agent/moderation | TrustAgentModeration | Trust-Agent | ProtectedRoute (roles) | Modération |
| /trust-agent/mediation | TrustAgentMediation | Trust-Agent | ProtectedRoute (roles) | Médiation |
| /trust-agent/analytics | TrustAgentAnalytics | Trust-Agent | ProtectedRoute (roles) | Analytics |
| /notifications/preferences | NotificationPreferences | Connecté | ProtectedRoute | Préférences notifications |
| /mes-litiges | MyDisputes | Connecté | ProtectedRoute | Litiges |
| /creer-litige | CreateDispute | Connecté | ProtectedRoute | Création litige |
| /litige/:id | DisputeDetail | Connecté | ProtectedRoute | Détail litige |
| /* (404) | NotFound | Tous | — | 404 personnalisé |

![Capture — Illustration d’état 404 ( aide )](/workspace/browser/screenshots/04-aide-404-error.png)

---

## Flux utilisateur clés

Les parcours utilisateurs principaux couvrent l’authentification, la recherche, la candidature/visite, le contrat/signature, le paiement, la maintenance, la vérification et l’administration. Les flux sont protégés par rôle et s’appuient sur des états de validation.

##### Flux et points d’intégration

| Flux | Etapes | Services | Composants | Points de contrôle |
|---|---|---|---|---|
| Inscription/Connexion | signUp/signIn; OAuth; reset; OTP | AuthProvider; InTouch; Edge reset | AuthModal; ModernAuth; VerifyOTP; Forgot/Reset | email/password; OTP; role selection |
| Recherche & découverte | QuickSearch; Filters; Map; Favoris; Recommandations | property.api; Mapbox | SearchResults; SearchFilters; PropertyCard; VoiceSearch | state loading; error boundary; map markers |
| Candidature & visites | ApplicationForm; Detail; Schedule; MyVisits | applicationRepository; messaging | ApplicationForm; ApplicationDetail; ScheduleVisit | gating par rôle; notifications |
| Contrat & signature | CreateContract; MyContracts; Detail; Sign | contractService; CryptoNeo | ContractPreview; Annexes; SignLease | allowedRoles; PDF generation; signature status |
| Paiement | MakePayment; Validation; History | paymentService; paymentRepository | MobileMoneyPayment; PaymentHistory | validation amount/phone; fees; retryable errors |
| Maintenance | MaintenanceRequest; List; Owner/Tenant pages | maintenanceRepository | MaintenancePage | création ticket; suivi statut |
| Vérification | Request; IdentityVerification; Settings; MyCertificates | verification.api; azure services | TrustIndicator; VerificationBadge | statut pending/verified/rejected; badges |
| Administration | Users; Roles; API Keys; Monitoring | admin.pages; apiKeyService; dashboardExportService | AdminPages; charts | RBAC; audit logs; export |

---

## Services et intégrations techniques

- Supabase: client, auth, base, edge functions; repositories abstractions (properties, leases, messages, payments, maintenance, application, user).
- Paiement Mobile Money: détection opérateur (Orange/MTN/Moov/Wave), validation montants/téléphone, calcul frais, messages d’erreur et retry.
- Azure AI: chat/LLM, NLP (sentiment, entités, langues, phrases clés), cache et logs de coûts; estimateCostFcfa.
- Signature CryptoNeo: intégration flag actif; service de signature.
- Chatbot SUTA, MonArtisan, InTouch: anti-arnaque, demandes artisan, OTP WhatsApp et communications.
- Notifications: email (activé), WhatsApp (activé), SMS (désactivé).
- Cartes: MapWrapper/MapboxMap; utilitaires LazyImage et ErrorBoundary pour robustesse UX.
- Observabilité IA: ai_usage_logs et ai_cache pour traçabilité des usages.

##### Inventaire des services et responsabilités

| Service | Domaine | Principales fonctions | Tables/Logs | Intégrations |
|---|---|---|---|---|
| Supabase Client | Auth/DB/Edge | auth, data, functions | profiles, ai_usage_logs, ai_cache | — |
| paymentService | Paiement | détection, validation, calcul | payments (repository) | Mobile Money providers |
| azureAIService | IA | chat, NLP, cache, logs | ai_usage_logs, ai_cache | Azure OpenAI/Azure AI |
| signatureService | Signature | CryptoNeo signature | leases/contracts | CryptoNeo |
| chatbotService | Assistant | anti-arnaque, guidance | — | — |
| inTouchService | Communication | OTP WhatsApp; envoi | — | InTouch |
| notificationService | Notifications | email; alertes | — | — |
| contractService | Contrats | PDF generator; templates | leases/contracts | pdfSections, templates |
| trustValidationService | Confiance | validation agents | trust_agents | — |
| cacheService | Cache | cache transversal | — | — |
| uploadService | Upload | fichiers | storage (non détaillé) | — |
| analytics | Observabilité | events | — | — |

##### API endpoints et repositories (vue synthétique)

| Repository | Domaine | Rôle | Observations |
|---|---|---|---|
| propertyRepository | Propriété | CRUD/listing/search | useProperties; hooks |
| leaseRepository | Leases | CRUD | ContractDetail/SignLease |
| maintenanceRepository | Maintenance | CRUD | Owner/Tenant pages |
| messageRepository | Messages | CRUD | MessagesPage; notifications |
| paymentRepository | Paiement | CRUD/historique | MakePayment; PaymentHistory |
| applicationRepository | Candidatures | CRUD | ApplicationForm/Detail |
| userRepository | Utilisateurs | CRUD | AdminUsers; Profiles |
| contractRepository | Contrats | CRUD | CreateContract; Sign |

##### Paiement — mapping erreurs → message utilisateur

| Code erreur | Message utilisateur | Retryable | Action recommandée |
|---|---|---|---|
| INVALID_PHONE | Numéro invalide | Non | Corriger format |
| INVALID_AMOUNT | Montant invalide | Non | Ajuster montant |
| INSUFFICIENT_BALANCE | Solde insuffisant | Non | Recharger compte |
| PROVIDER_ERROR | Erreur opérateur | Oui | Réessayer |
| NETWORK_ERROR | Réseau | Oui | Vérifier connexion |
| TIMEOUT | Expiration | Oui | Réessayer |
| DUPLICATE_TRANSACTION | Doublon | Non | Vérifier historique |
| CANCELLED_BY_USER | Annulé | Non | Nouvelle tentative si besoin |
| INVALID_OTP | Code OTP invalide | Non | Redemander OTP |
| TRANSACTION_EXPIRED | Expirée | Oui | Relancer transaction |
| UNKNOWN_ERROR | Erreur inconnue | Oui | Réessayer puis support |

---

## Forces et faiblesses de l’implémentation actuelle

La plateforme présente des atouts notables et des axes de vigilance importants.

##### Forces vs faiblesses (impact et remédiation)

| Point | Impact | Preuve (code/config) | Remédiation proposée |
|---|---|---|---|
| Architecture modulaire | Scalabilité/maintenabilité | features/, shared/, services/ | Continuer separation of concerns |
| Feature flags | Flexibilité produit | features.config.ts | Centraliser et auditer; ajouter governance |
| Observabilité IA | Pilotage coûts/usage | ai_usage_logs, ai_cache | Étendre aux autres domaines (paiement, signature) |
| Paiement Mobile Money | Adoption locale | paymentService; MobileMoneyPayment | Documenter endpoints provider; tests E2E |
| Signature électronique | Confiance juridique | CRYPTONEO_SIGNATURE | Monitorer latence et taux succès |
| Composants UI riches | UX robuste | shared/ui | Éliminer duplications; guidelines design |
| Rôles et protection | Sécurité fonctionnelle | ProtectedRoute; allowedRoles | Clarifier modèle RBAC |
| Chatbot/anti-arnaque | Réduction fraude | chatbotService | Analytics d’efficacité; feedback loop |

| Point de faiblesse | Risque | Preuve | Mitigation |
|---|---|---|---|
| Doublons de pages | Confusion maintenance | routes.tsx (redondances) | Unifier routes; rediriger |
| Duplications code | Régression | components/pages alike | Factoriser; lib commune |
| Couplage Supabase | Fragilité runtime | AuthProvider: schema cache errors | RPC ensure_profile;retry; doc schema |
| Tests insuffisants | Qualité en baisse | tests/e2e limité | Couverture unitaire/E2E; CI |
| Feature flags non centralisés | Gouvernance faible | config dispersée | Audit et registry flags |
| Edge functions non auditées | Opacité backend | functions non détaillées | Spécs & contrats; mocks/tests |
| Schéma DB non visible | Incidents prod | migrations non inspectées | Diagrammes; RLS docs; changelogs |
| Endpoints paiement | Opacité providers | intégrations non documentées | Documentation provider; test matrix |
| Logs non-IA limités | Observabilité partielle | logs IA seuls | Standardiser logs multi-domaines |
| Doublons composants UI | Inconsistance UX | cards/components alike | Design tokens; refactor composants |

---

## Recommandations priorisées (actionnables)

Les recommandations suivantes visent à renforcer la qualité technique, la maintenabilité et la scalabilité.

##### Backlog de remédiation

| Item | Priorité | Effort | Impact | Owner | ETA |
|---|---|---|---|---|---|
| Unifier routes (PropertyDetail, SignLease) | Haute | Moyen | Réduction confusion | FE | 1–2 sem |
| Factoriser composants UI (cards, headers) | Haute | Moyen | Cohésion UX | FE/Design | 2 sem |
| Séparer stores & provider (AuthProvider) | Moyenne | Élevé | Réduction couplage | FE | 2–3 sem |
| Observabilité paiement/signature | Haute | Moyen | Pilotage prod | BE/FE | 2 sem |
| Gouvernance feature flags | Moyenne | Faible | Contrôle produit | PM/Tech Lead | 1 sem |
| Tests unit/E2E (auth, paiement, contrats) | Haute | Élevé | Qualité | QA/FE/BE | 3–4 sem |
| Documentation Schéma/RLS/Edge | Haute | Moyen | Sécurité/ops | BE | 2 sem |
| Endpoints providers paiement | Moyenne | Moyen | Résilience | BE | 2–3 sem |
| Design tokens et guidelines | Moyenne | Faible | Consistance | Design | 1–2 sem |
| Refactor pages agency | Moyenne | Moyen | Maintenabilité | FE | 2 sem |

### Roadmap de stabilisation (4–6 semaines)

- Semaine 1–2: consolidation des routes et factorisation des composants UI critiques (PropertyCard, headers), mise en place d’un registre de feature flags (gouvernance), et audit de logs observabilité IA pour extension.
- Semaine 3–4: tests unitaires et E2E des flux auth, paiement et contrats (y compris les erreurs/retries), documentation des endpoints prestataires Mobile Money, et initialisation d’un schéma de logs transversal.
- Semaine 5–6: refactor de l’AuthProvider (découplage stores), documentation du schéma base/RLS et des Edge Functions, et introduction de design tokens pour une cohérence cross-module.

---

## Annexes (artéfacts et captures)

Les captures ci-dessous illustrent la navigation et certaines interfaces. Elles servent de preuve visuelle pour corroborer la cartographie des pages et des flux.

![Home — accueil MONTOIT](/workspace/browser/screenshots/01_page_accueil_montoit.png)

![Recherche — liste propriétés](/workspace/browser/screenshots/02_page_recherche_mon_toit.png)

![Footer — navigation secondaire](/workspace/browser/screenshots/03_footer_navigation.png)

![Inscription — formulaire](/workspace/browser/screenshots/03_page_inscription_formulaire.png)

![Scroll — contenu de la home](/workspace/browser/screenshots/02_page_accueil_scroll1.png)

---

## Points d’attention et lacunes d’information

Plusieurs informations critiques restent non visibles dans le périmètre d’audit:

- Schéma de base de données (tables, relations, RLS) — seul un type DB est exposé côté client.
- Contenu et spécifications des Edge Functions Supabase (paiement, reset password, communications).
- Politique de sécurité détaillée (CSP, CORS), gestion des secrets en prod, rotation des clés (API).
- Tests覆盖率 et rapports (unitaires, intégration, E2E).
- Performances runtime et métriques (Core Web Vitals, TTFB, erreurs JS, statistiques 404).
- Détails des intégrations prestataires paiement (Orange/MTN/Moov/Wave): endpoints, schémas réponses, gestion d’erreurs.
- Processus de signature électronique: schéma complet, flux juridique, preuves.
- Modalités de monitoring de santé backend (SLOs, alertes).
- Accessibilité (WCAG), i18n complète, contenu légal à jour.
- Dépendances tierces et licences, gestion des versions.

Ces lacunes doivent être adressées pour garantir la robustesse et la conformité de la plateforme en production.

---

## Conclusion

La plateforme MONTOIT révèle une architecture solide, modulaire et adaptée à son marché, avec un socle fonctionnel étendu qui couvre l’intégralité du cycle de vie locatif: recherche, candidature, visite, contrat, signature, paiement et maintenance. L’usage des feature flags, l’intégration d’Azure AI et la présence d’un chatbot anti-arnaque illustrent une stratégie produit différenciante. L’implémentationdemeure however marquée par des duplications de pages et de composants, une forte dépendance à Supabase, une couverture de tests limitée et une documentation backend/Edge absente dans le périmètre.

Les recommandations proposées, structurées en un backlog priorisé et une feuille de route de stabilisation, visent à réduire la dette technique, renforcer la qualité et améliorer l’observabilité. L’exécution de cette feuille de route permettra d’augmenter la résilience, la maintenabilité et la scalabilité de MONTOIT, et d'accompagner la croissance produit avec une base technique plus robuste.

![Illustration de la structure du dépôt (référence finale)](/workspace/imgs/montoit_repository_final.png)