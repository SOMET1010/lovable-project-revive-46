import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, Home, Banknote, FileCheck, Heart, ArrowRight, 
  Bed, Bath, Maximize, Star, Quote, Send, User, Phone, MessageSquare, 
  CheckCircle, Shield, Clock, Award, Bot, FileText, Key
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";
import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import SEOHead, { createOrganizationStructuredData, createWebsiteStructuredData } from '@/shared/components/SEOHead';
import SUTAChatWidget from '@/shared/components/SUTAChatWidget';
import { propertyApi } from '../services/property.api';
import type { PropertyWithOwnerScore } from '../types';

// ==================== CONSTANTES ====================
const PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'studio', label: 'Studio' },
  { value: 'commerce', label: 'Commerce' },
];

const LOCATIONS = [
  { value: 'cocody', label: 'Cocody' },
  { value: 'marcory', label: 'Marcory' },
  { value: 'plateau', label: 'Le Plateau' },
  { value: 'yopougon', label: 'Yopougon' },
  { value: 'abidjan', label: 'Tout Abidjan' },
];

const BUDGETS = [
  { value: '150000', label: 'Max 150.000 FCFA' },
  { value: '250000', label: 'Max 250.000 FCFA' },
  { value: '500000', label: 'Max 500.000 FCFA' },
  { value: '1000000', label: 'Max 1.000.000 FCFA' },
  { value: 'unlimited', label: 'Budget illimité' },
];

const QUICK_SEARCH_TAGS = ['Riviera 3', 'Zone 4', 'Studio', 'Marcory'];

const TRUST_BADGES = [
  { icon: Home, text: 'Logements vérifiés', color: 'text-[#2E4B3E]', bg: 'bg-[#2E4B3E]/10' },
  { icon: FileCheck, text: 'Contrats sécurisés', color: 'text-[#F16522]', bg: 'bg-[#F16522]/10' },
  { icon: MapPin, text: 'Quartiers populaires', color: 'text-[#A67C52]', bg: 'bg-[#A67C52]/10' }
];

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Explorez avec Confiance',
    description: 'Fini les mauvaises surprises. Parcourez des centaines d\'annonces 100% vérifiées par nos agents.',
    iconStart: Search,
    iconEnd: Heart,
  },
  {
    number: '02',
    title: 'Postulez en un Clic',
    description: 'Votre dossier locataire unique et votre Trust Score vous ouvrent les portes.',
    iconStart: Heart,
    iconEnd: FileCheck,
  },
  {
    number: '03',
    title: 'Signez et Emménagez',
    description: 'Signez votre bail électronique sécurisé. Bienvenue chez vous !',
    iconStart: FileCheck,
    iconEnd: Key,
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Mariam Bamba',
    location: 'Locataire à Marcory',
    quote: 'Le Trust Score a tout changé. J\'ai trouvé mon appartement en 48h !',
    avatar: '/images/hero-abidjan-1.jpg',
    trustScore: 92
  },
  {
    id: 2,
    name: 'Kouamé Assi',
    location: 'Locataire à Cocody Riviera',
    quote: 'Enfin une plateforme sérieuse. Tout était vérifié, pas de mauvaises surprises.',
    avatar: '/images/hero-abidjan-2.jpg',
    trustScore: 88
  },
  {
    id: 3,
    name: 'Fatou Diallo',
    location: 'Locataire au Plateau',
    quote: 'L\'agent m\'a accompagnée du premier appel jusqu\'à la signature.',
    avatar: '/images/hero-abidjan.jpg',
    trustScore: 95
  }
];

const STATS = [
  { value: '2,500+', label: 'Locataires satisfaits' },
  { value: '98%', label: 'Taux de satisfaction' },
  { value: '48h', label: 'Délai moyen' },
  { value: '500+', label: 'Propriétaires' }
];

// ==================== HOOKS ====================
function useScrollAnimation<T extends HTMLElement>(options = { threshold: 0.1 }) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && setIsVisible(true),
      { threshold: options.threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options.threshold]);

  return { ref, isVisible };
}

// ==================== COMPOSANTS ====================

