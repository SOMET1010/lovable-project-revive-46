# LISTE EXHAUSTIVE DES CORRECTIONS D'ACCESSIBILITÉ
## MonToitVPROD - Plan de Correction Détaillé

---

## 📁 CORRECTIONS PAR FICHIER

### 1. **Header.tsx** 🟥 CRITIQUE
**Chemin :** `/src/app/layout/Header.tsx`

#### A. Avatar utilisateur (lignes 374-379)
```tsx
// ❌ AVANT
<img
  src={profile.avatar_url}
  alt="Avatar"
  className="h-8 w-8 rounded-full border-2 border-terracotta-300 shadow-md"
/>

// ✅ APRÈS
<img
  src={profile.avatar_url}
  alt={profile.full_name ? `Avatar de ${profile.full_name}` : 'Avatar utilisateur'}
  className="h-8 w-8 rounded-full border-2 border-terracotta-300 shadow-md"
/>
```
**Impact :** Élevé | **Priorité :** 1 | **Temps :** 5 min

---

### 2. **HeaderPremium.tsx** 🟨 ÉLEVÉ
**Chemin :** `/src/app/layout/HeaderPremium.tsx`

#### A. Logo du header (ligne 50-54)
```tsx
// ❌ AVANT
<img
  src="/logo-montoit.png"
  alt="Mon Toit"
  className="h-10 w-10 md:h-12 md:w-12 object-contain"
/>

// ✅ APRÈS
<img
  src="/logo-montoit.png"
  alt="Mon Toit - Plateforme Immobilière ANSUT"
  className="h-10 w-10 md:h-12 md:w-12 object-contain"
/>
```
**Impact :** Moyen | **Priorité :** 2 | **Temps :** 5 min

#### B. Bouton menu mobile (lignes 155-160)
```tsx
// ❌ AVANT
<button
  onClick={() => setShowMobileMenu(!showMobileMenu)}
  className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
>
  {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
</button>

// ✅ APRÈS
<button
  onClick={() => setShowMobileMenu(!showMobileMenu)}
  className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
  aria-label={showMobileMenu ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
  aria-expanded={showMobileMenu}
  aria-controls="mobile-navigation-menu"
>
  {showMobileMenu ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
</button>
```
**Impact :** Élevé | **Priorité :** 1 | **Temps :** 10 min

---

### 3. **NotificationCenter.tsx** 🟥 CRITIQUE
**Chemin :** `/src/features/messaging/components/NotificationCenter.tsx`

#### A. Bouton principal des notifications (lignes 96-106)
```tsx
// ❌ AVANT
<button
  onClick={() => setIsOpen(!isOpen)}
  className="relative p-2 text-gray-600 hover:text-terracotta-600 transition-colors"
>
  <Bell className="w-6 h-6" />
  {unreadCount > 0 && (
    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>

// ✅ APRÈS
<button
  onClick={() => setIsOpen(!isOpen)}
  className="relative p-2 text-gray-600 hover:text-terracotta-600 transition-colors"
  aria-label={isOpen ? 'Fermer les notifications' : 'Ouvrir les notifications'}
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  aria-controls="notification-panel"
>
  <Bell className="w-6 h-6" aria-hidden="true" />
  {unreadCount > 0 && (
    <span 
      className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
      aria-label={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
```
**Impact :** Critique | **Priorité :** 1 | **Temps :** 15 min

#### B. Bouton "Tout marquer lu" (lignes 126-134)
```tsx
// ❌ AVANT
<button
  onClick={handleMarkAllAsRead}
  className="text-sm text-terracotta-600 hover:underline font-medium flex items-center space-x-1"
>
  <CheckCheck className="w-4 h-4" />
  <span>Tout marquer lu</span>
</button>

// ✅ APRÈS
<button
  onClick={handleMarkAllAsRead}
  className="text-sm text-terracotta-600 hover:underline font-medium flex items-center space-x-1"
  aria-label={`Marquer toutes les notifications comme lues`}
>
  <CheckCheck className="w-4 h-4" aria-hidden="true" />
  <span>Tout marquer lu</span>
</button>
```
**Impact :** Moyen | **Priorité :** 2 | **Temps :** 5 min

