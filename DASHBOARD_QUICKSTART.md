# Démarrage Rapide - Dashboard Utilisateur MONTOIT

## En 3 étapes simples

### Étape 1: Appliquer la Migration SQL (2 minutes)

1. Ouvrez [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet MONTOIT
3. Allez dans **SQL Editor**
4. Cliquez sur **New Query**
5. Copiez-collez le contenu de `supabase/migrations/20251130000000_add_search_history_table.sql`
6. Cliquez sur **Run**
7. Vérifiez qu'il n'y a pas d'erreur

### Étape 2: Vérifier le Bucket Storage (1 minute)

1. Dans Supabase Dashboard, allez dans **Storage**
2. Vérifiez qu'un bucket `user-content` existe
3. Si non, créez-le:
   - Cliquez sur **New bucket**
   - Nom: `user-content`
   - Public bucket: **Oui**
   - Cliquez sur **Create bucket**

### Étape 3: Déployer (selon votre plateforme)

#### Option A: Déploiement sur Bolt (Recommandé)

1. Ouvrez votre projet sur Bolt.new
2. Les fichiers sont déjà présents dans le repository
3. Bolt détectera automatiquement les changements
4. Attendez le build automatique
5. C'est prêt!

#### Option B: Déploiement Local/Autre

```bash
cd /path/to/MONTOITVPROD
pnpm install
pnpm build
```

Déployez le dossier `dist/` sur votre hébergement.

## Test Rapide

1. Connectez-vous sur https://votre-site.com
2. Allez sur https://votre-site.com/dashboard
3. Vous devriez voir votre dashboard avec 4 onglets

## C'est tout!

Le dashboard est maintenant opérationnel. Pour plus de détails:
- Documentation complète: `DASHBOARD_USER_README.md`
- Checklist de validation: `DASHBOARD_DEPLOYMENT_CHECKLIST.md`

## Intégration Optionnelle

### Ajouter un lien "Mon Dashboard" dans la navigation

Modifiez votre fichier de navigation (ex: `Header.tsx`):

```typescript
import { Link } from 'react-router-dom';

// Dans votre navigation
<Link to="/dashboard" className="nav-link">
  Mon Dashboard
</Link>
```

### Auto-remplir l'historique de recherche

Dans votre page de recherche, après une recherche réussie:

```typescript
import { addSearchToHistory } from '@/services/userDashboardService';

// Après avoir obtenu les résultats
await addSearchToHistory(searchParams, results.length);
```

## Support

Besoin d'aide?
1. Consultez `DASHBOARD_USER_README.md`
2. Vérifiez `DASHBOARD_DEPLOYMENT_CHECKLIST.md`
3. Consultez les logs Supabase
4. Vérifiez la console du navigateur

---

**Temps total d'installation: ~5 minutes**
