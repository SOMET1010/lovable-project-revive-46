import { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  quote: string;
  avatar: string;
  trustScore: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Mariam B.',
    location: 'Marcory',
    quote: 'Le Trust Score a tout changé. J\'ai trouvé mon appartement en 48h !',
    avatar: '/images/testimonials/avatar-1.jpg',
    trustScore: 92
  },
  {
    id: 2,
    name: 'Kouamé A.',
    location: 'Cocody Riviera',
    quote: 'Enfin une plateforme sérieuse. Tout était vérifié, pas de mauvaises surprises.',
    avatar: '/images/testimonials/avatar-2.jpg',
    trustScore: 88
  },
  {
    id: 3,
    name: 'Fatou D.',
    location: 'Plateau',
    quote: 'L\'agent m\'a accompagnée du premier appel jusqu\'à la signature. Service exceptionnel !',
    avatar: '/images/testimonials/avatar-3.jpg',
    trustScore: 95
  },
  {
    id: 4,
    name: 'Jean-Marc K.',
    location: 'Zone 4',
    quote: 'Je recommande à 100%. Mon propriétaire était fiable grâce au système de notation.',
    avatar: '/images/testimonials/avatar-4.jpg',
    trustScore: 90
  }
];

function ScoreDisplay({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreColor()}`}>
      <Star className="w-3 h-3 fill-current" />
      <span>Score {score}</span>
    </div>
  );
}

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Calcul du nombre de cartes visibles selon la taille d'écran
  const getVisibleCards = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const handleResize = () => setVisibleCards(getVisibleCards());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    setIsAutoPlaying(false);
  };

  // Obtenir les témoignages visibles avec wrap-around
  const getVisibleTestimonials = () => {
    const result: Testimonial[] = [];
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % TESTIMONIALS.length;
      result.push(TESTIMONIALS[index] as Testimonial);
    }
    return result;
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            Témoignages
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ils Nous Ont Fait Confiance
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Des milliers de locataires et propriétaires satisfaits par notre service
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-background shadow-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all hidden md:flex"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-background shadow-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all hidden md:flex"
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-12">
            {getVisibleTestimonials().map((testimonial, idx) => (
              <div
                key={`${testimonial.id}-${idx}`}
                className="bg-background rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Quote Icon */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Quote className="w-5 h-5 text-primary" />
                </div>

                {/* Quote Text */}
                <blockquote className="text-foreground text-lg font-medium mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                  <ScoreDisplay score={testimonial.trustScore} />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8 md:hidden">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Aller au témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '2,500+', label: 'Locataires satisfaits' },
            { value: '98%', label: 'Taux de satisfaction' },
            { value: '48h', label: 'Délai moyen de location' },
            { value: '500+', label: 'Propriétaires partenaires' }
          ].map((stat, index) => (
            <div key={index} className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
