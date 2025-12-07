#!/usr/bin/env node

/**
 * Script de génération des assets iOS pour Mon Toit
 * 
 * Ce script génère automatiquement :
 * - Les icônes d'application (AppIcon.appiconset)
 * - Les images du splash screen (Splash.imageset)
 * 
 * Prérequis :
 * - Node.js 18+
 * - npm install sharp
 * 
 * Usage :
 * node scripts/generate-ios-assets.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration des couleurs Mon Toit
const BRAND_COLORS = {
  primary: '#ea580c',
  primaryDark: '#c2410c',
  background: '#ffffff',
};

// Configuration des icônes iOS
const IOS_ICON_SIZES = [
  // iPhone Notification
  { size: 20, scale: 2, idiom: 'iphone', filename: 'Icon-App-20x20@2x.png' },
  { size: 20, scale: 3, idiom: 'iphone', filename: 'Icon-App-20x20@3x.png' },
  // iPhone Settings
  { size: 29, scale: 2, idiom: 'iphone', filename: 'Icon-App-29x29@2x.png' },
  { size: 29, scale: 3, idiom: 'iphone', filename: 'Icon-App-29x29@3x.png' },
  // iPhone Spotlight
  { size: 40, scale: 2, idiom: 'iphone', filename: 'Icon-App-40x40@2x.png' },
  { size: 40, scale: 3, idiom: 'iphone', filename: 'Icon-App-40x40@3x.png' },
  // iPhone App
  { size: 60, scale: 2, idiom: 'iphone', filename: 'Icon-App-60x60@2x.png' },
  { size: 60, scale: 3, idiom: 'iphone', filename: 'Icon-App-60x60@3x.png' },
  // iPad Notification
  { size: 20, scale: 1, idiom: 'ipad', filename: 'Icon-App-20x20@1x.png' },
  { size: 20, scale: 2, idiom: 'ipad', filename: 'Icon-App-20x20@2x-1.png' },
  // iPad Settings
  { size: 29, scale: 1, idiom: 'ipad', filename: 'Icon-App-29x29@1x.png' },
  { size: 29, scale: 2, idiom: 'ipad', filename: 'Icon-App-29x29@2x-1.png' },
  // iPad Spotlight
  { size: 40, scale: 1, idiom: 'ipad', filename: 'Icon-App-40x40@1x.png' },
  { size: 40, scale: 2, idiom: 'ipad', filename: 'Icon-App-40x40@2x-1.png' },
  // iPad App
  { size: 76, scale: 1, idiom: 'ipad', filename: 'Icon-App-76x76@1x.png' },
  { size: 76, scale: 2, idiom: 'ipad', filename: 'Icon-App-76x76@2x.png' },
  // iPad Pro
  { size: 83.5, scale: 2, idiom: 'ipad', filename: 'Icon-App-83.5x83.5@2x.png' },
  // App Store
  { size: 1024, scale: 1, idiom: 'ios-marketing', filename: 'Icon-App-1024x1024@1x.png' },
];

// Configuration des images splash iOS
const IOS_SPLASH_SIZES = [
  { width: 1242, height: 2688, scale: 3, filename: 'splash-2688h.png' }, // iPhone XS Max
  { width: 1125, height: 2436, scale: 3, filename: 'splash-2436h.png' }, // iPhone X/XS
  { width: 828, height: 1792, scale: 2, filename: 'splash-1792h.png' },  // iPhone XR
  { width: 1242, height: 2208, scale: 3, filename: 'splash-2208h.png' }, // iPhone 8 Plus
  { width: 750, height: 1334, scale: 2, filename: 'splash-1334h.png' },  // iPhone 8
  { width: 640, height: 1136, scale: 2, filename: 'splash-1136h.png' },  // iPhone SE
  { width: 2048, height: 2732, scale: 2, filename: 'splash-2732h.png' }, // iPad Pro 12.9
  { width: 1668, height: 2388, scale: 2, filename: 'splash-2388h.png' }, // iPad Pro 11
  { width: 1536, height: 2048, scale: 2, filename: 'splash-2048h.png' }, // iPad
];

// Chemins
const SOURCE_LOGO = path.join(__dirname, '../public/logo-montoit.png');
const OUTPUT_DIR = path.join(__dirname, '../ios-assets');
const ICONS_DIR = path.join(OUTPUT_DIR, 'AppIcon.appiconset');
const SPLASH_DIR = path.join(OUTPUT_DIR, 'Splash.imageset');

/**
 * Crée les dossiers de sortie
 */
