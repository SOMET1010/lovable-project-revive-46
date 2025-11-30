import { useEffect, useState } from 'react';
import { envConfig } from '@/shared/config/env.config';

export function DemoModeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!envConfig.isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 px-4 shadow-lg">
      <div className="flex items-center justify-center space-x-2">
        <span className="text-2xl">🎭</span>
        <span className="font-medium">
          MONTOITVPROD fonctionne en mode DÉMONSTRATION
        </span>
        <span className="text-sm opacity-90">
          Interface fonctionnelle, backend simulé
        </span>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-4 text-white hover:text-gray-200 text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default DemoModeBanner;