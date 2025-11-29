# Cahier des charges technique — Implémentation des nouvelles fonctionnalités avec intégration Supabase, APIs, architecture cible et stratégie par sprints

## 1. Introduction et contexte

Ce document définit un cahier des charges technique (CCT) complet et prescriptif pour la mise en œuvre d’un ensemble de nouvelles fonctionnalités applicatives, centré sur une intégration Supabase robuste et sécurisée. L’objectif est de passer, de manière maîtrisée, du cadrage des besoins à une architecture cible, à des spécifications fonctionnelles et techniques détaillées, à un plan de tests et à une stratégie de déploiement par sprints, tout en réduisant les risques par des pratiques d’ingénierie éprouvées.

L’approche s’appuie sur les principes structurants des documents de spécifications techniques : clarifier le public concerné, cadrer le problème à résoudre, délimiter le périmètre fonctionnel et technique, expliciter les contraintes (sécurité, performance, conformité, budget, délais), définir la solution et les critères de réussite, et établir un plan de tests, un calendrier et des jalons avec des mécanismes formels de validation. Ce CCT est écrit pour être opérable par les directions techniques et produits, et par les équipes de développement, d’UX/UI, de QA et de sécurité/DSI, afin de servir de feuille de route opérationnelle unique[^6][^7][^8].

Le périmètre couvre la chaîne de valeur bout en bout :
- Le modèle de données relationnel dans PostgreSQL et les exigences d’intégrité et de performance.
- Les services applicatifs fournis par Supabase : Auth (GoTrue), REST/GraphQL (PostgREST), Realtime, Storage, fonctions Edge.
- L’interface utilisateur (web et mobile), les wireframes basse/moyenne fidélité et l’alignement avec le système de design.
- Le plan de tests (unitaires, intégration, e2e, sécurité, performance), les données de test et les critères d’acceptation.
- Les exigences non fonctionnelles (sécurité, performance, disponibilité, observabilité) et les pratiques de production.
- La stratégie de développement par sprints (cadence, livrables, Definition of Done), les critères de passage et la gouvernance.

La structure narrative suit le fil “quoi → comment → pourquoi” : nous exposons d’abord les spécifications fonctionnelles et les cas d’usage, puis l’architecture et les APIs, ensuite la sécurité et les tests, avant de conclure par le plan par sprints et les annexes. Cette progression garantit une cohérence entre les décisions d’architecture, les besoins utilisateurs et les impératifs opérationnels.

Lacunes d’information à confirmer en amont du démarrage :
- Le portefeuille précis des fonctionnalités (noms, priorités, dépendances, règles métier).
- Le catalogue des personas, l’inventaire des écrans et les exigences d’accessibilité de référence (par ex. WCAG 2.2).
- Les volumes cibles (utilisateurs actifs, pics RPS, taille des données), les budgets et la politique de conformité (résidence des données, rétention).
- Les intégrations externes (paiements, notifications, géolocalisation), la stratégie d’infrastructure (Cloud vs. auto-hébergé) et les SLO détaillés.
- La stratégie de migration des données existantes et la politique de tests de charge.

Ces gaps sont listés pour être levés lors du Sprint 0, afin d’éviter les biais de conception précoces et de sécuriser le passage en développement incrémental[^6].

[^6]: Document360 — Guide du document de spécifications techniques. https://document360.com/fr/blog/document-de-specification-techniques/
[^7]: Appvizer — Comment faire un cahier des charges. https://www.appvizer.fr/magazine/operations/gestion-de-projet/cahier-des-charges
[^8]: Justinmind — Documents de spécification fonctionnelle. https://www.justinmind.com/fr/blog/specification-fonctionnelle-documentation/

---

## 2. Vision produit et périmètre fonctionnel

Nous considérons un ensemble de nouvelles fonctionnalités applicatives orientées utilisateur final et back-office, conçues pour exploiter les capacités de Supabase comme backend unifié. Sans présumer des détails fonctionnels spécifiques (à confirmer avec le produit), la vision cible couvre les briques suivantes :
- Gestion de comptes utilisateurs et profils : inscription, connexion, récupération, gestion des sessions.
- Profils et préférences : stockage structuré, métadonnées, opt-ins/privacy.
- Contenus et collections : création, modification, partage, contrôle d’accès.
- Collaboration en temps réel : présence, notifications, synchronisation d’états.
- Modules administratifs : gestion des ressources, supervision, audit.

Critères de succès
- Valeur utilisateur : une UX fluide, une latence perçue faible, des retours immédiats (état de chargement, erreurs signifiantes).
- Fiabilité : disponibilité élevée, résilience aux pannes, absence de corruption de données.
- Performance : réponses rapides en p95 pour les opérations clés, pages “Above the Fold” chargées en moins d’un seuil cible (à préciser).
- Sécurité : prévention des accès non autorisés, conformité aux politiques internes et exigences légales.
- Maintenabilité : modèles de données lisibles, tests automatisés, migrations reproductibles,observabilité opérationnelle.

Contraintes et hypothèses
- Les migrations de schéma se font uniquement via la CLI/mécanismes versionnés ; pas de modifications manuelles en production.
- RLS (Row-Level Security) activée par défaut sur toutes les tables orientées utilisateur.
- Clés et secrets gérés côté serveur ; JWT de courte durée.
- Realtime activé uniquement sur les tables nécessaires et avec granularité (INSERT/UPDATE/DELETE) calibrée.
- Fonctions Edge courtes, stateless, utilisées pour logique légère, sans traitement batch long[^1][^2][^4].

