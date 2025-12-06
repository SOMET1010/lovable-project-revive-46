import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Home, ChevronDown, Sparkles } from 'lucide-react';

interface HeroPremiumProps {
  onSearch: (filters: { city: string; propertyType: string; maxBudget: string }) => void;
}

interface HeroSlide {
  src: string;
  alt: string;
  position: string;
  title: string;
  subtitle: string;
}

/**
 * HeroPremium - Human-Centric Hero Section
 * 4 images avec humains pour créer de l'émotion et de la confiance
 * Texte dynamique synchronisé avec chaque slide
 */
const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/images/hero/hero_family_keys.jpg',
    alt: 'Famille ivoirienne heureuse recevant les clés de leur nouvelle maison',
    position: 'object-center',
    title: 'Trouvez le logement de vos rêves',
    subtitle: 'Villas, appartements et terrains vérifiés à Abidjan.'
  },
  {
    src: '/images/hero/hero_couple_search.jpg',
    alt: 'Jeune couple recherchant leur futur appartement sur Mon Toit',
    position: 'object-center',
    title: 'Louez ou achetez en toute simplicité',
    subtitle: 'Une expérience digitale fluide et sécurisée.'
  },
  {
    src: '/images/hero/hero_agent_showing.jpg',
    alt: 'Agent immobilier Mon Toit faisant visiter un bien',
    position: 'object-center',
    title: 'Des experts à votre service',
    subtitle: 'Faites-vous accompagner par nos agents certifiés.'
  },
  {
    src: '/images/hero/hero_woman_balcony.jpg',
    alt: 'Jeune femme active profitant de la vue depuis son balcon',
    position: 'object-top',
    title: 'Vivez là où vous vous sentez bien',
    subtitle: 'Des quartiers prisés : Cocody, Riviera, Zone 4.'
  }
];

const cities = [
  'Abidjan',
  'Yamoussoukro',
  'Bouaké',
  'San-Pédro',
  'Korhogo',
  'Man',
  'Daloa',
  'Gagnoa',
];

const propertyTypes = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'maison', label: 'Maison' },
  { value: 'duplex', label: 'Duplex' },
];

const budgets = [
  { value: '100000', label: 'Jusqu\'à 100 000 FCFA' },
  { value: '200000', label: 'Jusqu\'à 200 000 FCFA' },
  { value: '350000', label: 'Jusqu\'à 350 000 FCFA' },
  { value: '500000', label: 'Jusqu\'à 500 000 FCFA' },
  { value: '750000', label: 'Jusqu\'à 750 000 FCFA' },
  { value: '1000000', label: 'Plus de 750 000 FCFA' },
];

const popularDistricts = ['Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Riviera'];

// Composant image optimisé avec lazy loading et responsive sizes
interface OptimizedHeroImageProps {
  src: string;
  alt: string;
  position: string;
  isActive: boolean;
  priority?: boolean;
}

function OptimizedHeroImage({ src, alt, position, isActive, priority }: OptimizedHeroImageProps) {
  return (
    <div
      className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <img
        src={src}
        alt={alt}
        sizes="100vw"
        className={`w-full h-full object-cover ${position} transition-transform duration-[6000ms] ease-out ${
          isActive ? 'scale-105' : 'scale-100'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

export default function HeroPremium({ onSearch }: HeroPremiumProps) {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play slideshow (6 secondes par slide)
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city, propertyType, maxBudget });
  }, [city, propertyType, maxBudget, onSearch]);

  const handleQuickSearch = useCallback((district: string) => {
    onSearch({ city: district, propertyType: '', maxBudget: '' });
  }, [onSearch]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const currentSlideData = HERO_SLIDES[currentSlide];

  return (
    <section 
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slideshow Background avec Fade Transition */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <OptimizedHeroImage
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            position={slide.position}
            isActive={index === currentSlide}
            priority={index === 0}
          />
        ))}
        
        {/* Gradient Overlays améliorés pour lisibilité */}
        <div className="absolute inset-0 bg-black/40 md:bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            150+ logements vérifiés
          </span>
        </div>

        {/* Dynamic Title - synchronized with current slide */}
        <div className="text-center mb-8 transition-all duration-700">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            {currentSlideData?.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            {currentSlideData?.subtitle}
          </p>
        </div>

        {/* Search Form - Glassmorphism amélioré */}
        <form 
          onSubmit={handleSearch}
          className="bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/20"
        >
          <div className="flex flex-col lg:flex-row">
            {/* City Select */}
            <div className="relative flex-1 border-b lg:border-b-0 lg:border-r border-border">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="Sélectionner une ville"
                className="w-full h-16 pl-20 pr-12 bg-transparent text-foreground font-medium appearance-none cursor-pointer focus:outline-none hover:bg-muted/50 focus:bg-muted/50"
              >
                <option value="">Ville</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Property Type Select */}
            <div className="relative flex-1 border-b lg:border-b-0 lg:border-r border-border">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                aria-label="Sélectionner un type de bien"
                className="w-full h-16 pl-20 pr-12 bg-transparent text-foreground font-medium appearance-none cursor-pointer focus:outline-none hover:bg-muted/50 focus:bg-muted/50"
              >
                <option value="">Type de bien</option>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Budget Select */}
            <div className="relative flex-1 border-b lg:border-b-0 lg:border-r border-border">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-lg text-primary">₣</span>
              </div>
              <select
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                aria-label="Sélectionner un budget maximum"
                className="w-full h-16 pl-20 pr-12 bg-transparent text-foreground font-medium appearance-none cursor-pointer focus:outline-none hover:bg-muted/50 focus:bg-muted/50"
              >
                <option value="">Budget max</option>
                {budgets.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Search Button */}
            <div className="p-3">
              <button
                type="submit"
                className="w-full lg:w-auto h-14 px-8 min-w-[160px] flex items-center justify-center gap-3 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-lg"
              >
                <Search className="h-5 w-5" />
                <span>Rechercher</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-white/60 text-sm">Populaires :</span>
          {popularDistricts.map((district) => (
            <button
              key={district}
              type="button"
              onClick={() => handleQuickSearch(district)}
              className="px-4 py-2 rounded-full text-white text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              {district}
            </button>
          ))}
        </div>
      </div>

      {/* Slide Indicators - Dots élégants */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Voir l'image ${index + 1}`}
            className={`rounded-full transition-all duration-500 ease-out shadow-lg border border-white/10 ${
              index === currentSlide 
                ? 'w-10 h-2 bg-primary' 
                : 'w-2 h-2 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