function PropertyCard({ property, index, isVisible }: { property: PropertyWithOwnerScore; index: number; isVisible: boolean }) {
  return (
    <Link
      to={`/proprietes/${property.id}`}
      className={`group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: isVisible ? `${index * 150}ms` : '0ms' }}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
          alt={property.title || 'Propriété'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="px-3 py-1.5 bg-[#F16522] text-white text-xs font-bold rounded-full uppercase tracking-wide">
            {property.property_type || 'Appartement'}
          </span>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all">
            <Heart className="h-5 w-5 text-[#523628]" />
          </button>
        </div>
        
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2">
            <span className="text-xl font-bold text-[#F16522]">
              {property.monthly_rent?.toLocaleString() || 'N/A'}
            </span>
            <span className="text-sm text-[#523628] ml-1">FCFA/mois</span>
          </div>
        </div>

        {property.owner_trust_score != null && (
          <div className="absolute bottom-4 right-4">
            <ScoreBadge score={property.owner_trust_score} variant="compact" size="sm" />
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#3A2D25] mb-3 group-hover:text-[#F16522] transition-colors line-clamp-1">
          {property.title || 'Belle propriété à louer'}
        </h3>
        <div className="flex items-center gap-2 text-[#737373] mb-4">
          <MapPin className="h-4 w-4 text-[#F16522]" />
          <span className="text-sm">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city || 'Abidjan'}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#737373] pt-4 border-t border-[#E5E5E5]">
          {property.bedrooms && <div className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-[#A67C52]" /><span>{property.bedrooms} ch.</span></div>}
          {property.bathrooms && <div className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-[#A67C52]" /><span>{property.bathrooms} sdb</span></div>}
          {property.surface_area && <div className="flex items-center gap-1.5"><Maximize className="h-4 w-4 text-[#A67C52]" /><span>{property.surface_area} m²</span></div>}
        </div>
      </div>
    </Link>
  );
}

// ==================== PAGE PRINCIPALE ====================
export default function HomePage() {
  const navigate = useNavigate();
  
  // États Hero
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  
  // États Propriétés
  const [properties, setProperties] = useState<PropertyWithOwnerScore[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  
  // États How It Works
  const [activeStep, setActiveStep] = useState(0);
  
  // États CTA
  const [activeTab, setActiveTab] = useState<'chat' | 'form'>('chat');
  const [formData, setFormData] = useState({ name: '', phone: '', project: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Animations
  const { ref: howItWorksRef, isVisible: howItWorksVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.2 });
  const { ref: propertiesRef, isVisible: propertiesVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

  // Chargement des propriétés
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const { data, error } = await propertyApi.getFeatured();
        if (error) throw error;
        setProperties((data || []).slice(0, 4));
      } catch (error) {
        console.error('Error loading properties:', error);
        setProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };
    loadProperties();
  }, []);

  // Auto-progression des étapes
  useEffect(() => {
    if (!howItWorksVisible) return;
    const timer = setInterval(() => setActiveStep((prev) => (prev + 1) % HOW_IT_WORKS_STEPS.length), 4000);
    return () => clearInterval(timer);
  }, [howItWorksVisible]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (propertyType) params.set('type', propertyType);
    if (location) params.set('city', location);
    if (budget) params.set('maxPrice', budget);
    navigate(`/recherche?${params.toString()}`);
  };

  const handleQuickSearch = (term: string) => navigate(`/recherche?q=${encodeURIComponent(term)}`);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Demande envoyée ! Un expert vous contactera sous 24h.');
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', project: '' });
    }, 5000);
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [createOrganizationStructuredData(), createWebsiteStructuredData()],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Mon Toit - Trouvez Votre Logement Idéal en Côte d'Ivoire | Abidjan"
        description="Plus de 1000 propriétés vérifiées en Côte d'Ivoire. Appartements, villas, studios à Abidjan. Plateforme certifiée ANSUT."
        keywords="location Abidjan, appartement Cocody, villa Plateau, immobilier Côte d'Ivoire"
        structuredData={structuredData}
      />

      {/* ==================== SECTION HERO ==================== */}
      <section className="relative w-full min-h-[650px] lg:min-h-[700px] overflow-hidden flex items-center bg-[#F5E6D3]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none select-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl mix-blend-overlay bg-white/20 animate-pulse" />
          <div className="absolute bottom-0 right-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-50 bg-[#E6D0B3]" />
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-0 relative z-10">
          {/* Mobile Image */}
          <div className="lg:hidden w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(82,54,40,0.2)]">
              <img src="/images/hero/hero-famille-cocody.webp" alt="Famille ivoirienne" className="w-full h-full object-cover object-[center_30%]" loading="eager" fetchPriority="high" />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2E4B3E]/10"><Home className="w-4 h-4 text-[#2E4B3E]" /></div>
                <span className="text-sm font-semibold text-[#523628]">100% Vérifié</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center h-full">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8">
              <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                <span className="text-sm font-semibold tracking-wide uppercase text-[#A67C52]">Immobilier Premium Abidjan</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-[#3A2D25]">
                  Trouvez votre <br/><span className="text-[#F16522]">nouveau chez-vous</span>
                </h1>
                <p className="text-base lg:text-lg max-w-lg font-medium text-[#4A3628]">
                  Appartements, villas et terrains vérifiés. Une expérience simple, humaine et sécurisée en Côte d'Ivoire.
                </p>
              </div>

              {/* Barre de recherche */}
              <div className="bg-white p-3 lg:p-4 rounded-[2rem] lg:rounded-[2.5rem] max-w-2xl shadow-[0_20px_50px_rgba(82,54,40,0.12)] animate-in fade-in zoom-in duration-700 delay-200 ring-1 ring-[#523628]/5">
                <div className="flex flex-col md:flex-row items-stretch gap-2 lg:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#523628]/10">
                  <div className="flex-1 px-4 lg:px-6 py-2">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#A67C52]"><Home className="w-3 h-3" /> Type</div>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto font-semibold text-[#3A2D25] focus:ring-0"><SelectValue placeholder="Appartement" /></SelectTrigger>
                      <SelectContent>{PROPERTY_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 px-4 lg:px-6 py-2">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#A67C52]"><MapPin className="w-3 h-3" /> Lieu</div>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto font-semibold text-[#3A2D25] focus:ring-0"><SelectValue placeholder="Cocody" /></SelectTrigger>
                      <SelectContent>{LOCATIONS.map((loc) => <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 px-4 lg:px-6 py-2">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#A67C52]"><Banknote className="w-3 h-3" /> Budget</div>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto font-semibold text-[#3A2D25] focus:ring-0"><SelectValue placeholder="Max 500k" /></SelectTrigger>
                      <SelectContent>{BUDGETS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="p-1 w-full md:w-auto">
                    <Button onClick={handleSearch} className="w-full md:w-auto rounded-full bg-[#F16522] hover:bg-[#d95a1d] text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                      <Search className="w-5 h-5 mr-2" /><span className="hidden md:inline">Rechercher</span><span className="md:hidden">Voir les résultats</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tags rapides */}
              <div className="flex flex-wrap gap-2 lg:gap-3 pt-2 animate-in fade-in duration-700 delay-300">
                <span className="text-sm font-medium text-[#8C7A6D]">Recherches fréquentes :</span>
                {QUICK_SEARCH_TAGS.map((term) => (
                  <button key={term} onClick={() => handleQuickSearch(term)} className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105 hover:bg-white bg-white/60 text-[#523628] shadow-sm">{term}</button>
                ))}
              </div>

              {/* Badges de confiance */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-4 animate-in fade-in duration-700 delay-500">
                {TRUST_BADGES.map((item) => (
                  <div key={item.text} className="flex items-center gap-2 group cursor-default">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${item.bg}`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-[#523628]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Image */}
            <div className="hidden lg:block lg:col-span-5 relative h-[650px] animate-in slide-in-from-right-10 duration-1000 ease-out">
              <div className="absolute right-[-60px] top-8 w-[125%] h-[92%] rounded-l-[3rem] -z-10 blur-xl opacity-60 bg-gradient-to-br from-[#f5d9c0] via-[#f3e7db] to-[#f0e4d9]" />
              <div className="absolute right-[-50px] top-10 w-[120%] h-[90%] group">
                <img src="/images/hero/hero-famille-cocody.webp" alt="Famille ivoirienne" className="w-full h-full object-cover object-[center_40%] rounded-l-[3rem] shadow-[0_40px_80px_rgba(82,54,40,0.2)] transition-transform duration-700 group-hover:scale-[1.01]" loading="eager" fetchPriority="high" />
                <div className="absolute bottom-20 -left-10 bg-white p-4 rounded-2xl shadow-[0_16px_48px_rgba(82,54,40,0.15)] flex items-center gap-4 animate-bounce-slow">
                  <div className="p-3 rounded-full bg-[#2E4B3E]/10"><Home className="w-6 h-6 text-[#2E4B3E]" /></div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-[#A67C52]">Logements vérifiés</p>
                    <p className="text-lg font-bold text-[#3A2D25]">100% Sécurisé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION COMMENT ÇA MARCHE ==================== */}
      <section ref={howItWorksRef} className="relative py-20 md:py-28 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 blur-3xl bg-[#F16522]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 opacity-10 blur-3xl bg-[#E6D0B3]" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-6 py-2.5 text-sm font-semibold mb-6 bg-[#F16522]/10 text-[#F16522] rounded-[22px]">Comment ça marche</span>
            <h2 className="font-bold mb-5 text-[#523628]" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>La location, réinventée en 3 étapes simples</h2>
            <p className="max-w-2xl mx-auto text-lg text-[#737373]">Un processus transparent et sécurisé pour vous accompagner</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const IconStart = step.iconStart;
              const IconEnd = step.iconEnd;
              const isActive = index === activeStep;
              const isPast = index < activeStep;

              return (
                <div key={step.number} className={`relative group cursor-pointer transition-all duration-700 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${index * 200}ms` }} onClick={() => setActiveStep(index)}>
                  {index < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 z-0" style={{ background: isPast || isActive ? 'linear-gradient(90deg, #F16522 0%, #F16522 50%, #E5E5E5 50%, #E5E5E5 100%)' : '#E5E5E5', transform: 'translateX(-50%)' }} />
                  )}
                  <div className={`relative h-full text-center transition-all duration-500 bg-white rounded-[22px] p-12 ${isActive ? 'border-2 border-[#F16522] shadow-[0_20px_60px_-10px_rgba(241,101,34,0.25)] -translate-y-2' : 'border-2 border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.05)]'}`}>
                    <div className="text-xs font-bold mb-6 text-[#F16522] tracking-[0.15em]">ÉTAPE {step.number}</div>
                    <div className={`relative w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-[22px] ${isActive ? 'bg-[#F16522]/10' : 'bg-[#F16522]/5'}`}>
                      <div className="relative w-12 h-12">
                        <IconStart className={`absolute inset-0 w-12 h-12 transition-all duration-700 text-[#F16522] ${isActive ? 'opacity-0 scale-50 rotate-180' : 'opacity-100 scale-100 rotate-0'}`} />
                        <IconEnd className={`absolute inset-0 w-12 h-12 transition-all duration-700 text-[#F16522] ${isActive ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-180'}`} />
                      </div>
                      {isActive && <div className="absolute inset-0 animate-ping opacity-20 bg-[#F16522] rounded-[22px]" />}
                    </div>
                    <h3 className="font-bold mb-4 text-[22px] text-[#523628]">{step.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[#737373]">{step.description}</p>
                    {isPast && (
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-[#2E4B3E]">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-3 mt-12">
            {HOW_IT_WORKS_STEPS.map((_, index) => (
              <button key={index} onClick={() => setActiveStep(index)} className="transition-all duration-300" style={{ width: index === activeStep ? '32px' : '10px', height: '10px', borderRadius: '5px', backgroundColor: index === activeStep ? '#F16522' : '#D4D4D4' }} aria-label={`Étape ${index + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SECTION PROPRIÉTÉS ==================== */}
      <section ref={propertiesRef} className="py-16 md:py-20 bg-[#FAF7F4]">
        <div className="container mx-auto px-4">
          <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 transition-all duration-700 ease-out ${propertiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-[#F16522]/10 text-[#F16522] text-sm font-semibold mb-4">Nouvelles Annonces</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3A2D25] mb-3">Propriétés à découvrir</h2>
              <p className="text-lg text-[#737373] max-w-xl">Les dernières annonces vérifiées et prêtes à vous accueillir</p>
            </div>
            <Link to="/recherche" className={`group inline-flex items-center gap-2 text-[#F16522] font-semibold hover:text-[#d95a1d] transition-all duration-700 delay-200 ${propertiesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <span>Voir toutes les propriétés</span><ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-[#E6D0B3]" />
                  <div className="p-6"><div className="h-6 bg-[#E6D0B3] rounded-lg mb-3 w-3/4" /><div className="h-4 bg-[#E6D0B3] rounded mb-4 w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E6D0B3]/50 flex items-center justify-center"><MapPin className="h-10 w-10 text-[#737373]" /></div>
              <h3 className="text-xl font-semibold text-[#3A2D25] mb-2">Aucune propriété disponible</h3>
              <p className="text-[#737373]">De nouvelles annonces arrivent bientôt</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((property, index) => <PropertyCard key={property.id} property={property} index={index} isVisible={propertiesVisible} />)}
            </div>
          )}
        </div>
      </section>

      {/* ==================== SECTION TÉMOIGNAGES ==================== */}
      <section ref={testimonialsRef} className="py-20 md:py-28 overflow-hidden bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-block px-6 py-2.5 text-sm font-semibold mb-6 bg-[#F16522]/10 text-[#F16522] rounded-[22px]">Témoignages</span>
            <h2 className="font-bold mb-5 text-[#523628]" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>Ils Nous Ont Fait Confiance</h2>
            <p className="max-w-2xl mx-auto text-lg text-[#737373]">Des milliers de locataires satisfaits par notre service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={testimonial.id} className={`relative transition-all duration-700 hover:shadow-xl ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: testimonialsVisible ? `${200 + idx * 150}ms` : '0ms' }}>
                <div className="h-full bg-white rounded-[22px] p-10 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#523628]/8">
                  <div className="absolute -top-4 -left-2 opacity-10"><Quote className="w-20 h-20 text-[#F16522]" /></div>
                  <blockquote className="relative z-10 mb-8 leading-relaxed text-[#523628] text-base italic">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0 p-[3px] rounded-full bg-gradient-to-br from-[#F16522] to-[#D97706]">
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 object-cover rounded-full border-[3px] border-white" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-[#523628] text-[15px]">{testimonial.name}</p>
                      <p className="text-sm truncate text-[#737373]">{testimonial.location}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 font-semibold bg-[#2E4B3E]/10 text-[#2E4B3E] rounded-xl border border-[#2E4B3E] text-[13px]">
                      <Star className="w-4 h-4 fill-current" /><span>Score {testimonial.trustScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-16 max-w-4xl mx-auto py-10 px-8 bg-white rounded-[22px] shadow-[0_8px_32px_rgba(82,54,40,0.08)] transition-all duration-700 ease-out ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: testimonialsVisible ? '500ms' : '0ms' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map((stat, index) => (
                <div key={index} className={`transition-all duration-700 ease-out ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: testimonialsVisible ? `${600 + index * 100}ms` : '0ms' }}>
                  <p className="font-bold mb-1 text-[#F16522]" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>{stat.value}</p>
                  <p className="text-sm text-[#737373]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION CTA ==================== */}
      <section ref={ctaRef} className="py-20 md:py-28 relative overflow-hidden bg-[#F5E6D3]">
        <div className="absolute top-20 right-20 w-64 h-64 opacity-20 blur-3xl bg-[#F16522]" />
        <div className="absolute bottom-20 left-20 w-48 h-48 opacity-15 blur-3xl bg-[#2E4B3E]" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch max-w-6xl mx-auto">
            {/* Image */}
            <div className={`relative order-2 lg:order-1 transition-all duration-700 ease-out ${ctaVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <div className="relative max-w-lg mx-auto lg:mx-0 h-full">
                <div className="relative overflow-hidden h-full min-h-[400px] lg:min-h-[500px] rounded-[28px] shadow-[0_32px_64px_rgba(82,54,40,0.2)]">
                  <img src="/images/hero-controle-acces.jpg" alt="Expert immobilier Mon Toit" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#523628]/80 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white font-bold text-lg">Nos agents sur le terrain</p>
                    <p className="text-white/80 text-sm">Vérification physique de chaque bien</p>
                  </div>
                </div>
                <div className={`absolute -bottom-6 -right-6 lg:-right-10 flex items-center gap-4 p-5 bg-white rounded-[22px] shadow-[0_16px_48px_rgba(82,54,40,0.15)] border border-[#F16522]/10 transition-all duration-700 ease-out delay-300 ${ctaVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#F16522]/10"><Award className="w-7 h-7 text-[#F16522]" /></div>
                  <div>
                    <p className="font-bold text-[#523628] text-base">Agent Certifié</p>
                    <p className="text-[#737373] text-sm">Expert Mon Toit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form/Chat */}
            <div className={`order-1 lg:order-2 transition-all duration-700 ease-out delay-100 ${ctaVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="mb-6">
                <span className="inline-block px-6 py-2.5 text-sm font-semibold mb-6 bg-[#F16522]/10 text-[#F16522] rounded-[22px]">Accompagnement personnalisé</span>
                <h2 className="font-bold mb-4 text-[#523628]" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>Besoin d'aide ? Choisissez votre mode de contact</h2>
              </div>

              <div className="hidden lg:flex gap-6 mb-6">
                {[{ icon: Shield, label: 'Service 100% gratuit' }, { icon: Clock, label: 'Réponse instantanée' }, { icon: CheckCircle, label: 'Sans engagement' }].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#2E4B3E]/10"><item.icon className="w-4 h-4 text-[#2E4B3E]" /></div>
                    <span className="text-[#737373] text-[13px]">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[22px] shadow-[0_20px_60px_rgba(82,54,40,0.1)] border border-[#523628]/8 overflow-hidden">
                <div className="flex border-b border-[#523628]/10">
                  <button onClick={() => setActiveTab('chat')} className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all duration-300 ${activeTab === 'chat' ? 'bg-[#075E54] text-white' : 'text-[#737373]'}`}>
                    <Bot className="w-5 h-5" /><span>Chat avec SUTA</span>
                  </button>
                  <button onClick={() => setActiveTab('form')} className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all duration-300 ${activeTab === 'form' ? 'bg-[#F16522] text-white' : 'text-[#737373]'}`}>
                    <FileText className="w-5 h-5" /><span>Formulaire</span>
                  </button>
                </div>

                <div style={{ height: '420px' }}>
                  {activeTab === 'chat' ? (
                    <SUTAChatWidget className="h-full" />
                  ) : (
                    <div className="p-6 h-full overflow-y-auto">
                      {isSubmitted ? (
                        <div className="text-center py-8">
                          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#2E4B3E]/10"><CheckCircle className="w-10 h-10 text-[#2E4B3E]" /></div>
                          <h3 className="font-bold mb-3 text-[#2E4B3E] text-[22px]">Demande envoyée !</h3>
                          <p className="text-[#737373]">Un expert vous contactera dans les 24h.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#F16522]/10 rounded-[10px]"><User className="w-5 h-5 text-[#F16522]" /></div>
                            <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Votre nom complet *" required className="w-full h-14 pl-[60px] pr-5 border-2 border-[#E5E5E5] rounded-[14px] text-[#523628] text-[15px] focus:border-[#F16522] focus:outline-none transition-colors" />
                          </div>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#F16522]/10 rounded-[10px]"><Phone className="w-5 h-5 text-[#F16522]" /></div>
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Votre téléphone *" required className="w-full h-14 pl-[60px] pr-5 border-2 border-[#E5E5E5] rounded-[14px] text-[#523628] text-[15px] focus:border-[#F16522] focus:outline-none transition-colors" />
                          </div>
                          <div className="relative">
                            <div className="absolute left-4 top-4 w-10 h-10 flex items-center justify-center bg-[#F16522]/10 rounded-[10px]"><MessageSquare className="w-5 h-5 text-[#F16522]" /></div>
                            <textarea value={formData.project} onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))} placeholder="Décrivez votre projet..." rows={3} className="w-full pt-4 pb-4 pl-[60px] pr-5 border-2 border-[#E5E5E5] rounded-[14px] text-[#523628] text-[15px] focus:border-[#F16522] focus:outline-none transition-colors resize-none" />
                          </div>
                          <button type="submit" disabled={isSubmitting} className="w-full h-14 flex items-center justify-center gap-3 font-semibold bg-[#F16522] text-white rounded-[14px] shadow-[0_4px_16px_rgba(241,101,34,0.3)] hover:scale-[1.02] transition-all disabled:opacity-70">
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-5 h-5" /><span>Envoyer ma demande</span></>}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
