# Rapport de Recherche : URLs de Déploiement MONTOIT Alternatives

## Résumé Exécutif

Cette recherche a identifié plusieurs plateformes de déploiement et URLs alternatives pour le projet MONTOIT-STABLE. L'analyse du repository GitHub révèle une architecture de déploiement multi-plateforme avec plusieurs options configurées.

## Plateformes de Déploiement Identifiées

### 1. Netlify (Plateforme Principale)
- **Statut** : Prévu pour staging et production
- **URL de Production** : `montoitv35.netlify.app` (prévue)
- **Configuration** : Intégration CI/CD via GitHub Actions
- **Commandes** : `netlify login` et `netlify deploy --prod --dir=dist`

### 2. Vercel (Option Alternative)
- **Statut** : Configuré comme Option A dans la documentation
- **Intégration** : Workflow GitHub Actions configuré
- **Commandes** : `vercel login` et `vercel --prod`
- **Secrets requis** : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### 3. Serveur VPS/Nginx (Option Manuelle)
- **Statut** : Option C pour déploiement manuel
- **Configuration** : Guide complet avec certificats SSL Let's Encrypt
- **Répertoire** : `/var/www/montoit/dist`
- **Fonctionnalités** : Compression Gzip, cache des assets, fallback SPA

### 4. Supabase (Backend)
- **Statut** : Utilisé pour la base de données et Edge Functions
- **URLs** : 
  - Tableau de bord : `https://app.supabase.com`
  - Projet spécifique : `https://wsuarbcmxywcwcpaklxw.supabase.co`
- **Edge Functions** : `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-whatsapp-otp`

### 5. Azure (Tests)
- **Statut** : Usage implicite pour tests
- **Référence** : Script `test-azure-deployments.sh`
- **Configuration** : Azure OpenAI pour les Edge Functions

## URLs de Déploiement Confirmées

### Production
- **Domaine recommandé** : `https://montoit.app`
- **Netlify (prévu)** : `https://montoitv35.netlify.app`

### Services Associés
- **Supabase Dashboard** : `https://app.supabase.com`
- **InTouch API** : `https://api.intouch.ci`
- **Azure OpenAI** : `https://dtdi-ia-test.openai.azure.com/`

## Configuration CI/CD

### GitHub Actions
- **Workflow** : Configuration automatisée pour test, build et déploiement
- **Déploiement** : Push vers `develop` → staging, merge vers `main` → production
- **Intégrations** : Vercel configuré pour les déploiements automatisés

### Badges de Déploiement
- **GitHub Actions** : `[![GitHub Actions](https://github.com/your-org/mon-toit/actions)](https://github.com/your-org/mon-toit/actions)`
- **Statut** : Badge placeholders configurés dans le README

## Scripts et Documentation de Déploiement

### Scripts Disponibles
- `deploy-chatbot.sh`
- `deploy-production-secure.sh`
- `deploy-production.sh`
- `test-azure-deployments.sh`

### Guides de Déploiement
- `GUIDE_DEPLOIEMENT_PRODUCTION.md` (document principal)
- `GUIDE_AJOUT_WORKFLOW_CI_CD.md`
- `GUIDE_DEPLOIEMENT_BOLT.md`
- `GUIDE_DEPLOIEMENT_CHATBOT_SUTA.md`
- `README_DEPLOIEMENT_CHATBOT.md`

## Variables d'Environnement de Production

### Services Principaux
```env
VITE_SUPABASE_URL=https://wsuarbcmxywcwcpaklxw.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NODE_ENV=production
VITE_ENVIRONMENT=production
```

### Services Externes
```env
INTOUCH_API_URL=https://api.intouch.ci
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id_here
```

## Monitoring et Analytics

### Outils Configurés
- **Sentry** : Monitoring des erreurs
- **Google Analytics** : Suivi des utilisateurs (`G-XXXXXXXXXX`)
- **Supabase Analytics** : Analytics base de données et API
- **Uptime Monitoring** : UptimeRobot, Pingdom, StatusCake

### URLs de Surveillance
- **Production** : `https://montoit.app`
- **Test SSL** : `https://www.ssllabs.com/ssltest/analyze.html?d=montoit.app`

## Recommandations

1. **Plateforme Prioritaire** : Netlify semble être la plateforme principale configurée
2. **Domaine** : Le domaine recommandé `montoit.app` devrait être configuré
3. **CI/CD** : GitHub Actions est bien configuré pour l'automatisation
4. **Monitoring** : Système complet de monitoring déjà en place
5. **Documentation** : Guides détaillés disponibles pour tous les types de déploiement

## Conclusion

Le projet MONTOIT-STABLE dispose d'une architecture de déploiement robuste avec plusieurs alternatives configurées. La plateforme Netlify apparaît comme la solution principale, avec Vercel comme alternative viable et la possibilité d'un déploiement VPS pour plus de contrôle. La configuration CI/CD via GitHub Actions assure une automatisation complète du processus de déploiement.