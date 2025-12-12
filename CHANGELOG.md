# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planifié
- Optimisation mobile avancée (Bottom Navigation, swipeable cards)
- Intégration Google Calendar pour les visites
- Notifications push natives (Capacitor)
- Mode hors-ligne amélioré avec synchronisation
- Export des rapports en PDF

---

## [3.2.33] - 2025-12-12

### Added
- **Contribution OpenStreetMap**
  - Colonne `osm_contribution_consent` dans table `properties`
  - Badge "Améliore OSM" sur les cartes propriétés (icône Globe2, couleurs vertes)
  - Tooltip informatif Radix UI expliquant OpenStreetMap et l'impact de la contribution
  - Checkbox consentement OSM dans formulaire d'ajout de propriété
  - Index optimisé `idx_properties_osm_consent` pour requêtes de contribution

### Changed
- `PropertyBadges` enrichi avec badge OSM et tooltip riche éducatif
- `PropertyCard` et `PropertyCardMobile` intègrent le nouveau badge OSM
- `AddPropertyPage` inclut option de contribution OpenStreetMap (Step 3)

### Documentation
- Tooltip éducatif sur OpenStreetMap ("Wikipedia des cartes")
- Explication de l'impact sur la cartographie de Côte d'Ivoire
- Rassurance sur l'anonymisation des données partagées

---

## [3.2.32] - 2025-12-11

### Added
- **Système de Feature Flags complet** avec contrôle runtime
  - `useFeatureFlag` hook avec cache TanStack Query (5 min)
  - `useAllFeatureFlags` pour récupération groupée
  - `FeatureGate` composant pour rendu conditionnel
  - `withFeatureFlag` HOC wrapper
  - `FeatureFlagsPage` interface admin pour toggle temps réel

- **5 nouveaux composants Gated** pour contrôle granulaire
  - `ONECIFormGated` - Vérification ONECI avec fallback
  - `CNAMFormGated` - Vérification CNAM avec fallback
  - `MapboxMapGated` - Carte Mapbox avec fallback statique
  - `ElectronicSignatureGated` - Signature CryptoNeo avec fallback
  - `MobileMoneyGated` - Paiements Mobile Money avec fallback

- **8 Feature Flags configurés** dans la base de données
  - `oneci_verification` - Vérification identité nationale
  - `cnam_verification` - Vérification assurance maladie
  - `mapbox_maps` - Cartes interactives Mapbox
  - `cryptoneo_signature` - Signature électronique
  - `mobile_money_payments` - Paiements Mobile Money
  - `facial_verification` - Vérification faciale NeoFace
  - `ai_chatbot` - Assistant IA SUTA
  - `sms_notifications` - Notifications SMS/WhatsApp

### Changed
- `HomeMapSection` utilise maintenant `MapboxMapGated`
- `MapWrapper` utilise import lazy de `MapboxMapGated`
- Exports mis à jour dans `verification/index.ts` et `shared/ui/index.ts`

---

## [3.2.31] - 2025-12-10

### Added
- **Sprint 8 complet** - Analytics & Optimization
  - Tableaux de bord KPIs avec métriques en temps réel
  - Rapports de performance exportables
  - Gestion des renouvellements de bail
  - Préavis de départ avec workflow complet
  - États des lieux d'entrée/sortie digitalisés

### Changed
- Système de vérification simplifié à 2 facteurs
  - NeoFace biométrique (60 points)
  - Validation admin Mon Toit (40 points)
- ONECI et CNAM retirés du calcul de score

### Security
- Audit complet de sécurité - 80% prêt pour lancement
- Toutes les recommandations critiques implémentées

---

## [3.2.30] - 2025-12-09

### Added
- **Sprint 7** - Système de gestion d'agence
  - `TeamManagementPage` - Gestion des agents avec statistiques
  - `AgentDetailPage` - Profils agents avec KPIs individuels
  - `CommissionsPage` - Suivi financier et validation
  - `PropertyAssignmentsPage` - Attribution propriété-agent
  - `RegistrationRequestsPage` - Workflow de recrutement
  - `AgencySettingsPage` - Configuration agence
  - `AgencyReportsPage` - Rapports de performance

