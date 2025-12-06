import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Home, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Star, User, BadgeCheck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface HeroPremiumProps {
  onSearch: (filters: { city: string; propertyType: string; maxBudget: string }) => void;
  stats?: { propertiesCount: number };
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

interface HeroSlide {
  image: string;
  title: string;
  highlight: string;
  description: string;
  testimonial: Testimonial;
}

const heroSlides: HeroSlide[] = [
  {
    image: '/images/hero-users/hero_users_1_young_couple.png',
    title: 'Leur premier nid,',
    highlight: 'trouvé en confiance',
    description: 'Pour les jeunes couples qui construisent leur avenir',
    testimonial: {
      quote: "On a trouvé notre nid douillet en 2 semaines. Merci Mon Toit !",
      author: "Awa & Koné",
      role: "Jeune couple, Cocody",
      rating: 5
    }
  },
  {
    image: '/images/hero-users/hero_users_2_family_moving.png',
    title: "Plus d'espace pour",
    highlight: 'voir grandir la famille',
    description: 'La sécurité et le confort pour ceux que vous aimez',
    testimonial: {
      quote: "Une villa parfaite pour nos 3 enfants. Simple et sécurisé !",
      author: "Famille Traoré",
      role: "Parents, Riviera Golf",
      rating: 5
    }
  },
  {
    image: '/images/hero-users/hero_users_3_young_professional.png',
    title: "L'indépendance a une",
    highlight: 'nouvelle adresse',
    description: 'Pour les professionnels qui visent les sommets',
    testimonial: {
      quote: "Mon studio moderne près du bureau, sans tracas administratifs.",
      author: "Mariam D.",
      role: "Consultante, Plateau",
      rating: 5
    }
  },
  {
    image: '/images/hero-users/hero_users_4_students_roommates.png',
    title: 'La colocation parfaite,',
    highlight: 'sans les tracas',
    description: 'Pour les étudiants qui veulent vivre leur meilleure vie',
    testimonial: {
      quote: "Colocation trouvée en 3 jours ! Les colocataires sont géniaux.",
      author: "Yao & Amara",
      role: "Étudiants, Yopougon",
      rating: 5
    }
  },
  {
    image: '/images/hero-users/hero_users_5_agent_showing.png',
    title: 'Un service humain,',
    highlight: 'une expertise locale',
    description: 'Nos agents vous accompagnent à chaque étape',
    testimonial: {
      quote: "Mon Toit m'a permis de doubler mon portefeuille en 6 mois.",
      author: "Moussa K.",
      role: "Agent certifié, Abidjan",
      rating: 5
    }
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

/**
 * HeroPremium - Human-Centered Slideshow Design
 * 
 * Features:
 * - 5-image slideshow featuring real users (couples, families, professionals, students, agents)
 * - Emotional storytelling with each slide
 * - Auto-play every 6 seconds with pause on hover
 * - Premium search form with city, type, budget selects
 * - Trust indicators and quick neighborhood links
 */
export default function HeroPremium({ onSearch, stats }: HeroPremiumProps) {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  // Auto-play every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city, propertyType, maxBudget });
  };

  return (
    <section 
      className="relative min-h-[700px] lg:min-h-[85vh] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover scale-105"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        
        {/* Premium Gradient Overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-20" />
      </div>

      {/* Navigation Arrows - Desktop only */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white opacity-60 hover:opacity-100 transition-all hover:bg-white/20 hidden md:flex items-center justify-center"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white opacity-60 hover:opacity-100 transition-all hover:bg-white/20 hidden md:flex items-center justify-center"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-6 py-16 lg:py-20">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ 
              background: 'rgba(255, 108, 47, 0.15)',
              backdropFilter: 'blur(10px)',
              color: '#FF6C2F',
              border: '1px solid rgba(255, 108, 47, 0.3)'
            }}
          >
            <Sparkles className="w-4 h-4" />
            Plateforme N°1 en Côte d'Ivoire
          </span>
        </div>

        {/* Dynamic Title based on current slide */}
        <div className="text-center mb-6 min-h-[140px] lg:min-h-[180px] flex flex-col justify-center">
          <h1 
            className="text-white font-bold transition-all duration-500"
            style={{ 
              fontSize: 'clamp(32px, 6vw, 56px)',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            {heroSlides[currentSlide]?.title ?? ''}
            <br />
            <span style={{ color: '#FF6C2F' }}>{heroSlides[currentSlide]?.highlight ?? ''}</span>
          </h1>
          <p 
            className="text-white/90 max-w-2xl mx-auto mt-4 transition-all duration-500"
            style={{ 
              fontSize: 'clamp(14px, 2vw, 18px)',
              lineHeight: '1.6',
              textShadow: '0 2px 10px rgba(0,0,0,0.4)'
            }}
          >
            {heroSlides[currentSlide]?.description ?? ''}
          </p>
        </div>

        {/* Testimonial Badge - Synchronized with current slide */}
        <div className="flex justify-center mb-6">
          <div 
            className={cn(
              "relative max-w-md px-5 py-4 rounded-2xl transition-all duration-500",
              "bg-white/10 backdrop-blur-md border border-white/20"
            )}
            style={{ 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              transform: isTransitioning ? 'translateY(10px) scale(0.95)' : 'translateY(0) scale(1)',
              opacity: isTransitioning ? 0 : 1
            }}
          >
            {/* Stars */}
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-4 h-4",
                    i < (heroSlides[currentSlide]?.testimonial.rating ?? 0)
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-white/30"
                  )} 
                />
              ))}
              <span className="ml-2 flex items-center gap-1 text-xs text-green-400">
                <BadgeCheck className="w-3.5 h-3.5" />
                Avis vérifié
              </span>
            </div>

            {/* Quote */}
            <p className="text-white font-medium italic text-sm leading-relaxed mb-3">
              "{heroSlides[currentSlide]?.testimonial.quote ?? ''}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center border border-primary/40">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{heroSlides[currentSlide]?.testimonial.author ?? ''}</p>
                <p className="text-white/60 text-xs">{heroSlides[currentSlide]?.testimonial.role ?? ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "relative h-1.5 rounded-full transition-all duration-300 overflow-hidden",
                index === currentSlide 
                  ? "w-10 bg-primary" 
                  : "w-3 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Aller au slide ${index + 1}`}
            >
              {index === currentSlide && !isPaused && (
                <span 
                  className="absolute inset-0 bg-white/40 rounded-full"
                  style={{
                    animation: 'progress 6s linear forwards',
                    transformOrigin: 'left'
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Premium Search Form */}
        <form 
          onSubmit={handleSearch}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* City Select */}
            <div className="relative flex-1 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 108, 47, 0.1)' }}>
                <MapPin className="h-5 w-5" style={{ color: '#FF6C2F' }} />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="Sélectionner une ville"
                className="w-full pl-16 pr-12 bg-transparent text-gray-900 font-medium appearance-none cursor-pointer transition-colors focus:outline-none hover:bg-gray-50 focus:bg-gray-50"
                style={{ height: '64px', fontSize: '15px' }}
              >
                <option value="">Ville</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Property Type Select */}
            <div className="relative flex-1 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 108, 47, 0.1)' }}>
                <Home className="h-5 w-5" style={{ color: '#FF6C2F' }} />
              </div>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                aria-label="Sélectionner un type de bien"
                className="w-full pl-16 pr-12 bg-transparent text-gray-900 font-medium appearance-none cursor-pointer transition-colors focus:outline-none hover:bg-gray-50 focus:bg-gray-50"
                style={{ height: '64px', fontSize: '15px' }}
              >
                <option value="">Type de bien</option>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Budget Select */}
            <div className="relative flex-1 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 108, 47, 0.1)' }}>
                <span className="font-bold text-lg" style={{ color: '#FF6C2F' }}>₣</span>
              </div>
              <select
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                aria-label="Sélectionner un budget maximum"
                className="w-full pl-16 pr-12 bg-transparent text-gray-900 font-medium appearance-none cursor-pointer transition-colors focus:outline-none hover:bg-gray-50 focus:bg-gray-50"
                style={{ height: '64px', fontSize: '15px' }}
              >
                <option value="">Budget max</option>
                {budgets.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Search Button */}
            <div className="p-3">
              <button
                type="submit"
                className="w-full lg:w-auto flex items-center justify-center gap-3 text-white font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200"
                style={{ 
                  backgroundColor: '#FF6C2F',
                  height: '56px',
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  minWidth: '180px',
                  boxShadow: '0 10px 30px -5px rgba(255, 108, 47, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E05519';
                  e.currentTarget.style.boxShadow = '0 15px 40px -5px rgba(255, 108, 47, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF6C2F';
                  e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(255, 108, 47, 0.4)';
                }}
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
          {['Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Riviera'].map((district) => (
            <button
              key={district}
              type="button"
              onClick={() => {
                setCity('Abidjan');
                onSearch({ city: 'Abidjan', propertyType: '', maxBudget: '' });
              }}
              className="px-5 py-2.5 rounded-full text-white text-sm font-medium transition-all duration-300 hover:scale-105"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 108, 47, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 108, 47, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              {district}
            </button>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>Certifié ANSUT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>Paiement Mobile Money</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>{(stats?.propertiesCount || 150).toLocaleString('fr-FR')}+ logements</span>
          </div>
        </div>
      </div>

      {/* CSS for progress animation */}
      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}
