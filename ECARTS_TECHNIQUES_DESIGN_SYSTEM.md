# Écarts Techniques Détaillés - Design System MONTOIT

**Document technique de référence pour les corrections**

---

## 1. Analyse Comparative des Couleurs

### 1.1 Couleur Primaire - Écart Critique

#### Design System (Standard)
```json
// design-tokens.json
"primary": {
  "500": { "value": "#FF6C2F", "type": "color", "description": "Orange principal - COULEUR DE MARQUE" }
}
```

#### Implémentation Bolt (Non-Conforme)
```tsx
// Components utilisés - EXEMPLES OBSERVÉS
className="gradient-orange"  // from-terracotta-500 to-coral-500
className="from-orange-500 to-red-500"
className="bg-terracotta-500"
className="bg-coral-500"
```

#### Correction Requise
```tsx
// REMPLACER PAR
className="bg-primary-500"
// OU utiliser la classe design system
className="btn-primary"
```

### 1.2 Palette Complète - Analyse des Écarts

| Token Design System | Implémentation Bolt | Statut | Correction |
|---------------------|---------------------|--------|------------|
| `--color-primary-500: #FF6C2F` | `from-terracotta-500 to-coral-500` | ❌ | Standardiser |
| `--color-neutral-50: #F8F8F8` | `bg-gray-50` | ⚠️ | Aligner naming |
| `--color-neutral-100: #E0E0E0` | `border-gray-200` | ⚠️ | Aligner naming |
| `--color-neutral-700: #333333` | `text-gray-900` | ⚠️ | Aligner naming |
| `--color-background-surface: #FDFBF7` | Non utilisé | ❌ | Implémenter |

---

## 2. Analyse Typographique

### 2.1 Hiérarchie - Écart Important

#### Design System (Standardisé)
```json
"typography": {
  "fontSize": {
    "display": "60px",  // 3.75rem
    "h1": "48px",       // 3rem  
    "h2": "36px",       // 2.25rem
    "h3": "28px",       // 1.75rem
    "body": "16px",     // 1rem
    "small": "14px"     // 0.875rem
  }
}
```

#### Implémentation Bolt (Incohérente)
```tsx
// Classes Tailwind observées
className="text-4xl font-bold"  // ~36px vs 48px (h1)
className="text-3xl font-bold"  // ~30px vs 36px (h2)
className="text-2xl font-bold"  // ~24px vs 28px (h3)
className="text-lg"             // ~18px vs 16px (body)
```

#### Correction Requise
```tsx
// REMPLACER PAR les classes design system
className="text-h1 font-bold"   // 48px
className="text-h2 font-bold"   // 36px
className="text-h3 font-bold"   // 28px
className="text-body"           // 16px
```

### 2.2 Font Weights - Alignement Partiel

#### Design System
```json
"fontWeight": {
  "regular": { "value": "400" },
  "semibold": { "value": "600" },
  "bold": { "value": "700" }
}
```

#### Implémentation Bolt
```tsx
// Classes utilisées
className="font-semibold"  // ✅ Conforme (600)
className="font-bold"      // ✅ Conforme (700)
className="font-medium"    // ❌ Non standardisé (500)
```

---

## 3. Analyse des Composants

### 3.1 Boutons - Écart Critique

#### Design System (Standard)
```css
/* design-tokens.css */
.btn-primary {
  background-color: var(--color-primary-500);  /* #FF6C2F */
  color: #FFFFFF;
  border-radius: var(--border-radius-base);    /* 8px */
  padding: var(--spacing-3) var(--spacing-6);  /* 12px 24px */
  font-size: var(--font-size-body);            /* 16px */
  font-weight: var(--font-weight-semibold);    /* 600 */
  transition: all var(--animation-duration-base) var(--animation-easing-ease-out);
}
```

#### Implémentation Bolt (Non-Conforme)
```tsx
// Composants observés - EXEMPLES RÉELS
className="btn-primary" 
// Dans index.css:
@apply bg-gradient-to-r from-terracotta-500 to-coral-500;
@apply px-6 py-3 rounded-2xl;  // 16px vs 8px

className="btn-secondary"
// Dans index.css:
@apply bg-white border-2 border-terracotta-500;
// Couleur terracotta non standardisée

className="header-btn-primary"
// Dans header-footer-premium.css:
background: linear-gradient(135deg, #ff6b35 0%, #ff9933 100%);
/* Couleur différente du design system */
```

