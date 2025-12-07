# 📱 Guide de Build APK Android - Mon Toit

Ce guide détaille les étapes pour générer un APK Android de l'application Mon Toit.

---

## 📋 Prérequis

### Logiciels requis
- **Node.js** v18+ ([télécharger](https://nodejs.org/))
- **Android Studio** Arctic Fox ou supérieur ([télécharger](https://developer.android.com/studio))
- **Java JDK 17** (inclus avec Android Studio)
- **Git** ([télécharger](https://git-scm.com/))

### Configuration Android Studio
1. Ouvrir Android Studio
2. Aller dans **SDK Manager** (Tools > SDK Manager)
3. Installer :
   - Android SDK Platform 33 (Android 13) ou supérieur
   - Android SDK Build-Tools 33.0.0+
   - Android SDK Command-line Tools

### Variables d'environnement
Ajouter au PATH :
```bash
# macOS/Linux (~/.bashrc ou ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Windows (Variables système)
ANDROID_HOME=C:\Users\<user>\AppData\Local\Android\Sdk
```

---

## 🚀 Étapes de Build

### 1. Cloner et préparer le projet

```bash
# Cloner le repository
git clone <url-du-repo>
cd mon-toit

# Installer les dépendances
npm install
```

### 2. Build du projet web

```bash
# Build de production
npm run build
```

### 3. Initialiser Capacitor Android

```bash
# Ajouter la plateforme Android (première fois seulement)
npx cap add android

# Synchroniser le projet
npx cap sync android
```

### 4. Configuration Production

**IMPORTANT** : Avant le build de production, modifier `capacitor.config.ts` :

```typescript
// SUPPRIMER ou commenter le bloc server pour la production :
// server: {
//   url: 'https://...',
//   cleartext: true
// }
```

Ou utiliser `capacitor.config.production.ts` :
```bash
cp capacitor.config.production.ts capacitor.config.ts
npx cap sync android
```

### 5. Ouvrir dans Android Studio

```bash
npx cap open android
```

---

## 🔐 Génération du Keystore (Signature)

### Créer un nouveau keystore

```bash
keytool -genkey -v -keystore montoit-release.keystore \
  -alias montoit \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Répondez aux questions :
- **Mot de passe keystore** : Créez un mot de passe fort (notez-le !)
- **Prénom et nom** : Votre nom ou celui de l'entreprise
- **Unité organisationnelle** : Développement
- **Organisation** : Mon Toit
- **Ville** : Abidjan
- **Province** : Lagunes
- **Code pays** : CI

### Placer le keystore

```bash
# Déplacer dans le dossier Android
mv montoit-release.keystore android/app/
```

### Configurer la signature dans `android/app/build.gradle`

Ajouter dans le bloc `android { }` :

```gradle
android {
    // ... autres configs ...
    
    signingConfigs {
        release {
            storeFile file('montoit-release.keystore')
            storePassword 'VOTRE_MOT_DE_PASSE_KEYSTORE'
            keyAlias 'montoit'
            keyPassword 'VOTRE_MOT_DE_PASSE_CLE'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

⚠️ **SÉCURITÉ** : Ne jamais commiter les mots de passe ! Utilisez des variables d'environnement :

```gradle
signingConfigs {
    release {
        storeFile file('montoit-release.keystore')
        storePassword System.getenv('KEYSTORE_PASSWORD') ?: ''
        keyAlias 'montoit'
        keyPassword System.getenv('KEY_PASSWORD') ?: ''
    }
}
```

---

## 📦 Build de l'APK

### Option A : Via Android Studio (Recommandé)

1. Ouvrir le projet : `npx cap open android`
2. Menu **Build** > **Generate Signed Bundle / APK...**
3. Sélectionner **APK**
4. Choisir le keystore et entrer les mots de passe
5. Sélectionner **release**
6. Cliquer **Create**

L'APK sera dans : `android/app/release/app-release.apk`

### Option B : Via ligne de commande

```bash
cd android

# Build APK Debug (sans signature)
./gradlew assembleDebug

# Build APK Release (avec signature configurée)
./gradlew assembleRelease

# Build Bundle AAB (pour Play Store)
./gradlew bundleRelease
```

Emplacements des fichiers :
- APK Debug : `android/app/build/outputs/apk/debug/app-debug.apk`
- APK Release : `android/app/build/outputs/apk/release/app-release.apk`
- AAB : `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🎨 Assets Android

### Structure des icônes

Créer les icônes dans `android/app/src/main/res/` :

| Dossier | Taille | Fichier |
|---------|--------|---------|
| mipmap-mdpi | 48x48 | ic_launcher.png |
| mipmap-hdpi | 72x72 | ic_launcher.png |
| mipmap-xhdpi | 96x96 | ic_launcher.png |
| mipmap-xxhdpi | 144x144 | ic_launcher.png |
| mipmap-xxxhdpi | 192x192 | ic_launcher.png |

### Structure du Splash Screen

| Dossier | Orientation | Taille |
|---------|-------------|--------|
| drawable | Portrait | 480x800 |
| drawable-land | Paysage | 800x480 |
| drawable-hdpi | Portrait HD | 720x1280 |
| drawable-xhdpi | Portrait XHD | 960x1600 |
| drawable-xxhdpi | Portrait XXHD | 1280x1920 |

### Outil recommandé

Utilisez [capacitor-assets](https://github.com/ionic-team/capacitor-assets) :

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --android
```

---

## 📝 Permissions Android

Le fichier `android/app/src/main/AndroidManifest.xml` doit inclure :

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissions réseau -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Caméra (pour photos de propriétés) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    
    <!-- Géolocalisation -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Stockage -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <!-- Notifications -->
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- ... reste du manifest ... -->
</manifest>
```

---

## 🧪 Test de l'APK

### Sur émulateur

```bash
# Lister les émulateurs disponibles
emulator -list-avds

# Lancer un émulateur
emulator -avd Pixel_6_API_33

# Installer l'APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Sur appareil physique

1. Activer le **Mode développeur** sur le téléphone
2. Activer le **Débogage USB**
3. Connecter le téléphone via USB
4. Autoriser la connexion sur le téléphone
5. Installer :

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🏪 Publication Play Store

### Prérequis
- Compte Google Play Developer (25$ une fois)
- Fichier AAB (Android App Bundle)
- Captures d'écran (min. 2 par type d'écran)
- Icône 512x512 PNG
- Description courte (80 caractères max)
- Description longue (4000 caractères max)
- Politique de confidentialité (URL)

### Processus
1. Générer le bundle : `./gradlew bundleRelease`
2. Accéder à [Google Play Console](https://play.google.com/console)
3. Créer une nouvelle application
4. Remplir les informations de la fiche
5. Uploader le fichier AAB
6. Soumettre pour révision

---

## 🔧 Dépannage

### Erreur : "SDK location not found"
Créer `android/local.properties` :
```properties
sdk.dir=/Users/<user>/Library/Android/sdk
# ou Windows :
sdk.dir=C\:\\Users\\<user>\\AppData\\Local\\Android\\Sdk
```

### Erreur : "Execution failed for task ':app:processDebugResources'"
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Erreur : "AAPT2 error"
Vérifier qu'aucune image n'a d'extension incorrecte ou de caractères spéciaux.

### Build très lent
Ajouter dans `android/gradle.properties` :
```properties
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.jvmargs=-Xmx4096m
```

---

## 📞 Support

Pour toute question :
- Email : support@montoit.ci
- WhatsApp : +225 07 09 75 32 32

---

*Guide mis à jour le : Décembre 2024*
