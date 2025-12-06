import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Banknote, FileCheck } from 'lucide-react';
import { Button } from '@/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";

// --- CONSTANTES (Configuration) ---
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

export const HeroPremium = () => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (propertyType) params.set('type', propertyType);
    if (location) params.set('city', location);
    if (budget) params.set('maxPrice', budget);
    navigate(`/recherche?${params.toString()}`);
  };

  const handleQuickSearch = (term: string) => {
    navigate(`/recherche?q=${encodeURIComponent(term)}`);
  };

  return (
    <section className="relative w-full min-h-[650px] lg:min-h-[700px] overflow-hidden flex items-center bg-[#F5E6D3]">
      
      {/* --- DÉCORATION D'ARRIÈRE-PLAN --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl mix-blend-overlay bg-white/20 animate-pulse" />
        <div className="absolute bottom-0 right-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-50 bg-[#E6D0B3]" />
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-0 relative z-10">
        
        {/* --- MOBILE: IMAGE EN HAUT --- */}
        <div className="lg:hidden w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(82,54,40,0.2)]">
            <img 
              src="/images/hero/hero-famille-cocody.webp" 
              alt="Famille ivoirienne heureuse devant leur nouvelle maison"
              className="w-full h-full object-cover object-[center_30%]"
              loading="eager"
              fetchPriority="high"
            />
            {/* Badge mobile */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2E4B3E]/10">
                <Home className="w-4 h-4 text-[#2E4B3E]" />
              </div>
              <span className="text-sm font-semibold text-[#523628]">100% Vérifié</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center h-full">
          
          {/* --- COLONNE GAUCHE : TEXTE & RECHERCHE --- */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8">
              
              <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                  <span className="text-sm font-semibold tracking-wide uppercase text-[#A67C52]">
                      Immobilier Premium Abidjan
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-[#3A2D25]">
                      Trouvez votre <br/>
                      <span className="text-[#F16522]">nouveau chez-vous</span>
                  </h1>
                  <p className="text-base lg:text-lg max-w-lg font-medium text-[#4A3628]">
                      Appartements, villas et terrains vérifiés. Une expérience simple, humaine et sécurisée en Côte d'Ivoire.
                  </p>
              </div>

              {/* --- BARRE DE RECHERCHE --- */}
              <div className="bg-white p-3 lg:p-4 rounded-[2rem] lg:rounded-[2.5rem] max-w-2xl shadow-[0_20px_50px_rgba(82,54,40,0.12)] animate-in fade-in zoom-in duration-700 delay-200 ring-1 ring-[#523628]/5">
                  <div className="flex flex-col md:flex-row items-stretch gap-2 lg:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#523628]/10">
                      
                      {/* Select: Type */}
                      <div className="flex-1 px-4 lg:px-6 py-2">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#A67C52]">
                              <Home className="w-3 h-3" /> Type
                          </div>
                          <Select value={propertyType} onValueChange={setPropertyType}>
                              <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto font-semibold text-[#3A2D25] focus:ring-0">
                                  <SelectValue placeholder="Appartement" />
                              </SelectTrigger>
                              <SelectContent>
                                  {PROPERTY_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>

                      {/* Select: Lieu */}
                      <div className="flex-1 px-4 lg:px-6 py-2">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#A67C52]">
                              <MapPin className="w-3 h-3" /> Lieu
                          </div>
                          <Select value={location} onValueChange={setLocation}>
                              <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto font-semibold text-[#3A2D25] focus:ring-0">
                                  <SelectValue placeholder="Cocody" />
                              </SelectTrigger>
                              <SelectContent>
                                  {LOCATIONS.map((loc) => (
                                    <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>

                      {/* Select: Budget */}
                      <div className="flex-1 px-4 lg:px-6 py-2">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#A67C52]">
                              <Banknote className="w-3 h-3" /> Budget
                          </div>
                          <Select value={budget} onValueChange={setBudget}>
                              <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto font-semibold text-[#3A2D25] focus:ring-0">
                                  <SelectValue placeholder="Max 500k" />
                              </SelectTrigger>
                              <SelectContent>
                                  {BUDGETS.map((b) => (
                                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>

                      {/* Bouton Action */}
                      <div className="p-1 w-full md:w-auto">
                          <Button 
                            onClick={handleSearch}
                            className="w-full md:w-auto rounded-full bg-[#F16522] hover:bg-[#d95a1d] text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                          >
                              <Search className="w-5 h-5 mr-2" />
                              <span className="hidden md:inline">Rechercher</span>
                              <span className="md:hidden">Voir les résultats</span>
                          </Button>
                      </div>
                  </div>
              </div>

              {/* Tags rapides */}
              <div className="flex flex-wrap gap-2 lg:gap-3 pt-2 animate-in fade-in duration-700 delay-300">
                  <span className="text-sm font-medium text-[#8C7A6D] flex items-center">Recherches fréquentes :</span>
                  {QUICK_SEARCH_TAGS.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105 hover:bg-white bg-white/60 text-[#523628] shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
              </div>

              {/* Badges de confiance */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-4 animate-in fade-in duration-700 delay-500">
                {TRUST_BADGES.map((item) => (
                  <div 
                    key={item.text}
                    className="flex items-center gap-2 group cursor-default"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${item.bg}`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-[#523628]">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
          </div>

          {/* --- COLONNE DROITE : IMAGE DESKTOP --- */}
          <div className="hidden lg:block lg:col-span-5 relative h-[650px] animate-in slide-in-from-right-10 duration-1000 ease-out">
              {/* Effet d'overlay flou pour l'intégration */}
              <div className="absolute right-[-60px] top-8 w-[125%] h-[92%] rounded-l-[3rem] -z-10 blur-xl opacity-60 bg-gradient-radial from-[#f5d9c0] via-[#f3e7db] to-[#f0e4d9]" />
              
              <div className="absolute right-[-50px] top-10 w-[120%] h-[90%] group">
                  <img 
                      src="/images/hero/hero-famille-cocody.webp" 
                      alt="Famille ivoirienne heureuse devant leur nouvelle maison"
                      className="w-full h-full object-cover object-[center_40%] rounded-l-[3rem] shadow-[0_40px_80px_rgba(82,54,40,0.2)] transition-transform duration-700 group-hover:scale-[1.01]"
                      loading="eager"
                      fetchPriority="high"
                  />
                  
                  {/* Badge flottant Desktop */}
                  <div className="absolute bottom-20 -left-10 bg-white p-4 rounded-2xl shadow-[0_16px_48px_rgba(82,54,40,0.15)] flex items-center gap-4 animate-bounce-slow">
                      <div className="p-3 rounded-full bg-[#2E4B3E]/10">
                          <Home className="w-6 h-6 text-[#2E4B3E]" />
                      </div>
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
  );
};

export default HeroPremium;