- **6 nouvelles tables** pour gestion d'agence
  - `agency_agents` (membres équipe, rôle, commission)
  - `agent_registration_requests` (recrutement)
  - `property_assignments` (attribution propriétés)
  - `agency_transactions` (suivi commissions)
  - `agent_performance_targets` (objectifs KPI)
  - `agent_activities` (audit trail)

- **3 fonctions SQL** pour analytics agence
  - `get_agent_commissions()` - Totaux commissions par période
  - `get_agency_stats()` - KPIs consolidés
  - `get_agent_leaderboard()` - Classement performance

### Changed
- Drag-and-drop avec @dnd-kit pour réorganisation priorités
- `DragOverlay` et `SortableProviderCard` pour feedback visuel

---

## [3.2.29] - 2025-12-08

### Added
- **Sprint 6** - Rappels de loyer et dashboards multi-propriétés
  - Timeline rappels J-5 à J+30
  - Détection locataires fantômes
  - Reporting financier propriétaires
  - Dashboard consolidé multi-propriétés

- **Cron functions** pour automatisation
  - `send-payment-reminders` - Rappels J-3, J-Day, J+1
  - `apply-late-fees` - Pénalités 0.5%/jour, max 10%
  - `process-recurring-payments` - Prélèvements automatiques

---

## [3.2.28] - 2025-12-07

### Added
- **Sprint 5** - Résolution des litiges et avis
  - Système de médiation avec workflow
  - Modération des avis utilisateurs
  - Ratings de satisfaction
  - `DisputeDetailPage` avec timeline
  - `ReviewModerationPage` pour admins

### Changed
- `disputes` table enrichie avec résolution et satisfaction
- Workflow litiges : ouvert → en_médiation → résolu/escaladé

---

## [3.2.27] - 2025-12-06

### Added
- **Sprint 4** - Réseau de prestataires de services
  - Matching prestataires par spécialité
  - Suivi des interventions
  - Système de notation prestataires
  - `ServiceProvidersPage` pour recherche
  - `InterventionDetailPage` avec photos avant/après

- **Tables** pour prestataires
  - `service_providers` (artisans, plombiers, etc.)
  - `interventions` (suivi travaux)
  - Ratings et reviews prestataires

---

## [3.2.26] - 2025-12-05

### Added
- **Sprint 3** - Contrats et paiements
  - Paiements récurrents avec autorisation Mobile Money
  - Génération PDF reçus automatique
  - Pénalités de retard automatiques
  - `CreateContractPage` avec sélection template
  - `PaymentSchedulePage` pour échéanciers

- **Edge functions** paiements
  - `generate-payment-receipt` - PDF avec numéro unique
  - `mobile-money-webhook` - Callbacks InTouch
  - `intouch-webhook-handler` - Validation HMAC

### Security
- Vérification HMAC signatures webhooks
- `webhook_logs` table pour audit

---

## [3.2.25] - 2025-12-04

### Added
- **Sprint 2** - Recherche avancée et découverte
  - `property_alerts` avec fréquence (instant/daily/weekly)
  - `visit_slots` pour disponibilités propriétaires
  - `visits` table pour planification
  - `AlertCreationModal` avec max 5 alertes
  - `VisitCalendar` pour gestion créneaux
  - `PropertyBadges` (vérifié, réponse rapide, visite virtuelle)

### Changed
- `properties` enrichi : `has_virtual_tour`, `avg_response_time_hours`
- Trigger `enforce_max_alerts` limite à 5 alertes actives

---

## [3.2.24] - 2025-12-03

### Added
- **Sprint 1** - Authentification KYC et garant
  - Système de garant multi-étapes
  - Invitation garant par email/phone
  - Vérification biométrique garant (NeoFace 85%)
  - Documents garant (certificat travail, bulletins salaire)

- **Workflow publication propriété**
  - Phase 1: Détails + upload CNI → NeoFace auto
  - Phase 2: Documents additionnels
  - Phase 3: Soumission → `en_verification`
  - Admin validation → `disponible` ou `rejete`

---

## [3.2.20] - 2025-12-01

### Added
- `AdminDocumentValidationPage` pour validation documents propriétaires
- Notifications automatiques validation/rejet
- Workflow complet vérification avant publication

### Security
- Documents propriétaires obligatoires avant publication
- Titre de propriété, CNI, justificatif domicile requis