#### Correction Requise
```tsx
// REMPLACER tous les boutons par
<button className="btn-primary">
  Action principale
</button>

<button className="btn-secondary">
  Action secondaire
</button>

// SUPPRIMER les classes Tailwind personnalisées
// @apply bg-gradient-to-r, @apply rounded-2xl, etc.
```

### 3.2 Cards - Écart Important

#### Design System (Standard)
```css
.card {
  background-color: var(--color-background-page);  /* #FFFFFF */
  border: 1px solid var(--color-neutral-100);      /* #E0E0E0 */
  border-radius: var(--border-radius-md);           /* 12px */
  padding: var(--spacing-6);                        /* 24px */
  box-shadow: var(--shadow-base);                   /* Standardisée */
  transition: all var(--animation-duration-base);
}
```

#### Implémentation Bolt (Non-Conforme)
```tsx
// Classes observées
className="card-scrapbook"
@apply bg-white rounded-lg shadow-card hover:shadow-card-hover;
/* shadow-card non défini dans design system */

className="glass-card"
@apply bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl;
/* Style glass non standardisé */

className="bg-gradient-to-br from-orange-50 to-white border border-orange-100"
/* Gradient non autorisé par design system */
```

#### Correction Requise
```tsx
// UTILISER les cards standardisées
<div className="card">
  Contenu de la card
</div>

// SUPPRIMER les variations non conformes
// card-scrapbook, glass-card, gradient cards, etc.
```

### 3.3 Navigation/Header - Écart Critique

#### Design System (Attendu)
```css
.header-standard {
  background-color: var(--color-background-page);
  border-bottom: 1px solid var(--color-neutral-100);
  padding: var(--spacing-4) 0;  /* 16px top/bottom */
}
```

#### Implémentation Bolt (Spectacular Non-Standard)
```css
/* header-footer-premium.css - CONFLIT TOTAL */
.header-premium {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 107, 53, 0.1);
}

.header-btn-primary {
  background: linear-gradient(135deg, #ff6b35 0%, #ff9933 100%);
  animation: header-btn-gradient 3s ease infinite;
}
```

#### Correction Requise
```tsx
// SIMPLIFIER vers le design system
<header className="header-standard">
  <nav className="container">
    <a href="/" className="text-primary-500">
      Logo + Navigation
    </a>
    <div className="flex gap-4">
      <button className="btn-primary">Connexion</button>
      <button className="btn-secondary">Inscription</button>
    </div>
  </nav>
</header>
```

---

## 4. Analyse des Espacements

### 4.1 Scale 4pt Grid - Partiellement Conforme

#### Design System
```json
"spacing": {
  "1": "4px",   // 0.25rem
  "2": "8px",   // 0.5rem  
  "3": "12px",  // 0.75rem
  "4": "16px",  // 1rem
  "6": "24px",  // 1.5rem
  "8": "32px",  // 2rem
  "12": "48px", // 3rem
  "16": "64px"  // 4rem
}
```

#### Implémentation Bolt
```tsx
// Classes utilisées - PARTIELLEMENT CONFORMES
className="p-4"    // ✅ 16px (spacing.4)
className="p-6"    // ✅ 24px (spacing.6) 
className="px-4"   // ✅ 16px horizontal
className="py-3"   // ❌ 12px (spacing.3 non utilisée)
className="p-8"    // ❌ 32px (spacing.8 non définie en Tailwind standard)
```

### 4.2 Containers - Conforme

#### Design System
```css
.container {
  max-width: var(--size-container-xl);  /* 1280px */
  margin: 0 auto;
  padding: 0 var(--spacing-8);          /* 32px */
}
```

#### Implémentation Bolt
```tsx
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
/* ✅ max-w-7xl = 1280px (conforme) */
/* ⚠️ Padding variable (non standardisé) */
```

---

## 5. Analyse des Animations

### 5.1 Transitions - Non Standardisées

#### Design System
```json
"animation": {
  "duration": {
    "fast": { "value": "150ms" },
    "base": { "value": "250ms" },  
    "slow": { "value": "350ms" }
  },
  "easing": {
    "easeOut": { "value": "cubic-bezier(0, 0, 0.2, 1)" },
    "easeIn": { "value": "cubic-bezier(0.4, 0, 1, 1)" }
  }
}
```

