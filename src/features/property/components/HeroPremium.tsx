import { useState, useEffect, useCallback } from 'react';
import { Search, Home, Users, Gem, GraduationCap, Building } from 'lucide-react';

interface HeroPremiumProps {
  onSearch: (filters: { city: string; propertyType: string; maxBudget: string }) => void;
}

interface HeroSlide {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

/**
 * HeroPremium - Refonte Complète avec Identité Ivoirienne
 * Design organique, coins arrondis 22px, palette Sable/Cacao/Orange
 */
const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/images/hero/family-moving.png',
    alt: 'Famille ivoirienne heureuse emménageant dans leur nouvelle maison',
    title: 'Votre Histoire Commence Ici',
    subtitle: 'Plus qu\'un logement. Un nouveau départ. Certifié par Mon Toit.'
  },
  {
    src: '/images/hero/young-couple.png',
    alt: 'Jeune couple recherchant leur appartement idéal',
    title: 'Trouvez Votre Chez-Vous Ensemble',
    subtitle: '100% des annonces vérifiées. 0 mauvaise surprise.'
  },
  {
    src: '/images/hero/riviera-luxury.png',
    alt: 'Villa luxueuse avec piscine à Riviera',
    title: 'Le Luxe Accessible',
    subtitle: 'Des villas d\'exception à Riviera et Cocody.'
  },
  {
    src: '/images/hero/young-professional.png',
    alt: 'Jeune professionnelle épanouie dans son appartement',
    title: 'Vivez Votre Réussite',
    subtitle: 'Votre appartement à la hauteur de vos ambitions.'
  },
  {
    src: '/images/hero/students.png',
    alt: 'Étudiants colocataires heureux',
    title: 'La Coloc Parfaite Existe',
    subtitle: 'Trouvez vos colocataires et votre nid étudiant.'
  }
];

// Placeholders dynamiques qui racontent une histoire
const DYNAMIC_PLACEHOLDERS = [
  'Un duplex avec jardin pour les enfants à Cocody...',
  'Un studio moderne près de l\'université...',
  'Une villa avec piscine à Riviera...',
  'Un appartement lumineux au Plateau...',
  'Une colocation étudiante à Marcory...'
];

// Filtres rapides interactifs
const QUICK_FILTERS = [
  { id: 'family', label: 'Idéal Famille', icon: Users, color: 'bg-amber-500' },
  { id: 'urban', label: 'Urbain & Moderne', icon: Building, color: 'bg-slate-600' },
  { id: 'luxury', label: 'Luxe Abordable', icon: Gem, color: 'bg-purple-500' },
  { id: 'student', label: 'Spécial Étudiants', icon: GraduationCap, color: 'bg-blue-500' }
];

