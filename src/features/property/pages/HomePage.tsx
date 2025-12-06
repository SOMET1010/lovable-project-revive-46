// Force re-bundle - 2025-12-06T11:32:00Z
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, Home, FileCheck, Heart, ArrowRight, 
  Bed, Bath, Maximize, Star, Quote, Send, User, Phone, MessageSquare, 
  CheckCircle, Shield, Award, Key
} from 'lucide-react';
// toast temporarily disabled due to server issues
// import { toast } from 'sonner';
import { Button } from '@/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";
import { ScoreBadge } from '@/shared/ui/ScoreBadge';
import SEOHead, { createOrganizationStructuredData, createWebsiteStructuredData } from '@/shared/components/SEOHead';
import SUTAChatWidget from '@/shared/components/SUTAChatWidget';
import { propertyApi } from '../services/property.api';
import type { PropertyWithOwnerScore } from '../types';

// ==================== PALETTE HARMONISÉE ====================
// Chocolat profond (titres): #2C1810
// Taupe chaud (paragraphes): #6B5A4E
// Crème pâle (fonds): #FAF7F4
// Beige subtil (bordures): #EFEBE9
// Sable moyen (inactifs): #A69B95
// Blanc cassé chaud (cartes): #FFFBF5
// Ombres: rgba(44,24,16,x) - teintées chocolat

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
  { value: 'riviera', label: 'Riviera' },
  { value: 'yopougon', label: 'Yopougon' },
];

const BUDGETS = [
  { value: '250000', label: 'Max 250k FCFA' },
  { value: '500000', label: 'Max 500k FCFA' },
  { value: '1000000', label: 'Max 1M FCFA' },
  { value: 'unlimited', label: 'Budget illimité' },
];

const QUICK_SEARCH_TAGS = ['Riviera 3', 'Zone 4', 'Studio', 'Cocody'];

const HERO_TRUST_BADGES = [
  { icon: Home, text: 'Logements vérifiés', color: 'text-[#E8D4C5]', bg: 'bg-white/10' },
  { icon: FileCheck, text: 'Dossier Digital', color: 'text-[#F16522]', bg: 'bg-[#F16522]/10' },
  { icon: Shield, text: '100% Sécurisé', color: 'text-[#E8D4C5]', bg: 'bg-white/10' }
];

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Explorez avec Confiance',
    description: 'Fini les mauvaises surprises. Parcourez des centaines d\'annonces 100% vérifiées physiquement par nos agents.',
    iconStart: Search,
    iconEnd: Heart,
  },
  {
    number: '02',
    title: 'Postulez en un Clic',
    description: 'Créez votre dossier locataire unique et digitalisé. Votre Trust Score vous ouvre les portes des meilleurs biens.',
    iconStart: Heart,
    iconEnd: FileCheck,
  },
  {
    number: '03',
    title: 'Signez et Emménagez',
    description: 'Signature de bail électronique sécurisée et état des lieux numérique. Bienvenue chez vous !',
    iconStart: FileCheck,
    iconEnd: Key,
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Mariam Bamba',
    location: 'Locataire à Marcory',
    quote: 'Le Trust Score a tout changé. Les propriétaires me font confiance et j\'ai trouvé mon appartement en 48h !',
    avatar: '/images/hero-abidjan-1.jpg',
    trustScore: 92
  },
  {
    id: 2,
    name: 'Jean-Marc Kouassi',
    location: 'Propriétaire à Riviera',
    quote: 'Enfin une plateforme sérieuse. Je reçois des dossiers complets et vérifiés. Je loue plus vite et sans stress.',
    avatar: '/images/hero-abidjan-2.jpg',
    trustScore: 98
  },
  {
    id: 3,
    name: 'Sarah Diallo',
    location: 'Locataire au Plateau',
    quote: 'L\'agent Mon Toit m\'a accompagnée du premier appel jusqu\'à la remise des clés. Un service impeccable.',
    avatar: '/images/hero-abidjan.jpg',
    trustScore: 95
  }
];

const STATS = [
  { value: '2,500+', label: 'Locataires logés' },
  { value: '98%', label: 'Taux de satisfaction' },
  { value: '48h', label: 'Délai moyen' },
  { value: '1M+', label: 'Visites virtuelles' }
];