Risques préliminaires et stratégies d’atténuation
- Accessibilité insuffisante : intégrer des critères WCAG dans l’UX dès les wireframes ; tests d’accessibilité planifiés.
- Complexité des politiques RLS : itérer avec matrices de permissions et revues de sécurité ; tests d’intégration专用 sur l’isolation.
- Performance Realtime : limiter les flux, débouncer les mises à jour côté client, mesurer l’impact ; fallback polling si nécessaire.
- Dette de migrations : CI/CD pour les migrations et déploiements de fonctions ; revues de schéma systématiques.
- Gouvernance des clés : vault, rotation, monitoring d’usage ; interdiction d’exposer service_role côté client[^4][^2].

Pour cadrer le périmètre et la priorisation, le tableau suivant distingue les éléments “In Scope” et “Out of Scope” de la release visée. Il sert de point d’ancrage aux arbitrages produit.

Tableau 1 — In Scope vs Out of Scope (priorisation initiale)
| Élément | In Scope (v1) | Out of Scope (v2+) | Justification |
|---|---|---|---|
| Auth (inscription, connexion, sessions) | Oui | — | Fonctionnalité de base à livrer dès v1[^2] |
| Profils utilisateurs | Oui | — | Prérequis pour personnalisation et RLS |
| Collections/ressources CRUD | Oui | — | Cœur applicatif ; API REST générée[^2] |
| Recherche simple (filtre/colonne indexée) | Oui | Avancée (moteurs externes) | Éviter la complexité premature |
| Collaboration temps réel (présence, mises à jour ciblées) | Oui | — | Realtime activé sur tables nécessaires[^1] |
| Administration et audit | Oui | Rapports avancés | Données d’audit de base pour traçabilité |
| Stockage fichiers (métadonnées dans Postgres) | Oui | Traitement heavy (transcodage) | Storage API pour fichiers ; traitement externe[^1] |
| Fonctions Edge (webhooks, validations serveur) | Oui | Jobs batch longs | Fonctions stateless <1s typiquement[^4] |
| GraphQL (pg_graphql) | Optionnel | — | Activer si besoin de schémas flexibles[^1][^2] |

Analyse
- La réussite de la v1 dépend de la qualité du modèle de données et de la politique de sécurité. L’exclusion intentionnelle de fonctionnalités avancées de recherche et de rapports réduit les risques de dérive de périmètre et de dette de performance.
- Realtime est autorisé sur un périmètre restreint pour réduire l’impact sur la base et l’interface. Les traitements pesados sont externalisés pour préserver la simplicité et la lisibilité du système[^1][^4].

---

## 3. Cas d’usage et parcours utilisateur

Les cas d’usage ci-dessous couvrent les interactions clés : création de compte, authentification, gestion du profil, opérations CRUD sur une ressource, collaboration temps réel, et actions back-office. Les préconditions/postconditions explicites, ainsi que les exceptions, garantissent un alignement opérationnel avec les politiques de sécurité et de rétention. Les parcours sont séquencés pour révéler les points de contrôle de sécurité (RLS, tokens), de performance (index, pagination) et d’UX (feedback, états).

Tableau 2 — Catalogue des cas d’usage (acteurs, objectifs, pré/postconditions, exceptions)
| Cas d’usage | Acteur | Objectif | Préconditions | Postconditions | Exceptions |
|---|---|---|---|---|---|
| Inscription | Utilisateur | Créer un compte et établir une session | Email valide ; politique de mot de passe | Compte créé ; JWT de courte durée ; profil initial créé | Email déjà utilisé ; capture anti-bot |
| Connexion | Utilisateur | Ouvrir une session | Compte existant ; MFA (si activé) | JWT rafraîchi ; session stockée | Échec MFA ; brute-force ; jeton expiré |
| Récupération de compte | Utilisateur | Réinitialiser le mot de passe | Email vérifié | Lien de reset envoyé ; horodatage | Email non vérifié ; tentative excessive |
| Gestion du profil | Utilisateur | Mettre à jour préférences/infos | Session valide ; RLS autorise l’utilisateur | Profil mis à jour ; logs d’audit | Conflit de version ; données invalides |
| CRUD Ressource | Utilisateur | Créer/lire/mettre à jour/supprimer une ressource | RLS autorise ; индекс sur colonnes de filtre | Ressource modifiée ; événements Realtime ciblés | Violation contrainte ; collision d’édition |
| Recherche simple | Utilisateur | Filtrer une liste | Index sur colonnes de filtre ; pagination | Résultats paginés | Requête lente ; timeout |
| Présence/Collab | Utilisateur | Voir statut et co-édition | Realtime activé ; canal abonné | État présence mis à jour | Perte réseau ; fallback polling |
| Administration | Admin | Gérer ressources et utilisateurs | Rôles et permissions ; politiques RLS admin | Actions tracés ; audit | Accès non autorisé ; logs d’échec |
| Upload fichier | Utilisateur | Stocker un fichier | Bucket correct ; politique Storage | Métadonnées insérées ; URL signée | Quota atteint ; type MIME invalide |

Analyse
- La granularité des exceptions est essentielle pour couvrir les scénarios dégradés et garantir des messages UX actionnables. Les préconditions renforcent l’usage de RLS et des index, ce qui réduit les incidents de sécurité et de performance.
- La présence/collaboration est intégrée dans un cadre maîtrisé (activation ciblée, canaux explicites), limitant l’empreinte côté base et client[^1][^2][^11].

---

## 4. Spécifications fonctionnelles détaillées

Nous détaillons les exigences fonctionnelles pour chaque module, en reliant les actions utilisateurs aux APIs Supabase, aux contrôles de sécurité (RLS) et aux messages UX. Chaque règle est reliée à des critères d’acceptation et à des tests prioritaires.

