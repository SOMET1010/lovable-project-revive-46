# INSTRUCTIONS DE DÉPLOIEMENT - CORRECTIONS MONTOIT

## Fichiers Fournis

1. **RAPPORT_CORRECTIONS_MONTOIT.md** - Rapport détaillé des corrections
2. **corrections-montoit.patch** - Patch Git des modifications
3. **corrections-montoit-complete.tar.gz** - Archive des fichiers modifiés

## Option 1: Pousser depuis le Repository Local

Si vous avez déjà le repository cloné:

```bash
# Se placer dans le dossier du projet
cd /path/to/MONTOITVPROD

# Récupérer les dernières modifications (optionnel)
git pull origin main

# Appliquer le patch
git apply /path/to/corrections-montoit.patch

# Vérifier les changements
git status
git diff

# Commiter et pousser
git add .
git commit -m "Fix: Corriger les erreurs Supabase HTTP 400 - Remplacement 'available' par 'disponible'"
git push origin main
```

## Option 2: Modification Manuelle via GitHub Web

1. Aller sur https://github.com/SOMET1010/MONTOITVPROD
2. Pour chaque fichier modifié, cliquer sur le fichier puis "Edit"
3. Appliquer les changements indiqués dans le rapport

### Fichiers à Modifier (5 fichiers):

1. `src/features/property/pages/HomePage.tsx`
2. `src/api/repositories/propertyRepository.ts`
3. `src/features/property/hooks/useInfiniteProperties.ts`
4. `src/features/tenant/pages/SearchPropertiesPage.tsx`
5. `src/services/ai/recommendationEngine.ts`

### Changement Simple à Appliquer:

Remplacer toutes les occurrences de:
```typescript
.in('status', ['disponible', 'available'])
```

Par:
```typescript
.eq('status', 'disponible')
```

Et remplacer:
```typescript
if (property.status === 'disponible' || property.status === 'available')
```

Par:
```typescript
if (property.status === 'disponible')
```

## Option 3: Upload Direct des Fichiers Modifiés

1. Extraire l'archive `corrections-montoit-complete.tar.gz`
2. Uploader les fichiers modifiés sur GitHub
3. Respecter la structure de dossiers existante

## Vérification Post-Déploiement

Une fois le code poussé vers GitHub:

1. **Attendre le redéploiement automatique** (Bolt.host détecte les changements)
2. **Tester le site** à https://somet1010-montoit-st-jcvj.bolt.host
3. **Vérifier:**
   - [ ] Page d'accueil charge les propriétés correctement
   - [ ] Console navigateur sans erreur HTTP 400
   - [ ] Recherche de propriétés fonctionne
   - [ ] Formulaire de contact toujours opérationnel

## En Cas de Problème

Si le déploiement automatique ne se déclenche pas:

1. Vérifier les webhooks GitHub dans les settings du repository
2. Déclencher manuellement un redéploiement sur Bolt.host
3. Contacter le support Bolt.host si nécessaire

## Contact Support

Pour toute question sur les corrections:
- Consulter le fichier RAPPORT_CORRECTIONS_MONTOIT.md
- Reviewer le patch: corrections-montoit.patch
