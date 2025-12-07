# 🍎 Assets iOS - Mon Toit

Ce document décrit la structure et la génération des assets iOS pour l'application Mon Toit.

## 📁 Structure des Assets

```
ios-assets/
├── AppIcon.appiconset/          # Icônes de l'application
│   ├── Contents.json            # Manifeste des icônes
│   ├── Icon-App-20x20@2x.png    # 40x40 - iPhone Notification
│   ├── Icon-App-20x20@3x.png    # 60x60 - iPhone Notification
│   ├── Icon-App-29x29@2x.png    # 58x58 - iPhone Settings
│   ├── Icon-App-29x29@3x.png    # 87x87 - iPhone Settings
│   ├── Icon-App-40x40@2x.png    # 80x80 - iPhone Spotlight
│   ├── Icon-App-40x40@3x.png    # 120x120 - iPhone Spotlight
│   ├── Icon-App-60x60@2x.png    # 120x120 - iPhone App
│   ├── Icon-App-60x60@3x.png    # 180x180 - iPhone App
│   ├── Icon-App-76x76@1x.png    # 76x76 - iPad App
│   ├── Icon-App-76x76@2x.png    # 152x152 - iPad App
│   ├── Icon-App-83.5x83.5@2x.png # 167x167 - iPad Pro
│   └── Icon-App-1024x1024@1x.png # 1024x1024 - App Store
│
└── Splash.imageset/             # Images du splash screen
    ├── Contents.json            # Manifeste splash
    ├── splash-logo.png          # 1x
    ├── splash-logo@2x.png       # 2x
    └── splash-logo@3x.png       # 3x
```

## 🎨 Spécifications de Design

### Icônes d'Application

| Propriété | Valeur |
|-----------|--------|
| Fond | Orange Mon Toit (#ea580c) |
| Logo | Blanc, centré, 70% de la taille |
| Format | PNG avec transparence |
| Coins | Automatiquement arrondis par iOS |

### Splash Screen

| Propriété | Valeur |
|-----------|--------|
| Fond | Blanc (#ffffff) |
| Logo | Centré, 30% de la largeur |
| Animation | Fade out 300ms |
| Durée | 2 secondes |

## 🔧 Génération Automatique

### Méthode 1 : Script Node.js (Recommandé)

```bash
# Installer les dépendances
npm install sharp

# Exécuter le script
node scripts/generate-ios-assets.js
```

Le script génère tous les assets à partir de `public/logo-montoit.png`.

### Méthode 2 : Xcode Asset Catalog

1. Ouvrir le projet dans Xcode
2. Sélectionner `Assets.xcassets`
3. Glisser-déposer les images dans les emplacements appropriés

### Méthode 3 : Outils en ligne

- [App Icon Generator](https://appicon.co/) - Génère toutes les tailles d'icônes
- [Make App Icon](https://makeappicon.com/) - Alternative gratuite
- [Figma iOS App Icon Template](https://www.figma.com/community) - Templates Figma

## 📋 Installation dans le Projet iOS

### Après génération des assets :

```bash
# Copier les assets vers le projet Capacitor iOS
cp -r ios-assets/AppIcon.appiconset ios/App/App/Assets.xcassets/
cp -r ios-assets/Splash.imageset ios/App/App/Assets.xcassets/

# Synchroniser
npx cap sync ios
```

### Vérification dans Xcode :

1. Ouvrir `ios/App/App.xcworkspace`
2. Sélectionner `Assets.xcassets`
3. Vérifier que toutes les icônes sont présentes (pas de cases vides)

## ⚠️ Exigences Apple

### Icône App Store (1024x1024)

- **Obligatoire** pour la soumission
- Pas de transparence
- Pas de coins arrondis (iOS les ajoute automatiquement)
- Pas de couche alpha

### Icônes d'application

- Toutes les tailles requises doivent être présentes
- Même design à toutes les échelles
- Contraste suffisant pour la lisibilité

## 🔍 Dépannage

### "Missing required icon file"

→ Vérifier que toutes les tailles sont présentes dans `Contents.json`

### Icône floue sur certains appareils

→ Vérifier la résolution exacte (pas de redimensionnement par iOS)

### Splash screen ne s'affiche pas

→ Vérifier que `Splash.imageset` contient les 3 résolutions (@1x, @2x, @3x)

## 📱 Test des Assets

### Sur Simulateur

```bash
npx cap run ios --target "iPhone 15 Pro"
```

### Sur Appareil

```bash
npx cap run ios --target <device-id>
```

## 📞 Ressources

- [Human Interface Guidelines - App Icon](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Asset Catalog Format Reference](https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/)
