# GUIDE DES BONNES PRATIQUES D'ACCESSIBILITÉ
## MonToitVPROD - Guide Complet pour l'Équipe

---

## 🎯 PRINCIPES FONDAMENTAUX

### **Les 4 Piliers de l'Accessibilité**

1. **Perceptible** - Les informations doivent être présentées de manière à ce que les utilisateurs puissent les percevoir
2. **Utilisable** - Les composants d'interface doivent être utilisables
3. **Compréhensible** - Les informations et l'interface doivent être compréhensibles
4. **Robuste** - Le contenu doit être robuste pour permettre une interprétation par une grande variety d'agents utilisateurs

---

## 🖼️ IMAGES ET MÉDIAS

### **✅ Bonnes Pratiques**

#### 1. **Alt Text Descriptif**
```tsx
// ✅ BIEN - Descriptif et informatif
<img 
  src="/property/123/image.jpg"
  alt="Appartement 2 pièces salon avec canapé gris et télévision"
  className="w-full h-64 object-cover"
/>

// ✅ BIEN - Logo avec nom complet
<img
  src="/logo-montoit.png"
  alt="Mon Toit - Plateforme Immobilière ANSUT"
  className="h-12 w-12"
/>

// ✅ BIEN - Avatar utilisateur
<img
  src={user.avatar_url}
  alt={user.full_name ? `Avatar de ${user.full_name}` : 'Avatar utilisateur'}
  className="h-8 w-8 rounded-full"
/>
```

#### 2. **Images Décoratives**
```tsx
// ✅ BIEN - Image装饰ative masquée des lecteurs d'écran
<img
  src="/decorative-icon.svg"
  alt=""
  aria-hidden="true"
  className="inline-block w-4 h-4"
/>

// ✅ BIEN - Icône avec span pour le texte
<span className="inline-flex items-center">
  <Search className="w-4 h-4 mr-2" aria-hidden="true" />
  <span>Rechercher</span>
</span>
```

#### 3. **Images Complexes**
```tsx
// ✅ BIEN - Graphique avec description détaillée
<figure>
  <img src="/chart-revenus.png" alt="Graphique en barres montrant la progression des revenus de 2020 à 2024" />
  <figcaption>Évolution des revenus annuels (en milliers d'euros)</figcaption>
</figure>
```

### **❌ Pratiques à Éviter**

```tsx
// ❌ MAUVAIS - Alt text trop générique
<img src="property.jpg" alt="Photo" />

// ❌ MAUVAIS - Redondance avec le contexte
<p>Description de l'appartement</p>
<img src="appartement.jpg" alt="Description de l'appartement" />

// ❌ MAUVAIS - Pas d'informations utiles
<img src="graphique.png" alt="Image" />

// ❌ MAUVAIS - URL dans l'alt text
<img src="plan.jpg" alt="/images/plan-appartement.pdf" />
```

---

## 🔘 BOUTONS ET ÉLÉMENTS INTERACTIFS

### **✅ Bonnes Pratiques**

#### 1. **Boutons avec Texte**
```tsx
// ✅ BIEN - Texte descriptif
<button onClick={handleSubmit}>
  Créer mon compte
</button>

// ✅ BIEN - Icône + texte pour accessibilité
<button onClick={handleSave}>
  <Save className="w-4 h-4 mr-2" aria-hidden="true" />
  <span>Sauvegarder</span>
</button>
```

#### 2. **Boutons Iconographiques**
```tsx
// ✅ BIEN - Avec aria-label explicite
<button
  onClick={handleClose}
  aria-label="Fermer la fenêtre de dialogue"
  className="p-2 rounded-full hover:bg-gray-100"
>
  <X className="w-5 h-5" aria-hidden="true" />
</button>

// ✅ BIEN - Toggle avec aria-expanded
<button
  onClick={toggleMenu}
  aria-expanded={isOpen}
  aria-controls="main-menu"
  aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
>
  <Menu className="w-5 h-5" aria-hidden="true" />
</button>

// ✅ BIEN - Bouton de notification avec compteur
<button
  onClick={toggleNotifications}
  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : ', aucune notification'}`}
  className="relative p-2"