function OptimizedHeroImage({ 
  src, 
  alt, 
  isActive, 
  priority 
}: { 
  src: string; 
  alt: string; 
  isActive: boolean; 
  priority?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 w-full h-full transition-all duration-[1500ms] ease-in-out ${
        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
      }`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover object-center"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

export default function HeroPremium({ onSearch }: HeroPremiumProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Auto-play slideshow (6 secondes par slide)
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Rotation des placeholders dynamiques
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % DYNAMIC_PLACEHOLDERS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city: searchQuery, propertyType: '', maxBudget: '' });
  }, [searchQuery, onSearch]);

  const handleFilterClick = useCallback((filterId: string) => {
    setActiveFilter(filterId === activeFilter ? null : filterId);
    // Mapper les filtres aux types de recherche
    const filterMap: Record<string, { type?: string; city?: string }> = {
      family: { type: 'villa' },
      urban: { type: 'appartement', city: 'Plateau' },
      luxury: { type: 'villa', city: 'Cocody' },
      student: { type: 'studio' }
    };
    const filter = filterMap[filterId];
    if (filter) {
      onSearch({ 
        city: filter.city || '', 
        propertyType: filter.type || '', 
        maxBudget: '' 
      });
    }
  }, [activeFilter, onSearch]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const currentSlideData = HERO_SLIDES[currentSlide];

  return (
    <section 
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#1a1a1a' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slideshow Background */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <OptimizedHeroImage
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            isActive={index === currentSlide}
            priority={index === 0}
          />
        ))}
        
        {/* Overlays pour lisibilité */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
        {/* Badge Certifié */}
        <div className="flex justify-center mb-8">
          <span 
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold backdrop-blur-xl shadow-2xl"
            style={{ 
              backgroundColor: 'rgba(248, 232, 216, 0.15)',
              color: '#F8E8D8',
              borderRadius: '22px',
              border: '1px solid rgba(248, 232, 216, 0.3)'
            }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#F16522' }}
            />
            Plateforme Certifiée ANSUT
          </span>
        </div>

        {/* Dynamic Title - synchronized with current slide */}
        <div className="text-center mb-10">
          <h1 
            className="font-bold mb-5 leading-tight drop-shadow-2xl transition-all duration-700"
            style={{ 
              fontSize: 'clamp(36px, 6vw, 64px)',
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.02em'
            }}
          >
            {currentSlideData?.title}
          </h1>
          <p 
            className="max-w-2xl mx-auto drop-shadow-lg transition-all duration-700"
            style={{ 
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'rgba(248, 232, 216, 0.9)',
              lineHeight: 1.6
            }}
          >
            {currentSlideData?.subtitle}
          </p>
        </div>

        {/* Search Form - Airbnb Style avec design organique */}
        <form 
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto mb-8"
        >
          <div 
            className="flex flex-col sm:flex-row items-stretch backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '22px',
              border: '4px solid rgba(241, 101, 34, 0.2)'
            }}
          >
            {/* Search Input avec placeholder dynamique */}
            <div className="relative flex-1">
              <div 
                className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center"
                style={{ 
                  backgroundColor: 'rgba(241, 101, 34, 0.1)',
                  borderRadius: '14px'
                }}
              >
                <Home className="h-6 w-6" style={{ color: '#F16522' }} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={DYNAMIC_PLACEHOLDERS[currentPlaceholder]}
                className="w-full h-16 sm:h-20 pl-20 pr-6 bg-transparent text-lg font-medium placeholder:text-neutral-400 focus:outline-none transition-all"
                style={{ 
                  color: '#523628',
                  borderRadius: '22px'
                }}
              />
            </div>

            {/* Search Button */}
            <div className="p-2 sm:p-3">
              <button
                type="submit"
                className="w-full sm:w-auto h-12 sm:h-14 px-8 flex items-center justify-center gap-3 font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 shadow-lg"
                style={{ 
                  backgroundColor: '#F16522',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(241, 101, 34, 0.4)'
                }}
              >
                <Search className="h-5 w-5" />
                <span>Rechercher</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Filters - Icônes interactives */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {QUICK_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleFilterClick(filter.id)}
                className={`group flex items-center gap-2 px-5 py-3 font-medium transition-all duration-300 hover:scale-105 ${
                  isActive ? 'ring-2 ring-white/50' : ''
                }`}
                style={{ 
                  backgroundColor: isActive ? 'rgba(241, 101, 34, 0.9)' : 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${filter.color}`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stats rapides */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { value: '2,500+', label: 'Locataires satisfaits' },
            { value: '500+', label: 'Propriétés vérifiées' },
            { value: '48h', label: 'Délai moyen' }
          ].map((stat, index) => (
            <div key={index} className="px-4">
              <p 
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: '#F16522' }}
              >
                {stat.value}
              </p>
              <p 
                className="text-sm"
                style={{ color: 'rgba(248, 232, 216, 0.7)' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators - Design organique */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Voir l'image ${index + 1}`}
            className="transition-all duration-500 ease-out shadow-lg"
            style={{
              width: index === currentSlide ? '40px' : '12px',
              height: '12px',
              borderRadius: '6px',
              backgroundColor: index === currentSlide ? '#F16522' : 'rgba(255, 255, 255, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          />
        ))}
      </div>
    </section>
  );
}