### 4.1 Authentification et comptes

- Inscription/connexion : utiliser Auth (GoTrue), émettre des JWT, appliquer des durées de vie courtes, rafraîchir de manière proactive. Activer MFA si requis. RLS sur profils pour interdire la lecture/écriture croisée. Sessions stockées côté client de manière sécurisée (cookies httponly/samesite selon contexte). Erreurs explicites pour tentatives invalides et captchas en cas d’abus[^2][^1].
- Récupération de compte : flux d’email de reset avec tokens horodatés ; limiter le nombre de tentatives ; tracer les événements (succès/échec).
- Gestion des rôles : associer des rôles (utilisateur, admin) aux profils ; policies RLS admin plus strictes.

Tableau 3 — Exigences fonctionnelles Auth (règles, erreurs, messages, sécurité)
| Fonction | Règle | Erreurs UX | Messages UX | Mesures de sécurité |
|---|---|---|---|---|
| Inscription | Email unique ; mot de passe robuste | Email existe ; faiblesse mot de passe | “Email déjà utilisé” ; “Mot de passe insuffisant” | Rate limiting ; captcha anti-bot ; logs |
| Connexion | JWT court ; refresh token | MFA requis ; échec | “Vérifiez votre authentification” | Brute-force detection ; verrouillage progressif |
| Reset | Token horodaté | Token expiré | “Lien expiré, demandez un nouveau” | Limite tentatives ; horodatage |
| Session | Stockage sécurisé | Session expirée | “Votre session a expiré” | Rotation clés ; invalidation server-side |

Analyse
- La sécurité de l’Auth repose sur des durées de vie courtes, la détection d’abus, et des logs. La clarté des messages réduit la friction et oriente les actions correctives. RLS sur profils évite les fuites de données même si un JWT est compromis[^2][^1].

### 4.2 Profils et préférences

- Profil utilisateur : schéma minimal (id, display_name, email, prefs JSON, opt-ins, created_at, updated_at). Préférences stockées en JSON si variabilité ; colonnes indexées sur requêtes fréquentes.
- Préférences : opt-in notifications, langue, thèmes. RLS sur profils (utilisateur = owner), plus admin override.
- Journalisation : audit des changements (qui, quand, quoi).

Tableau 4 — Règles métier des préférences (opt-ins, validations, impact UX)
| Préférence | Validations | Impact UX | Sécurité |
|---|---|---|---|
| Opt-in notifications | Booléen ; horodatage | “Notifications activées” | Consentement traçable |
| Langue | Valeurs autorisées | Langue appliquée instant | RLS : owns preference |
| Thème | Enum (light/dark) | Thème persistant | Stockage côté client et serveur |

Analyse
- L’usage de JSON pour les préférences hétérogènes évite la rigidité du schéma, tout en maintenant des colonnes indexées pour des requêtes rapides. L’audit renforce la conformité et la traçabilité[^1][^3].

### 4.3 Gestion de contenu (CRUD + recherche simple)

- CRUD via PostgREST : insérer, lire, modifier, supprimer avec filtres et pagination. Index sur colonnes de filtre (ex. created_at, status). Contrôles RLS : lecture/écriture selon propriétaire et permissions. Messages d’erreur contextualisés (contrainte violée, duplication).
- Recherche simple : filtres indexés ; éviter la recherche textuelle avancée tant que les volumes sont faibles ; fallback “no results”.
- Feedback UX : états de chargement, “optimistic updates” si appropriate, messages de conflits d’édition.

Tableau 5 — APIs CRUD (ressources, endpoints, filtres, pagination, codes de retour)
| Ressource | Endpoint type | Filtres | Pagination | Codes retour (exemples) |
|---|---|---|---|---|
| /resources | GET | status, owner_id (RLS) | limit/offset ; order by | 200 (OK), 400 (bad request) |
| /resources | POST | — | — | 201 (created), 400 (invalid) |
| /resources/:id | PATCH | owner_id (RLS) | — | 200 (updated), 403 (forbidden) |
| /resources/:id | DELETE | owner_id (RLS) | — | 204 (no content), 404 (not found) |

Analyse
- PostgREST offre une API autogérée, rapide, auto-documentée, qui réduit la complexité de la couche backend. L’indexation et la pagination sont clés pour la performance. RLS est strictement appliquée côté serveur[^2][^10].

### 4.4 Stockage de fichiers (Storage API)

- Buckets : organiser par type (public/privé), métadonnées dans Postgres (taille, MIME, checksum, owner). Upload via URLs signées ; éviter d’exposer les clés sensibles côté client.
- Policies : lecture/écriture par propriétaire ; transformations externes si nécessaires (ex. thumbnails).
- Quotas : taille maximale par fichier ; nombre de fichiers par profil ; logs d’erreur explicites.

Tableau 6 — Spécifications Storage (buckets, policies, quotas, opérations)
| Bucket | Access | Policy | Quotas | Opérations |
|---|---|---|---|---|
| user-uploads | Privé | owner-only read/write | Max 20 MB/file ; 1 GB/user | Upload (signed URL), delete, metadata update |
| public-assets | Public | read-all ; admin write | N/A | Upload admin ; purge |

Analyse
- Le stockage d’objets s’intègre nativement à Postgres pour les métadonnées, garantissant cohérence et requêtes efficaces. Les URLs signées renforcent la sécurité sans exposer les clés de service. La limitation explicite des quotas évite la dérive de coûts[^1][^4].

### 4.5 Collaboration temps réel (Realtime)

