# 🚀 ROADMAP : Prochaines Étapes - Plateforme MonToit

**Dernière mise à jour** : 26 Novembre 2024
**Version actuelle** : 3.2.3
**Prochaine version** : 3.3.0

---

## 📊 ÉTAT ACTUEL DE LA PLATEFORME

### ✅ Fonctionnalités Complètes
```
✅ HomePage avec 31 propriétés visibles
✅ Page de recherche 100% fonctionnelle
✅ Formulaires de recherche avec validation
✅ Stats réelles depuis Supabase
✅ Configuration SPA (routing)
✅ ErrorBoundary et monitoring
✅ RLS Policies sécurisées
✅ Build production optimisé (21.90s)
```

### ⏳ Points d'Amélioration Identifiés
```
⏳ Pagination (limite actuelle : 100 résultats)
⏳ Cache recherches pour performance
⏳ Autocomplétion villes/quartiers
⏳ Optimisation images (WebP, responsive)
⏳ Tests E2E automatisés
⏳ Dashboard analytics admin
⏳ Recherche géolocalisée
```

---

## 🎯 PLAN D'ACTION : 3 PHASES

### **Phase 1 - Court Terme (1-2 semaines)** ⭐⭐⭐
> **Objectif** : Améliorer l'expérience utilisateur de recherche

| Tâche | Priorité | Complexité | Impact | Temps |
|-------|----------|------------|--------|-------|
| 1. Pagination/Infinite Scroll | Haute | Moyenne | Élevé | 4h |
| 2. Cache localStorage | Haute | Faible | Moyen | 2h |
| 3. Autocomplétion | Moyenne | Moyenne | Élevé | 3h |
| 4. Filtres persistés URL | Moyenne | Faible | Moyen | 1h |

**Total Phase 1** : ~10 heures

---

### **Phase 2 - Moyen Terme (2-4 semaines)** ⭐⭐
> **Objectif** : Performance et qualité du code

| Tâche | Priorité | Complexité | Impact | Temps |
|-------|----------|------------|--------|-------|
| 5. Optimisation images | Haute | Moyenne | Élevé | 6h |
| 6. Tests E2E (Playwright) | Haute | Élevée | Élevé | 8h |
| 7. Dashboard analytics | Moyenne | Élevée | Moyen | 10h |
| 8. Service Worker (offline) | Faible | Élevée | Moyen | 6h |

**Total Phase 2** : ~30 heures

---

### **Phase 3 - Long Terme (1-3 mois)** ⭐
> **Objectif** : Fonctionnalités avancées

| Tâche | Priorité | Complexité | Impact | Temps |
|-------|----------|------------|--------|-------|
| 9. Recherche géolocalisée | Moyenne | Élevée | Élevé | 12h |
| 10. SSR pour SEO | Moyenne | Très élevée | Élevé | 20h |
| 11. Recherche vocale | Faible | Moyenne | Moyen | 8h |
| 12. IA recommandations | Faible | Très élevée | Élevé | 30h |

**Total Phase 3** : ~70 heures

---

## 📋 DÉTAIL DES TÂCHES

### 1. Pagination / Infinite Scroll ⭐⭐⭐

**Problème actuel** : Limite de 100 résultats, pas de pagination

**Solution** : Implémenter infinite scroll avec Intersection Observer

**Implémentation** :
```typescript
// Hook personnalisé useInfiniteScroll
const useInfiniteScroll = (loadMore: () => void) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  return sentinelRef;
};
```

**Dans SearchPropertiesPage** :
```typescript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const ITEMS_PER_PAGE = 20;

const loadMoreProperties = async () => {
  if (!hasMore || loading) return;

  const { data } = await supabase
    .from('properties')
    .select('*')
    .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

  setProperties(prev => [...prev, ...(data || [])]);
  setHasMore(data && data.length === ITEMS_PER_PAGE);
  setPage(p => p + 1);
};

const sentinelRef = useInfiniteScroll(loadMoreProperties);
```

**Bénéfices** :
- ✅ Pas de limitation à 100 résultats
- ✅ Meilleure performance (chargement progressif)
- ✅ UX fluide (pas de boutons pagination)
- ✅ Compatible mobile

**Fichiers à modifier** :
- `src/features/tenant/pages/SearchPropertiesPage.tsx`
- Nouveau : `src/hooks/useInfiniteScroll.ts`

---

### 2. Cache localStorage ⭐⭐⭐

**Problème actuel** : Chaque visite = nouvelles requêtes DB

**Solution** : Cache des recherches récentes dans localStorage

