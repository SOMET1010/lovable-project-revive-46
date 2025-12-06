import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Banknote } from 'lucide-react';
import { Button } from '@/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";

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
    <section className="relative w-full min-h-[650px] lg:min-h-[650px] overflow-hidden flex items-center" style={{ backgroundColor: '#F5E6D3' }}>
      
      {/* Décoration d'arrière-plan */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl mix-blend-overlay" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
        <div className="absolute bottom-0 right-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-50" style={{ backgroundColor: '#E6D0B3' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-0 relative z-10">
        
        {/* Mobile: Image en haut */}
        <div className="lg:hidden w-full mb-8">
          <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden shadow-xl" style={{ boxShadow: '0 20px 40px rgba(82, 54, 40, 0.2)' }}>
            <img 
              src="/images/hero/hero-famille-cocody.webp" 
              alt="Famille ivoirienne heureuse devant leur nouvelle maison"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
            />
            {/* Badge mobile simplifié */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(46, 75, 62, 0.1)' }}>
                <Home className="w-4 h-4" style={{ color: '#2E4B3E' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#523628' }}>100% Vérifié</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Colonne gauche : Texte & Recherche */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8">
              
              <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                  <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#A67C52' }}>
                      Immobilier Premium Abidjan
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight" style={{ color: '#3A2D25' }}>
                      Trouvez votre <br/>
                      <span style={{ color: '#F16522' }}>nouveau chez-vous</span>
                  </h1>
                  <p className="text-base lg:text-lg max-w-lg" style={{ color: '#6B5A4E' }}>
                      Appartements, villas et terrains vérifiés. Une expérience simple, humaine et sécurisée en Côte d'Ivoire.
                  </p>
              </div>

              {/* Barre de recherche capsule */}
              <div className="bg-white p-2 rounded-[1.5rem] lg:rounded-[2rem] shadow-xl max-w-2xl animate-in fade-in zoom-in duration-700 delay-200" style={{ boxShadow: '0 20px 40px rgba(82, 54, 40, 0.1)' }}>
                  <div className="flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'rgba(82, 54, 40, 0.1)' }}>
                      
                      {/* Type */}
                      <div className="flex-1 px-4 py-3 md:py-2">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase" style={{ color: '#A67C52' }}>
                              <Home className="w-3 h-3" /> Type
                          </div>
                          <Select value={propertyType} onValueChange={setPropertyType}>
                              <SelectTrigger className="border-0 shadow-none p-0 h-auto font-semibold focus:ring-0" style={{ color: '#3A2D25' }}>
                                  <SelectValue placeholder="Appartement" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="appartement">Appartement</SelectItem>
                                  <SelectItem value="villa">Villa</SelectItem>
                                  <SelectItem value="terrain">Terrain</SelectItem>
                                  <SelectItem value="studio">Studio</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>

                      {/* Localisation */}
                      <div className="flex-1 px-4 py-3 md:py-2">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase" style={{ color: '#A67C52' }}>
                              <MapPin className="w-3 h-3" /> Lieu
                          </div>
                          <Select value={location} onValueChange={setLocation}>
                              <SelectTrigger className="border-0 shadow-none p-0 h-auto font-semibold focus:ring-0" style={{ color: '#3A2D25' }}>
                                  <SelectValue placeholder="Cocody" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="cocody">Cocody</SelectItem>
                                  <SelectItem value="marcory">Marcory</SelectItem>
                                  <SelectItem value="plateau">Le Plateau</SelectItem>
                                  <SelectItem value="yopougon">Yopougon</SelectItem>
                                  <SelectItem value="abidjan">Abidjan</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>

                      {/* Budget */}
                      <div className="flex-1 px-4 py-3 md:py-2">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase" style={{ color: '#A67C52' }}>
                              <Banknote className="w-3 h-3" /> Budget
                          </div>
                          <Select value={budget} onValueChange={setBudget}>
                              <SelectTrigger className="border-0 shadow-none p-0 h-auto font-semibold focus:ring-0" style={{ color: '#3A2D25' }}>
                                  <SelectValue placeholder="Max 500k" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="150000">Max 150.000 FCFA</SelectItem>
                                  <SelectItem value="250000">Max 250.000 FCFA</SelectItem>
                                  <SelectItem value="500000">Max 500.000 FCFA</SelectItem>
                                  <SelectItem value="1000000">Max 1.000.000 FCFA</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>

                      {/* Bouton */}
                      <div className="p-2 w-full md:w-auto">
                          <Button 
                            onClick={handleSearch}
                            className="w-full md:w-auto rounded-full text-white px-6 lg:px-8 py-5 lg:py-6 text-base lg:text-lg shadow-md transition-transform hover:scale-105"
                            style={{ backgroundColor: '#F16522' }}
                          >
                              <Search className="w-5 h-5 mr-2" />
                              Rechercher
                          </Button>
                      </div>
                  </div>
              </div>

              {/* Tags rapides */}
              <div className="flex flex-wrap gap-2 lg:gap-3 pt-2">
                  <span className="text-sm font-medium" style={{ color: '#8C7A6D' }}>Recherches fréquentes :</span>
                  {['Riviera 3', 'Zone 4', 'Studio', 'Marcory'].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className="px-3 py-1 rounded-full text-xs cursor-pointer transition-all hover:scale-105"
                      style={{ backgroundColor: 'rgba(255,255,255,0.6)', color: '#523628' }}
                    >
                      {term}
                    </button>
                  ))}
              </div>
          </div>

          {/* Colonne droite : Image Desktop */}
          <div className="hidden lg:block lg:col-span-5 relative h-[650px]">
              <div className="absolute right-[-50px] top-10 w-[120%] h-[90%]">
                  <img 
                      src="/images/hero/hero-famille-cocody.webp" 
                      alt="Famille ivoirienne heureuse devant leur nouvelle maison"
                      className="w-full h-full object-cover rounded-l-[3rem] shadow-2xl"
                      style={{ objectPosition: 'center 40%', boxShadow: '0 40px 80px rgba(82, 54, 40, 0.2)' }}
                  />
                  
                  {/* Badge flottant */}
                  <div className="absolute bottom-20 -left-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow" style={{ boxShadow: '0 16px 48px rgba(82, 54, 40, 0.15)' }}>
                      <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(46, 75, 62, 0.1)' }}>
                          <Home className="w-6 h-6" style={{ color: '#2E4B3E' }} />
                      </div>
                      <div>
                          <p className="text-sm" style={{ color: '#737373' }}>Logements vérifiés</p>
                          <p className="text-lg font-bold" style={{ color: '#3A2D25' }}>100% Sécurisé</p>
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