- Activation : sur les tables nécessaires (ex. présence, statuts de ressources). Granularité INSERT/UPDATE/DELETE. Débouncer les mises à jour côté client pour éviter les re-rendus inutiles.
- Présence : publication d’état (online/offline, typing). Channels par ressource ou par session. Gestion du fallback en cas de perte de réseau.
- Observabilité : mesurer les abonnements et la charge ; ajuster les flux si les métriques dépassent les seuils.

Tableau 7 — Canaux et événements Realtime (tables, types d’événements, payload, fréquence)
| Canal | Table | Événements | Payload | Fréquence |
|---|---|---|---|---|
| presence:{resourceId} | resources | INSERT/UPDATE (status) | {userId, status, ts} | bursts debounced |
| thread:{resourceId} | messages | INSERT | {userId, message, ts} | on action |
| audit:admin | audit_log | INSERT | {actorId, action, target} | on admin action |

Analyse
- Le temps réel n’est pas “gratuit” : bien calibré, il offre une UX supérieure sur les cas où la latence d’état est critique. Sinon, le polling reste acceptable. L’observabilité des flux permet des arbitrages éclairés[^1][^4].

---

## 5. Architecture cible avec Supabase

Supabase fournit un ensemble de composants découplés mais intégrés autour de PostgreSQL : Auth (GoTrue), PostgREST (REST/GraphQL), Realtime, Storage API, fonctions Edge (Deno), Studio, Supavisor (pooler), et une passerelle API. Cette architecture privilégie des “primitifs” robustes, extensibles et portables, afin d’éviter le verrouillage et de faciliter la migration future[^1][^2][^10].

Découpage par services et responsabilités
- PostgreSQL : source de vérité ; intégrité référentielle ; RLS ; indexation ; partitions pour séries temporelles si besoin.
- Auth (GoTrue) : comptes, sessions, JWT ; intégration avec RLS.
- PostgREST : API CRUD autogénérée ; pagination ; filtres ; ordres ; GraphQL via pg_graphql.
- Realtime : diffusion des changements via WebSocket ; présence ; événements sur tables.
- Storage API : objets avec URLs signées ; métadonnées en Postgres ; policies d’accès.
- Edge Functions : logique légère côté serveur ; webhooks ; validations ; authentification via Authorization header ; pas de batch long.
- Supavisor : pooling de connexions multi-tenant ; optimise la performance des connexions.
- Studio : administration et inspection de la base et des services.
- Passerelle API : point d’entrée ; gestion des clés et des quotas ; Kong pour le routing et les politiques.

Patrons de conception
- Service-per-table : exposer chaque domaine via PostgREST avec des politiques RLS spécifiques ; clarifie l’ownership des données.
- CQRS light : distinguer lectures paginées/filtrées et écritures transactionnelles ; denormaliser légèrement si les lectures dominent.
- Event-driven minimal : utiliser Realtime pour les changements critiques ; éviter l’overload d’événements.
- Edge “thin” : déléguer les tâches lourdes à des files externes (ex. Upstash/SQS/Temporal) ; garde les fonctions <1s[^4].

Sélection Cloud vs auto-hébergement
- Cloud Supabase : plus simple, bonnes pratiques par défaut ; contraintes de régions et plans. Idéal pour un time-to-market rapide.
- Auto-hébergement : contrôle total, conformité stricte ; exige une compétence DevOps. Idéal pour données réglementées et contraintes de résidence.

Tableau 8 — Matrice des composants et responsabilités (technologies, interfaces, contrats)
| Composant | Rôle | Interface | Contrat |
|---|---|---|---|
| Postgres | Données relationnelles | SQL ; pg_graphql | Contraintes ; RLS ; index |
| GoTrue (Auth) | Comptes/sessions | REST ; JWT | TTL ; refresh ; MFA |
| PostgREST | API CRUD/GraphQL | HTTP REST/GraphQL | Pagination ; filtres ; ordres |
| Realtime | Diffusion changements | WebSocket | Événements ; présence |
| Storage | Objets | HTTP (signed URL) | Buckets ; policies |
| Edge Functions | Logique serveur | HTTP | Auth header ; latence <1s |
| Supavisor | Pool connexions | — | Multi-tenant pooling |
| Studio | Administration | GUI | Gestion DB/services |
| Kong | Passerelle | HTTP | Routing ; keys |

Analyse
- Le choix de Postgres et des standards ouverts rend la solution portable et testable. Chaque service est découplé, ce qui autorise des remplacements ponctuels sans refonte globale. L’intégration de pg_graphql et de PostgREST couvre des besoins variés sans duplication de logique[^1][^2][^10].

---

## 6. Spécifications techniques détaillées

Schéma de base de données
- Tables : profils, ressources, préférences, messages/événements, audit_log. Colonnes communes : id (UUID/ULID), created_at, updated_at, owner_id.
- Contraintes : clés étrangères, unicité (email), checks (MIME valide).
- Index : colonnes de filtres fréquentes ; colonnes de jointure ; partial index si distributions biaisées.
- RLS : activer sur toutes les tables ; policies “owner-only” ; override admin ; tester l’isolation.

APIs
- REST/GraphQL (PostgREST) : CRUD, filtres, pagination ; GraphQL via pg_graphql pour clients nécessitant des schémas flexibles. Pagination standard (limit/offset ou curseurs selon besoin).
- Edge Functions : endpoints spécialisés (webhooks, validations serveur) ; auth внутри ; TTL <1s ; logs et erreurs standardisés.
- Auth : endpoints d’inscription/connexion/reset ; gestion de sessions ; MFA si requis.

