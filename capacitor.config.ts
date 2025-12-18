import type { CapacitorConfig } from '@capacitor/cli';

// Détection de l'environnement de production
const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'ci.montoit.app',
  appName: 'Mon Toit',
  webDir: 'dist',
  
  // Configuration serveur uniquement en développement
  ...(isProduction ? {} : {
    server: {
      // Hot-reload depuis le sandbox Lovable (dev uniquement)
      url: 'https://lovable-renewal.lovable.app',
      cleartext: true
    }
  }),
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#ffffff',
      // Android
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      // iOS
      iosSplashResourceName: 'Splash',
      showSpinner: true,
      spinnerColor: '#ea580c'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
      style: 'light' // iOS: light keyboard style
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
      overlaysWebView: false // iOS: don't overlay content
    }
  }
};

export default config;