const HERO_IMAGES = [
  { src: '/images/hero/hero-family-cocody.webp', alt: 'Famille devant leur nouvelle villa à Cocody' },
  { src: '/images/hero/hero-couple-tablet.png', alt: 'Couple découvrant Mon Toit sur tablette' },
  { src: '/images/hero/hero-roommates.png', alt: 'Colocataires heureux dans leur appartement' },
  { src: '/images/hero/hero-agent.png', alt: 'Agent Mon Toit accompagnant des clients' },
];

// ==================== HOOKS ====================
function useScrollAnimation<T extends HTMLElement>(options = { threshold: 0.1 }) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      options
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
      className={`group block bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(44,24,16,0.08)] border border-[#EFEBE9] transition-all duration-500 ease-out hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images?.[0] || '/images/placeholder-property.jpg'}
          alt={property.title || 'Propriété Mon Toit'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/60 via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-[#2C1810] text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
            {property.property_type || 'Bien'}
          </span>
          <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-[#F16522] text-white transition-colors">
            <Heart className="h-4 w-4" />
          </button>
        </div>
        
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold">
              {property.monthly_rent?.toLocaleString('fr-FR') || 'N/A'}
            </span>
            <span className="text-xs font-medium opacity-90">FCFA/mois</span>
          </div>
        </div>

        {property.owner_trust_score != null && (
          <div className="absolute bottom-4 right-4">
            <ScoreBadge score={property.owner_trust_score} variant="compact" size="sm" />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-[#2C1810] mb-2 group-hover:text-[#F16522] transition-colors line-clamp-1">
          {property.title || 'Appartement de standing'}
        </h3>
        <div className="flex items-center gap-2 text-[#6B5A4E] mb-4 text-sm">
          <MapPin className="h-3.5 w-3.5 text-[#F16522]" />
          <span className="line-clamp-1">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city || 'Abidjan'}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs font-medium text-[#A69B95] pt-4 border-t border-[#EFEBE9]">
          <div className="flex items-center gap-1.5"><Bed className="h-4 w-4" /><span>{property.bedrooms || '-'} ch.</span></div>
          <div className="flex items-center gap-1.5"><Bath className="h-4 w-4" /><span>{property.bathrooms || '-'} sdb</span></div>
          <div className="flex items-center gap-1.5"><Maximize className="h-4 w-4" /><span>{property.surface_area || '-'} m²</span></div>
        </div>
      </div>
    </Link>
  );
}

// ==================== PAGE PRINCIPALE ====================
export default function HomePage() {
  const navigate = useNavigate();
  
  // États
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  
  const [properties, setProperties] = useState<PropertyWithOwnerScore[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  
  const [activeStep, setActiveStep] = useState(0);
  const [activeCtaTab, setActiveCtaTab] = useState<'chat' | 'form'>('chat');
  const [formData, setFormData] = useState({ name: '', phone: '', project: '' });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

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
        console.error('Erreur chargement propriétés:', error);
      } finally {
        setLoadingProperties(false);
      }
    };
    loadProperties();
  }, []);

  // Auto-progression des étapes
  useEffect(() => {
    if (!howItWorksVisible) return;
    const timer = setInterval(() => setActiveStep((prev) => (prev + 1) % HOW_IT_WORKS_STEPS.length), 5000);
    return () => clearInterval(timer);
  }, [howItWorksVisible]);

  // Auto-rotation carousel Hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
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
      console.warn('Formulaire incomplet');
      return;
    }
    setIsFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsFormSubmitting(false);
    setIsFormSubmitted(true);
    console.log('Demande envoyée avec succès');
    setFormData({ name: '', phone: '', project: '' });
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [createOrganizationStructuredData(), createWebsiteStructuredData()],
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-[#F16522] selection:text-white">
      <SEOHead
        title="Mon Toit - Trouvez Votre Logement Idéal en Côte d'Ivoire"
        description="La plateforme immobilière N°1 en Côte d'Ivoire. Appartements et villas vérifiés. Location sécurisée avec dossier digital."
        keywords="immobilier abidjan, location appartement cocody, villa riviera, agence immobilière abidjan"
        structuredData={structuredData}
      />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative w-full min-h-[700px] overflow-hidden flex items-center bg-[#2C1810]">
        
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#F16522]/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-[#F5E6D3]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 py-12 lg:py-0 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
              <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                  <Star className="w-3 h-3 text-[#F16522] fill-current" />
                  <span className="text-[#F5E6D3] text-xs font-bold tracking-wider uppercase">N°1 de la confiance à Abidjan</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] text-white tracking-tight">
                  Trouvez votre <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F16522] to-[#FF8C55]">
                    nouveau chez-vous
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-[#E8D4C5]/80 max-w-lg font-light leading-relaxed">
                  Des milliers d'appartements et villas vérifiés physiquement. Une expérience humaine, simple et 100% sécurisée.
                </p>
              </div>

              {/* Barre de recherche */}
              <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700 delay-200 relative z-20">
                <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-[#EFEBE9]">
                  
                  <div className="flex-1 px-6 py-3 w-full group">
                    <label className="text-[10px] font-bold uppercase text-[#A69B95] tracking-wider mb-1 block group-hover:text-[#F16522] transition-colors">Type de bien</label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="w-full border-0 shadow-none p-0 h-6 text-base font-bold text-[#2C1810] focus:ring-0"><SelectValue placeholder="Appartement" /></SelectTrigger>
                      <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 px-6 py-3 w-full group">
                    <label className="text-[10px] font-bold uppercase text-[#A69B95] tracking-wider mb-1 block group-hover:text-[#F16522] transition-colors">Localisation</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="w-full border-0 shadow-none p-0 h-6 text-base font-bold text-[#2C1810] focus:ring-0"><SelectValue placeholder="Cocody" /></SelectTrigger>
                      <SelectContent>{LOCATIONS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 px-6 py-3 w-full group">
                    <label className="text-[10px] font-bold uppercase text-[#A69B95] tracking-wider mb-1 block group-hover:text-[#F16522] transition-colors">Budget Max</label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger className="w-full border-0 shadow-none p-0 h-6 text-base font-bold text-[#2C1810] focus:ring-0"><SelectValue placeholder="500.000 FCFA" /></SelectTrigger>
                      <SelectContent>{BUDGETS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="p-1.5 w-full md:w-auto">
                    <Button onClick={handleSearch} className="w-full md:w-auto rounded-[2rem] bg-[#F16522] hover:bg-[#d95a1d] text-white px-8 py-7 text-lg font-bold shadow-lg hover:shadow-[#F16522]/40 transition-all hover:scale-105">
                      <Search className="w-5 h-5 mr-2" /> Rechercher
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tags rapides & badges */}
              <div className="space-y-6">
                 <div className="flex flex-wrap gap-2 animate-in fade-in duration-700 delay-300">
                  <span className="text-xs font-medium text-[#E8D4C5]/60 py-1">Populaire :</span>
                  {QUICK_SEARCH_TAGS.map((term) => (
                    <button key={term} onClick={() => handleQuickSearch(term)} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-[#E8D4C5] hover:bg-white/20 transition-all border border-white/5">
                      {term}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 animate-in fade-in duration-700 delay-500">
                  {HERO_TRUST_BADGES.map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.bg}`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className={`text-sm font-medium ${item.color === 'text-[#F16522]' ? 'text-white' : 'text-[#E8D4C5]'}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Hero Desktop - Carousel */}
            <div className="lg:col-span-5 relative h-[650px] hidden lg:block animate-in fade-in duration-1000 delay-300">
              <div className="absolute top-[10%] right-[5%] w-[450px] h-[450px] bg-[#3D261C] rounded-full -z-10 blur-sm" />
              
              <div className="relative w-full h-full group">
                {/* Carousel d'images */}
                {HERO_IMAGES.map((image, index) => (
                  <img 
                    key={image.src}
                    src={image.src} 
                    alt={image.alt}
                    className={`absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-2xl ring-1 ring-[#F16522]/20 transition-all duration-700 ease-in-out ${
                      index === heroImageIndex 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-[1.02]'
                    }`}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
                  />
                ))}

                {/* Indicateurs carousel */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                  {HERO_IMAGES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setHeroImageIndex(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === heroImageIndex 
                          ? 'w-8 h-2 bg-[#F16522]' 
                          : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Badge flottant */}
                <div className="absolute bottom-[20%] -left-[10%] bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                   <div className="relative">
                     <img src="/images/hero-abidjan-1.jpg" alt="User" className="w-12 h-12 rounded-full border-2 border-[#F16522] object-cover" />
                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#2E4B3E] rounded-full flex items-center justify-center text-[10px] text-white">✓</div>
                   </div>
                   <div>
                     <div className="flex text-[#F16522] mb-1 gap-0.5">
                       {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                     </div>
                     <p className="text-xs text-white font-medium">"J'ai trouvé en 2 jours !"</p>
                     <p className="text-[10px] text-white/60">Amina K., Riviera</p>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== COMMENT ÇA MARCHE ==================== */}
      <section ref={howItWorksRef} className="relative py-20 md:py-28 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[url('/images/pattern-dot.svg')] opacity-[0.03]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4 bg-[#F16522]/10 text-[#F16522] rounded-full">Processus Simplifié</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#2C1810] mb-6">La location réinventée, <br/>sans stress.</h2>
            <p className="max-w-2xl mx-auto text-lg text-[#6B5A4E]">Nous avons digitalisé toutes les étapes pénibles pour vous offrir une expérience fluide.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <div 
                  key={step.number} 
                  className={`relative group cursor-pointer transition-all duration-700 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
                  style={{ transitionDelay: `${index * 150}ms` }} 
                  onClick={() => setActiveStep(index)}
                >
                  {index < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 z-0 bg-[#EFEBE9] transform -translate-x-1/2">
                       <div className={`h-full bg-[#F16522] transition-all duration-1000 ${isActive ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                  
                  <div className={`relative h-full text-center transition-all duration-500 bg-white rounded-[24px] p-10 hover:-translate-y-2 ${isActive ? 'shadow-[0_20px_60px_-15px_rgba(241,101,34,0.15)] border-transparent ring-1 ring-[#F16522]/20' : 'shadow-sm border border-[#EFEBE9]'}`}>
                    <div className="text-xs font-black mb-6 text-[#F16522] tracking-widest opacity-80">ÉTAPE {step.number}</div>
                    
                    <div className={`relative w-20 h-20 mx-auto mb-8 flex items-center justify-center rounded-[20px] transition-colors duration-500 ${isActive ? 'bg-[#F16522] text-white' : 'bg-[#F16522]/5 text-[#F16522]'}`}>
                      <step.iconStart className="w-8 h-8" />
                    </div>
                    
                    <h3 className="font-bold mb-3 text-xl text-[#2C1810]">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-[#6B5A4E]">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== PROPRIÉTÉS ==================== */}
      <section ref={propertiesRef} className="py-20 bg-[#FAF7F4]">
        <div className="container mx-auto px-4">
          <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 transition-all duration-700 ${propertiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-3">Pépites du moment 🔥</h2>
              <p className="text-lg text-[#6B5A4E]">Les dernières annonces vérifiées, prêtes à habiter.</p>
            </div>
            <Link to="/recherche" className="group inline-flex items-center gap-2 text-[#F16522] font-bold hover:text-[#d95a1d] transition-colors">
              <span>Voir tout le catalogue</span>
              <div className="w-8 h-8 rounded-full bg-[#F16522]/10 flex items-center justify-center group-hover:bg-[#F16522] group-hover:text-white transition-all">
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>

          {loadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-[20px] h-[380px] animate-pulse border border-[#EFEBE9] bg-[#E8D4C5]/20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} isVisible={propertiesVisible} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== TÉMOIGNAGES ==================== */}
      <section ref={testimonialsRef} className="py-20 bg-white border-t border-[#EFEBE9]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4">La confiance se partage</h2>
            <div className="flex justify-center gap-1 mb-2">
               {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-[#FBAF00] fill-current" />)}
            </div>
            <p className="text-[#6B5A4E]">Note moyenne de <strong>4.8/5</strong> sur plus de 500 avis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={testimonial.id} className={`bg-[#FFFBF5] rounded-[24px] p-8 hover:bg-white hover:shadow-[0_20px_40px_rgba(44,24,16,0.06)] transition-all duration-500 border border-transparent hover:border-[#E8D4C5] ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${idx * 150}ms` }}>
                <Quote className="w-8 h-8 text-[#F16522]/20 mb-6" />
                <p className="text-[#2C1810] text-lg font-medium leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                  <div>
                    <p className="font-bold text-[#2C1810] text-sm">{testimonial.name}</p>
                    <p className="text-xs text-[#6B5A4E]">{testimonial.location}</p>
                  </div>
                  <div className="ml-auto">
                    <ScoreBadge score={testimonial.trustScore} variant="compact" size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mt-20 py-10 border-y border-[#EFEBE9]">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-[#EFEBE9]">
                {STATS.map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl lg:text-4xl font-black text-[#F16522] mb-1">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wider font-bold text-[#6B5A4E]">{stat.label}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section ref={ctaRef} className="py-20 md:py-28 bg-[#F5E6D3] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-30 bg-[url('/images/pattern-topo.svg')] bg-cover" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(44,24,16,0.15)] max-w-4xl mx-auto">
            
            {/* Texte & Form - Centré */}
            <div className={`transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="text-center mb-8">
                <span className="text-[#F16522] font-bold tracking-widest text-xs uppercase mb-2 block">Accompagnement VIP</span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4">Vous cherchez ? On trouve pour vous.</h2>
                <p className="text-[#6B5A4E] text-lg max-w-xl mx-auto">Confiez votre recherche à nos chasseurs immobiliers. Service 100% gratuit pour les locataires.</p>
              </div>
              
              <div className="flex justify-center gap-4 mb-8">
                 <button onClick={() => setActiveCtaTab('chat')} className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${activeCtaTab === 'chat' ? 'bg-[#2C1810] text-white shadow-lg' : 'bg-[#FAF7F4] text-[#A69B95] hover:bg-[#EFEBE9]'}`}>
                   Chat Direct
                 </button>
                 <button onClick={() => setActiveCtaTab('form')} className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${activeCtaTab === 'form' ? 'bg-[#F16522] text-white shadow-lg' : 'bg-[#FAF7F4] text-[#A69B95] hover:bg-[#EFEBE9]'}`}>
                   Formulaire
                 </button>
              </div>

              <div className="bg-[#FAF7F4] rounded-[20px] p-1 border border-[#EFEBE9] h-[450px] max-w-2xl mx-auto">
                 {activeCtaTab === 'chat' ? (
                   <SUTAChatWidget className="h-full w-full rounded-[16px]" />
                 ) : (
                   <div className="h-full flex flex-col justify-center p-8">
                     {isFormSubmitted ? (
                       <div className="text-center animate-in zoom-in">
                         <div className="w-16 h-16 bg-[#F16522]/10 text-[#F16522] rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8" /></div>
                         <h3 className="font-bold text-xl text-[#2C1810]">Reçu 5/5 !</h3>
                         <p className="text-[#6B5A4E]">Un expert vous appelle très vite.</p>
                       </div>
                     ) : (
                       <form onSubmit={handleFormSubmit} className="space-y-4">
                         <div className="relative">
                           <User className="absolute left-4 top-3.5 w-5 h-5 text-[#A69B95]" />
                           <input type="text" placeholder="Votre nom" required className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#EFEBE9] focus:border-[#F16522] focus:ring-[#F16522] bg-white text-[#2C1810]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                         </div>
                         <div className="relative">
                           <Phone className="absolute left-4 top-3.5 w-5 h-5 text-[#A69B95]" />
                           <input type="tel" placeholder="Votre numéro" required className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#EFEBE9] focus:border-[#F16522] focus:ring-[#F16522] bg-white text-[#2C1810]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                         </div>
                         <div className="relative">
                           <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-[#A69B95]" />
                           <textarea placeholder="Votre projet en quelques mots..." rows={3} className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#EFEBE9] focus:border-[#F16522] focus:ring-[#F16522] bg-white resize-none text-[#2C1810]" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} />
                         </div>
                         <Button type="submit" disabled={isFormSubmitting} className="w-full bg-[#F16522] hover:bg-[#d95a1d] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#F16522]/20 flex items-center justify-center gap-2">
                           {isFormSubmitting ? 'Envoi en cours...' : <><Send className="w-5 h-5" /> Envoyer ma demande</>}
                         </Button>
                       </form>
                     )}
                   </div>
                 )}
              </div>

              {/* Badge en dessous */}
              <div className="flex justify-center mt-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#FAF7F4] rounded-full border border-[#EFEBE9]">
                  <div className="w-10 h-10 rounded-full bg-[#F16522]/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#F16522]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2C1810] text-sm">Agents Certifiés</p>
                    <p className="text-xs text-[#6B5A4E]">Service 100% gratuit</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
