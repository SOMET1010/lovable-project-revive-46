# Gestionnaire de Propriétés Propriétaires - MONTOIT

## Vue d'ensemble

Le **Gestionnaire de Propriétés Propriétaires** est un système complet permettant aux propriétaires et agences de gérer efficacement leurs biens immobiliers sur la plateforme MONTOIT. Il offre des fonctionnalités avancées de création, édition, suivi des performances et gestion des candidatures.

**Date de développement**: 2025-11-30  
**Version**: Sprint 3

---

## Architecture

### Structure des fichiers

```
src/features/owner/
├── pages/
│   ├── DashboardPage.tsx         # Dashboard principal propriétaire (517 lignes)
│   ├── AddPropertyPage.tsx       # Création de propriété (616 lignes)
│   └── EditPropertyPage.tsx      # Édition de propriété (773 lignes) ✨ NOUVEAU
│
src/features/property/
├── pages/
│   └── PropertyStatsPage.tsx     # Statistiques détaillées (369 lignes)
│
supabase/migrations/
└── 20251029172620_add_dashboard_analytics_tables.sql
```

### Stack technique

- **Framework**: React 18.3 + TypeScript 5.5
- **Base de données**: Supabase (PostgreSQL)
- **Routage**: React Router DOM
- **Styling**: Design tokens CSS + Tailwind
- **Icônes**: Lucide React
- **Build**: Vite 5.4

---

## Fonctionnalités principales

### 1. Dashboard Propriétaire (`DashboardPage.tsx`)

**Statistiques en temps réel:**
- Nombre total de propriétés
- Propriétés actives / louées
- Vues totales sur toutes les propriétés
- Candidatures en attente
- Messages non lus
- Visites à venir
- Revenus mensuels et projetés

**Gestion des propriétés:**
- Liste complète des propriétés avec filtres
- Actions rapides: Modifier, Voir stats, Voir annonce
- Indicateurs visuels de statut (disponible, loué, retiré)
- Navigation fluide vers les pages d'édition

**Gestion des candidatures:**
- Tri par score ou date
- Affichage du scoring automatique
- Filtrage par statut
- Accès rapide aux profils candidats

**Routes:**
- `/dashboard/proprietaire` - Dashboard principal

---

### 2. Création de propriété (`AddPropertyPage.tsx`)

**Formulaire multi-sections:**

**a) Informations générales**
- Titre de l'annonce
- Description détaillée
- Catégorie (résidentiel / commercial)
- Type de bien (appartement, maison, villa, studio, bureau, local commercial, etc.)
- Statut (disponible, loué, en attente, retiré)

**b) Localisation**
- Adresse complète
- Ville
- Quartier

**c) Caractéristiques**
- Nombre de chambres
- Nombre de salles de bain
- Surface en m²
- Équipements: Parking, Jardin, Meublé, Climatisé

**d) Tarification**
- Loyer mensuel (FCFA)
- Montant de la caution
- Charges mensuelles

**e) Upload de photos**
- Maximum 10 images
- Formats: JPG, PNG, WebP
- Upload vers Supabase Storage (`property-images`)
- Première image = image principale

**Validation:**
- Champs obligatoires marqués (*)
- Vérification des formats numériques
- Limite d'images respectée
- Messages d'erreur explicites

**Routes:**
- `/ajouter-propriete` - Formulaire de création

---

### 3. Édition de propriété (`EditPropertyPage.tsx`) ✨ NOUVEAU

**Fonctionnalités complètes:**

**a) Chargement des données**
- Récupération de la propriété depuis Supabase
- Vérification de propriété (owner_id)
- Redirection si non autorisé
- État de chargement avec loader

**b) Gestion des images avancée**

**Images existantes:**
- Affichage en grille (2x4 sur mobile/desktop)
- Indication de l'image principale
- Suppression avec confirmation visuelle
- Restauration des images marquées pour suppression
- Icône de corbeille au survol