Sécurité
- Clés : anon (frontend), service_role (serveur seulement) ; jamais exposer service_role côté client.
- JWT : durée courte ; rotation et rafraîchissement ; invalidation server-side en cas de compromission.
- RLS : par défaut sur toutes les tables orientées utilisateur ; policies granulaires ; tests d’isolation.
- Storage : URLs signées ; policies strictes owner-only ; quotas ; audits.
- Rotation/pivot des clés : planifié ; procédure de révocation ; surveillance d’usage.

Performance
- Indexation : sur colonnes de filtre et de tri ; monitoring des requêtes lentes.
- Pooling : Supavisor ; connexions réutilisées ; limites par instance.
- Pagination : curseurs pour grandes listes ; limitation des tailles de réponse.
- Realtime : activer sur tables nécessaires ; granularité d’événements ; debouncing côté client.
- Dénormalisation ciblée : si lectures >> écritures ; cohérence assurée par transactions.

CI/CD
- Migrations : versionnées dans Git ; déploiements via CLI ; éviter les变更 manuelles en production.
- Edge Functions : build/test/déploiement automatisés ; contrôle des secrets.
- Environnements : dev/staging/prod ; promotion contrôlée ; rollback reproductibles.

Observabilité
- pg_stat_statements : activation pour identifier les requêtes lentes.
- Logs : Auth, Edge, Storage ;稽核 d’accès ; corrélation des erreurs.
- Alertes : seuils d’erreurs, latence, saturation ; tableaux de bord.

Tableau 9 — Spécifications techniques (choix, justification, sources, risques)
| Choix | Justification | Source | Risques |
|---|---|---|---|
| Postgres + RLS | Sécurité granulaire ; portable | Supabase Archi | Complexité policies |
| PostgREST | API autogénérée ; rapide | PostgREST | Filtrage inadéquat |
| Realtime ciblé | UX temps réel maîtrisée | Supabase Archi | Charge DB |
| URLs signées | Sécurité Storage | Supabase Archi | Mauvaise config |
| Edge <1s | Simplicité ; cost | Blog Supabase | Sur-utilisation |

Tableau 10 — Plan de sécurité (contrôles, responsabilités, métriques)
| Contrôle | Responsabilité | Métrique |
|---|---|---|
| RLS default-on | DBA/Back-end | 100% tables RLS |
| JWT court TTL | Auth/Back-end | p95 latence refresh < 200 ms |
| Rotation clés | DevOps | Clés pivotées trimestriellement |
| Storage policies | Back-end | 0 accès cross-owner |
| pg_stat_statements | DBA | Requêtes lentes < 1% |

Tableau 11 — Plan de performance (index, requêtes lentes, limites)
| Élément | Action | Seuil |
|---|---|---|
| Colonnes de filtre | Index | p95 < 200 ms |
| Listes | Pagination/curseurs | 100 items/page |
| Realtime | Granularité | Événements < X/s (à définir) |

Analyse
- La matrice sécurité/performance clarifie les responsabilités et les seuils. La discipline CI/CD sur les migrations et la surveillance active des requêtes lentes préviennent les régressions et les incidents[^1][^2][^4][^9][^12][^15].

---

## 7. Modèle de données et APIs (REST/GraphQL)

Diagramme entité-relation (décrit)
- Profils (id, email, display_name, prefs JSON, created_at, updated_at).
- Ressources (id, owner_id, title, status, content JSON, created_at, updated_at).
- Préférences (id, owner_id, key, value, updated_at).
- Messages (id, resource_id, user_id, body, created_at).
- Audit_log (id, actor_id, action, target_type, target_id, payload JSON, created_at).

Clés et index
- Clés primaires : UUID/ULID ; clés étrangères owner_id, resource_id, user_id ; index sur created_at, status, owner_id ; partial index pour status=active si nécessaire.
- RLS : owner-only ; admin override ; policies testées.

Endpoints REST/GraphQL
- REST (PostgREST) : CRUD sur profils, ressources, préférences ; filtres et pagination.
- GraphQL (pg_graphql) : schémas flexibles pour clients ; queries/mutations structurées ; pagination côté serveur.

Gestion des erreurs et versioning
- Codes HTTP standard (200, 201, 204, 400, 403, 404) ; messages UX contextualisés ; pagination et ordonnancement explicites.
- Versioning d’API : éviter les breaking changes ; introduire de nouveaux champs en arrière ; deprecations progressives.

Contrats d’API
- Exemple (REST) :
  - GET /resources?status=eq.active&order=created_at.desc&limit=20&offset=0
  - POST /resources (body JSON)
  - PATCH /resources?id=eq.{id}
  - DELETE /resources?id=eq.{id}
- Exemple (GraphQL) :
  - query GetResources($filter: ResourcesFilter!, $pagination: PaginationInput) { resources(filter: $filter, pagination: $pagination) { id title status } }
  - mutation UpdateResource($id: UUID!, $patch: ResourcePatch!) { updateResource(id: $id, patch: $patch) { id updated_at } }

Analyse
- L’API autogénérée et les schémas GraphQL couvriront des besoins hétérogènes, tout en maintenant des contrats simples et versionnés. L’indexation et la pagination garantissent des performances stables[^2][^12][^13].

---

## 8. Sécurité, confidentialité et conformité

RLS par défaut
- Activer sur toutes les tables orientées utilisateur ; policies owner-only ; admin override documenté ; tests d’intégration专用.

Gestion des secrets et clés
- service_role jamais côté client ; rotation périodique ; plan de révocation ; vault ; audit d’accès.

Politique de confidentialité et conservation
- Données minimales ; opt-in explicites ; rétention définie par politique ; effacement sur demande.

Sauvegardes et récupération
- Sauvegardes quotidiennes ; manuelles avant changements de schéma ; exports via pg_dump ; stockage externe ; tests de restauration.

