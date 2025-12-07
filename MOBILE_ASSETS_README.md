# 📱 Mon Toit - Génération d'Assets Mobile

Script unifié pour générer automatiquement tous les assets Android et iOS.

## 🚀 Utilisation Rapide

```bash
# Installer Sharp (requis)
npm install sharp

# Générer tous les assets (Android + iOS)
node scripts/generate-mobile-assets.js

# Générer Android uniquement
node scripts/generate-mobile-assets.js --android

# Générer iOS uniquement
node scripts/generate-mobile-assets.js --ios

# Nettoyer et regénérer
node scripts/generate-mobile-assets.js --clean

# Mode verbeux
node scripts/generate-mobile-assets.js --verbose
```

## 📁 Structure Générée

### Android (`android-res/`)

```
android-res/
├── mipmap-mdpi/
│   ├── ic_launcher.png          (48x48)
│   ├── ic_launcher_round.png    (48x48)
│   └── ic_launcher_foreground.png
├── mipmap-hdpi/                  (72x72)
├── mipmap-xhdpi/                 (96x96)
├── mipmap-xxhdpi/                (144x144)
├── mipmap-xxxhdpi/               (192x192)
├── drawable/
│   └── splash.png
├── drawable-port-*/              (splash portrait)
├── drawable-land-*/              (splash landscape)
└── values/
    └── colors.xml
```

### iOS (`ios-assets/`)

```
ios-assets/
├── AppIcon.appiconset/
│   ├── Contents.json
│   ├── icon-40.png              (20pt @2x)
│   ├── icon-60.png              (20pt @3x)
│   ├── icon-58.png              (29pt @2x)
│   ├── icon-87.png              (29pt @3x)
│   ├── icon-80.png              (40pt @2x)
│   ├── icon-120.png             (40pt @3x, 60pt @2x)
│   ├── icon-180.png             (60pt @3x)
│   ├── icon-76.png              (76pt @1x)
│   ├── icon-152.png             (76pt @2x)
│   ├── icon-167.png             (83.5pt @2x)
│   └── icon-1024.png            (App Store)
├── Splash.imageset/
│   ├── Contents.json
│   └── splash-*.png             (différentes résolutions)
└── Colors/
    └── BrandColor.colorset/
        └── Contents.json
```

## 🎨 Personnalisation

### Logo Source

Placez votre logo dans `public/logo-montoit.png`:
- **Format recommandé**: PNG avec transparence
- **Taille recommandée**: 1024x1024 pixels
- **Forme**: Carré (sera recadré automatiquement)

### Couleurs

Modifiez `scripts/lib/common.js`:

```javascript
const BRAND_COLORS = {
  primary: '#FF6C2F',      // Couleur principale
  background: '#FFFFFF',    // Couleur de fond splash
};
```

## 🔧 Intégration Capacitor

### Android

```bash
# 1. Générer les assets
node scripts/generate-mobile-assets.js --android

# 2. Ajouter la plateforme (si pas déjà fait)
npx cap add android

# 3. Copier les assets
cp -r android-res/* android/app/src/main/res/

# 4. Synchroniser
npx cap sync android

# 5. Ouvrir Android Studio
npx cap open android
```

### iOS (Mac requis)

```bash
# 1. Générer les assets
node scripts/generate-mobile-assets.js --ios

# 2. Ajouter la plateforme (si pas déjà fait)
npx cap add ios

# 3. Copier les assets
cp -r ios-assets/* ios/App/App/Assets.xcassets/

# 4. Synchroniser
npx cap sync ios

# 5. Ouvrir Xcode
npx cap open ios
```

## 📊 Assets Générés

| Plateforme | Type | Nombre | Description |
|------------|------|--------|-------------|
| Android | Icons | 15 | 5 densités × 3 types |
| Android | Splash | 11 | Portrait + Landscape |
| iOS | Icons | 20 | iPhone + iPad + Store |
| iOS | Splash | 10 | Toutes résolutions |
| **Total** | - | **56** | - |

## ⚠️ Prérequis

- **Node.js** 18+
- **Sharp** (`npm install sharp`)
- **Logo source** dans `public/logo-montoit.png`
- **macOS + Xcode** pour iOS
- **Android Studio** pour Android

## 🐛 Dépannage

### "sharp" non trouvé

```bash
npm install sharp
```

### Logo source non trouvé

Créez `public/logo-montoit.png` (1024x1024 recommandé).

### Erreurs de mémoire

Pour les très grandes images:
```bash
node --max-old-space-size=4096 scripts/generate-mobile-assets.js
```
