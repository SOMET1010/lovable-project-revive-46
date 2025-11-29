# Exemples Concrets de Corrections - Design System MONTOIT

**Guide pratique de migration pour chaque fichier problématique**

---

## 1. Fichiers Critiques à Corriger

### 1.1 `/src/index.css` - CRITIQUE

#### État Actuel (Non-Conforme)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ❌ PROBLÈME - Classes gradient non standardisées */
@layer components {
  .btn-primary {
    @apply bg-gradient-to-r from-terracotta-500 to-coral-500;
    @apply text-white font-semibold px-6 py-3 rounded-2xl;
    @apply shadow-lg hover:shadow-glow-lg transform hover:scale-105;
    @apply transition-all duration-300 hover:animate-glow;
  }

  .btn-secondary {
    @apply bg-white border-2 border-terracotta-500 text-terracotta-600;
    @apply font-semibold px-6 py-3 rounded-2xl;
    @apply hover:bg-terracotta-50 transform hover:scale-105;
    @apply transition-all duration-300;
  }

  .text-gradient {
    @apply bg-gradient-to-r from-terracotta-500 via-coral-500 to-amber-500;
    @apply bg-clip-text text-transparent;
  }

  .glass-card {
    @apply bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl;
  }
}
```

#### État Correct (Conforme Design System)
```css
@tailwind base;
@tailwind utilities;

/* ✅ IMPORT du design system complet */
@import './styles/design-tokens.css';

@layer components {
  /* ✅ Utilisation directe des tokens standard */
  .btn-primary {
    /* Déjà défini dans design-tokens.css - utilisation directe */
    /* background-color: var(--color-primary-500); */
  }

  .btn-secondary {
    /* Déjà défini dans design-tokens.css - utilisation directe */
    /* border: 2px solid var(--color-primary-500); */
  }

  /* ✅ Suppression des classes non conformes */
  /* .text-gradient { supprimé } */
  /* .glass-card { supprimé } */
  
  /* ✅ Classes utilitaires conformes uniquement */
  .custom-component {
    background-color: var(--color-background-page);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-6);
  }
}
```

### 1.2 `/src/shared/styles/header-footer-premium.css` - CRITIQUE

#### État Actuel (Spectacular Non-Standard)
```css
/* ❌ PROBLÈME - Style spectacular non conforme */
.header-premium {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 107, 53, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-btn-primary {
  position: relative;
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff9933 100%);
  background-size: 200% 200%;
  color: white;
  font-weight: 600;
  border-radius: 9999px;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: header-btn-gradient 3s ease infinite;
}
```

#### État Correct (Standard Design System)
```css
/* ✅ SIMPLIFICATION vers design system */
.header-standard {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--color-background-page);
  border-bottom: 1px solid var(--color-neutral-100);
  padding: var(--spacing-4) 0;
  transition: all var(--animation-duration-base) var(--animation-easing-ease-out);
}

.header-btn-primary {
  /* ✅ Utilisation classe design system */
  composes: btn-primary from design-tokens.css;
}

.header-btn-secondary {
  /* ✅ Utilisation classe design system */
  composes: btn-secondary from design-tokens.css;
}

