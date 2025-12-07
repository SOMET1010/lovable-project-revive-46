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
      url: 'https://4d8f5937-4e73-4af7-a740-286b13067a1d.lovableproject.com?forceHideBadge=true',
      cleartext: true
    }
  }),
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#ea580c'
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
    }
  }
};

export default config;
