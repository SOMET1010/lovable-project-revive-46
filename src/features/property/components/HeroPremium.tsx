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
      {/* Mobile background image - optimized */}
      <div 
        className="absolute inset-0 lg:hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C1810]/85 via-[#1a0f0a]/90 to-[#0f0805]" />
      </div>

      {/* Subtle grid pattern - hidden on mobile for performance */}
      <div 
        className="absolute inset-0 opacity-[0.03] hidden sm:block"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Orange glow effect - reduced on mobile */}
      <div className="absolute top-1/2 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#FF6C2F]/15 sm:bg-[#FF6C2F]/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-16 items-center">
          
          {/* Left column - Text & Search */}
          <div className="space-y-4 sm:space-y-6">
            {/* Trust badge - compact on mobile */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6C2F] fill-[#FF6C2F]" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                <span className="sm:hidden">N°1 en Côte d'Ivoire</span>
                <span className="hidden sm:inline">N°1 DE LA CONFIANCE EN CÔTE D'IVOIRE</span>
              </span>
            </div>

            {/* Main headline - optimized sizes for mobile */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-[28px] sm:text-5xl lg:text-6xl font-bold leading-[1.15] sm:leading-tight">
                <span className="text-white">Trouvez votre</span>
                <br />
                <span className="text-[#FF6C2F]">nouveau chez-vous</span>
              </h1>
              {/* Adaptive subtitle */}
              <p className="text-[15px] sm:text-lg text-white/70 max-w-lg leading-relaxed">
                <span className="sm:hidden">Logements vérifiés • 100% sécurisés</span>
                <span className="hidden sm:inline">
                  Des milliers d'appartements et villas vérifiés physiquement. 
                  Une expérience humaine, simple et 100% sécurisée.
                </span>
              </p>
            </div>

            {/* Search bar - Stacked on mobile, row on desktop */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-3">
              {/* Mobile: 2 columns stacked */}
              <div className="grid grid-cols-2 gap-2 sm:hidden">
                {/* Property type */}
                <div className="relative">
                  <Home className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-11 pl-8 pr-2 bg-neutral-50 border-0 rounded-lg text-sm text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none"
                  >
                    <option value="">Type</option>
                    {RESIDENTIAL_PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 pl-8 pr-2 bg-neutral-50 border-0 rounded-lg text-sm text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none"
                  >
                    <option value="">Ville</option>
                    {CITIES.map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget - full width */}
                <div className="relative col-span-2">
                  <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full h-11 pl-8 pr-2 bg-neutral-50 border-0 rounded-lg text-sm text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none"
                  >
                    <option value="">Budget max</option>
                    {budgetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search button - full width */}
                <button
                  onClick={handleSearch}
                  className="col-span-2 h-12 px-4 bg-[#FF6C2F] hover:bg-[#e05519] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#FF6C2F]/30"
                >
                  <Search className="w-5 h-5" />
                  <span>Rechercher</span>
                </button>
              </div>

              {/* Desktop: 4 columns */}
              <div className="hidden sm:grid grid-cols-4 gap-2">
                {/* Property type select */}
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-neutral-400 pointer-events-none" />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-11 sm:h-14 pl-9 sm:pl-10 pr-2 sm:pr-4 bg-neutral-50 border-0 rounded-xl text-sm sm:text-base text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none transition-all"
                  >
                    <option value="">Type</option>
                    {RESIDENTIAL_PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City select */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-neutral-400 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 sm:h-14 pl-9 sm:pl-10 pr-2 sm:pr-4 bg-neutral-50 border-0 rounded-xl text-sm sm:text-base text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none transition-all"
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
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-neutral-400 pointer-events-none" />
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full h-11 sm:h-14 pl-9 sm:pl-10 pr-2 sm:pr-4 bg-neutral-50 border-0 rounded-xl text-sm sm:text-base text-neutral-700 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6C2F]/20 focus:outline-none transition-all"
                  >
                    <option value="">Budget</option>
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
                  className="h-11 sm:h-14 px-4 sm:px-6 bg-[#FF6C2F] hover:bg-[#e05519] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-[#FF6C2F]/30"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Rechercher</span>
                </button>
              </div>
            </div>

            {/* Properties counter - compact on mobile */}
            <div className="flex items-center gap-4 sm:gap-6 pt-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-[#FF6C2F]/20 items-center justify-center">
                  <Home className="w-6 h-6 text-[#FF6C2F]" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    <AnimatedCounter target={propertiesCount || 150} suffix="+" />
                  </div>
                  <div className="text-xs sm:text-sm text-white/60">Logements</div>
                </div>
              </div>
              
              <div className="h-8 sm:h-12 w-px bg-white/20" />
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-green-500/20 items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
                  <div className="text-xs sm:text-sm text-white/60">Sécurisés</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Image & Testimonial card (desktop only) */}
          <div className="relative hidden lg:block">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80"
                alt="Appartement moderne à Abidjan"
                className="w-full h-[450px] object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating testimonial card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 max-w-xs">
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

      {/* Wave transition to next section */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 60V30C240 50 480 60 720 50C960 40 1200 20 1440 30V60H0Z" fill="#FAF7F4"/>
        </svg>
      </div>
    </section>
  );
}