/* ✅ Suppression animations non standardisées */
/* @keyframes header-btn-gradient { supprimé } */
```

---

## 2. Corrections de Composants React

### 2.1 `/src/app/layout/HeaderPremium.tsx` - IMPORTANT

#### État Actuel (Non-Conforme)
```tsx
export default function HeaderPremium() {
  return (
    <>
      <header className="header-premium"> {/* ❌ Classe non standard */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <a href="/" className="header-logo header-logo-animated"> {/* ❌ */}
              <div className="relative">
                <span className="text-lg md:text-xl font-bold gradient-text-orange"> {/* ❌ */}
                  Mon Toit
                </span>
              </div>
            </a>

            <nav className="hidden md:flex items-center space-x-1">
              <a href="/" className="header-nav-link header-nav-link-animated"> {/* ❌ */}
                <Home className="h-5 w-5" />
                <span>Accueil</span>
              </a>

              <button className="header-btn-primary"> {/* ❌ Non conforme */}
                <User className="h-5 w-5 header-btn-icon" />
                <span>Mon Compte</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
```

#### État Correct (Conforme Design System)
```tsx
export default function HeaderStandard() {
  return (
    <>
      <header className="header-standard"> {/* ✅ Classe standard */}
        <div className="container"> {/* ✅ Container standard */}
          <div className="flex justify-between items-center h-16 md:h-20">
            <a href="/" className="flex items-center space-x-3"> {/* ✅ Simple */}
              <div className="relative">
                <span className="text-h4 font-bold text-primary-500"> {/* ✅ Standard */}
                  Mon Toit
                </span>
              </div>
            </a>

            <nav className="hidden md:flex items-center space-x-4"> {/* ✅ Spacing standard */}
              <a href="/" className="text-body text-neutral-700 hover:text-primary-500"> {/* ✅ */}
                <Home className="h-5 w-5 inline mr-2" />
                <span>Accueil</span>
              </a>

              <button className="btn-primary"> {/* ✅ Classe design system */}
                <User className="h-5 w-5 inline mr-2" />
                <span>Mon Compte</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
```

### 2.2 `/src/shared/components/ProfileCard.tsx` - IMPORTANT

#### État Actuel (Non-Conforme)
```tsx
export default function ProfileCard({ icon, title, features, ctaText, ctaLink }: ProfileCardProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 text-center hover:border-orange-500 shadow-premium hover:shadow-orange transition-all duration-300 card-premium animate-slide-up"> {/* ❌ */}
      {/* Icon */}
      <div className="text-4xl sm:text-5xl mb-4"> {/* ❌ Taille non standard */}
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4"> {/* ❌ */}
        {title}
      </h3>

      {/* Features List */}
      <ul className="text-left mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="text-sm sm:text-base text-gray-600 flex items-start"> {/* ❌ */}
            <span className="text-orange-500 font-bold mr-2 flex-shrink-0">✓</span> {/* ❌ */}
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a href={ctaLink} className="block w-full px-6 py-3 bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-900 font-semibold rounded-lg transition-all duration-300 text-sm sm:text-base btn-premium"> {/* ❌ */}
        {ctaText}
      </a>
    </div>
  );
}
```

#### État Correct (Conforme Design System)
```tsx
export default function ProfileCard({ icon, title, features, ctaText, ctaLink }: ProfileCardProps) {
  return (
    <div className="card hover:border-primary-500"> {/* ✅ Card standard + état hover */}
      {/* Icon */}
      <div className="text-h2 mb-4 text-primary-500"> {/* ✅ Taille standard */}
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-h5 font-bold text-neutral-900 mb-4"> {/* ✅ Standard */}
        {title}
      </h3>

      {/* Features List */}
      <ul className="text-left mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="text-small text-neutral-600 flex items-start"> {/* ✅ */}
            <span className="text-primary-500 font-bold mr-2 flex-shrink-0">✓</span> {/* ✅ couleur standard */}
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a href={ctaLink} className="btn-primary w-full"> {/* ✅ Classe standard */}
        {ctaText}
      </a>
    </div>
  );
}
```

### 2.3 `/src/features/auth/pages/AuthPage.tsx` - CRITIQUE

#### État Actuel (Non-Conforme)
```tsx
export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-coral-50"> {/* ❌ */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-terracotta-500 to-coral-500 rounded-full flex items-center justify-center"> {/* ❌ */}
              <Lock className="h-12 w-12 text-white" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900"> {/* ❌ */}
              Connexion à votre compte
            </h2>
          </div>

          <form className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-terracotta-500 focus:border-terracotta-500 focus:z-10 sm:text-sm" {/* ❌ */}
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-terracotta-600 hover:bg-terracotta-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500" {/* ❌ */}
              >
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

#### État Correct (Conforme Design System)
```tsx
export default function AuthPage() {
  return (
    <div className="min-h-screen bg-neutral-50"> {/* ✅ Background standard */}
      <div className="container py-12"> {/* ✅ Container standard */}
        <div className="max-w-md mx-auto"> {/* ✅ Largeur standard */}
          <div className="text-center mb-8"> {/* ✅ Espacement standard */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-6"> {/* ✅ */}
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-h2 font-bold text-neutral-900"> {/* ✅ Typographie standard */}
              Connexion à votre compte
            </h2>
          </div>

          <div className="card"> {/* ✅ Card standard */}
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="text-body font-semibold text-neutral-700">Email</label> {/* ✅ */}
                <input
                  id="email"
                  type="email"
                  className="input mt-2 w-full" {/* ✅ Input standard */}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn-primary w-full" {/* ✅ Bouton standard */}
                >
                  Se connecter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Configuration Tailwind

### 3.1 `/tailwind.config.js` - IMPORTANT

#### État Actuel (Non-Conforme)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // ❌ Couleurs non alignées design system
        primary: {
          50: '#eff6ff',    // Bleu au lieu d'orange
          500: '#3b82f6',   // Bleu au lieu de #FF6C2F
          600: '#2563eb',
        },
        terracotta: {      // ❌ Couleur non standard
          50: '#fff9f7',
          500: '#f2785c',
          600: '#e55a3d',
        },
        coral: {          // ❌ Couleur non standard
          50: '#fff7f5',
          500: '#ff6b4a',
          600: '#ff4520',
        }
      },
      fontSize: {
        // ❌ Non aligné design system
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
      }
    }
  }
}
```

#### État Correct (Conforme Design System)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // ✅ Alignement complet design system
        primary: {
          50: '#FFF5F0',   // Orange très clair
          100: '#FFE5D6',  // Orange clair
          500: '#FF6C2F',  // Orange principal - COULEUR DE MARQUE
          700: '#E05519',  // Orange foncé
          900: '#B84512'   // Orange très foncé
        },
        neutral: {         // ✅ Palette neutre standardisée
          50: '#F8F8F8',
          100: '#E0E0E0',
          300: '#9E9E9E',
          500: '#6A6A6A',
          700: '#333333',
          900: '#1A1A1A'
        },
        // ❌ SUPPRESSION des couleurs non standard
        // terracotta, coral supprimés
      },
      fontSize: {
        // ✅ Alignement exact design system
        display: ['60px', { lineHeight: '1.25' }],  // 3.75rem
        h1: ['48px', { lineHeight: '1.25' }],       // 3rem
        h2: ['36px', { lineHeight: '1.25' }],       // 2.25rem
        h3: ['28px', { lineHeight: '1.25' }],       // 1.75rem
        h4: ['24px', { lineHeight: '1.25' }],       // 1.5rem
        h5: ['20px', { lineHeight: '1.25' }],       // 1.25rem
        body: ['16px', { lineHeight: '1.5' }],      // 1rem - BASE
        small: ['14px', { lineHeight: '1.5' }],     // 0.875rem
        xs: ['12px', { lineHeight: '1.5' }],        // 0.75rem
      },
      spacing: {
        // ✅ Scale 4pt grid alignement
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      }
    }
  }
}
```

---

## 4. Plan de Migration par Fichiers

### Phase 1 : Fichiers Critiques (Semaine 1)

1. **`/src/index.css`**
   - [ ] Supprimer `@layer components` non conformes
   - [ ] Conserver uniquement l'import design tokens
   - [ ] Nettoyer les classes gradient personnalisées

2. **`/src/shared/styles/header-footer-premium.css`**
   - [ ] Remplacer par version standardisée
   - [ ] Supprimer animations spectacular
   - [ ] Utiliser classes design system

3. **`/tailwind.config.js`**
   - [ ] Aligner couleurs avec design system
   - [ ] Corriger font sizes
   - [ ] Supprimer couleurs non standard

### Phase 2 : Composants Majeurs (Semaine 2)

1. **`/src/app/layout/Header*.tsx`**
   - [ ] Simplifier vers design system
   - [ ] Utiliser btn-primary/secondary
   - [ ] Corriger typographie

2. **`/src/features/auth/pages/Auth*.tsx`**
   - [ ] Remplacer gradients par background neutres
   - [ ] Utiliser cards standardisées
   - [ ] Corriger inputs

3. **`/src/shared/components/*.tsx`**
   - [ ] Migrer ProfileCard
   - [ ] Corriger FeatureCard
   - [ ] Standardiser tous les composants

### Phase 3 : Pages et Détails (Semaine 3-4)

1. **Toutes les autres pages**
2. **Composants restants**
3. **Optimisations finales**

---

## 5. Tests de Validation

### 5.1 Checklist Post-Migration

```bash
# Vérifier qu'il n'y a plus de classes non conformes
grep -r "terracotta\|coral\|gradient-" src/ --include="*.tsx" --include="*.css" | wc -l
# Résultat attendu: 0

grep -r "text-4xl\|text-3xl\|text-2xl" src/ --include="*.tsx" | wc -l  
# Résultat attendu: 0 (sauf cas spéciaux justifiés)

grep -r "duration-300\|duration-200" src/ --include="*.tsx" --include="*.css" | wc -l
# Résultat attendu: 0
```

### 5.2 Tests Visuels

- [ ] **Boutons** : Uniformité couleur #FF6C2F
- [ ] **Typographie** : Hiérarchie respectée (H1=48px, H2=36px, etc.)
- [ ] **Cards** : Border-radius 12px uniforme
- [ ] **Animations** : Transitions 250ms standard
- [ ] **Layout** : Container max-width 1280px

### 5.3 Tests Fonctionnels

- [ ] **Performance** : Bundle CSS réduit de 30%
- [ ] **Accessibilité** : Contraste WCAG AA respecté
- [ ] **Responsive** : Breakpoints alignés
- [ ] **Compatibilité** : Fonctionnement cross-browser

---

## 6. Rollback Plan

En cas de problème durant la migration :

1. **Backup** : Sauvegarder état avant migration
2. **Migration progressive** : Fichier par fichier
3. **Tests continus** : Validation après chaque modification
4. **Fallback** : Classes Tailwind standard si échec design system

---

*Guide pratique de migration design system - v1.0*