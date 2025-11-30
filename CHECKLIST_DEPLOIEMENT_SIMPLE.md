# ✅ CHECKLIST DÉPLOIEMENT MONTOIT

**Version**: 3.3.0
**Temps estimé**: 30 minutes
**Difficulté**: ⭐⭐ (Facile)

---

## 🎯 AVANT DE COMMENCER

### Vous Avez Besoin De:
```
□ Node.js installé (v20+)
□ Compte Supabase (gratuit)
□ Éditeur de code (VS Code)
□ Terminal/Console
```

---

## 📋 ÉTAPE PAR ÉTAPE

### 1️⃣ Configuration Environnement (5 min)

```bash
# Dans le dossier du projet
cd /chemin/vers/montoit

# Créer fichier .env
cp .env.example .env
```

**Éditez `.env`** et remplissez **MINIMUM ces 2 lignes**:
```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_publique
```

**Où trouver ces valeurs ?**
1. Allez sur https://supabase.com
2. Votre projet → Settings → API
3. Copiez "Project URL" et "anon public"

---

### 2️⃣ Installation (3 min)

```bash
# Installer dépendances
npm install

# Vérifier installation
npm run typecheck
```

**Résultat attendu**: ✅ Pas d'erreurs

---

### 3️⃣ Test Local (2 min)

```bash
# Démarrer serveur développement
npm run dev
```

**Ouvrir**: http://localhost:5173

**Vérifier**:
```
□ Page d'accueil s'affiche
□ Hero avec diaporama fonctionne
□ Menu hamburger cliquable
□ Recherche accessible
□ Pas d'erreur console (F12)
```

---

### 4️⃣ Build Production (2 min)

```bash
# Arrêter serveur dev (Ctrl+C)

# Build production
npm run build
```

**Résultat attendu**:
```
✓ built in 25s
```

---

### 5️⃣ Déploiement (10 min)

#### Option A: Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Suivre les instructions:
? Set up and deploy? Yes
? Which scope? [Votre compte]
? Link to existing project? No
? What's your project's name? montoit
? In which directory is your code? ./
? Want to override the settings? No
```

**Ajouter variables d'environnement**:
1. Dashboard Vercel → Votre projet
2. Settings → Environment Variables
3. Ajouter `VITE_SUPABASE_URL`
4. Ajouter `VITE_SUPABASE_ANON_KEY`
5. Redéployer

#### Option B: Netlify

```bash
# Build déjà fait (étape 4)

# Aller sur netlify.com
# Sites → Add new site → Deploy manually
# Glisser-déposer le dossier dist/
```

**Ajouter variables**:
1. Site settings → Environment variables
2. Ajouter les mêmes variables

---

### 6️⃣ Vérification Finale (5 min)

**Tester votre site en ligne**:
```
□ URL accessible (https://montoit-xxx.vercel.app)
□ Page d'accueil charge
□ Navigation fonctionne
□ Recherche affiche propriétés
□ Images s'affichent
□ Formulaires soumettent
```

---

### 7️⃣ Monitoring (5 min - Optionnel)

**Sentry** (Erreurs):
```bash
# Dans .env
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**Google Analytics**:
```bash
# Dans .env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Redéployer après ajout**:
```bash
vercel --prod
```

---

## 🎉 C'EST FINI !

### Votre Plateforme Est En Ligne ! 🚀

**URL**: https://votre-montoit.vercel.app

**Partagez**:
- Facebook
- LinkedIn
- WhatsApp
- Twitter/X

---

## 🐛 DÉPANNAGE RAPIDE

### ❌ "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Missing environment variables"
**Solution**: Vérifiez que `.env` existe avec les 2 variables

### ❌ Page blanche en production
**Solution**: Vérifiez variables d'environnement sur Vercel/Netlify

### ❌ Build échoue
```bash
npm run lint:fix
npm run build
```

---

## 📞 AIDE

### Documents
- `GUIDE_DEMARRAGE_RAPIDE.md` - Guide détaillé
- `RESUME_EXECUTIF_FINAL.md` - Vue d'ensemble
- `AUDIT_COMPLET_PRODUCTION_READY.md` - Audit technique

### Commandes Utiles
```bash
npm run dev          # Développement
npm run build        # Build production
npm run lint         # Vérifier code
npm run typecheck    # Vérifier types
```

---

## ✅ CHECKLIST COMPLÈTE

### Avant Production
```
✅ .env créé et configuré
✅ npm install réussi
✅ npm run dev fonctionne
✅ npm run build réussi
✅ Tests manuels OK
```

### Déploiement
```
✅ Site déployé (Vercel/Netlify)
✅ Variables d'env configurées
✅ URL accessible publiquement
✅ Toutes pages testées
```

### Après Production
```
□ Monitoring configuré (Sentry/GA)
□ 5-10 beta testers invités
□ Feedback collecté
□ Corrections mineures faites
```

---

**Temps total**: ~30 minutes
**Résultat**: Site en ligne opérationnel ✅

**Bon déploiement ! 🎉**
