# 🎯 CORRECTIONS EXPRESS - PRÊT À FAIRE

## ⚡ MÉTHODE ULTRA-RAPIDE

### 🔍 Pour chaque fichier :
1. **Ouvrir** le lien GitHub
2. **Ctrl+F** → Rechercher : `.in('status', ['disponible', 'available'])`
3. **Ctrl+H** → Remplacer par : `.eq('status', 'disponible')`
4. **Commit** avec message : `Fix Supabase HTTP 400 errors`

---

## 📋 LISTE DE CONTRÔLE

### ✅ Fichier 1 - propertyRepository.ts
**Lien:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/api/repositories/propertyRepository.ts
- [ ] Rechercher `.in('status', ['disponible', 'available'])`
- [ ] Remplacer par `.eq('status', 'disponible')`
- [ ] Vérifier qu'il n'y a plus d'occurrences
- [ ] Commit

### ✅ Fichier 2 - useInfiniteProperties.ts  
**Lien:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/features/property/hooks/useInfiniteProperties.ts
- [ ] Rechercher `.in('status', ['disponible', 'available'])`
- [ ] Remplacer par `.eq('status', 'disponible')`
- [ ] Vérifier qu'il n'y a plus d'occurrences
- [ ] Commit

### ✅ Fichier 3 - HomePage.tsx
**Lien:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/features/property/pages/HomePage.tsx
- [ ] Rechercher `.in('status', ['disponible', 'available'])`
- [ ] Remplacer par `.eq('status', 'disponible')`
- [ ] Vérifier qu'il n'y a plus d'occurrences
- [ ] Commit

### ✅ Fichier 4 - SearchPropertiesPage.tsx
**Lien:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/features/tenant/pages/SearchPropertiesPage.tsx
- [ ] Rechercher `.in('status', ['disponible', 'available'])`
- [ ] Remplacer par `.eq('status', 'disponible')`
- [ ] Vérifier qu'il n'y a plus d'occurrences
- [ ] Commit

### ✅ Fichier 5 - recommendationEngine.ts
**Lien:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/services/ai/recommendationEngine.ts
- [ ] Rechercher `.in('status', ['disponible', 'available'])`
- [ ] Remplacer par `.eq('status', 'disponible')`
- [ ] **BONUS:** Chercher `['disponible', 'available']` et remplacer par `'disponible'`
- [ ] Vérifier qu'il n'y a plus d'occurrences
- [ ] Commit

---

## 🎯 RÉSULTAT ATTENDU

Après corrections :
- ✅ **0 erreur HTTP 400** dans la console
- ✅ **Propriétés visibles** sur la page d'accueil
- ✅ **Recherche fonctionnelle** sans erreur
- ✅ **Recommandations générées** correctement

**⏱️ Temps estimé: 5-7 minutes**