function createDirectories() {
  const dirs = [OUTPUT_DIR, ICONS_DIR, SPLASH_DIR];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Créé: ${dir}`);
    }
  });
}

/**
 * Génère une icône iOS avec fond coloré
 */
async function generateIcon(config) {
  const pixelSize = Math.round(config.size * config.scale);
  const outputPath = path.join(ICONS_DIR, config.filename);
  
  try {
    // Créer un fond orange
    const background = await sharp({
      create: {
        width: pixelSize,
        height: pixelSize,
        channels: 4,
        background: { r: 234, g: 88, b: 12, alpha: 1 } // #ea580c
      }
    }).png().toBuffer();
    
    // Redimensionner le logo (70% de la taille de l'icône)
    const logoSize = Math.round(pixelSize * 0.7);
    const logo = await sharp(SOURCE_LOGO)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    
    // Superposer le logo sur le fond
    const offset = Math.round((pixelSize - logoSize) / 2);
    await sharp(background)
      .composite([{ input: logo, left: offset, top: offset }])
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Icône générée: ${config.filename} (${pixelSize}x${pixelSize})`);
  } catch (error) {
    console.error(`❌ Erreur génération icône ${config.filename}:`, error.message);
  }
}

/**
 * Génère une image splash screen iOS
 */
async function generateSplash(config) {
  const outputPath = path.join(SPLASH_DIR, config.filename);
  
  try {
    // Créer un fond blanc
    const background = await sharp({
      create: {
        width: config.width,
        height: config.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    }).png().toBuffer();
    
    // Redimensionner le logo (30% de la largeur)
    const logoSize = Math.round(config.width * 0.3);
    const logo = await sharp(SOURCE_LOGO)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    
    // Centrer le logo
    const leftOffset = Math.round((config.width - logoSize) / 2);
    const topOffset = Math.round((config.height - logoSize) / 2);
    
    await sharp(background)
      .composite([{ input: logo, left: leftOffset, top: topOffset }])
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Splash générée: ${config.filename} (${config.width}x${config.height})`);
  } catch (error) {
    console.error(`❌ Erreur génération splash ${config.filename}:`, error.message);
  }
}

/**
 * Génère le fichier Contents.json pour les icônes
 */
function generateIconsContentsJson() {
  const contents = {
    images: IOS_ICON_SIZES.map(config => ({
      filename: config.filename,
      idiom: config.idiom,
      scale: `${config.scale}x`,
      size: `${config.size}x${config.size}`
    })),
    info: {
      author: 'xcode',
      version: 1
    }
  };
  
  const outputPath = path.join(ICONS_DIR, 'Contents.json');
  fs.writeFileSync(outputPath, JSON.stringify(contents, null, 2));
  console.log(`✅ Contents.json icônes généré`);
}

/**
 * Génère le fichier Contents.json pour le splash
 */
function generateSplashContentsJson() {
  const contents = {
    images: IOS_SPLASH_SIZES.map(config => ({
      filename: config.filename,
      idiom: 'universal',
      scale: `${config.scale}x`
    })),
    info: {
      author: 'xcode',
      version: 1
    }
  };
  
  const outputPath = path.join(SPLASH_DIR, 'Contents.json');
  fs.writeFileSync(outputPath, JSON.stringify(contents, null, 2));
  console.log(`✅ Contents.json splash généré`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🍎 Génération des assets iOS pour Mon Toit\n');
  
  // Vérifier le logo source
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error(`❌ Logo source non trouvé: ${SOURCE_LOGO}`);
    console.log('💡 Assurez-vous que public/logo-montoit.png existe');
    process.exit(1);
  }
  
  // Créer les dossiers
  createDirectories();
  
  console.log('\n📱 Génération des icônes iOS...');
  for (const config of IOS_ICON_SIZES) {
    await generateIcon(config);
  }
  
  console.log('\n🎨 Génération des splash screens iOS...');
  for (const config of IOS_SPLASH_SIZES) {
    await generateSplash(config);
  }
  
  console.log('\n📄 Génération des fichiers Contents.json...');
  generateIconsContentsJson();
  generateSplashContentsJson();
  
  console.log('\n✅ Génération terminée!');
  console.log(`\n📁 Assets générés dans: ${OUTPUT_DIR}`);
  console.log('\n📋 Prochaines étapes:');
  console.log('1. npx cap add ios');
  console.log('2. cp -r ios-assets/* ios/App/App/Assets.xcassets/');
  console.log('3. npx cap sync ios');
  console.log('4. npx cap open ios');
}

// Exécuter
main().catch(console.error);