#### C. Bouton de fermeture (lignes 135-140)
```tsx
// ❌ AVANT
<button
  onClick={() => setIsOpen(false)}
  className="text-gray-400 hover:text-gray-600"
>
  <X className="w-5 h-5" />
</button>

// ✅ APRÈS
<button
  onClick={() => setIsOpen(false)}
  className="text-gray-400 hover:text-gray-600"
  aria-label="Fermer les notifications"
>
  <X className="w-5 h-5" aria-hidden="true" />
</button>
```
**Impact :** Moyen | **Priorité :** 2 | **Temps :** 5 min

#### D. Bouton "Marquer comme lu" individuel (lignes 171-177)
```tsx
// ❌ AVANT
<button
  onClick={() => handleMarkAsRead(notification.id)}
  className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
  title="Marquer comme lu"
>
  <Check className="w-4 h-4" />
</button>

// ✅ APRÈS
<button
  onClick={() => handleMarkAsRead(notification.id)}
  className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
  aria-label="Marquer cette notification comme lue"
>
  <Check className="w-4 h-4" aria-hidden="true" />
</button>
```
**Impact :** Moyen | **Priorité :** 2 | **Temps :** 5 min

---

### 4. **LanguageSelector.tsx** 🟨 ÉLEVÉ
**Chemin :** `/src/shared/ui/LanguageSelector.tsx`

#### A. Bouton principal du sélecteur (lignes 101-112)
```tsx
// ❌ AVANT
<button
  onClick={() => setIsOpen(!isOpen)}
  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-terracotta-400 transition-all"
  disabled={translating}
>
  <Globe className="h-5 w-5 text-terracotta-600" />
  <span className="text-2xl">{currentLang.flag}</span>
  <span className="font-medium text-gray-700">{currentLang.nativeName}</span>
  {translating && (
    <div className="animate-spin h-4 w-4 border-2 border-terracotta-500 border-t-transparent rounded-full"></div>
  )}
</button>

// ✅ APRÈS
<button
  onClick={() => setIsOpen(!isOpen)}
  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-terracotta-400 transition-all"
  disabled={translating}
  aria-label={`Langue actuelle: ${currentLang.nativeName}. Cliquer pour changer la langue`}
  aria-expanded={isOpen}
  aria-haspopup="listbox"
>
  <Globe className="h-5 w-5 text-terracotta-600" aria-hidden="true" />
  <span className="text-2xl" aria-hidden="true">{currentLang.flag}</span>
  <span className="font-medium text-gray-700">{currentLang.nativeName}</span>
  {translating && (
    <div 
      className="animate-spin h-4 w-4 border-2 border-terracotta-500 border-t-transparent rounded-full"
      aria-label="Changement de langue en cours"
      role="status"
    ></div>
  )}
</button>
```
**Impact :** Élevé | **Priorité :** 2 | **Temps :** 15 min

---

### 5. **AuthPage.tsx** 🟨 ÉLEVÉ
**Chemin :** `/src/features/auth/pages/AuthPage.tsx`

#### A. Logo desktop (ligne 308-312)
```tsx
// ❌ AVANT
<img
  src="/logo.png"
  alt="Mon Toit Logo"
  className="h-24 w-24 object-contain drop-shadow-2xl"
/>

// ✅ APRÈS
<img
  src="/logo.png"
  alt="Mon Toit - Plateforme Immobilière ANSUT"
  className="h-24 w-24 object-contain drop-shadow-2xl"
/>
```
**Impact :** Moyen | **Priorité :** 2 | **Temps :** 5 min

#### B. Logo mobile (ligne 361-365)
```tsx
// ❌ AVANT
<img
  src="/logo.png"
  alt="Mon Toit Logo"
  className="h-14 w-14 object-contain"
/>

// ✅ APRÈS
<img
  src="/logo.png"
  alt="Mon Toit - Plateforme Immobilière ANSUT"
  className="h-14 w-14 object-contain"
/>
```
**Impact :** Moyen | **Priorité :** 2 | **Temps :** 5 min

---

### 6. **FileUpload.tsx** 🟩 MOYEN
**Chemin :** `/src/shared/ui/FileUpload.tsx`

