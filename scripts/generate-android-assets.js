#!/usr/bin/env node

/**
 * Mon Toit - Android Assets Generator
 * 
 * Ce script génère automatiquement les icônes et splash screens Android
 * aux différentes résolutions requises.
 * 
 * Prérequis:
 *   npm install sharp
 * 
 * Usage:
 *   node scripts/generate-android-assets.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_LOGO = path.join(__dirname, '../public/logo-montoit.png');
const ANDROID_RES_DIR = path.join(__dirname, '../android/app/src/main/res');

// Mon Toit brand colors
const BRAND_ORANGE = '#ea580c';
const BRAND_WHITE = '#ffffff';

// Icon sizes configuration
const ICON_SIZES = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Foreground icon sizes (for adaptive icons, 108dp with safe zone)
const FOREGROUND_SIZES = [
  { folder: 'mipmap-mdpi', size: 108 },
  { folder: 'mipmap-hdpi', size: 162 },
  { folder: 'mipmap-xhdpi', size: 216 },
  { folder: 'mipmap-xxhdpi', size: 324 },
  { folder: 'mipmap-xxxhdpi', size: 432 },
];

// Splash screen sizes
const SPLASH_SIZES = [
  { folder: 'drawable', width: 480, height: 800 },
  { folder: 'drawable-land', width: 800, height: 480 },
  { folder: 'drawable-hdpi', width: 720, height: 1280 },
  { folder: 'drawable-xhdpi', width: 960, height: 1600 },
  { folder: 'drawable-xxhdpi', width: 1280, height: 1920 },
  { folder: 'drawable-xxxhdpi', width: 1920, height: 2880 },
];

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

/**
 * Generate launcher icons with orange background
 */
async function generateLauncherIcons() {
  console.log('\n🎨 Generating launcher icons...');
  
  for (const { folder, size } of ICON_SIZES) {
    const outputDir = path.join(ANDROID_RES_DIR, folder);
    ensureDir(outputDir);
    
    // Create icon with orange background and centered logo
    const logoSize = Math.floor(size * 0.6);
    const padding = Math.floor((size - logoSize) / 2);
    
    try {
      // Resize logo
      const resizedLogo = await sharp(SOURCE_LOGO)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      
      // Create square icon with orange background
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 234, g: 88, b: 12, alpha: 1 } // #ea580c
        }
      })
        .composite([{ input: resizedLogo, top: padding, left: padding }])
        .png()
        .toFile(path.join(outputDir, 'ic_launcher.png'));
      
      // Create round icon
      const roundMask = Buffer.from(
        `<svg width="${size}" height="${size}">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
        </svg>`
      );
      
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 234, g: 88, b: 12, alpha: 1 }
        }
      })
        .composite([{ input: resizedLogo, top: padding, left: padding }])
        .composite([{ input: roundMask, blend: 'dest-in' }])
        .png()
        .toFile(path.join(outputDir, 'ic_launcher_round.png'));
      
      console.log(`  ✅ ${folder}: ${size}x${size}px`);
    } catch (error) {
      console.error(`  ❌ Error generating ${folder}:`, error.message);
    }
  }
}

/**
 * Generate foreground icons for adaptive icons
 */
async function generateForegroundIcons() {
  console.log('\n🎨 Generating foreground icons (adaptive)...');
  
  for (const { folder, size } of FOREGROUND_SIZES) {
    const outputDir = path.join(ANDROID_RES_DIR, folder);
    ensureDir(outputDir);
    
    // Logo should be 66% of foreground size (safe zone)
    const logoSize = Math.floor(size * 0.5);
    const padding = Math.floor((size - logoSize) / 2);
    
    try {
      const resizedLogo = await sharp(SOURCE_LOGO)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([{ input: resizedLogo, top: padding, left: padding }])
        .png()
        .toFile(path.join(outputDir, 'ic_launcher_foreground.png'));
      
      console.log(`  ✅ ${folder}: ${size}x${size}px (foreground)`);
    } catch (error) {
      console.error(`  ❌ Error generating foreground ${folder}:`, error.message);
    }
  }
}

/**
 * Generate splash screens
 */
async function generateSplashScreens() {
  console.log('\n🎨 Generating splash screens...');
  
  for (const { folder, width, height } of SPLASH_SIZES) {
    const outputDir = path.join(ANDROID_RES_DIR, folder);
    ensureDir(outputDir);
    
    // Logo should be about 30% of the smaller dimension
    const logoSize = Math.floor(Math.min(width, height) * 0.3);
    const logoX = Math.floor((width - logoSize) / 2);
    const logoY = Math.floor((height - logoSize) / 2) - Math.floor(height * 0.05);
    
    try {
      const resizedLogo = await sharp(SOURCE_LOGO)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .toBuffer();
      
      // Create text "Mon Toit" as SVG
      const textSize = Math.floor(logoSize * 0.25);
      const textY = logoY + logoSize + Math.floor(height * 0.03);
      const textSvg = Buffer.from(
        `<svg width="${width}" height="${height}">
          <text x="${width/2}" y="${textY}" 
                font-family="Arial, sans-serif" 
                font-size="${textSize}" 
                font-weight="bold"
                fill="${BRAND_ORANGE}" 
                text-anchor="middle">Mon Toit</text>
        </svg>`
      );
      
      await sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
        .composite([
          { input: resizedLogo, top: logoY, left: logoX },
          { input: textSvg, top: 0, left: 0 }
        ])
        .png()
        .toFile(path.join(outputDir, 'splash_logo.png'));
      
      console.log(`  ✅ ${folder}: ${width}x${height}px`);
    } catch (error) {
      console.error(`  ❌ Error generating splash ${folder}:`, error.message);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🏠 Mon Toit - Android Assets Generator');
  console.log('=====================================');
  
  // Check if source logo exists
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error(`❌ Source logo not found: ${SOURCE_LOGO}`);
    console.log('Please ensure public/logo-montoit.png exists.');
    process.exit(1);
  }
  
  console.log(`📷 Source logo: ${SOURCE_LOGO}`);
  console.log(`📂 Output directory: ${ANDROID_RES_DIR}`);
  
  try {
    await generateLauncherIcons();
    await generateForegroundIcons();
    await generateSplashScreens();
    
    console.log('\n✅ All assets generated successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npx cap sync android');
    console.log('   2. Open Android Studio: npx cap open android');
    console.log('   3. Build your APK: Build > Generate Signed Bundle/APK');
  } catch (error) {
    console.error('\n❌ Error generating assets:', error);
    process.exit(1);
  }
}

main();
