import { useState } from 'react';
import { HeroSimplified } from '@/features/property';
import { useRouter } from 'next/navigation';

// Exemple d'utilisation du composant HeroSimplified
export default function ExampleHomePage() {
  const router = useRouter();
  
  // Gestionnaire de recherche avec redirection
  const handleSearch = (filters: {
    city: string;
    propertyType: string;
    maxBudget: string;
  }) => {
    // Construire les paramètres de requête
    const params = new URLSearchParams();
    
    if (filters.city) params.set('city', filters.city);
    if (filters.propertyType) params.set('type', filters.propertyType);
    if (filters.maxBudget) params.set('max_price', filters.maxBudget);
    
    // Rediriger vers la page de recherche
    router.push(`/search?${params.toString()}`);
  };
  
  // Alternative : Logique de recherche personnalisée
  const handleCustomSearch = async (filters: {
    city: string;
    propertyType: string;
    maxBudget: string;
  }) => {
    try {
      const searchParams = {
        location: filters.city,
        propertyType: filters.propertyType,
        maxBudget: parseInt(filters.maxBudget) || undefined,
        page: 1,
        limit: 20
      };
      
      // Appel API ou recherche locale
      console.log('Paramètres de recherche:', searchParams);
      
      // Example: redirection avec filtres
      await router.push(`/properties/search?${new URLSearchParams(searchParams as any).toString()}`);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero simplifié avec props par défaut */}
      <HeroSimplified 
        onSearch={handleSearch}
      />
      
      {/* Section suivante */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Propriétés populaires
          </h2>
          {/* Contenu des propriétés... */}
        </div>
      </section>
    </main>
  );
}

// Exemple avec titre personnalisé
export function ExampleCustomizedHero() {
  const handleSearch = (filters) => {
    console.log('Recherche personnalisée:', filters);
  };

  return (
    <HeroSimplified
      onSearch={handleSearch}
      title="Votre nouvelle maison vous attend"
      subtitle="Découvrez des milliers de propriétés de qualité dans toute la Côte d'Ivoire"
      backgroundImage="/images/hero-villa-cocody.jpg"
    />
  );
}

// Exemple avec gestion d'état avancée
export function ExampleAdvancedSearch() {
  const [loading, setLoading] = useState(false);
  const [lastSearch, setLastSearch] = useState(null);
  
  const handleAdvancedSearch = async (filters) => {
    setLoading(true);
    
    try {
      // Logique de recherche avec état de chargement
      setLastSearch(filters);
      
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirection ou mise à jour de l'état
      console.log('Recherche terminée:', filters);
      
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <HeroSimplified 
        onSearch={handleAdvancedSearch}
      />
      
      {/* Indicateur de chargement */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 bg-primary-500 text-white p-4 text-center z-50">
          Recherche en cours...
        </div>
      )}
      
      {/* Dernière recherche */}
      {lastSearch && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 m-4">
          <p className="text-green-800">
            Dernière recherche : {lastSearch.city} - {lastSearch.propertyType} - {lastSearch.maxBudget} FCFA
          </p>
        </div>
      )}
    </div>
  );
}

// Exemple d'intégration avec un état global (Zustand/Context)
export function ExampleWithGlobalState() {
  const { setSearchFilters } = useSearchStore(); // Store global
  
  const handleSearchWithStore = (filters) => {
    // Mettre à jour l'état global
    setSearchFilters(filters);
    
    // Rediriger vers la page de recherche
    window.location.href = `/search?city=${filters.city}&type=${filters.propertyType}&max_price=${filters.maxBudget}`;
  };

  return (
    <HeroSimplified onSearch={handleSearchWithStore} />
  );
}

// Exemple avec validation avancée
export function ExampleWithValidation() {
  const [errors, setErrors] = useState({});
  
  const validateSearch = (filters) => {
    const newErrors = {};
    
    // Validation du budget
    if (filters.maxBudget && parseInt(filters.maxBudget) < 10000) {
      newErrors.maxBudget = 'Le budget minimum est de 10 000 FCFA';
    }
    
    if (filters.maxBudget && parseInt(filters.maxBudget) > 10000000) {
      newErrors.maxBudget = 'Le budget maximum est de 10 000 000 FCFA';
    }
    
    // Validation de la ville
    if (!filters.city) {
      newErrors.city = 'Veuillez sélectionner une ville';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleValidatedSearch = (filters) => {
    if (validateSearch(filters)) {
      console.log('Recherche validée:', filters);
      // Procéder à la recherche
    }
  };

  return (
    <div>
      <HeroSimplified onSearch={handleValidatedSearch} />
      
      {/* Affichage des erreurs */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <h4 className="text-red-800 font-medium">Erreurs de validation :</h4>
          <ul className="text-red-700 text-sm mt-2">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Exemple avec analytics
export function ExampleWithAnalytics() {
  const trackSearch = (filters) => {
    // Tracking Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        event_category: 'Property Search',
        event_label: `City: ${filters.city}, Type: ${filters.propertyType}`,
        value: parseInt(filters.maxBudget) || 0
      });
    }
    
    // Tracking personnalisé
    console.log('Analytics - Recherche:', {
      timestamp: new Date().toISOString(),
      filters,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });
  };
  
  const handleSearchWithTracking = (filters) => {
    // Tracking avant la recherche
    trackSearch(filters);
    
    // Exécution de la recherche
    console.log('Recherche exécutée:', filters);
  };

  return (
    <HeroSimplified onSearch={handleSearchWithTracking} />
  );
}