---

## [3.2.15] - 2025-11-28

### Added
- **Architecture multi-rôle contextuelle**
  - `useContextualRoles` hook détection dynamique
  - `ContextualRoleSwitcher` composant
  - `UnifiedDashboardPage` avec tabs adaptatifs
  - Rôles basés sur propriétés/baux réels

### Changed
- Navigation `HeaderPremium` adaptatif selon rôles
- Route `/mon-espace` point d'entrée unifié

---

## [3.2.12] - 2025-11-26

### Added
- **Messagerie style WhatsApp**
  - Palette couleurs WhatsApp (#075E54, #DCF8C6, #25D366)
  - Checkmarks lecture (gris envoyé, bleu lu)
  - Support pièces jointes (photos/documents 10MB)
  - Conversations temps réel via Supabase Realtime

### Changed
- `user_conversations` et `messages` tables avec RLS
- Initiation conversation depuis détail propriété

---

## [3.2.10] - 2025-11-25

### Added
- **Design Premium Ivoirien** établi comme standard
  - Chocolat #2C1810 (texte principal)
  - Orange #F16522 (CTAs interactifs)
  - Sable #FAF7F4, #EFEBE9 (backgrounds)
  - Ombres douces, glassmorphism, coins arrondis

- **Navigation breadcrumb** globale
  - Génération dynamique depuis URL
  - Labels user-friendly
  - Améliore orientation utilisateur

### Changed
- `ProfileCompletionPage` redesign Split-Screen Premium
- Toutes pages menu mises à niveau Premium Ivoirien

---

## [3.2.8] - 2025-11-23

### Added
- **OTP téléphone infrastructure complète**
  - InTouch primary, Brevo fallback
  - Rate limiting 60 secondes
  - Normalisation téléphone (2250XXXXXXXXX)
  - Mode `login` vs `register`

### Fixed
- Cloudflare blocking workaround via InTouch primary
- Timeout 10s avec AbortController sur fetch()

---

## [3.2.6] - 2025-11-21

### Added
- **Validation Zod centralisée**
  - 40+ schémas dans `validation-schemas.ts`
  - Patterns ivoiriens (téléphone, ONECI, CNAM)
  - Messages d'erreur français
  - Fonctions `validate()`, `sanitizeString()`, `normalizePhone()`

### Security
- Protection XSS via sanitization
- Validation webhooks HMAC

---

## [3.2.5] - 2025-11-20

### Security
- **RLS hardening complet**
  - `profiles` bloque accès public, users voient leur profil
  - `verification_codes` bloque tout accès client
  - `agencies` vue publique limitée
  - `contact_submissions` anti-spam (5/email/jour)
  - `business_rules` cache settings sensibles

### Fixed
- OTP retiré des réponses API
- Fonctions SECURITY_INVOKER=true

---

## [3.2.4] - 2025-11-19

### Added
- **Infinite scroll** pagination avec `useInfiniteQuery`
  - 20 propriétés par page
  - `useInfiniteProperties` hook
  - `InfiniteScroll` composant

### Changed
- `SearchPropertiesPage` utilise infinite scroll
- Remplace pagination fixe 100 limite

---

## [3.2.3] - 2025-11-18

### Added
- **Global loading skeleton** système
  - 5 variants (default, dashboard, property, list, form)
  - `GlobalLoadingSkeleton` composant
  - Sélection automatique par route

### Changed
- `Layout.tsx` intègre skeletons dans Suspense
- UX améliorée pendant transitions

---

## [3.2.2] - 2024-11-24

### Added
- Service Worker et support offline
- Système de newsletter
- Rate Limiting API
- Tests unitaires base
- SEO complet avec meta tags
- PWA manifest et icons

### Performance
- Lazy loading images
- Code splitting routes
- Bundle optimization

---

## [3.2.0] - 2024-10-31

### Added
- **EPIC 13** - Système Multi-LLM AI
  - LLM Orchestrator pour routing intelligent
  - Assistant Juridique IA pour conseils légaux
  - Chatbot SUTA amélioré avec contexte
  - Génération descriptions propriétés

### Changed
- Architecture AI centralisée
- Support modèles Lovable AI natifs

---

## [3.1.0] - 2025-10-31

### Added
- **Moteur de recommandation** IA
  - Suggestions personnalisées
  - Propriétés tendance
  - Nouvelles annonces curées

- **Comparaison propriétés**
  - Side-by-side jusqu'à 10 propriétés
  - Indicateurs visuels différences

- **Multi-rôle support**
  - Switch tenant/landlord
  - Dashboards séparés

- **Recherche vocale** améliorée
  - Langage naturel
  - Focus accessibilité

### Performance
- Build time optimisé
- Bundle size réduit

---

## [3.0.0] - 2025-10-25

### Added
- **Migration architecture feature-based**
  - Structure ANSUT/DTDI complète
  - `shared/` pour composants réutilisables
  - Features isolées (auth, tenant, owner, admin, agency)

- **Système de rôles sécurisé**
  - `app_role` enum
  - `user_roles` table avec RLS
  - `has_role()` fonction SQL

- **Admin audit logs**
  - `admin_audit_logs` table
  - `get_platform_stats()` RPC
  - `log_admin_action()` RPC

### Changed
- Routes corrigées (6 dashboards)
- Stores renommés (`stores/` → `store/`)
- Features redondantes supprimées

### Security
- RLS complet sur toutes tables sensibles
- Séparation rôles admin/user

---

## [2.0.0] - 2025-10-20

### Added
- **Contrats électroniques**
  - `lease_templates` table configurable
  - CryptoNeo signature integration
  - NeoFace facial verification
  - PDF génération automatique

- **Configuration services**
  - `service_configurations` table
  - Providers SMS/WhatsApp/Email
  - Drag-and-drop priorités

### Changed
- Workflow signature multi-parties
- Stockage documents signés Supabase Storage

---

## [1.0.0] - 2025-10-15

### Added
- **Dashboards propriétaires complets**
  - `DashboardPage` overview
  - `OwnerContractsPage` gestion contrats
  - `OwnerApplicationsPage` candidatures
  - `CreateContractPage` création contrats

- **Scoring unifié**
  - Profile Score (20%)
  - Verification Score (40%)
  - History Score (40%)
  - `ScoreBadge` composant

### Changed
- Property API avec owner metadata automatique
- `PropertyWithOwnerScore` type

---

## [0.5.0] - 2025-10-10

### Added
- **React Router migration** complète
  - `<Link>` et `useNavigate()` partout
  - Élimination `window.location.href`
  - State preservation navigation

- **Sidebar navigation** tenants
  - `TenantSidebar` 9 items
  - `TenantDashboardLayout` wrapper
  - Badge messages non lus

### Performance
- Pas de full page reloads
- Navigation SPA optimisée

---

## [0.3.0] - 2025-10-05

### Added
- **OTP verification** infrastructure
  - `verification_codes` table
  - `generate_otp()` fonction SQL
  - `verify_otp_code()` fonction SQL
  - Expiration 10min, max 3 tentatives

### Security
- Codes OTP jamais exposés côté client
- Rate limiting par téléphone

---

## [0.2.0] - 2025-10-01

### Added
- **Foreign key** `properties.owner_id` → `profiles.user_id`
- Joins Supabase relationnels activés
- Property queries avec owner data

### Changed
- Supabase client canonical path standardisé
- Re-exports pour compatibilité

---

## [0.1.0] - 2025-09-29

### Added
- **Configuration initiale** projet
  - React 18 + TypeScript + Vite
  - Tailwind CSS + shadcn/ui
  - Supabase (Lovable Cloud)

- **Authentification** base
  - Email/password signup
  - Session management
  - Protected routes

- **Gestion propriétés**
  - CRUD propriétés
  - Upload images
  - Recherche basique

- **Système de messagerie** initial
- **Planification visites** basique
- **Candidatures locatives** workflow
- **Contrats de bail** templates
- **Paiements** Mobile Money structure
- **Vérification** framework initial

---

## Epic Progress

| Epic | Status | Version |
|------|--------|---------|
| EPIC 1: Auth & Profiles | ✅ Complet | 0.1.0 |
| EPIC 2: Property Management | ✅ Complet | 0.1.0 |
| EPIC 3: Search & Discovery | ✅ Complet | 3.2.25 |
| EPIC 4: Applications | ✅ Complet | 1.0.0 |
| EPIC 5: Contracts | ✅ Complet | 2.0.0 |
| EPIC 6: Payments | ✅ Complet | 3.2.26 |
| EPIC 7: Maintenance | ✅ Complet | 3.2.27 |
| EPIC 8: Messaging | ✅ Complet | 3.2.12 |
| EPIC 9: Verification | ✅ Complet | 3.2.24 |
| EPIC 10: Reviews | ✅ Complet | 3.2.28 |
| EPIC 11: Analytics | ✅ Complet | 3.2.31 |
| EPIC 12: Admin | ✅ Complet | 3.0.0 |
| EPIC 13: AI Features | ✅ Complet | 3.2.0 |
| EPIC 14: Agency | ✅ Complet | 3.2.30 |
| EPIC 15: Feature Flags | ✅ Complet | 3.2.32 |

---

## Sprint Progress

| Sprint | Thème | Status | Version |
|--------|-------|--------|---------|
| Sprint 1 | Authentification KYC & Garant | ✅ Complet | 3.2.24 |
| Sprint 2 | Recherche avancée & Alertes | ✅ Complet | 3.2.25 |
| Sprint 3 | Contrats & Paiements récurrents | ✅ Complet | 3.2.26 |
| Sprint 4 | Réseau prestataires | ✅ Complet | 3.2.27 |
| Sprint 5 | Litiges & Avis | ✅ Complet | 3.2.28 |
| Sprint 6 | Rappels loyer & Multi-propriétés | ✅ Complet | 3.2.29 |
| Sprint 7 | Gestion agence | ✅ Complet | 3.2.30 |
| Sprint 8 | Analytics & Optimization | ✅ Complet | 3.2.31 |

---

## Known Issues

### Active
- Bundle Mapbox volumineux (~500KB)
- Support navigateur recherche vocale limité
- Cold start recommandations nouveaux utilisateurs
- Mobile UX à améliorer (Bottom Navigation)

### Résolu
- ~~RLS profiles exposait données~~ (3.2.5)
- ~~OTP exposé dans réponse API~~ (3.2.5)
- ~~Navigation full page reload~~ (0.5.0)
- ~~Coordonnées GPS null~~ (3.2.15)
- ~~property_category contrainte 'residentiel'~~ (3.2.24)

---

## Statistiques

| Métrique | Valeur |
|----------|--------|
| Tables Supabase | 50+ |
| Edge Functions | 20+ |
| Composants React | 200+ |
| Pages | 50+ |
| RLS Policies | 100+ |
| Migrations | 30+ |
| Feature Flags | 8 |

---

## Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Lovable Cloud)
- **State**: TanStack Query, Zustand
- **Maps**: Mapbox GL
- **Charts**: Recharts
- **Mobile**: Capacitor
- **AI**: Lovable AI Models

---

## Intégrations Externes

| Service | Usage | Status |
|---------|-------|--------|
| InTouch | SMS/WhatsApp CI | ✅ Actif |
| Brevo | Email/SMS fallback | ✅ Actif |
| CryptoNeo | Signature électronique | ✅ Configuré |
| NeoFace | Vérification biométrique | ✅ Configuré |
| Mapbox | Cartes interactives | ✅ Actif |
| Sentry | Monitoring erreurs | ✅ Actif |

---

## Acknowledgments

- **Lovable AI** - Plateforme de développement
- **Supabase** - Backend as a Service
- **shadcn/ui** - Composants UI
- **Tailwind CSS** - Framework CSS
- **TanStack Query** - Data fetching
- **Mapbox** - Cartes interactives
- **InTouch** - SMS/WhatsApp Côte d'Ivoire
- **Brevo** - Email transactionnel
- **CryptoNeo** - Signature électronique
- **NeoFace** - Vérification biométrique

---

## Contact

- **Projet**: Mon Toit Platform
- **Objectif**: Production Q1 2026
- **Readiness**: 80%

---

[Unreleased]: https://github.com/user/mon-toit/compare/v3.2.32...HEAD
[3.2.32]: https://github.com/user/mon-toit/compare/v3.2.31...v3.2.32
[3.2.31]: https://github.com/user/mon-toit/compare/v3.2.30...v3.2.31
[0.1.0]: https://github.com/user/mon-toit/releases/tag/v0.1.0
