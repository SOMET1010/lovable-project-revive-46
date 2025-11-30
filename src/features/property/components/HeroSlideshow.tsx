import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/homepage-modern.css';
import '../../shared/styles/hero-troncature-fix.css';

interface Slide {
  image: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    image: '/images/hero-villa-cocody.jpg',
    title: 'Votre villa à Cocody',
    description: 'Le luxe et le confort dans le quartier le plus prisé d\'Abidjan',
  },
  {
    image: '/images/hero-residence-moderne.jpg',
    title: 'Résidences modernes sécurisées',
    description: 'Un cadre de vie exceptionnel avec toutes les commodités',
  },
  {
    image: '/images/hero-quartiers-abidjan.jpg',
    title: 'Découvrez les quartiers d\'Abidjan',
    description: 'De Plateau à Marcory, trouvez votre quartier idéal',
  },
  {
    image: '/images/hero-immeuble-moderne.png',
    title: 'Immeubles modernes et équipés',
    description: 'Des appartements avec vue panoramique sur Abidjan',
  },
  {
    image: '/images/hero-maison-moderne.jpg',
    title: 'Maisons familiales spacieuses',
    description: 'Des espaces pour créer des souvenirs inoubliables',
  },
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="relative h-full rounded-3xl overflow-hidden shadow-2xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 animate-fade-in leading-tight">
                {slide.title}
              </h3>
              <p className="text-base md:text-lg text-white/90 animate-fade-in animation-delay-200 leading-relaxed">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Improved visibility and positioning */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 shadow-lg hover:scale-110"
        aria-label="Diapositive précédente"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 shadow-lg hover:scale-110"
        aria-label="Diapositive suivante"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
      </button>

      {/* Indicators - Improved size and spacing with anti-truncation */}
      <div className="hero-slide-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`hero-slide-indicator transition-all duration-300 ${
              index === currentSlide
                ? 'active'
                : ''
            }`}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {!isHovered && (
        <div className="absolute top-2 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 rounded-full"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
