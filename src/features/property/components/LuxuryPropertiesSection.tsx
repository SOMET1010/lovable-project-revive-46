import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, ArrowRight } from 'lucide-react';
import { useScrollAnimation, getAnimationClasses } from '@/shared/hooks/useScrollAnimation';

const FEATURED_LUXURY_PROPERTIES = [
  {
    id: 'luxury-1',
    src: '/images/hero/plateau-lagoon-night.png',
    title: 'Penthouse Vue Lagune',
    location: 'Le Plateau, Abidjan',
    price: '2,500,000',
    bedrooms: 4,
    bathrooms: 3,
    surface: 280,
    badge: 'Exclusivité'
  },
  {
    id: 'luxury-2',
    src: '/images/hero/riviera-luxury-villa.png',
    title: 'Villa Contemporaine',
    location: 'Riviera Golf, Cocody',
    price: '3,200,000',
    bedrooms: 5,
    bathrooms: 4,
    surface: 450,
    badge: 'Haut de gamme'
  }
];

export function LuxuryPropertiesSection() {
  // Animation hooks
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="py-20 bg-gradient-to-b from-[#2C1810] to-[#1A0F0A] relative overflow-hidden">
      {/* Texture de fond */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('/images/topographic-pattern.svg')" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header avec animation fadeUp */}
        <div 
          ref={headerRef}
          className={`text-center mb-12 ${getAnimationClasses(headerVisible, 'fadeUp')}`}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4 bg-[#F16522]/20 text-[#F16522] rounded-full border border-[#F16522]/30">
            Collection Premium
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Propriétés d'Exception
          </h2>
          <p className="text-lg text-[#E8D4C5]/80 max-w-2xl mx-auto">
            Découvrez notre sélection exclusive de biens haut de gamme, vérifiés et prêts à vous accueillir.
          </p>
        </div>
        
        {/* Grid 2 colonnes avec animations slideLeft/slideRight */}
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {FEATURED_LUXURY_PROPERTIES.map((property, index) => (
            <Link 
              to="/recherche?premium=true" 
              key={property.id} 
              className={`group relative block ${getAnimationClasses(
                cardsVisible, 
                index === 0 ? 'slideLeft' : 'slideRight',
                index * 200
              )}`}
            >
              {/* Image container */}
              <div className="relative h-[400px] rounded-[24px] overflow-hidden">
                <img 
                  src={property.src} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Badge */}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-[#F16522] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                    {property.badge}
                  </span>
                </div>
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#F16522] transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[#E8D4C5]/80 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>
                  
                  {/* Caractéristiques */}
                  <div className="flex items-center gap-6 text-white/80 text-sm mb-4">
                    <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {property.bedrooms} ch.</span>
                    <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" /> {property.bathrooms} sdb</span>
                    <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4" /> {property.surface} m²</span>
                  </div>
                  
                  {/* Prix */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{property.price}</span>
                    <span className="text-[#E8D4C5]/60 text-sm">FCFA/mois</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* CTA avec animation scaleIn */}
        <div 
          ref={ctaRef}
          className={`text-center mt-12 ${getAnimationClasses(ctaVisible, 'scaleIn', 400)}`}
        >
          <Link 
            to="/recherche?premium=true" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#F16522] text-white font-bold rounded-full hover:bg-[#d95a1d] transition-all shadow-lg hover:shadow-[#F16522]/30 hover:scale-105"
          >
            Découvrir nos biens premium
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