Tableau 12 — Politiques RLS (tables, conditions, rôles, exceptions)
| Table | Condition RLS | Rôle | Exceptions |
|---|---|---|---|
| profiles | id = auth.uid() | utilisateur | admin lecture |
| resources | owner_id = auth.uid() | utilisateur | admin override |
| preferences | owner_id = auth.uid() | utilisateur | admin lecture |
| audit_log | actor_id = auth.uid() | utilisateur | admin full |

Tableau 13 — Plan de rotation et de révocation des clés
| Clé | Fréquence | Procédure | Responsable |
|---|---|---|---|
| anon | Trimestrielle | Régénérer via Studio | DevOps |
| service_role | Trimestrielle | Vault + rotation | DevOps |
| JWT TTL | Mensuelle | Ajuster selon usage | Tech Lead |

Analyse
- Les politiques RLS et la gouvernance des clés sont les fondations de la sécurité. Les sauvegardes testées et la rétention définie garantissent la conformité et la résilience en cas d’incident[^4][^2][^3][^15].

---

## 9. Wireframes conceptuels et principes UX

Approche wireframing
- Basse fidélité : mise en page, navigation, flux essentiels, placeholders en niveaux de gris ; itérations rapides.
- Moyenne fidélité : ajout d’annotations et de contenu ; affinement des interactions ; alignement avec le système de design.
- Haute fidélité : précision visuelle ; test utilisateur ; préparation au prototypage.

Dimensions recommandées
- Mobile : 393×852 ; Tablette 11" : 834×1194 ; Desktop : 1440×1024.
- Alignement avec les breakpoints et le système de design.

Navigation et feedback
- Navigation évidente ; breadcrumbs si nécessaire ; états (chargement, succès, erreur) ; messages contextualisés.

Cohérence et accessibilité
- Composants uniformes ; contrastes ; tailles de cible tactile ; focus visible ; ordre de tabulation.

Tableau 14 — Inventaire des écrans (objectif, éléments UI, interactions, états)
| Écran | Objectif | Éléments UI | Interactions | États |
|---|---|---|---|---|
| Inscription | Créer compte | Champs email/mdp ; CTA | Submit ; captcha | Loading ; succès ; erreur |
| Connexion | Ouvrir session | Fields ; MFA | Submit ; refresh | Loading ; succès ; erreur |
| Profil | Gérer prefs | Form prefs ; toggle | Save ; undo | Loading ; succès ; conflit |
| Liste ressources | Filtrer/lister | Filters ; pagination | Change filter ; page | Loading ; empty ; erreur |
| Détail ressource | Voir/modifier | Title ; content ; CTA | Edit ; delete | Loading ; succès ; conflit |
| Upload | Stocker fichier | Drag-drop ; progress | Upload ; cancel | Loading ; succès ; erreur |
| Temps réel | Présence | Status badges | Subscribe ; debounce | Loading ; online ; offline |

Analyse
- Les wireframes, créés en basse/moyenne fidélité d’abord, servent d’alignement entre UX et devs. La clarté des flux et des états limite les ambiguïtés et accélère le développement. L’accessibilité est intégrée dès cette phase[^5][^16][^17].

---

## 10. Stratégie de développement par sprints

Le développement suit une cadence itérative avec des sprints de deux semaines. Chaque sprint produit des livrables increments fonctionnels, des artefacts (migrations, fonctions Edge, tests), et des validations formelles (revues, QA). La Definition of Done inclut la conformité RLS, la performance cible, la couverture de tests et l’observabilité minimale.

Plan de sprints (exemple initial)
- Sprint 0 (2 semaines) : cadrage, schéma v0, policies RLS v0, CI/CD initial, Studio configuré.
- Sprint 1 (2 semaines) : Auth et profils ; tests unitaires et intégration ; messages UX.
- Sprint 2 (2 semaines) : CRUD ressources ; index ; pagination ; tests e2e.
- Sprint 3 (2 semaines) : Storage ; URLs signées ; quotas ; audit.
- Sprint 4 (2 semaines) : Realtime ; présence ; événements ciblés ; debouncing.
- Sprint 5 (2 semaines) : Edge Functions (webhooks/validations) ; observabilité ; rapports.

Tableau 15 — Plan par sprints (objectifs, livrables, critères DoD, risques, propriétaires)
| Sprint | Objectifs | Livrables | DoD | Risques | Propriétaires |
|---|---|---|---|---|---|
| 0 | Cadrage ; schéma ; CI/CD | Schema v0 ; CI/CD ; RLS v0 | RLS enabled ; CI passe | Gap specs | Tech Lead ; DBA |
| 1 | Auth ; profils | Auth flows ; profil CRUD | Messages ; tests ok | MFA complexité | Back-end ; UX |
| 2 | CRUD ; index | Pagination ; filtres | p95 < target | Requêtes lentes | Back-end ; DBA |
| 3 | Storage | Buckets ; policies | URLs signées | Quotas | Back-end ; DevOps |
| 4 | Realtime | Presence ; events | Debounce ; fallback | Charge | Front-end ; Back-end |
| 5 | Edge ; observabilité | Webhooks ; logs | Latence <1s | Sur-usage | Back-end ; DevOps |

Analyse
- La progression “Auth → CRUD → Storage → Realtime → Edge” réduit le risque et maximise la valeur tôt. La DoD explicite rend les critères de sortie non négociables ; les revues de sécurité et performance sont intégrées à chaque sprint[^6][^7].

---

## 11. Plan de tests et qualité