#### A. Image de prévisualisation (ligne 78)
```tsx
// ❌ AVANT
<img src={preview} alt="Preview" className="w-full h-48 object-contain rounded-lg" />

// ✅ APRÈS
<img 
  src={preview} 
  alt={`Prévisualisation du fichier: ${label}`} 
  className="w-full h-48 object-contain rounded-lg" 
/>
```
**Impact :** Moyen | **Priorité :** 3 | **Temps :** 5 min

#### B. Bouton de suppression (lignes 71-76)
```tsx
// ❌ AVANT
<button
  onClick={handleRemove}
  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
>
  <X className="w-4 h-4" />
</button>

// ✅ APRÈS
<button
  onClick={handleRemove}
  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
  aria-label={`Supprimer le fichier: ${label}`}
>
  <X className="w-4 h-4" aria-hidden="true" />
</button>
```
**Impact :** Moyen | **Priorité :** 3 | **Temps :** 5 min

---

### 7. **Composant Icon.tsx** 🟩 MOYEN
**Chemin :** `/src/shared/ui/Icon.tsx`

#### A. Ajout d'un système d'accessibilité (lignes 104-128)
```tsx
// ✅ AMÉLIORATION RECOMMANDÉE
interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
  ariaLabel?: string;        // Nouveau prop
  ariaHidden?: boolean;      // Nouveau prop
} & React.SVGProps<SVGSVGElement>;

export const Icon = ({ 
  name, 
  size = 20, 
  className = '', 
  color = 'currentColor',
  strokeWidth = 1.5,
  ariaLabel,                 // Nouveau paramètre
  ariaHidden = false,        // Nouveau paramètre
  ...props 
}: IconProps) => {
  const IconComponent = LucideIcons[name as IconName] as React.ComponentType<any>;
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide React`);
    return null;
  }
  
  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      aria-label={ariaLabel}    // Application du aria-label
      aria-hidden={ariaHidden}  // Application de aria-hidden
      {...props}
    />
  );
};
```
**Impact :** Élevé (maintenabilité) | **Priorité :** 2 | **Temps :** 20 min

---

## 🎯 ESTIMATION TEMPS TOTAL

| Priorité | Fichiers | Temps Total |
|----------|----------|-------------|
| 🟥 Critique | 2 | 30 min |
| 🟨 Élevé | 3 | 55 min |
| 🟩 Moyen | 2 | 30 min |
| **TOTAL** | **7** | **1h55** |

---

## 🧪 TESTS DE VALIDATION REQUIS

### **Tests Manuels Post-Correction**

1. **Test Navigation Clavier**
   - [ ] Tab à travers tous les boutons modifiés
   - [ ] Vérifier que tous les éléments sont atteignables
   - [ ] Vérifier l'ordre de tabulation logique

2. **Test Lecteur d'Écran**
   - [ ] Test avec NVDA (Windows)
   - [ ] Test avec VoiceOver (Mac)
   - [ ] Vérifier que tous les aria-labels sont vocalisés correctement

3. **Test Focus Management**
   - [ ] Vérifier que le focus est visible sur tous les éléments interactifs
   - [ ] Vérifier que les modales gèrent correctement le focus

4. **Test Responsive**
   - [ ] Vérifier que les menus mobiles sont accessibles
   - [ ] Tester sur différentes tailles d'écran

---

## 🚀 COMMANDES DE DÉPLOIEMENT

### **Déploiement des Corrections**

```bash
# 1. Créer une branche feature
git checkout -b feature/accessibility-fixes

# 2. Appliquer les corrections
# (copier-coller les corrections depuis ce fichier)

# 3. Tester localement
npm run test:a11y
npm run cypress:open

# 4. Commiter les changements
git add .
git commit -m "feat: improve accessibility with proper aria-labels

- Add descriptive alt text for user avatars
- Add aria-labels to icon buttons
- Improve logo alt text for brand recognition
- Add proper ARIA attributes for menu toggles
- Enhance notification center accessibility
- Add language selector accessibility"

# 5. Créer une Pull Request
git push origin feature/accessibility-fixes
```

---

**Cette liste exhaustive couvre tous les problèmes d'accessibilité identifiés lors de l'analyse approfondie du codebase MonToitVPROD.**