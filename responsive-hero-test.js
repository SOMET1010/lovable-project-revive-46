// Test Responsive Design - Hero Section MONTOITVPROD
// Test des breakpoints: 320px, 768px, 1024px+
// Analyse des débordements et problèmes d'affichage

const { chromium } = require('playwright');

async function testHeroResponsive() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // URL du site déployé
  const url = 'https://psjpmfaprzdl.space.minimax.io';
  
  console.log('🔍 Test Responsive Design - Hero Section MONTOITVPROD');
  console.log('URL:', url);
  console.log('Breakpoints à tester: 320px, 768px, 1024px+');
  console.log('=============================================\n');

  // Breakpoints à tester
  const breakpoints = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Large', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1024, height: 768 },
    { name: 'Desktop Large', width: 1440, height: 900 },
    { name: 'Desktop XL', width: 1920, height: 1080 }
  ];

  const issues = [];

  for (const breakpoint of breakpoints) {
    console.log(`\n📱 Test ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
    console.log('─'.repeat(50));

    // Définir la taille d'écran
    await page.setViewportSize({
      width: breakpoint.width,
      height: breakpoint.height
    });

    // Naviguer vers le site
    await page.goto(url, { waitUntil: 'networkidle' });

    // Attendre le chargement de la page
    await page.waitForTimeout(2000);

    // Vérifier la présence des éléments hero
    const heroSection = await page.$('.relative.h-\\[500px\\]');
    if (!heroSection) {
      console.log('❌ Section hero non trouvée');
      issues.push(`${breakpoint.name}: Section hero manquante`);
      continue;
    }

    // Prendre un screenshot
    await page.screenshot({
      path: `/workspace/screenshots/hero_${breakpoint.name.toLowerCase().replace(' ', '_')}_${breakpoint.width}.png`,
      fullPage: false
    });

    // Vérifier le débordement horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    if (bodyWidth > viewportWidth) {
      console.log('⚠️ Débordement horizontal détecté');
      issues.push(`${breakpoint.name}: Débordement horizontal (${bodyWidth}px > ${viewportWidth}px)`);
    } else {
      console.log('✅ Pas de débordement horizontal');
    }

    // Vérifier les éléments de la barre de recherche
    const searchContainer = await page.$('.hero-search-spectacular');
    if (!searchContainer) {
      console.log('⚠️ Barre de recherche hero non trouvée');
      issues.push(`${breakpoint.name}: Barre de recherche manquante`);
    } else {
      console.log('✅ Barre de recherche trouvée');

      // Vérifier la responsivité des champs de recherche
      const searchInputs = await page.$$('input, select');
      console.log(`   - ${searchInputs.length} champs de recherche détectés`);

      // Vérifier les boutons
      const searchButton = await page.$('button[type="submit"]');
      if (searchButton) {
        const isVisible = await searchButton.isVisible();
        const buttonText = await searchButton.textContent();
        console.log(`   - Bouton recherche: ${isVisible ? 'visible' : 'caché'} "${buttonText}"`);
      }
    }

    // Vérifier le titre et le sous-titre
    const title = await page.$('.hero-title-spectacular');
    const subtitle = await page.$('.hero-subtitle-spectacular');
    
    if (title) {
      const titleText = await title.textContent();
      const titleVisible = await title.isVisible();
      console.log(`✅ Titre: ${titleVisible ? 'visible' : 'caché'} "${titleText?.trim()}"`);
    } else {
      console.log('⚠️ Titre hero non trouvé');
      issues.push(`${breakpoint.name}: Titre hero manquant`);
    }

    if (subtitle) {
      const subtitleText = await subtitle.textContent();
      const subtitleVisible = await subtitle.isVisible();
      console.log(`✅ Sous-titre: ${subtitleVisible ? 'visible' : 'caché'} "${subtitleText?.trim()}"`);
    }

    // Vérifier les statistiques/indicateurs
    const indicators = await page.$$('.hero-indicator');
    console.log(`✅ ${indicators.length} indicateurs de slide détectés`);

    // Vérifier les boutons de navigation
    const navButtons = await page.$$('button[aria-label*="Diapositive"]');
    console.log(`✅ ${navButtons.length} boutons de navigation détectés`);

    // Test spécifique mobile
    if (breakpoint.width <= 768) {
      // Vérifier l'espacement vertical sur mobile
      const heroHeight = await page.evaluate(() => {
        const hero = document.querySelector('.relative.h-\\[500px\\]');
        return hero ? hero.offsetHeight : 0;
      });
      
      console.log(`   - Hauteur hero: ${heroHeight}px`);
      
      if (heroHeight > window.innerHeight * 1.5) {
        console.log('⚠️ Hero pourrait déborder verticalement sur mobile');
        issues.push(`${breakpoint.name}: Débordement vertical potentiel`);
      }
    }

    // Test de lisibilité du texte
    const textElements = await page.$$('h1, .hero-subtitle-spectacular');
    for (const element of textElements) {
      const fontSize = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.fontSize;
      }, element);
      
      const textColor = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.color;
      }, element);
      
      console.log(`   - Texte: ${fontSize}, Couleur: ${textColor}`);
    }

    console.log(`✅ Test ${breakpoint.name} terminé\n`);
  }

  // Rapport final
  console.log('📊 RAPPORT FINAL');
  console.log('================');
  if (issues.length === 0) {
    console.log('🎉 Aucun problème détecté !');
  } else {
    console.log(`⚠️ ${issues.length} problème(s) détecté(s):`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }

  await browser.close();
}

testHeroResponsive().catch(console.error);