#### Implémentation Bolt
```tsx
// Classes observées - NON CONFORMES
className="transition-all duration-300"        // 300ms vs 250ms (base)
className="transition-all duration-200"        // 200ms vs 150ms (fast)
className="transition-all duration-500"        // 500ms vs 350ms (slow)
className="ease-in-out"                        // Non standardisé

// Animations custom non définies
animation: header-btn-gradient 3s ease infinite;
```

### 5.2 Hover Effects - Variables

#### Design System (Standard)
```css
.btn-primary:hover {
  background-color: var(--color-primary-700);  /* Darker */
  transform: scale(1.02);                      /* Subtle */
}
```

#### Implémentation Bolt
```tsx
// Effets observés - TROP SPECTACULAIRES
className="hover:shadow-xl hover:scale-105"    // Scale 5% vs 2%
className="hover:shadow-glow"                  // Glow non standardisé
className="animate-glow"                       // Animation permanente
className="hover:-rotate-1 hover:scale-105"    // Rotation non autorisée
```

---

## 6. Priorités de Correction

### 🔴 CRITIQUES (Semaine 1)

1. **Couleurs de marque**
   ```bash
   # Rechercher et remplacer
   terracotta-500 → primary-500
   coral-500 → primary-500  
   from-orange-500 to-red-500 → bg-primary-500
   gradient-orange → btn-primary
   ```

2. **Boutons principaux**
   ```bash
   # Supprimer classes personnalisées
   .btn-primary { @apply gradient... } → .btn-primary { standard }
   .btn-secondary { @apply border-terracotta } → .btn-secondary { standard }
   ```

3. **Header spectacular**
   ```bash
   # Simplifier
   .header-premium { gradient + animation } → .header-standard { simple }
   ```

### 🟡 IMPORTANTES (Semaine 2-3)

1. **Typographie**
   ```bash
   text-4xl → text-h1
   text-3xl → text-h2
   text-2xl → text-h3
   ```

2. **Cards**
   ```bash
   .card-scrapbook → .card
   .glass-card → .card (variante)
   ```

3. **Animations**
   ```bash
   duration-300 → transition-base
   duration-200 → transition-fast
   hover:scale-105 → hover:scale-102 (standard)
   ```

### 🟢 MINEURES (Semaine 4)

1. **Espacements fins**
2. **Détails typographiques**
3. **Optimisations performance**

---

## 7. Scripts de Migration

### 7.1 Recherche/Remplacement Couleurs

```bash
# Dans le dossier src/
find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/terracotta-500/primary-500/g'
find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/coral-500/primary-500/g'
find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/from-orange-500 to-red-500/bg-primary-500/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/gradient-orange/btn-primary/g'
```

### 7.2 Vérification Post-Migration

```bash
# Compter les occurrences non-conformes
grep -r "terracotta\|coral\|gradient-" src/ | wc -l  # Doit être 0
grep -r "text-4xl\|text-3xl\|text-2xl" src/ | wc -l  # Doit être 0
grep -r "duration-300\|duration-200" src/ | wc -l    # Doit être 0
```

---

## 8. Checklist de Validation

### ✅ Conformité Design System
- [ ] **Couleurs** : 100% utilisation tokens standard
- [ ] **Typographie** : 100% utilisation scales définies  
- [ ] **Boutons** : 100% utilisation classes design system
- [ ] **Cards** : 100% utilisation composants standardisés
- [ ] **Animations** : 100% utilisation durations définies
- [ ] **Espacements** : 100% utilisation 4pt grid

### ✅ Qualité Code
- [ ] **CSS Bundle** : Réduction 30% taille
- [ ] **Classes custom** : < 10% du total
- [ ] **Duplications** : Éliminées
- [ ] **Performance** : Lighthouse score > 90

### ✅ Expérience Utilisateur
- [ ] **Cohérence visuelle** : Score > 90%
- [ ] **Hiérarchie claire** : Audit UX passed
- [ ] **États interactifs** : Standardisés
- [ ] **Accessibilité** : Contraste WCAG AA

---

*Document technique pour migration design system - v1.0*