**Nouvelles images:**
- Upload multiple de nouvelles photos
- Prévisualisation avant enregistrement
- Limite de 10 images au total
- Suppression des nouvelles images avant upload

**Processus d'upload:**
```typescript
1. Validation du nombre total d'images
2. Upload des nouvelles images vers Supabase Storage
3. Suppression des images marquées pour suppression
4. Construction du tableau final des URLs
5. Mise à jour de la propriété avec le nouveau tableau
```

**c) Édition complète du formulaire**
- Tous les champs modifiables
- Changement de statut (disponible → loué → retiré)
- Modification des équipements
- Ajustement des prix
- Mise à jour de la localisation

**d) Validation et enregistrement**
- Vérification des champs obligatoires
- Gestion des erreurs d'upload
- Message de succès
- Redirection automatique vers le dashboard

**Routes:**
- `/dashboard/propriete/:id/modifier` - Édition de propriété

**Code clé - Gestion des images:**
```typescript
// Supprimer image existante (marquer pour suppression)
const removeExistingImage = (imageUrl: string) => {
  setImagesToDelete([...imagesToDelete, imageUrl]);
};

// Restaurer image marquée
const restoreImage = (imageUrl: string) => {
  setImagesToDelete(imagesToDelete.filter(url => url !== imageUrl));
};

// Upload nouvelles images
const uploadNewImages = async (): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  for (const file of imageFiles) {
    const fileName = `${propertyId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `properties/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);
    
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);
    
    uploadedUrls.push(publicUrl);
  }
  return uploadedUrls;
};

// Construction du tableau final
const finalImages = [
  ...existingImages.filter(url => !imagesToDelete.includes(url)),
  ...newImageUrls,
];
```

---

### 4. Statistiques de propriété (`PropertyStatsPage.tsx`)

**Métriques détaillées:**
- Vues totales et évolution
- Favoris et sauvegarde de recherches
- Candidatures reçues
- Taux de conversion
- Graphiques de tendance

**Analytics:**
- Graphiques de performances temporelles
- Comparaison avec le marché
- Export de rapports (à venir)

**Routes:**
- `/propriete/:id/statistiques` - Page de statistiques

---

## Base de données

### Tables principales

**`properties`**
```sql
- id: uuid (PK)
- owner_id: uuid (FK → profiles)
- title: text
- description: text
- address: text
- city: text
- neighborhood: text
- property_type: property_type_enum
- property_category: text ('residentiel' | 'commercial')
- bedrooms: integer
- bathrooms: integer
- surface_area: numeric
- monthly_rent: numeric
- deposit_amount: numeric
- charges_amount: numeric
- has_parking: boolean
- has_garden: boolean
- is_furnished: boolean
- has_ac: boolean
- status: text ('disponible' | 'loue' | 'en_attente' | 'retire')
- images: text[] (URLs Supabase Storage)
- main_image: text
- view_count: integer (default: 0)
- created_at: timestamp
- updated_at: timestamp
```

**`property_views`**
```sql
- id: uuid (PK)
- property_id: uuid (FK → properties)
- user_id: uuid (FK → profiles, nullable)
- viewed_at: timestamp
- session_id: text
```

**`property_statistics`**
```sql
- id: uuid (PK)
- property_id: uuid (FK → properties)
- date: date
- views: integer
- favorites: integer
- applications: integer
- contact_requests: integer
```

**`rental_applications`**
```sql
- id: uuid (PK)
- property_id: uuid (FK → properties)
- applicant_id: uuid (FK → profiles)
- status: text ('en_attente' | 'accepte' | 'refuse')
- application_score: integer (0-100)
- monthly_income: numeric
- current_location: text
- move_in_date: date
- message: text
- created_at: timestamp
```

### Fonctions SQL

**`get_owner_dashboard_stats(owner_uuid)`**
- Retourne les statistiques globales du propriétaire
- Agrégation de toutes les métriques

**`get_property_conversion_rate(property_uuid)`**
- Calcule le taux de conversion (vues → candidatures)

### Stockage Supabase

**Bucket: `property-images`**
- Accès: Public
- Structure: `properties/{propertyId}_{timestamp}_{random}.{ext}`
- Formats acceptés: JPG, PNG, WebP
- Limite: 10 images par propriété

**Configuration RLS (Row Level Security):**
```sql
-- Propriétaires peuvent voir, créer, modifier leurs propriétés
CREATE POLICY "Owners can manage their properties"
ON properties FOR ALL
USING (auth.uid() = owner_id);

-- Upload d'images autorisé pour propriétaires authentifiés
CREATE POLICY "Owners can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');
```

---

## Flux utilisateur

### Scénario 1: Créer une nouvelle propriété

1. Propriétaire clique sur "Ajouter une propriété" depuis le dashboard
2. Remplit le formulaire multi-sections
3. Upload jusqu'à 10 photos
4. Soumet le formulaire
5. Système:
   - Upload les images vers Supabase Storage
   - Crée l'entrée dans `properties`
   - Définit la première image comme `main_image`
6. Redirection vers le dashboard avec message de succès

### Scénario 2: Modifier une propriété existante ✨ NOUVEAU

1. Propriétaire clique sur "Modifier" depuis le dashboard
2. Système charge les données de la propriété
3. Vérifie la propriété (owner_id)
4. Affiche le formulaire pré-rempli avec images existantes
5. Propriétaire peut:
   - Modifier tous les champs
   - Supprimer des images existantes (marquage visuel)
   - Ajouter de nouvelles images
   - Restaurer des images marquées pour suppression
   - Changer le statut
6. Soumet les modifications
7. Système:
   - Upload les nouvelles images
   - Supprime les images marquées du Storage
   - Met à jour l'entrée `properties`
   - Reconstruit le tableau `images` et `main_image`
8. Redirection avec confirmation

### Scénario 3: Consulter les statistiques

1. Propriétaire clique sur "Voir stats" depuis le dashboard
2. Accède à PropertyStatsPage
3. Visualise:
   - Graphiques de vues temporelles
   - Métriques de performance
   - Taux de conversion
4. Peut exporter les rapports (fonctionnalité future)

---

## Utilisation des composants

### Exemple: Bouton de modification dans le dashboard

```tsx
import { Edit } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

<Button
  size="sm"
  variant="outline"
  onClick={() => window.location.href = `/dashboard/propriete/${property.id}/modifier`}
>
  <Edit className="h-4 w-4" />
  Modifier
</Button>
```

### Exemple: Upload d'images dans EditPropertyPage

```tsx
<label className="btn-secondary inline-flex items-center cursor-pointer">
  <Upload className="h-5 w-5 mr-2" />
  Ajouter des photos
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageSelect}
    className="hidden"
  />
</label>
```

### Exemple: Affichage conditionnel d'image principale

```tsx
{index === 0 && !imagesToDelete.includes(url) && (
  <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded">
    Principale
  </span>
)}
```

---

## Tests

### Tests manuels requis

**1. Création de propriété**
```
✅ Formulaire se charge correctement
✅ Validation des champs obligatoires
✅ Upload de 1 image fonctionne
✅ Upload de 10 images fonctionne
✅ Upload de 11 images est bloqué avec message
✅ Propriété créée apparaît dans le dashboard
✅ Images sont accessibles via URLs Supabase
✅ Image principale est définie correctement
```

**2. Édition de propriété** ✨ NOUVEAU
```
✅ Chargement des données existantes
✅ Vérification de propriété (owner_id)
✅ Redirection si non autorisé
✅ Images existantes affichées
✅ Suppression d'image existante (marquage visuel)
✅ Restauration d'image marquée
✅ Ajout de nouvelles images
✅ Prévisualisation des nouvelles images
✅ Validation limite 10 images total
✅ Suppression de nouvelle image avant upload
✅ Modification de tous les champs
✅ Changement de statut
✅ Enregistrement avec succès
✅ Images supprimées retirées du Storage
✅ Nouvelles images uploadées au Storage
✅ Tableau final d'images correctement construit
✅ Redirection vers dashboard après succès
```

**3. Dashboard propriétaire**
```
✅ Statistiques chargées correctement
✅ Liste des propriétés affichée
✅ Bouton "Modifier" redirige vers EditPropertyPage
✅ Bouton "Voir stats" redirige vers PropertyStatsPage
✅ Filtres fonctionnels
✅ Candidatures affichées avec scoring
```

**4. Statistiques**
```
✅ Métriques chargées pour la propriété
✅ Graphiques rendus correctement
✅ Taux de conversion calculé
```

### Tests unitaires (à implémenter)

```typescript
// EditPropertyPage.test.tsx
describe('EditPropertyPage', () => {
  it('should load property data on mount', async () => {
    // Test chargement des données
  });

  it('should validate ownership before allowing edit', async () => {
    // Test vérification owner_id
  });

  it('should handle image deletion', () => {
    // Test marquage image pour suppression
  });

  it('should prevent uploading more than 10 total images', () => {
    // Test limite d'images
  });

  it('should upload new images and delete marked images on submit', async () => {
    // Test processus complet de sauvegarde
  });
});
```

---

## Gestion des erreurs

### Messages d'erreur utilisateur

**Création/Édition:**
- `"Veuillez remplir tous les champs obligatoires"` - Validation formulaire
- `"Maximum 10 images au total"` - Limite d'images dépassée
- `"Erreur lors de l'upload des images"` - Échec upload Supabase
- `"Une erreur est survenue"` - Erreur générique

**Chargement:**
- `"Erreur lors du chargement de la propriété"` - Échec récupération
- `"Propriété non trouvée"` - ID invalide
- `"Vous n'êtes pas autorisé à modifier cette propriété"` - owner_id ne correspond pas

### Gestion technique

```typescript
try {
  // Opération Supabase
} catch (err) {
  console.error('Erreur détaillée:', err);
  setError(err instanceof Error ? err.message : 'Une erreur est survenue');
} finally {
  setLoading(false);
}
```

---

## Optimisations & bonnes pratiques

### Performance

1. **Chargement lazy des images**
   ```tsx
   <img loading="lazy" src={imageUrl} alt="..." />
   ```

2. **Nettoyage des URLs d'objets**
   ```typescript
   useEffect(() => {
     return () => {
       imagePreviews.forEach(url => URL.revokeObjectURL(url));
     };
   }, [imagePreviews]);
   ```

3. **Requêtes optimisées**
   ```typescript
   // Sélection uniquement des champs nécessaires
   .select('id, title, status, view_count, created_at')
   ```

### Sécurité

1. **Vérification de propriété**
   ```typescript
   if (data.owner_id !== user?.id) {
     alert('Vous n\'êtes pas autorisé à modifier cette propriété');
     window.location.href = '/dashboard/proprietaire';
     return;
   }
   ```

2. **RLS Supabase**
   - Politiques strictes au niveau base de données
   - Double vérification frontend + backend

3. **Validation des uploads**
   - Formats d'images acceptés: `accept="image/*"`
   - Limite de taille gérée par Supabase Storage

### UX

1. **États de chargement**
   ```tsx
   {saving && <Loader2 className="animate-spin" />}
   ```

2. **Feedback visuel**
   - Messages de succès/erreur
   - Désactivation des boutons pendant l'upload
   - Indicateurs de progression

3. **Accessibilité**
   - Labels descriptifs
   - Attributs ARIA
   - Navigation au clavier

---

## Évolutions futures

### Fonctionnalités planifiées

1. **Wizard multi-étapes pour création**
   - Étape 1: Informations générales
   - Étape 2: Localisation
   - Étape 3: Caractéristiques
   - Étape 4: Tarification
   - Étape 5: Photos
   - Étape 6: Récapitulatif

2. **Duplication de propriété**
   ```typescript
   const duplicateProperty = async (propertyId: string) => {
     // Copier toutes les données sauf ID et dates
     // Permettre modifications avant création
   };
   ```

3. **Gestion avancée des photos**
   - Drag & drop pour réorganiser
   - Crop/resize intégré
   - Compression automatique
   - Watermark optionnel

4. **Export de rapports**
   - PDF avec statistiques
   - CSV des candidatures
   - Envoi par email

5. **Notifications**
   - Nouvelle candidature
   - Visite programmée
   - Message reçu
   - Seuil de vues atteint

6. **Calendrier de visites**
   - Gestion des disponibilités
   - Confirmation automatique
   - Rappels

---

## Dépannage

### Problèmes courants

**1. Images ne s'uploadent pas**
```
Vérifier:
- Bucket 'property-images' existe dans Supabase Storage
- Politiques RLS permettent l'upload (authenticated users)
- Format d'image valide (JPG, PNG, WebP)
- Taille de fichier < limite Supabase
```

**2. Propriété ne se charge pas dans EditPropertyPage**
```
Vérifier:
- L'ID dans l'URL est valide
- L'utilisateur est bien le propriétaire (owner_id)
- La propriété existe dans la base de données
- Les logs console pour erreurs Supabase
```

**3. Redirection après connexion**
```
Si user_type !== 'proprietaire' && !== 'agence':
→ Redirection vers '/'

Solution: Vérifier le profil utilisateur dans la table 'profiles'
```

**4. Images supprimées ne disparaissent pas du Storage**
```
Vérifier:
- La fonction deleteRemovedImages() est bien appelée
- Le chemin extrait de l'URL est correct
- Les politiques RLS permettent la suppression
```

---

## Support & Contact

Pour toute question ou problème concernant le Gestionnaire de Propriétés Propriétaires:

- **Documentation technique**: `/docs`
- **Repository GitHub**: https://github.com/SOMET1010/MONTOITVPROD
- **Logs Supabase**: Vérifier dans le dashboard Supabase → Logs

---

## Changelog

### Sprint 3 (2025-11-30) ✨ NOUVEAU
- ✅ Ajout de `EditPropertyPage.tsx` (773 lignes)
- ✅ Gestion avancée des images (suppression, ajout, restauration)
- ✅ Validation de propriété (owner_id)
- ✅ Mise à jour complète du formulaire
- ✅ Integration avec Supabase Storage
- ✅ Route `/dashboard/propriete/:id/modifier`

### Sprint 2 (précédent)
- ✅ Dashboard utilisateur personnel
- ✅ Favoris, historique, notifications

### Sprint 1 (existant avant intervention)
- ✅ `DashboardPage.tsx` - Dashboard propriétaire
- ✅ `AddPropertyPage.tsx` - Création de propriété
- ✅ `PropertyStatsPage.tsx` - Statistiques
- ✅ Tables: properties, property_views, property_statistics
- ✅ Système de scoring des candidatures
- ✅ Gestion des visites

---

## Annexes

### Types TypeScript

```typescript
// Database types
type Property = Database['public']['Tables']['properties']['Row'];
type PropertyType = Database['public']['Tables']['properties']['Row']['property_type'];

// Form data
interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  neighborhood: string;
  property_type: PropertyType;
  property_category: 'residentiel' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  surface_area: string;
  monthly_rent: string;
  deposit_amount: string;
  charges_amount: string;
  has_parking: boolean;
  has_garden: boolean;
  is_furnished: boolean;
  has_ac: boolean;
  status: 'disponible' | 'loue' | 'en_attente' | 'retire';
}
```

### Constantes

```typescript
// app.constants.ts
export const RESIDENTIAL_PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'chambre', label: 'Chambre' },
];

export const COMMERCIAL_PROPERTY_TYPES = [
  { value: 'bureau', label: 'Bureau' },
  { value: 'local_commercial', label: 'Local Commercial' },
  { value: 'entrepot', label: 'Entrepôt' },
  { value: 'terrain', label: 'Terrain' },
];
```

---

**Documentation générée le 2025-11-30**  
**Version: Sprint 3 - Gestionnaire de Propriétés Complet**
