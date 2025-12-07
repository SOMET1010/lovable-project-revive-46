import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuration Capacitor pour la PRODUCTION
 * 
 * Utilisation :
 * 1. Renommer ce fichier en capacitor.config.ts avant le build de production
 * 2. Ou copier son contenu dans capacitor.config.ts
 * 
 * IMPORTANT : Ne pas inclure de server.url en production !
 */
const config: CapacitorConfig = {
  appId: 'ci.montoit.app',
  appName: 'Mon Toit',
  webDir: 'dist',
  
  // PAS de server.url en production - l'app utilise les assets locaux
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#ea580c',
      splashFullScreen: true,
      splashImmersive: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    },
    // Configuration additionnelle pour la production
    CapacitorHttp: {
      enabled: true
    }
  },
  
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false // Désactiver le debug en production
  }
};

export default config;
