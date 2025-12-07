import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, Wallet, Search, Star, Check } from 'lucide-react';
import { RESIDENTIAL_PROPERTY_TYPES, CITIES, ABIDJAN_COMMUNES } from '@/lib/constants/app.constants';
import { useHomeStats } from '@/shared/hooks/useHomeStats';

// Animated counter component
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated.current && target > 0) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(target * easeOut));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}

export default function HeroPremium() {
  const navigate = useNavigate();
  const { propertiesCount } = useHomeStats();
  
  // Search form state
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Get neighborhoods based on selected city
  const neighborhoods = city === 'Abidjan' ? ABIDJAN_COMMUNES : [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (propertyType) params.set('type', propertyType);
    if (city) params.set('city', city);
    if (maxBudget) params.set('maxPrice', maxBudget);
    
    navigate(`/recherche${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const budgetOptions = [
    { value: '50000', label: '50 000 FCFA' },
    { value: '100000', label: '100 000 FCFA' },
    { value: '150000', label: '150 000 FCFA' },
    { value: '200000', label: '200 000 FCFA' },
    { value: '300000', label: '300 000 FCFA' },
    { value: '500000', label: '500 000 FCFA' },
    { value: '1000000', label: '1 000 000+ FCFA' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#2C1810] via-[#1a0f0a] to-[#0f0805] overflow-hidden">
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Orange glow effect */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[#FF6C2F]/20 rounded-full blur-[150px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left column - Text & Search */}
          <div className="space-y-8">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-[#FF6C2F] fill-[#FF6C2F]" />
              <span className="text-white/90 text-sm font-medium">
                N°1 DE LA CONFIANCE EN CÔTE D'IVOIRE
              </span>
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">Trouvez votre</span>
                <br />
                <span className="text-[#FF6C2F]">nouveau chez-vous</span>
              </h1>
              <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                Des milliers d'appartements et villas vérifiés physiquement. 
                Une expérience humaine, simple et 100% sécurisée.
              </p>
            </div>

            {/* Search bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3">
                {/* Property type select */}
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-12 sm:h-14 pl-10 pr-4 bg-neutral-50 border-0 rounded-xl text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none transition-all"
                  >
                    <option value="">Type de bien</option>
                    {RESIDENTIAL_PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City select */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 sm:h-14 pl-10 pr-4 bg-neutral-50 border-0 rounded-xl text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none transition-all"
                  >
                    <option value="">Ville</option>
                    {CITIES.map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                    {neighborhoods.length > 0 && (
                      <optgroup label="Communes d'Abidjan">
                        {neighborhoods.map((commune) => (
                          <option key={commune} value={commune}>
                            {commune}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Budget select */}
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full h-12 sm:h-14 pl-10 pr-4 bg-neutral-50 border-0 rounded-xl text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none transition-all"
                  >
                    <option value="">Budget max</option>
                    {budgetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search button */}
                <button
                  onClick={handleSearch}
                  className="h-12 sm:h-14 px-6 bg-[#FF6C2F] hover:bg-[#e05519] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-[#FF6C2F]/30"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Rechercher</span>
                </button>
              </div>
            </div>

            {/* Properties counter */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF6C2F]/20 flex items-center justify-center">
                  <Home className="w-6 h-6 text-[#FF6C2F]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter target={propertiesCount || 150} suffix="+" />
                  </div>
                  <div className="text-sm text-white/60">Logements vérifiés</div>
                </div>
              </div>
              
              <div className="h-12 w-px bg-white/20" />
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-white/60">Sécurisés</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Image & Testimonial card */}
          <div className="relative hidden lg:block">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80"
                alt="Appartement moderne à Abidjan"
                className="w-full h-[500px] object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating testimonial card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 max-w-xs animate-bounce-slow">
              <div className="flex items-start gap-4">
                <img
                  src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Marie K."
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF6C2F]/20"
                />
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600 leading-snug">
                    "Logement trouvé en 48h ! Service exceptionnel."
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">Marie K. — Cocody</p>
                </div>
              </div>
            </div>

            {/* Property badge */}
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-neutral-700">Disponible maintenant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
