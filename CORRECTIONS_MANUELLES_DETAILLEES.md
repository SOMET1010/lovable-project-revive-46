# 📝 CORRECTIONS MANUELLES - 5 FICHIERS

## 🎯 CORRECTION GLOBALE
**🔍 Rechercher:** `.in('status', ['disponible', 'available'])`
**🔄 Remplacer par:** `.eq('status', 'disponible')`

---

## 📂 FICHIER 1: propertyRepository.ts
**Chemin:** `src/api/repositories/propertyRepository.ts`
**URL GitHub:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/api/repositories/propertyRepository.ts

### Corrections (3 occurrences):
1. Ligne avec `.filter('status', 'in', ['disponible', 'available'])` → `.filter('status', 'eq', 'disponible')`
2. Ligne avec `.filter('status', 'in', ['disponible', 'available'])` → `.filter('status', 'eq', 'disponible')`
3. Ligne avec `.filter('status', 'in', ['disponible', 'available'])` → `.filter('status', 'eq', 'disponible')`

---

## 📂 FICHIER 2: useInfiniteProperties.ts
**Chemin:** `src/features/property/hooks/useInfiniteProperties.ts`
**URL GitHub:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/features/property/hooks/useInfiniteProperties.ts

### Corrections (2 occurrences):
1. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`
2. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`

---

## 📂 FICHIER 3: HomePage.tsx
**Chemin:** `src/features/property/pages/HomePage.tsx`
**URL GitHub:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/features/property/pages/HomePage.tsx

### Corrections (2 occurrences):
1. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`
2. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`

---

## 📂 FICHIER 4: SearchPropertiesPage.tsx
**Chemin:** `src/features/tenant/pages/SearchPropertiesPage.tsx`
**URL GitHub:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/features/tenant/pages/SearchPropertiesPage.tsx

### Corrections (1 occurrence):
1. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`

---

## 📂 FICHIER 5: recommendationEngine.ts
**Chemin:** `src/services/ai/recommendationEngine.ts`
**URL GitHub:** https://github.com/SOMET1010/MONTOITVPROD/edit/MONTOIT-STABLE/main/src/services/ai/recommendationEngine.ts

### Corrections (6 total):
**A. Requêtes à corriger (5 occurrences):**
1. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`
2. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`
3. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`
4. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`
5. Ligne avec `.eq('status', 'in', ['disponible', 'available'])` → `.eq('status', 'disponible')`

**B. Condition à corriger (1 occurrence):**
```javascript
// À REMPLACER:
if (status && ['disponible', 'available'].includes(status)) {

// PAR:
if (status === 'disponible') {
```

---

## ✅ RÉSUMÉ DES CORRECTIONS
- **Fichiers:** 5
- **Corrections totales:** 14
- **Type:** Remplacement de requêtes Supabase
- **Objectif:** Éliminer les erreurs HTTP 400

## 🚀 MESSAGE DE COMMIT
```
Fix Supabase HTTP 400 errors - change status query from .in() to .eq()
```