**Implémentation** :
```typescript
// Hook useSearchCache
interface CachedSearch {
  key: string;
  data: Property[];
  timestamp: number;
  ttl: number; // Time to live en ms
}

const CACHE_KEY = 'montoit_search_cache';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function useSearchCache() {
  const getCachedSearch = (searchKey: string): Property[] | null => {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return null;

    const cached: CachedSearch[] = JSON.parse(cache);
    const found = cached.find(c => c.key === searchKey);

    if (!found) return null;
    if (Date.now() - found.timestamp > found.ttl) {
      // Cache expiré
      return null;
    }

    return found.data;
  };

  const setCachedSearch = (searchKey: string, data: Property[]) => {
    const cache = localStorage.getItem(CACHE_KEY);
    const cached: CachedSearch[] = cache ? JSON.parse(cache) : [];

    // Supprimer ancien cache pour cette recherche
    const filtered = cached.filter(c => c.key !== searchKey);

    // Ajouter nouveau cache
    filtered.push({
      key: searchKey,
      data,
      timestamp: Date.now(),
      ttl: DEFAULT_TTL,
    });

    // Garder seulement les 10 dernières recherches
    const limited = filtered.slice(-10);

    localStorage.setItem(CACHE_KEY, JSON.stringify(limited));
  };

  return { getCachedSearch, setCachedSearch };
}
```

**Utilisation dans SearchPropertiesPage** :
```typescript
const { getCachedSearch, setCachedSearch } = useSearchCache();

const searchProperties = useCallback(async () => {
  const searchKey = `${city}-${propertyType}-${minPrice}-${maxPrice}`;

  // Vérifier cache d'abord
  const cached = getCachedSearch(searchKey);
  if (cached) {
    console.log('[Cache] Using cached results');
    setProperties(cached);
    setLoading(false);
    return;
  }

  // Requête DB si pas de cache
  const { data } = await supabase.from('properties').select('*');

  // Mettre en cache
  setCachedSearch(searchKey, data || []);
  setProperties(data || []);
}, [city, propertyType, minPrice, maxPrice]);
```

**Bénéfices** :
- ✅ Réduction requêtes DB (-50% estimé)
- ✅ Chargement instantané recherches récentes
- ✅ Économie bande passante
- ✅ Meilleure performance ressentie

**Fichiers à créer/modifier** :
- Nouveau : `src/hooks/useSearchCache.ts`
- Modifier : `src/features/tenant/pages/SearchPropertiesPage.tsx`

---

### 3. Autocomplétion Villes/Quartiers ⭐⭐⭐

**Problème actuel** : Dropdown statique, pas d'aide à la saisie

**Solution** : Composant Combobox avec recherche temps réel

**Implémentation** :
```typescript
// Composant Autocomplete
interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function Autocomplete({ options, value, onChange, placeholder }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!value) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter(opt =>
      opt.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [value, options]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg"
      />

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Utilisation** :
```typescript
<Autocomplete
  options={CITY_NAMES}
  value={city}
  onChange={setCity}
  placeholder="Ex: Abidjan, Cocody..."
/>
```

**Bénéfices** :
- ✅ Saisie plus rapide
- ✅ Pas de fautes d'orthographe
- ✅ Découverte des options
- ✅ Meilleure UX mobile

**Fichiers à créer/modifier** :
- Nouveau : `src/shared/components/Autocomplete.tsx`
- Modifier : `src/features/tenant/pages/SearchPropertiesPage.tsx`

---

### 4. Filtres Persistés dans URL ⭐⭐

**Problème actuel** : Filtres partiellement dans URL

**Solution** : Tous les filtres dans URL pour partage et historique

**Implémentation** :
```typescript
// Synchroniser tous les états avec URL
useEffect(() => {
  const params = new URLSearchParams(searchParams);
  setCity(params.get('city') || '');
  setNeighborhood(params.get('neighborhood') || '');
  setPropertyType(params.get('type') || '');
  setMinPrice(params.get('minPrice') || '');
  setMaxPrice(params.get('maxPrice') || '');
  setBedrooms(params.get('bedrooms') || '');
  setShowFilters(params.get('advanced') === 'true');
}, [searchParams]);