>
  <Bell className="w-5 h-5" aria-hidden="true" />
  {unreadCount > 0 && (
    <span
      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
      aria-label={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
```

#### 3. **Boutons de Style Link**
```tsx
// ✅ BIEN - Si c'est un bouton, utiliser <button>
<button onClick={handleAction} className="text-blue-600 underline hover:text-blue-800">
  Action personnalisée
</button>

// ✅ BIEN - Si c'est un lien, utiliser <a>
<a href="/profile" className="text-blue-600 underline hover:text-blue-800">
  Aller au profil
</a>
```

### **❌ Pratiques à Éviter**

```tsx
// ❌ MAUVAIS - Bouton sans contexte
<button onClick={() => {}}>
  <TrashIcon />
</button>

// ❌ MAUVAIS - Événements click sans support clavier
<div onClick={handleClick} className="clickable">
  Click me
</div>

// ❌ MAUVAIS - Liens styled comme des boutons sans href
<a className="btn btn-primary">
  Action
</a>
```

---

## 📝 FORMULAIRES

### **✅ Bonnes Pratiques**

#### 1. **Labels et Contrôles**
```tsx
// ✅ BIEN - Label explicite et associé
<label htmlFor="email" className="block text-sm font-medium text-gray-700">
  Adresse email
</label>
<input
  id="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
  aria-required="true"
  aria-describedby="email-error"
/>

// ✅ BIEN - Messages d'erreur associés
{errors.email && (
  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
    {errors.email}
  </p>
)}

// ✅ BIEN - Input avec placeholder ET label
<label htmlFor="search" className="sr-only">
  Rechercher une propriété
</label>
<input
  id="search"
  type="search"
  placeholder="Ville, quartier, prix..."
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
/>
```

#### 2. **Champs Requis**
```tsx
// ✅ BIEN - Indication de champ requis
<label htmlFor="password" className="block text-sm font-medium text-gray-700">
  Mot de passe <span className="text-red-500" aria-label="obligatoire">*</span>
</label>

// ✅ BIEN - Utilisation de aria-required
<input
  id="password"
  type="password"
  required
  aria-required="true"
  aria-describedby="password-help"
/>
<p id="password-help" className="text-sm text-gray-600">
  Au moins 8 caractères avec une majuscule, une minuscule et un chiffre
</p>
```

#### 3. **Groupes de Radio Buttons**
```tsx
// ✅ BIEN - Fieldset avec légende
<fieldset>
  <legend className="text-sm font-medium text-gray-700">
    Type de propriété
  </legend>
  <div className="mt-2 space-y-2">
    <div className="flex items-center">
      <input
        id="appartment"
        name="propertyType"
        type="radio"
        value="appartment"
        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
      />
      <label htmlFor="appartment" className="ml-3 text-sm text-gray-700">
        Appartement
      </label>
    </div>
    <div className="flex items-center">
      <input
        id="house"
        name="propertyType"
        type="radio"
        value="house"
        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
      />
      <label htmlFor="house" className="ml-3 text-sm text-gray-700">
        Maison
      </label>
    </div>
  </div>
</fieldset>
```

### **❌ Pratiques à Éviter**

```tsx
// ❌ MAUVAIS - Placeholder sans label
<input placeholder="Votre email" />

// ❌ MAUVAIS - ID non unique
<input id="input" />
<label htmlFor="input">Email</label>
<input id="input" />  {/* Conflit d'ID */}

// ❌ MAUVAIS - Messages d'erreur non associés
<input aria-label="Email" />
{errors.email && <p>{errors.email}</p>}  {/* Pas de lien avec le champ */}

// ❌ MAUVAIS - Fieldsets sans legend
<div>
  <input type="radio" name="choice" value="1" /> Choix 1
  <input type="radio" name="choice" value="2" /> Choix 2
</div>
```

---

## 🧭 NAVIGATION

### **✅ Bonnes Pratiques**

#### 1. **Menu Principal**
```tsx
// ✅ BIEN - Navigation sémantique avec landmarks
<nav aria-label="Navigation principale">
  <ul role="menubar">
    <li role="none">
      <a href="/" role="menuitem">
        Accueil
      </a>
    </li>
    <li role="none">
      <a href="/recherche" role="menuitem">
        Rechercher
      </a>
    </li>
  </ul>
</nav>
```

#### 2. **Breadcrumbs**
```tsx
// ✅ BIEN - Structure sémantique
<nav aria-label="Fil d'Ariane">
  <ol className="flex items-center space-x-2">
    <li>
      <a href="/" className="text-primary-600 hover:underline">
        Accueil
      </a>
    </li>
    <li aria-hidden="true">/</li>
    <li>
      <a href="/appartements" className="text-primary-600 hover:underline">
        Appartements
      </a>
    </li>
    <li aria-hidden="true">/</li>
    <li aria-current="page" className="text-gray-900 font-medium">
      Appartement 3 pièces - Cocody
    </li>
  </ol>
</nav>
```

#### 3. **Skip Links**
```tsx
// ✅ BIEN - Lien de navigation rapide
<body>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded z-50"
  >
    Aller au contenu principal
  </a>
  
  <header>
    {/* Navigation */}
  </header>
  
  <main id="main-content">
    {/* Contenu principal */}
  </main>
</body>
```

---

## 🎭 STRUCTURE ET CONTENU

### **✅ Bonnes Pratiques**

#### 1. **Hiérarchie des Titres**
```tsx
// ✅ BIEN - Structure logique
<h1>Mon Toit - Trouvez votre logement idéal</h1>
<h2>Propriétés disponibles</h2>
<h3>Appartements meublés</h3>
<h4>Studio centre-ville</h4>

// ❌ MAUVAIS - Sauts de niveau
<h1>Titre principal</h1>
<h3>Sous-titre sans h2</h3>  {/* Manque h2 */}
```

#### 2. **Listes**
```tsx
// ✅ BIEN - Liste ordonnée
<ol>
  <li>Étape 1: Rechercher</li>
  <li>Étape 2: Contacter</li>
  <li>Étape 3: Visiter</li>
</ol>

// ✅ BIEN - Liste non-ordonnée
<ul>
  <li>Appartement</li>
  <li>Maison</li>
  <li>Studio</li>
</ul>

// ❌ MAUVAIS - Éléments non sémantiques
<div>
  <div>• Appartement</div>
  <div>• Maison</div>
</div>
```

#### 3. **Tableaux**
```tsx
// ✅ BIEN - Tableau sémantique
<table>
  <caption>Prix des loyers par type de propriété</caption>
  <thead>
    <tr>
      <th scope="col">Type</th>
      <th scope="col">Prix moyen</th>
      <th scope="col">Surface</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Studio</th>
      <td>80 000 FCFA</td>
      <td>25 m²</td>
    </tr>
    <tr>
      <th scope="row">Appartement 2P</th>
      <td>120 000 FCFA</td>
      <td>45 m²</td>
    </tr>
  </tbody>
</table>
```

---

## 🎨 COULEURS ET CONTRASTE

### **✅ Bonnes Pratiques**

#### 1. **Contraste Minimum**
```css
/* ✅ BIEN - Texte sur fond blanc (4.5:1 minimum) */
.text-primary { color: #1e40af; } /* Contraste 5.4:1 */

/* ✅ BIEN - Texte sur fond sombre */
.text-white-on-dark { color: #ffffff; background: #1f2937; } /* Contraste 15.8:1 */

/* ✅ BIEN - Liens avec contraste suffisant */
.link { color: #2563eb; } /* Contraste 4.6:1 */

/* ❌ MAUVAIS - Contraste insuffisant */
.text-bad-contrast { color: #9ca3af; } /* Contraste 2.1:1 - INSUFFISANT */
```

#### 2. **Focus Visible**
```css
/* ✅ BIEN - Indicateur de focus visible */
.focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* ✅ BIEN - Focus avec box-shadow */
.focus-ring:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
}

/* ✅ BIEN - Respect de prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .animate {
    animation: none;
    transition: none;
  }
}
```

#### 3. **États des Éléments**
```css
/* ✅ BIEN - États différenciés */
.button {
  background-color: #2563eb;
  color: white;
}

.button:hover {
  background-color: #1d4ed8;
}

.button:active {
  background-color: #1e40af;
}

.button:disabled {
  background-color: #9ca3af;
  color: #6b7280;
}
```

---

## 📱 RESPONSIVE ET TOUCH

### **✅ Bonnes Pratiques**

#### 1. **Zones Touch**
```css
/* ✅ BIEN - Taille minimum 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* ✅ BIEN - Espacement entre éléments interactifs */
.interactive-elements {
  margin-bottom: 8px;
}
```

#### 2. **Orientation**
```css
/* ✅ BIEN - Adaptation à l'orientation */
@media (orientation: landscape) {
  .mobile-layout {
    flex-direction: row;
  }
}

@media (orientation: portrait) {
  .mobile-layout {
    flex-direction: column;
  }
}
```

---

## 🧪 TESTS D'ACCESSIBILITÉ

### **Tests Manuels**

#### 1. **Navigation au Clavier**
- [ ] Utiliser `Tab` pour naviguer
- [ ] Utiliser `Enter`/`Space` pour activer
- [ ] Vérifier l'ordre logique
- [ ] Vérifier les focus visibles

#### 2. **Lecteur d'Écran**
- [ ] Vérifier la lecture des éléments
- [ ] Tester les aria-labels
- [ ] Vérifier les annonces de changements

#### 3. **Zoom et Agrandissement**
- [ ] Tester jusqu'à 200% de zoom
- [ ] Vérifier la mise en page
- [ ] Vérifier la lisibilité

### **Tests Automatisés**

```bash
# Avec axe DevTools
npm install -g @axe-core/cli
axe-cli http://localhost:3000

# Avec jest-axe
npm test -- --testNamePattern="accessibility"
```

---

## 🚨 ERREURS COMMUNES À ÉVITER

### 1. **Problèmes de Structure**
```tsx
// ❌ MAUVAIS - Div au lieu de bouton
<div onClick={handleClick}>Action</div>

// ❌ MAUVAIS - Lien sans href
<a>Action</a>

// ❌ MAUVAIS - Images sans alt
<img src="image.jpg" />
```

### 2. **Problèmes d'Arborescence**
```tsx
// ❌ MAUVAIS - Sauts de niveau de titres
<h1>Titre 1</h1>
<h3>Sous-titre</h3>  {/* Manque h2 */}

// ❌ MAUVAIS - Mauvais usage des listes
<p>• Élément 1</p>
<p>• Élément 2</p>
```

### 3. **Problèmes d'ARIA**
```tsx
// ❌ MAUVAIS - ARIA superflu
<button aria-label="Button" aria-label="Another label">Click</button>

// ❌ MAUVAIS - ARIA incorrect
<div role="button" tabindex="0">Click</div>  {/* Utiliser <button> */}

// ❌ MAUVAIS - États non annoncés
<button aria-busy="false">Submit</button>  {/* Mettre à jour l'état */}
```

---

## 📚 RESSOURCES

### **Outils de Test**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### **Guides de Référence**
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)

### **Formation**
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

---

**Ce guide doit être consulté régulièrement et appliqué à chaque nouveau développement pour garantir une accessibilité optimale de la plateforme MonToitVPROD.**