Types de tests
- Unitaires : fonctions, helpers, validations.
- Intégration : RLS (isolation), CRUD (filtres/pagination), Storage (policies), Auth (flux).
- End-to-end (e2e) : parcours complets (inscription → CRUD → realtime).
- Sécurité : tests d’accès, rotation de clés, journaux d’audit.
- Performance : requêtes lentes, latence p95, throughput, impact Realtime.
- Accessibilité : contrastes, focus, annonces ARIA, navigation clavier.

Données de test et mocks
- Jeux de données synthétiques ; anonymisation des données sensibles ; seeds reproductibles.
- Mocks Realtime ; URLs signées de test ; quotas de test.

Stratégie de couverture
- Couverture unitaire minimale (à définir) ; tests d’intégration sur endpoints critiques ; e2e sur parcours prioritaires.
- Non-régression : suite minimale exécutée en PR ; suite complète nightly.

Outils et métriques
- CI : exécution des tests en PR ; rapports de couverture ; qualité de code (lint).
- Observabilité : pg_stat_statements pour requêtes lentes ; alertes sur erreurs et latences.

Critères d’acceptation
- Définition par fonctionnalité (ex. inscription) ; thresholds de performance (p95) ; taux d’erreurs acceptable ; tests d’accessibilité conformes.

Tableau 16 — Matrice de couverture (niveaux vs types vs fonctionnalités)
| Fonctionnalité | Unitaire | Intégration | e2e | Sécurité | Performance | Accessibilité |
|---|---|---|---|---|---|---|
| Auth | Oui | Oui | Oui | Oui | Oui (latence) | Oui (focus) |
| Profils | Oui | Oui | Oui | Oui | Oui (reads) | Oui (contraste) |
| CRUD | Oui | Oui | Oui | Oui | Oui (p95) | Oui (navigation) |
| Storage | Oui | Oui | Oui | Oui | Oui (upload) | Oui (progress) |
| Realtime | Oui | Oui | Oui | Oui | Oui (events) | Oui (feedback) |
| Edge | Oui | Oui | — | Oui | Oui (TTL) | — |

Tableau 17 — Critères d’acceptation (fonctionnalité, métriques, seuils)
| Fonctionnalité | Critère | Seuil |
|---|---|---|
| Inscription | Taux d’échec | < 1% |
| Connexion | Latence p95 | < 300 ms |
| CRUD | p95 < target | À définir |
| Storage | Upload succès | > 99% |
| Realtime | Événements reçus | > 99% |
| Edge | TTL | < 1s |

Analyse
- La matrice et les seuils guident les arbitrages ; l’usage de pg_stat_statements et de logs standardisés alimente les décisions de performance et de refactoring[^4][^3][^5].

---

## 12. Déploiement, CI/CD et observabilité

Environnements
- dev/staging/prod : isolation ; promotion contrôlée ; feature flags ; rollback via migrations inverses.

CI/CD
- CLI Supabase pour migrations et déploiements de fonctions ; GitHub Actions pour tests ; pipelines de lint/build/deploy.
- Pas de modifications manuelles en production ; artefacts versionnés.

Observabilité
- Logs : Auth, Edge, Storage ;稽核 ; corrélation des erreurs.
- Métriques : latence p95 ; taux d’erreur ; saturation.
- Alertes : seuils ; canaux (email, Slack) ; runbooks.

Tableau 18 — Cartographie des pipelines (étapes, outils, contrôles, rollback)
| Étape | Outil | Contrôle | Rollback |
|---|---|---|---|
| Lint/Test | CI | Qualité ; couverture | Rejet PR |
| Migration | CLI Supabase | Migrations versionnées | Migration inverse |
| Functions Deploy | CLI Supabase | Build ; secrets | Revert commit |
| Release | Studio/CI | Promouvoir | Tag précédent |

Analyse
- La discipline CI/CD sur les migrations et fonctions, couplée à l’observabilité, réduit fortement les risques d’incident et accélère la récupération. Les runbooks sécurisent les procédures d’urgence[^4][^9][^14][^15].

---

## 13. Risques, hypothèses et mesures d’atténuation

Registre des risques (exemple initial)
- Complexité des politiques RLS ; performance Realtime ; volumétrie ; conformité.
- Atténuation : matrices de permissions ; granularité d’événements ; index/pagination ; audit ; sauvegardes testées.

Hypothèses techniques
- Supabase Cloud ; quotas raisonnables ; accès à la CLI ; monitoring activé ; pas de workloads batch lourds en Edge.
- Tests de charge à exécuter pour calibrer les seuils ; migration des données existantes planifiée.

Tableau 19 — Registre des risques (probabilité, impact, atténuation, propriétaire)
| Risque | Probabilité | Impact | Atténuation | Propriétaire |
|---|---|---|---|---|
| RLS mal configurée | Moyenne | Élevé | Matrices ; tests | DBA/Back-end |
| Realtime surcharge | Moyenne | Moyen | Granularité ; debounce | Front-end/Back-end |
| Requêtes lentes | Moyenne | Élevé | Index ; pg_stat_statements | DBA |
| Clés exposées | Faible | Élevé | Vault ; audits | DevOps |
| Non-conformité | Faible/Moyenne | Élevé | Politique rétention | DPO/DSI |

Analyse
- La prévention par design (RLS, Edge light, CI/CD) et l’observabilité active réduisent la probabilité d’incidents. Le registre sera revu à chaque sprint pour intégrer les retours de terrain[^4][^2][^3].

---

## 14. Jalons, calendrier et critères de validation

Jalons
- M0 : Schéma et RLS v0 ; CI/CD initial.
- M1 : Auth/Profils ; tests ; messages UX.
- M2 : CRUD ; index ; pagination ; e2e.
- M3 : Storage ; URLs signées ; quotas.
- M4 : Realtime ; présence ; fallback.
- M5 : Edge ; observabilité ; sécurité renforcée.
- M6 : Go-Live ; runbooks ; rétro.

