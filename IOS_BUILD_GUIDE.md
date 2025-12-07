# 🍎 Guide de Build iOS - Mon Toit

Ce guide détaille les étapes pour compiler et publier l'application Mon Toit sur iOS.

## 📋 Prérequis

### Matériel et Logiciels
- **Mac** avec macOS 13 (Ventura) ou supérieur
- **Xcode 15+** (téléchargeable depuis l'App Store)
- **Node.js 18+** et npm
- **CocoaPods** (gestionnaire de dépendances iOS)

### Compte Apple Developer
- **Apple Developer Account** (99$/an) pour publier sur l'App Store
- Certificats de développement et distribution configurés
- App ID créé dans Apple Developer Portal

## 🚀 Étapes de Build

### 1. Préparation de l'environnement

```bash
# Cloner et installer les dépendances
git clone <repository>
cd mon-toit
npm install

# Installer CocoaPods (si pas déjà fait)
sudo gem install cocoapods
```

### 2. Générer les assets iOS

```bash
# Installer Sharp pour la génération d'images
npm install sharp

# Générer les icônes et splash screens
node scripts/generate-ios-assets.js
```

### 3. Build du projet web

```bash
npm run build
```

### 4. Ajouter la plateforme iOS

```bash
# Ajouter iOS à Capacitor
npx cap add ios

# Copier les assets générés vers le projet iOS
cp -r ios-assets/AppIcon.appiconset ios/App/App/Assets.xcassets/
cp -r ios-assets/Splash.imageset ios/App/App/Assets.xcassets/

# Synchroniser le projet
npx cap sync ios
```

### 5. Ouvrir dans Xcode

```bash
npx cap open ios
```

## ⚙️ Configuration Xcode

### Signing & Capabilities

1. Ouvrir le projet dans Xcode
2. Sélectionner **App** dans le navigateur de projet
3. Onglet **Signing & Capabilities**
4. Sélectionner votre **Team** (compte développeur)
5. Vérifier que **Automatically manage signing** est activé

### Capabilities à activer

- **Push Notifications** - Pour les notifications
- **Background Modes** → Remote notifications
- **Associated Domains** - Pour les deep links (optionnel)

### Info.plist - Permissions

Ajouter les descriptions de permissions dans `ios/App/App/Info.plist` :

```xml
<!-- Caméra -->
<key>NSCameraUsageDescription</key>
<string>Mon Toit utilise la caméra pour prendre des photos de profil et de propriétés.</string>

<!-- Galerie photos -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Mon Toit accède à vos photos pour les télécharger sur votre profil ou vos annonces.</string>

<!-- Localisation -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Mon Toit utilise votre position pour trouver des propriétés à proximité.</string>

<!-- Face ID -->
<key>NSFaceIDUsageDescription</key>
<string>Mon Toit utilise Face ID pour une connexion sécurisée.</string>
```

## 🧪 Test sur appareil

### Simulateur

1. Dans Xcode, sélectionner un simulateur (iPhone 15 Pro recommandé)
2. Cliquer sur ▶️ **Run** ou `Cmd + R`

### Appareil physique

1. Connecter l'iPhone via USB
2. Faire confiance à l'ordinateur sur l'iPhone
3. Sélectionner l'appareil dans Xcode
4. Cliquer sur ▶️ **Run**

## 📦 Création de l'Archive (Build de production)

### 1. Configurer le schéma de build

1. Menu **Product** → **Scheme** → **Edit Scheme**
2. Sélectionner **Archive** dans la colonne de gauche
3. Vérifier que **Build Configuration** est sur **Release**

### 2. Créer l'archive

1. Menu **Product** → **Archive** (ou `Cmd + Shift + A`)
2. Attendre la fin de la compilation
3. L'archive apparaît dans l'Organizer

### 3. Distribuer l'application

1. Dans l'Organizer, sélectionner l'archive
2. Cliquer sur **Distribute App**
3. Choisir **App Store Connect** pour publier
4. Suivre les étapes de validation

## 🏪 Publication sur App Store

### App Store Connect

1. Se connecter à [App Store Connect](https://appstoreconnect.apple.com)
2. Créer une nouvelle app avec le même Bundle ID
3. Remplir les informations :
   - **Nom** : Mon Toit
   - **Sous-titre** : Votre logement idéal en Côte d'Ivoire
   - **Catégorie** : Lifestyle / Immobilier
   - **Description** : (voir ci-dessous)
   - **Mots-clés** : immobilier, location, Côte d'Ivoire, appartement, maison
   - **Captures d'écran** : 6.5" et 5.5" minimum

### Description App Store

```
Mon Toit - Trouvez votre logement idéal en Côte d'Ivoire

🏠 RECHERCHEZ parmi des milliers de propriétés vérifiées
📍 LOCALISEZ les biens près de chez vous sur la carte
💬 CONTACTEZ directement les propriétaires
📝 POSTULEZ en ligne avec votre dossier de confiance
✅ VÉRIFIEZ l'authenticité des annonces et des propriétaires

Fonctionnalités :
• Recherche avancée par ville, quartier, prix et critères
• Carte interactive avec géolocalisation
• Messagerie intégrée style WhatsApp
• Score de confiance pour locataires et propriétaires
• Notifications en temps réel
• Gestion des visites et candidatures

Mon Toit révolutionne la location immobilière en Côte d'Ivoire avec une plateforme de confiance qui connecte locataires et propriétaires en toute transparence.
```

### Captures d'écran requises

| Appareil | Taille | Quantité |
|----------|--------|----------|
| iPhone 6.7" | 1290 x 2796 | 3-10 |
| iPhone 6.5" | 1284 x 2778 | 3-10 |
| iPhone 5.5" | 1242 x 2208 | 3-10 |
| iPad Pro 12.9" | 2048 x 2732 | 3-10 (optionnel) |

## 🔧 Dépannage

### Erreur "No signing certificate"

```bash
# Révoquer et recréer les certificats
# Dans Xcode : Preferences → Accounts → Manage Certificates
```

### Erreur "Provisioning profile doesn't match"

1. Supprimer les profils existants dans Xcode
2. Activer "Automatically manage signing"
3. Xcode recréera les profils

### Build échoue avec erreur CocoaPods

```bash
cd ios/App
pod deintegrate
pod install
cd ../..
npx cap sync ios
```

### L'app plante au lancement

1. Vérifier les permissions dans Info.plist
2. Vérifier la configuration Capacitor
3. Tester sur simulateur d'abord

## 📱 Configuration Hot Reload (Développement)

Pour tester avec hot reload depuis le sandbox Lovable :

```typescript
// capacitor.config.ts (déjà configuré)
server: {
  url: 'https://4d8f5937-4e73-4af7-a740-286b13067a1d.lovableproject.com?forceHideBadge=true',
  cleartext: true
}
```

⚠️ **Important** : Supprimer cette configuration avant le build de production !

## 📞 Support

- Documentation Capacitor : https://capacitorjs.com/docs/ios
- Apple Developer : https://developer.apple.com
- Mon Toit Support : contact@montoit.ci
