import { useState } from 'react';
import { Search, MapPin, Home, ChevronDown, Sparkles } from 'lucide-react';

interface HeroPremiumProps {
  onSearch: (filters: { city: string; propertyType: string; maxBudget: string }) => void;
}

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
 * HeroPremium - Modern Minimalism Premium Design
 * 
 * Features:
 * - Full-width hero image with 50% black overlay
 * - 64px bold white title with -0.02em letter spacing
 * - Premium search form: 56px fields, orange button, shadows
 * - Subtle animations and hover effects
 */
export default function HeroPremium({ onSearch }: HeroPremiumProps) {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city, propertyType, maxBudget });
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image - Premium Quality */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt="Villa moderne de luxe"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
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

        {/* Main Title - 64px Bold */}
        <h1 
          className="text-center text-white font-bold mb-6"
          style={{ 
            fontSize: 'clamp(40px, 7vw, 64px)',
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          Trouvez votre logement
          <br />
          <span style={{ color: '#FF6C2F' }}>en toute confiance</span>
        </h1>
        
        {/* Subtitle */}
        <p 
          className="text-center text-white/90 max-w-2xl mx-auto mb-10"
          style={{ 
            fontSize: 'clamp(16px, 2vw, 20px)',
            lineHeight: '1.6'
          }}
        >
          Identité certifiée • Paiement sécurisé • Plus de <strong>1 500 logements</strong> vérifiés
        </p>

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
                className="w-full pl-20 pr-12 bg-transparent text-gray-900 font-medium appearance-none cursor-pointer transition-colors focus:outline-none hover:bg-gray-50 focus:bg-gray-50"
                style={{ height: '72px', fontSize: '16px' }}
              >
                <option value="">Où souhaitez-vous habiter ?</option>
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
                className="w-full pl-20 pr-12 bg-transparent text-gray-900 font-medium appearance-none cursor-pointer transition-colors focus:outline-none hover:bg-gray-50 focus:bg-gray-50"
                style={{ height: '72px', fontSize: '16px' }}
              >
                <option value="">Quel type de bien ?</option>
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
                className="w-full pl-20 pr-12 bg-transparent text-gray-900 font-medium appearance-none cursor-pointer transition-colors focus:outline-none hover:bg-gray-50 focus:bg-gray-50"
                style={{ height: '72px', fontSize: '16px' }}
              >
                <option value="">Votre budget max ?</option>
                {budgets.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Search Button - PROMINENT ORANGE */}
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
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/70 text-sm">
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
            <span>Support 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