// Mettre à jour URL à chaque changement
const updateURL = useCallback(() => {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (neighborhood) params.set('neighborhood', neighborhood);
  if (propertyType) params.set('type', propertyType);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (bedrooms) params.set('bedrooms', bedrooms);
  if (showFilters) params.set('advanced', 'true');

  setSearchParams(params, { replace: true });
}, [city, neighborhood, propertyType, minPrice, maxPrice, bedrooms, showFilters]);
```

**Bénéfices** :
- ✅ Partage de recherche par URL
- ✅ Historique navigateur fonctionnel
- ✅ Bookmarks avec filtres
- ✅ SEO amélioré

---

### 5. Optimisation Images ⭐⭐⭐

**Problème actuel** : Images lourdes, pas de formats modernes

**Solution** : Pipeline d'optimisation images

**Stack recommandée** :
- **Sharp** pour compression serveur
- **WebP** + fallback JPEG
- **Responsive images** avec srcset
- **Lazy loading** (déjà implémenté ✅)

**Implémentation** :

#### a) Script d'optimisation
```javascript
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImage(inputPath, outputDir) {
  const filename = path.basename(inputPath, path.extname(inputPath));

  // WebP version
  await sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(path.join(outputDir, `${filename}.webp`));

  // JPEG fallback
  await sharp(inputPath)
    .jpeg({ quality: 85, progressive: true })
    .toFile(path.join(outputDir, `${filename}.jpg`));

  // Thumbnails
  await sharp(inputPath)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 75 })
    .toFile(path.join(outputDir, `${filename}-thumb.webp`));
}
```

#### b) Composant OptimizedImage
```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}

export function OptimizedImage({ src, alt, sizes, className }: OptimizedImageProps) {
  const baseUrl = src.replace(/\.(jpg|jpeg|png)$/, '');

  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`
          ${baseUrl}-thumb.webp 400w,
          ${baseUrl}.webp 800w,
          ${baseUrl}-large.webp 1200w
        `}
        sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
      />
      <source
        type="image/jpeg"
        srcSet={`
          ${baseUrl}-thumb.jpg 400w,
          ${baseUrl}.jpg 800w,
          ${baseUrl}-large.jpg 1200w
        `}
        sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
      />
      <img
        src={`${baseUrl}.jpg`}
        alt={alt}
        loading="lazy"
        className={className}
      />
    </picture>
  );
}
```

**Bénéfices** :
- ✅ Réduction taille images (-60% estimé)
- ✅ Chargement plus rapide
- ✅ Support formats modernes (WebP)
- ✅ Responsive automatique
- ✅ Meilleur score Lighthouse

---

### 6. Tests E2E (Playwright) ⭐⭐⭐

**Problème actuel** : Pas de tests automatisés

**Solution** : Tests E2E avec Playwright

**Installation** :
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration** :
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

**Tests prioritaires** :
```typescript
// tests/e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Page de recherche', () => {
  test('Navigation vers /recherche', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/recherche"]');
    await expect(page).toHaveURL('/recherche');
  });

  test('Recherche par ville', async ({ page }) => {
    await page.goto('/recherche');
    await page.selectOption('select[name="city"]', 'Abidjan');
    await page.click('button:has-text("Rechercher")');
    await expect(page.locator('.property-card')).toHaveCount.greaterThan(0);
  });

  test('Validation min > max', async ({ page }) => {
    await page.goto('/recherche');
    await page.fill('input[name="minPrice"]', '200000');
    await page.fill('input[name="maxPrice"]', '100000');
    await page.click('button:has-text("Rechercher")');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('Rechargement page garde filtres', async ({ page }) => {
    await page.goto('/recherche?city=Abidjan&type=appartement');
    await page.reload();
    await expect(page.locator('select[name="city"]')).toHaveValue('Abidjan');
    await expect(page.locator('select[name="type"]')).toHaveValue('appartement');
  });
});
```

**Bénéfices** :
- ✅ Détection précoce des régressions
- ✅ Confiance pour refactoring
- ✅ Documentation vivante du comportement
- ✅ CI/CD automatisé

---

### 7. Dashboard Analytics Admin ⭐⭐

**Problème actuel** : Pas de visibilité sur l'utilisation

**Solution** : Dashboard avec métriques clés

**Implémentation** :

#### Tables Supabase
```sql
-- Table pour tracking des recherches
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  search_term TEXT,
  city TEXT,
  property_type TEXT,
  min_price INTEGER,
  max_price INTEGER,
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at DESC);
CREATE INDEX idx_search_analytics_city ON search_analytics(city);

-- RLS
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all analytics"
  ON search_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

