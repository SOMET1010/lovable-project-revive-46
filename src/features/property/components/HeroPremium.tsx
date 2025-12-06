import { useState, useEffect, useCallback } from 'react';
import { Search, Home, MapPin, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroPremiumProps {
  onSearch?: (filters: { city: string; propertyType: string; maxBudget: string }) => void;
}

// 4 slides avec images disponibles
const HERO_SLIDES = [
  {
    id: 1,
    src: '/images/hero/hero1.jpg',
    alt: 'Propriété moderne à Abidjan',
    position: 'object-center',
    title: 'Vivez là où vous vous sentez bien',
    subtitle: 'Des quartiers prisés : Cocody, Riviera, Zone 4.'
  },
  {
    id: 2,
    src: '/images/hero/hero2.jpg',
    alt: 'Villa de luxe avec piscine',
    position: 'object-center',
    title: 'Des experts à votre service',
    subtitle: 'Faites-vous accompagner par nos agents certifiés.'
  },
  {
    id: 3,
    src: '/images/hero/hero3.jpg',
    alt: 'Appartement moderne',
    position: 'object-center',
    title: 'Trouvez le logement de vos rêves',
    subtitle: 'Villas, appartements et terrains vérifiés.'
  },
  {
    id: 4,
    src: '/images/hero/hero4.jpg',
    alt: 'Résidence sécurisée',
    position: 'object-center',
    title: "L'immobilier d'exception",
    subtitle: 'Découvrez nos propriétés de prestige.'
  },
];

// Options pour les selects
const PROPERTY_TYPES = [
  { value: '', label: 'Type de bien' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'maison', label: 'Maison' },
  { value: 'terrain', label: 'Terrain' },
];

const CITIES = [
  { value: '', label: 'Localisation' },
  { value: 'Abidjan', label: 'Abidjan' },
  { value: 'Cocody', label: 'Cocody' },
  { value: 'Plateau', label: 'Plateau' },
  { value: 'Riviera', label: 'Riviera' },
  { value: 'Marcory', label: 'Marcory' },
  { value: 'Yopougon', label: 'Yopougon' },
  { value: 'Bingerville', label: 'Bingerville' },
  { value: 'Grand-Bassam', label: 'Grand-Bassam' },
];

const BUDGET_RANGES = [
  { value: '', label: 'Budget' },
  { value: '100000', label: 'Jusqu\'à 100 000 F' },
  { value: '200000', label: 'Jusqu\'à 200 000 F' },
  { value: '300000', label: 'Jusqu\'à 300 000 F' },
  { value: '500000', label: 'Jusqu\'à 500 000 F' },
  { value: '1000000', label: 'Jusqu\'à 1 000 000 F' },
  { value: '999999999', label: 'Sans limite' },
];

export default function HeroPremium({ onSearch }: HeroPremiumProps) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Form state pour les 3 champs
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Auto-play intelligent (6 secondes)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch({ city, propertyType, maxBudget });
    }
    
    // Navigate to search page with filters
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.set('type', propertyType);
    if (maxBudget) params.set('maxBudget', maxBudget);
    
    navigate(`/recherche?${params.toString()}`);
  }, [city, propertyType, maxBudget, onSearch, navigate]);

  const currentSlideData = HERO_SLIDES[currentSlide];

  return (
    <div
      className="relative w-full h-[650px] md:h-[750px] overflow-hidden flex items-center justify-center bg-neutral-900 font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* --- 1. SLIDESHOW AVEC TRANSITION DOUCE --- */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className={`w-full h-full object-cover ${slide.position}`}
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Overlay sombre pour garantir la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/40 md:bg-black/30 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          </div>
        ))}
      </div>

      {/* --- 2. CONTENU TEXTE & RECHERCHE --- */}
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center mt-10">

        {/* Badge Certifié */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium backdrop-blur-md rounded-full border border-white/20 bg-white/10 text-white">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Plateforme Certifiée ANSUT
          </span>
        </div>

        {/* Texte dynamique selon le slide */}
        <div className="space-y-4 max-w-4xl mx-auto mb-8 transition-all duration-700 transform">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
            {currentSlideData?.title}
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 font-light drop-shadow-md max-w-2xl mx-auto">
            {currentSlideData?.subtitle}
          </p>
        </div>

        {/* Barre de Recherche - 3 CHAMPS DISTINCTS */}
        <form 
          onSubmit={handleSearch}
          className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-2 md:p-3 rounded-2xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-1000"
        >
          <div className="flex flex-col md:flex-row items-stretch gap-2">
            
            {/* Type de bien */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full h-14 md:h-16 pl-16 pr-4 bg-transparent text-base font-medium text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl border border-neutral-200 cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Localisation */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-14 md:h-16 pl-16 pr-4 bg-transparent text-base font-medium text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl border border-neutral-200 cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                {CITIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <select
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full h-14 md:h-16 pl-16 pr-4 bg-transparent text-base font-medium text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl border border-neutral-200 cursor-pointer appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton Rechercher */}
            <button
              type="submit"
              className="h-14 md:h-16 px-6 md:px-8 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              style={{ boxShadow: '0 8px 24px rgba(241, 101, 34, 0.35)' }}
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Rechercher</span>
            </button>
          </div>
        </form>

        {/* Stats rapides */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-10 text-center">
          {[
            { value: '2,500+', label: 'Locataires satisfaits' },
            { value: '500+', label: 'Propriétés vérifiées' },
            { value: '48h', label: 'Délai moyen' }
          ].map((stat, index) => (
            <div key={index} className="px-4">
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-white/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- 3. INDICATEURS (Dots) AMÉLIORÉS --- */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Aller à l'image ${index + 1}`}
            className={`transition-all duration-500 rounded-full shadow-lg border border-white/10 ${
              index === currentSlide
                ? 'w-10 h-2.5 bg-primary'
                : 'w-2.5 h-2.5 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Named export for compatibility
export { HeroPremium };
