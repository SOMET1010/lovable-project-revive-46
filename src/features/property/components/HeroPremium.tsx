import { useState, useEffect } from 'react';
import { Search, MapPin, Home, ChevronDown, Sparkles } from 'lucide-react';

interface HeroPremiumProps {
  onSearch: (filters: { city: string; propertyType: string; maxBudget: string }) => void;
}

// Configuration des 4 slides premium
const HERO_SLIDES = [
  {
    src: '/images/hero/hero-famille-cles.png',
    alt: 'Famille ivoirienne recevant les clés de leur nouvelle maison',
    position: 'object-center'
  },
  {
    src: '/images/hero/hero-couple-digital.png',
    alt: 'Jeune couple recherchant leur logement sur Mon Toit',
    position: 'object-center'
  },
  {
    src: '/images/hero/hero-professionnelle-balcon.png',
    alt: 'Jeune professionnelle profitant de son balcon avec vue sur Abidjan',
    position: 'object-top'
  },
  {
    src: '/images/hero/hero-famille-cocody.webp',
    alt: 'Famille heureuse devant leur villa à Cocody',
    position: 'object-center'
  },
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

/**
 * HeroPremium - Fade Slideshow Hero
 * 4 images avec transition fade, auto-play 6s, pause au hover
 * Focus: Search form + quick links
 */
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city, propertyType, maxBudget });
  };

  const handleQuickSearch = (district: string) => {
    onSearch({ city: district, propertyType: '', maxBudget: '' });
  };

  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-neutral-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slideshow Background avec Fade Transition */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className={`w-full h-full object-cover ${slide.position} transition-transform duration-[6000ms] ease-out ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
              {...(index === 0 ? { fetchPriority: 'high' as const } : {})}
            />
          </div>
        ))}
        
        {/* Gradient Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
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

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Trouvez votre{' '}
            <span className="text-primary">logement idéal</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            La première plateforme immobilière certifiée en Côte d'Ivoire. 
            Propriétés vérifiées, paiements sécurisés.
          </p>
        </div>

        {/* Search Form */}
        <form 
          onSubmit={handleSearch}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl"
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

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Voir l'image ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ease-out shadow-sm ${
              index === currentSlide 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
