# 🎨 Mon Toit - Android Assets Guide

## Vue d'ensemble

Ce guide explique comment générer les icônes et splash screens Android pour l'application Mon Toit.

## 📁 Structure des Assets

```
android/app/src/main/res/
├── mipmap-mdpi/           # 48x48px (160 dpi)
│   ├── ic_launcher.png
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
├── mipmap-hdpi/           # 72x72px (240 dpi)
├── mipmap-xhdpi/          # 96x96px (320 dpi)
├── mipmap-xxhdpi/         # 144x144px (480 dpi)
├── mipmap-xxxhdpi/        # 192x192px (640 dpi)
├── mipmap-anydpi-v26/     # Adaptive icons (Android 8+)
│   ├── ic_launcher.xml
│   └── ic_launcher_round.xml
├── drawable/              # Splash 480x800px
├── drawable-land/         # Splash paysage 800x480px
├── drawable-hdpi/         # Splash 720x1280px
├── drawable-xhdpi/        # Splash 960x1600px
├── drawable-xxhdpi/       # Splash 1280x1920px
├── drawable-xxxhdpi/      # Splash 1920x2880px
└── values/
    ├── colors.xml         # Couleurs Mon Toit
    └── styles.xml         # Thèmes et styles
```

## 🚀 Méthode 1 : Script Automatique (Recommandé)

### Prérequis

```bash
npm install sharp
```

### Exécution

```bash
node scripts/generate-android-assets.js
```

Le script génère automatiquement :
- ✅ Icônes launcher (toutes résolutions)
- ✅ Icônes rondes (toutes résolutions)
- ✅ Foreground pour adaptive icons
- ✅ Splash screens (portrait et paysage)

## 🎨 Méthode 2 : Android Asset Studio (En ligne)

1. Accédez à [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

2. **Configuration pour ic_launcher :**
   - Source : Upload `public/logo-montoit.png`
   - Shape : Square ou Circle
   - Color : `#ea580c` (orange Mon Toit)
   - Scaling : Shrink to fit

3. **Téléchargez** le ZIP et extrayez dans `android/app/src/main/res/`

## 🖌️ Méthode 3 : Création Manuelle (Figma/Canva)

### Spécifications des Icônes

| Densité | Taille icône | Taille foreground |
|---------|--------------|-------------------|
| mdpi    | 48x48        | 108x108           |
| hdpi    | 72x72        | 162x162           |
| xhdpi   | 96x96        | 216x216           |
| xxhdpi  | 144x144      | 324x324           |
| xxxhdpi | 192x192      | 432x432           |

### Design de l'Icône

```
┌─────────────────┐
│    #ea580c      │  ← Fond orange Mon Toit
│   ┌───────┐     │
│   │  🏠   │     │  ← Logo blanc centré (60% de la taille)
│   └───────┘     │
│                 │
└─────────────────┘
```

### Spécifications du Splash Screen

| Dossier          | Dimensions  | Orientation |
|------------------|-------------|-------------|
| drawable         | 480x800     | Portrait    |
| drawable-land    | 800x480     | Paysage     |
| drawable-hdpi    | 720x1280    | Portrait    |
| drawable-xhdpi   | 960x1600    | Portrait    |
| drawable-xxhdpi  | 1280x1920   | Portrait    |
| drawable-xxxhdpi | 1920x2880   | Portrait    |

### Design du Splash Screen

```
┌─────────────────────────┐
│                         │
│         #ffffff         │  ← Fond blanc
│                         │
│       ┌───────┐         │
│       │  🏠   │         │  ← Logo Mon Toit centré
│       └───────┘         │
│                         │
│      "Mon Toit"         │  ← Texte orange #ea580c
│                         │
│                         │
└─────────────────────────┘
```

## 🎨 Palette de Couleurs

| Nom            | Hex       | Usage                    |
|----------------|-----------|--------------------------|
| Primary        | `#ea580c` | Couleur principale       |
| Primary Dark   | `#c2410c` | Status bar               |
| Accent         | `#f97316` | Accents et highlights    |
| Background     | `#ffffff` | Fond splash et app       |

## ✅ Vérification

Après génération, vérifiez que tous les fichiers existent :

```bash
# Vérifier les icônes
ls -la android/app/src/main/res/mipmap-*/

# Vérifier les splash
ls -la android/app/src/main/res/drawable*/splash*.png
```

## 🔄 Synchronisation

Après avoir généré les assets :

```bash
# Synchroniser avec le projet Android
npx cap sync android

# Ouvrir dans Android Studio pour vérifier
npx cap open android
```

## 📱 Test sur Appareil

1. Connectez un appareil Android en mode développeur
2. Dans Android Studio : `Run > Run 'app'`
3. Vérifiez l'icône sur l'écran d'accueil
4. Vérifiez le splash screen au lancement

## 🐛 Problèmes Courants

### L'icône apparaît carrée sur Android 8+

→ Assurez-vous que `mipmap-anydpi-v26/ic_launcher.xml` existe et référence correctement le foreground.

### Le splash screen est déformé

→ Utilisez une image 9-patch ou le format XML layer-list (déjà configuré dans `drawable/splash.xml`).

### Les couleurs ne correspondent pas

→ Vérifiez que `values/colors.xml` utilise les codes hex corrects.

---

📚 **Documentation officielle** : [Capacitor Android Configuration](https://capacitorjs.com/docs/android/configuration)
