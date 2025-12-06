import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useScrollAnimation } from '@/shared/hooks/useScrollAnimation';

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
    name: 'Mariam Bamba',
    location: 'Locataire à Marcory',
    quote: 'Le Trust Score a tout changé. J\'ai trouvé mon appartement en 48h ! Le propriétaire m\'a fait confiance immédiatement grâce à mon score.',
    avatar: '/images/hero/young-professional.png',
    trustScore: 92
  },
  {
    id: 2,
    name: 'Kouamé Assi',
    location: 'Locataire à Cocody Riviera',
    quote: 'Enfin une plateforme sérieuse. Tout était vérifié, pas de mauvaises surprises. L\'appartement correspondait exactement aux photos.',
    avatar: '/images/hero/young-couple.png',
    trustScore: 88
  },
  {
    id: 3,
    name: 'Fatou Diallo',
    location: 'Locataire au Plateau',
    quote: 'L\'agent m\'a accompagnée du premier appel jusqu\'à la signature. Service exceptionnel et humain. Je recommande à tous mes amis.',
    avatar: '/images/hero/family-moving.png',
    trustScore: 95
  },
  {
    id: 4,
    name: 'Jean-Marc Koné',
    location: 'Propriétaire à Zone 4',
    quote: 'Comme propriétaire, je trouve des locataires fiables grâce au système de notation. Fini les impayés et les mauvaises surprises !',
    avatar: '/images/hero/students.png',
    trustScore: 90
  }
];

function TrustScoreBadge({ score }: { score: number }) {
  const getScoreStyle = () => {
    if (score >= 80) return { bg: 'rgba(46, 75, 62, 0.1)', color: '#2E4B3E', border: '#2E4B3E' };
    if (score >= 60) return { bg: 'rgba(241, 101, 34, 0.1)', color: '#F16522', border: '#F16522' };
    return { bg: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: '#DC2626' };
  };

  const style = getScoreStyle();

  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1.5 font-semibold"
      style={{ 
        backgroundColor: style.bg,
        color: style.color,
        borderRadius: '12px',
        border: `1px solid ${style.border}`,
        fontSize: '13px'
      }}
    >
      <Star className="w-4 h-4 fill-current" />
      <span>Score {score}</span>
    </div>
  );
}

/**
 * TestimonialsSection - Design organique avec coins arrondis 22px
 * Carrousel horizontal avec avatars et citations
 */
export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Scroll animations
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

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

  // Get visible testimonials (3 on desktop, 1 on mobile)
  const getVisibleTestimonials = () => {
    const result: Testimonial[] = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % TESTIMONIALS.length;
      result.push(TESTIMONIALS[index] as Testimonial);
    }
    return result;
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Header - Animation fadeUp */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span 
            className="inline-block px-6 py-2.5 text-sm font-semibold mb-6"
            style={{ 
              backgroundColor: 'rgba(241, 101, 34, 0.1)',
              color: '#F16522',
              borderRadius: '22px'
            }}
          >
            Témoignages
          </span>
          <h2 
            className="font-bold mb-5"
            style={{ 
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: '#523628',
              letterSpacing: '-0.02em'
            }}
          >
            Ils Nous Ont Fait Confiance
          </h2>
          <p 
            className="max-w-2xl mx-auto"
            style={{ 
              fontSize: '18px',
              lineHeight: '1.7',
              color: '#737373'
            }}
          >
            Des milliers de locataires et propriétaires satisfaits par notre service
          </p>
        </div>

        {/* Carousel Container - Animation scaleIn */}
        <div 
          className={`relative max-w-6xl mx-auto transition-all duration-700 ease-out delay-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 z-10 w-14 h-14 flex items-center justify-center transition-all duration-300 hover:scale-110 hidden md:flex"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '22px',
              boxShadow: '0 8px 24px rgba(82, 54, 40, 0.15)',
              border: '1px solid rgba(82, 54, 40, 0.1)'
            }}
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="w-6 h-6" style={{ color: '#523628' }} />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 z-10 w-14 h-14 flex items-center justify-center transition-all duration-300 hover:scale-110 hidden md:flex"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '22px',
              boxShadow: '0 8px 24px rgba(82, 54, 40, 0.15)',
              border: '1px solid rgba(82, 54, 40, 0.1)'
            }}
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="w-6 h-6" style={{ color: '#523628' }} />
          </button>

          {/* Cards Grid - Stagger animation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-0 md:px-8">
            {getVisibleTestimonials().map((testimonial, idx) => (
              <div
                key={`${testimonial.id}-${idx}`}
                className={`relative transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  opacity: isVisible ? (idx === 1 ? 1 : 0.7) : 0,
                  transform: isVisible 
                    ? `scale(${idx === 1 ? 1.02 : 0.98}) translateY(0)` 
                    : 'scale(0.98) translateY(32px)',
                  transitionDelay: isVisible ? `${300 + idx * 150}ms` : '0ms'
                }}
              >
                <div
                  className="h-full transition-all duration-300 hover:shadow-xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    borderRadius: '22px',
                    padding: '40px 32px',
                    boxShadow: idx === 1 
                      ? '0 20px 60px rgba(82, 54, 40, 0.12)' 
                      : '0 8px 24px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(82, 54, 40, 0.08)'
                  }}
                >
                  {/* Giant Quote Icon */}
                  <div className="absolute -top-4 -left-2 opacity-10">
                    <Quote 
                      className="w-24 h-24" 
                      style={{ color: '#F16522' }} 
                    />
                  </div>

                  {/* Quote Text */}
                  <blockquote 
                    className="relative z-10 mb-8 leading-relaxed"
                    style={{ 
                      color: '#523628',
                      fontSize: '17px',
                      fontStyle: 'italic',
                      lineHeight: 1.7
                    }}
                  >
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar with golden border */}
                    <div 
                      className="relative"
                      style={{ 
                        padding: '3px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F16522 0%, #D97706 100%)'
                      }}
                    >
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 object-cover"
                        style={{ 
                          borderRadius: '50%',
                          border: '3px solid white'
                        }}
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <p 
                        className="font-bold"
                        style={{ color: '#523628', fontSize: '16px' }}
                      >
                        {testimonial.name}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: '#737373' }}
                      >
                        {testimonial.location}
                      </p>
                    </div>
                    
                    <TrustScoreBadge score={testimonial.trustScore} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className="transition-all duration-300"
                style={{
                  width: index === currentIndex ? '32px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: index === currentIndex ? '#F16522' : '#D4D4D4'
                }}
                aria-label={`Aller au témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar - Animation fadeUp with stagger */}
        <div 
          className={`mt-20 max-w-4xl mx-auto py-10 px-8 transition-all duration-700 ease-out delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ 
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            boxShadow: '0 8px 32px rgba(82, 54, 40, 0.08)'
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2,500+', label: 'Locataires satisfaits' },
              { value: '98%', label: 'Taux de satisfaction' },
              { value: '48h', label: 'Délai moyen de location' },
              { value: '500+', label: 'Propriétaires partenaires' }
            ].map((stat, index) => (
              <div 
                key={index}
                className={`transition-all duration-700 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: isVisible ? `${600 + index * 100}ms` : '0ms' }}
              >
                <p 
                  className="font-bold mb-1"
                  style={{ 
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    color: '#F16522'
                  }}
                >
                  {stat.value}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: '#737373' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
