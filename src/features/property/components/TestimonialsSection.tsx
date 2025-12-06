import { Star, Quote } from 'lucide-react';
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
    avatar: '/images/hero-abidjan-1.jpg',
    trustScore: 92
  },
  {
    id: 2,
    name: 'Kouamé Assi',
    location: 'Locataire à Cocody Riviera',
    quote: 'Enfin une plateforme sérieuse. Tout était vérifié, pas de mauvaises surprises. L\'appartement correspondait exactement aux photos.',
    avatar: '/images/hero-abidjan-2.jpg',
    trustScore: 88
  },
  {
    id: 3,
    name: 'Fatou Diallo',
    location: 'Locataire au Plateau',
    quote: 'L\'agent m\'a accompagnée du premier appel jusqu\'à la signature. Service exceptionnel et humain. Je recommande à tous mes amis.',
    avatar: '/images/hero-abidjan.jpg',
    trustScore: 95
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
 * TestimonialsSection - Version Simplifiée sans Carrousel
 * Grille statique de 3 témoignages pour réduire la surcharge cognitive
 */
export default function TestimonialsSection() {
  // Scroll animations
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section 
      ref={sectionRef}
      className="py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: '#FFFFFF' }}
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

        {/* Static Grid - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div
              key={testimonial.id}
              className={`relative transition-all duration-700 hover:shadow-xl ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${200 + idx * 150}ms` : '0ms'
              }}
            >
              <div
                className="h-full"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '22px',
                  padding: '40px 32px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(82, 54, 40, 0.08)'
                }}
              >
                {/* Giant Quote Icon */}
                <div className="absolute -top-4 -left-2 opacity-10">
                  <Quote 
                    className="w-20 h-20" 
                    style={{ color: '#F16522' }} 
                  />
                </div>

                {/* Quote Text */}
                <blockquote 
                  className="relative z-10 mb-8 leading-relaxed"
                  style={{ 
                    color: '#523628',
                    fontSize: '16px',
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
                    className="relative flex-shrink-0"
                    style={{ 
                      padding: '3px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F16522 0%, #D97706 100%)'
                    }}
                  >
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 object-cover"
                      style={{ 
                        borderRadius: '50%',
                        border: '3px solid white'
                      }}
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p 
                      className="font-bold truncate"
                      style={{ color: '#523628', fontSize: '15px' }}
                    >
                      {testimonial.name}
                    </p>
                    <p 
                      className="text-sm truncate"
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

        {/* Stats Bar - Animation fadeUp with stagger */}
        <div 
          className={`mt-16 max-w-4xl mx-auto py-10 px-8 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ 
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            boxShadow: '0 8px 32px rgba(82, 54, 40, 0.08)',
            transitionDelay: isVisible ? '500ms' : '0ms'
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
                    fontSize: 'clamp(24px, 3vw, 36px)',
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