Calendrier indicatif
- Deux semaines par sprint ; rétro à la fin de chaque sprint ; revues techniques et sécurité en continu.

Critères de passage de jalon
- Tests verts (unitaires/intégration/e2e) ; RLS active ; performance p95达标 ; observabilité minimale ; documentation mise à jour.

Validation et approbations
- Sign-offs produit, technique, sécurité/DSI ; change management documenté ; plan de communication.

Tableau 20 — Tableau de jalons (date, livrable, responsable, statut, dépendances)
| Jalons | Date cible | Livrable | Responsable | Statut | Dépendances |
|---|---|---|---|---|---|
| M0 | S0 fin | Schema v0 ; CI/CD | Tech Lead/DBA | À venir | — |
| M1 | S1 fin | Auth/profils | Back-end/UX | À venir | M0 |
| M2 | S2 fin | CRUD | Back-end/DBA | À venir | M1 |
| M3 | S3 fin | Storage | Back-end/DevOps | À venir | M2 |
| M4 | S4 fin | Realtime | Front/Back | À venir | M3 |
| M5 | S5 fin | Edge ; observabilité | Back/DevOps | À venir | M4 |
| M6 | S6 fin | Go-Live | Direction | À venir | M5 |

Analyse
- La chaîne de dépendances et les sign-offs formels renforcent la gouvernance. Les jalons sont atteints sur preuves (rapports de tests, métriques, documentation), non sur promesses[^6][^8].

---

## 15. Annexes

Glossaire
- RLS (Row-Level Security) : sécurité au niveau des lignes dans PostgreSQL, qui limite l’accès aux enregistrements selon des politiques.
- PostgREST : serveur qui expose une base Postgres en API REST/GraphQL.
- Realtime : moteur WebSocket pour diffuser changements de base et présence.
- Edge Functions : fonctions serverless (Deno) pour logique légère côté serveur.
- Supavisor : pooler de connexions Postgres multi-tenant.

Liste des endpoints (REST/GraphQL)
- REST : /profiles, /resources, /preferences, /messages, /audit_log.
- GraphQL : queries/mutations équivalentes ; pagination côté serveur.

Exemples de politiques RLS et templates
- Profiles : SELECT/UPDATE WHERE id = auth.uid() ; admin override.
- Resources : SELECT/UPDATE/DELETE WHERE owner_id = auth.uid() ; admin override.
- Audit_log : INSERT par back-end ; SELECT admin.

Checklist Go-Live et post-déploiement
- Migrations vérifiées ; tests e2e verts ; RLS active ; clés pivotées ; pg_stat_statements activé ; logs configurés ; alertes.
- Plan de communication ; runbooks ; monitoring intensif 72h.

Tableau 21 — Checklist Go-Live (items, responsables, preuves, statuts)
| Item | Responsable | Preuve | Statut |
|---|---|---|---|
| Migrations validées | DBA | Rapport CI | À venir |
| RLS active | Back-end | Tests intégration | À venir |
| Clés pivotées | DevOps | Journal rotation | À venir |
| pg_stat_statements | DBA | Vue requêtes lentes | À venir |
| Alertes configurées | DevOps | Dashboard ; test alerte | À venir |
| Runbooks | Tech Lead | Docs ; rehearsal | À venir |

Analyse
- Les annexes servent de guide opératoire. La checklist formalise les conditions minimales de mise en production ; les runbooks et la rehearsals réduisent le temps de réponse en cas d’incident[^1][^2][^4].

---

## Références

[^1]: Supabase Docs — Architecture. https://supabase.com/docs/guides/getting-started/architecture  
[^2]: Supabase Docs — REST API (PostgREST). https://supabase.com/docs/guides/api  
[^3]: Supabase Docs — Auth architecture (GoTrue). https://supabase.com/docs/guides/auth/architecture  
[^4]: Best Practices for Securing and Scaling Supabase for Production Data Workloads (Medium). https://medium.com/@firmanbrilian/best-practices-for-securing-and-scaling-supabase-for-production-data-workloads-4394aba9e868  
[^5]: Figma Resource Library — What is Wireframing? https://www.figma.com/resource-library/what-is-wireframing/  
[^6]: Document360 — Guide du document de spécifications techniques. https://document360.com/fr/blog/document-de-specification-techniques/  
[^7]: Appvizer — Comment faire un cahier des charges ? https://www.appvizer.fr/magazine/operations/gestion-de-projet/cahier-des-charges  
[^8]: Justinmind — Spécification fonctionnelle : guide complet. https://www.justinmind.com/fr/blog/specification-fonctionnelle-documentation/  
[^9]: Supabase Docs — Build a Supabase Integration. https://supabase.com/docs/guides/integrations/build-a-supabase-integration  
[^10]: PostgREST — Documentation officielle. https://postgrest.org/  
[^11]: Supabase Docs — Realtime. https://supabase.com/docs/guides/realtime  
[^12]: Supabase Docs — Storage API Reference. https://supabase.com/docs/reference/storage  
[^13]: Deno — Runtime officiel. https://deno.land/  
[^14]: Kong — API Gateway Documentation. https://docs.konghq.com/  
[^15]: Supavisor — Pooler de connexions. https://supabase.github.io/supavisor/  
[^16]: Justinmind — What is a wireframe? https://www.justinmind.com/wireframe  
[^17]: UXPin — What is a wireframe? https://www.uxpin.com/studio/ui-design/what-is-a-wireframe-designing-your-ux-backbone/