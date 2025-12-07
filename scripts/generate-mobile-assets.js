#!/usr/bin/env node

/**
 * Mon Toit - Unified Mobile Assets Generator
 * 
 * Génère automatiquement tous les assets Android et iOS
 * 
 * Usage:
 *   node scripts/generate-mobile-assets.js           # Génère Android + iOS
 *   node scripts/generate-mobile-assets.js --android # Android uniquement
 *   node scripts/generate-mobile-assets.js --ios     # iOS uniquement
 *   node scripts/generate-mobile-assets.js --clean   # Nettoie avant génération
 *   node scripts/generate-mobile-assets.js --verbose # Mode verbeux
 */

const path = require('path');
const {
  parseArgs,
  printHelp,
  printBanner,
  printSummary,
  checkSourceLogo,
  cleanDirectory,
} = require('./lib/common');

const { generateAndroidAssets } = require('./lib/android-generator');
const { generateIosAssets } = require('./lib/ios-generator');

async function main() {
  const args = parseArgs();

  // Show help if requested
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  // Determine platforms
  const platforms = [];
  if (args.android) platforms.push('Android');
  if (args.ios) platforms.push('iOS');
  
  // Print banner
  printBanner(platforms.join(' + '));

  // Check source logo
  if (!checkSourceLogo()) {
    process.exit(1);
  }

  // Check Sharp dependency
  try {
    require('sharp');
  } catch (e) {
    console.error('❌ Le module "sharp" n\'est pas installé.');
    console.log('💡 Installez-le avec: npm install sharp');
    process.exit(1);
  }

  // Clean directories if requested
  if (args.clean) {
    console.log('🧹 Nettoyage des dossiers existants...\n');
    if (args.android) {
      cleanDirectory(path.join(process.cwd(), 'android-res'));
    }
    if (args.ios) {
      cleanDirectory(path.join(process.cwd(), 'ios-assets'));
    }
    console.log('');
  }

  // Initialize stats
  const stats = {
    startTime: Date.now(),
    android: { count: 0, size: 0 },
    ios: { count: 0, size: 0 },
  };

  // Generate Android assets
  if (args.android) {
    try {
      stats.android = await generateAndroidAssets({ verbose: args.verbose });
    } catch (error) {
      console.error('❌ Erreur génération Android:', error.message);
      if (args.verbose) console.error(error);
    }
  }

  // Generate iOS assets
  if (args.ios) {
    try {
      stats.ios = await generateIosAssets({ verbose: args.verbose });
    } catch (error) {
      console.error('❌ Erreur génération iOS:', error.message);
      if (args.verbose) console.error(error);
    }
  }

  // Print summary
  printSummary(stats);

  // Print next steps
  console.log('📋 Prochaines étapes:\n');
  
  if (args.android) {
    console.log('  Android:');
    console.log('    1. npx cap add android');
    console.log('    2. cp -r android-res/* android/app/src/main/res/');
    console.log('    3. npx cap sync android');
    console.log('    4. npx cap open android\n');
  }
  
  if (args.ios) {
    console.log('  iOS (Mac requis):');
    console.log('    1. npx cap add ios');
    console.log('    2. cp -r ios-assets/* ios/App/App/Assets.xcassets/');
    console.log('    3. npx cap sync ios');
    console.log('    4. npx cap open ios\n');
  }
}

main().catch(console.error);