#### Composant Dashboard
```typescript
export function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalSearches: 0,
    uniqueUsers: 0,
    topCities: [],
    topTypes: [],
    avgResultsPerSearch: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data } = await supabase
      .from('search_analytics')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Calculer statistiques
    const topCities = countOccurrences(data, 'city').slice(0, 5);
    const topTypes = countOccurrences(data, 'property_type').slice(0, 5);

    setStats({
      totalSearches: data.length,
      uniqueUsers: new Set(data.map(d => d.user_id)).size,
      topCities,
      topTypes,
      avgResultsPerSearch: average(data.map(d => d.results_count)),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Recherches (7j)" value={stats.totalSearches} />
      <StatCard title="Utilisateurs uniques" value={stats.uniqueUsers} />
      <StatCard title="Résultats moyens" value={stats.avgResultsPerSearch.toFixed(1)} />

      <div className="col-span-2">
        <h3>Top 5 Villes Recherchées</h3>
        <BarChart data={stats.topCities} />
      </div>

      <div className="col-span-2">
        <h3>Top 5 Types de Biens</h3>
        <PieChart data={stats.topTypes} />
      </div>
    </div>
  );
}
```

**Bénéfices** :
- ✅ Compréhension comportement utilisateurs
- ✅ Identification tendances
- ✅ Optimisation contenu basée sur données
- ✅ Décisions business informées

---

### 8. Recherche Géolocalisée ⭐⭐

**Problème actuel** : Pas de recherche "près de moi"

**Solution** : Intégration géolocalisation navigateur + Mapbox

**Implémentation** :

#### Hook useGeolocation
```typescript
export function useGeolocation() {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  return { position, error, loading, requestLocation };
}
```

#### Bouton "Près de moi"
```typescript
<button
  onClick={async () => {
    requestLocation();
    if (position) {
      // Calculer distance avec PostGIS dans Supabase
      const { data } = await supabase.rpc('nearby_properties', {
        lat: position.lat,
        lng: position.lng,
        radius_km: 5,
      });
      setProperties(data);
    }
  }}
  className="btn-secondary"
>
  📍 Près de moi
</button>
```

#### Fonction SQL Supabase
```sql
CREATE OR REPLACE FUNCTION nearby_properties(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS SETOF properties
LANGUAGE sql
AS $$
  SELECT *
  FROM properties
  WHERE status IN ('disponible', 'available')
  AND ST_DWithin(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint(lng, lat)::geography,
    radius_km * 1000
  )
  ORDER BY ST_Distance(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint(lng, lat)::geography
  );
$$;
```

**Bénéfices** :
- ✅ Recherche contextuelle
- ✅ Meilleure pertinence résultats
- ✅ UX moderne
- ✅ Engagement utilisateur accru

---

## 🎯 RECOMMANDATIONS DE PRIORISATION

### À Faire EN PREMIER (Cette semaine)
1. ✅ **Pagination/Infinite Scroll** - Bloquant pour scale
2. ✅ **Cache localStorage** - Quick win performance
3. ✅ **Autocomplétion** - Amélioration UX majeure

### À Faire ENSUITE (Ce mois)
4. ✅ **Optimisation images** - Performance critique
5. ✅ **Tests E2E** - Qualité code
6. ✅ **Dashboard analytics** - Insights business

### À Planifier (Prochains mois)
7. ⏳ **Recherche géolocalisée** - Fonctionnalité différenciante
8. ⏳ **SSR pour SEO** - Visibilité Google
9. ⏳ **Recherche vocale** - Innovation UX
10. ⏳ **IA recommandations** - Personnalisation

---

## 📊 MÉTRIQUES DE SUCCÈS

### Phase 1 (Court Terme)
- [ ] Temps chargement recherche < 1s (avec cache)
- [ ] Taux rebond page recherche < 30%
- [ ] Utilisateurs scrollent > 2 pages résultats

### Phase 2 (Moyen Terme)
- [ ] Score Lighthouse > 90
- [ ] 0 erreur en production (monitoring)
- [ ] Couverture tests > 70%

### Phase 3 (Long Terme)
- [ ] 50% trafic organique (SEO)
- [ ] Taux conversion recherche → candidature > 10%
- [ ] NPS (Net Promoter Score) > 50

---

## 🚀 COMMENCER MAINTENANT

### Option A - Tout automatiser
```bash
# Lancer le script qui fait tout
npm run implement-next-steps
```

### Option B - Pas à pas
Je peux implémenter chaque tâche une par une. **Par laquelle voulez-vous commencer ?**

1. Pagination/Infinite Scroll
2. Cache localStorage
3. Autocomplétion
4. Autre

---

**Prêt à continuer ? Dites-moi par quelle tâche vous voulez commencer !** 🚀
