import { Search, MapPin, Home, Banknote } from 'lucide-react';
import { Button } from '@/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";

export const HeroPremium = () => {
  return (
    <section className="relative w-full min-h-[650px] bg-[#F5E6D3] overflow-hidden flex items-center">
      
      {/* Décoration d'arrière-plan */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/20 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 right-1/2 w-[500px] h-[500px] bg-[#e6d0b3] rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-8 items-center relative z-10 h-full">
        
        {/* Colonne gauche : Texte & Recherche */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-10 lg:pt-0">
            
            <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                <span className="text-[#A67C52] font-semibold tracking-wide uppercase text-sm">
                    Immobilier Premium Abidjan
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-[#3A2D25] leading-tight">
                    Trouvez votre <br/>
                    <span className="text-[#F16522]">nouveau chez-vous</span>
                </h1>
                <p className="text-lg text-[#6B5A4E] max-w-lg">
                    Appartements, villas et terrains vérifiés. Une expérience simple, humaine et sécurisée en Côte d'Ivoire.
                </p>
            </div>

            {/* Barre de recherche capsule */}
            <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-[#523628]/10 max-w-2xl animate-in fade-in zoom-in duration-700 delay-200">
                <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    
                    {/* Type */}
                    <div className="flex-1 px-4 py-2 w-full">
                         <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-400 uppercase">
                            <Home className="w-3 h-3" /> Type
                        </div>
                        <Select>
                            <SelectTrigger className="border-0 shadow-none p-0 h-auto font-semibold text-gray-800 focus:ring-0">
                                <SelectValue placeholder="Appartement" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="appartement">Appartement</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                                <SelectItem value="terrain">Terrain</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Localisation */}
                    <div className="flex-1 px-4 py-2 w-full">
                        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-400 uppercase">
                            <MapPin className="w-3 h-3" /> Lieu
                        </div>
                        <Select>
                             <SelectTrigger className="border-0 shadow-none p-0 h-auto font-semibold text-gray-800 focus:ring-0">
                                <SelectValue placeholder="Cocody" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cocody">Cocody</SelectItem>
                                <SelectItem value="marcory">Marcory</SelectItem>
                                <SelectItem value="plateau">Le Plateau</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Budget */}
                    <div className="flex-1 px-4 py-2 w-full">
                        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-400 uppercase">
                            <Banknote className="w-3 h-3" /> Budget
                        </div>
                         <Select>
                             <SelectTrigger className="border-0 shadow-none p-0 h-auto font-semibold text-gray-800 focus:ring-0">
                                <SelectValue placeholder="Max 500k" />
                            </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="250000">Max 250.000 FCFA</SelectItem>
                                <SelectItem value="500000">Max 500.000 FCFA</SelectItem>
                                <SelectItem value="1000000">Max 1.000.000 FCFA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bouton */}
                    <div className="p-1 w-full md:w-auto">
                        <Button className="w-full md:w-auto rounded-full bg-[#F16522] hover:bg-[#D95318] text-white px-8 py-6 text-lg shadow-md transition-transform hover:scale-105">
                            <Search className="w-5 h-5 mr-2" />
                            Rechercher
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tags rapides */}
            <div className="flex flex-wrap gap-3 pt-2">
                <span className="text-sm text-[#8C7A6D] font-medium">Recherches fréquentes :</span>
                <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-[#523628] cursor-pointer hover:bg-white transition">Riviera 3</span>
                <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-[#523628] cursor-pointer hover:bg-white transition">Zone 4</span>
                <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-[#523628] cursor-pointer hover:bg-white transition">Studio</span>
            </div>
        </div>

        {/* Colonne droite : Image */}
        <div className="hidden lg:block lg:col-span-5 relative h-[650px]">
            <div className="absolute right-[-50px] top-10 w-[120%] h-[90%]">
                <img 
                    src="/images/hero/hero-famille-cocody.webp" 
                    alt="Famille ivoirienne heureuse devant leur nouvelle maison"
                    className="w-full h-full object-cover rounded-l-[3rem] shadow-2xl shadow-[#523628]/20"
                    style={{ objectPosition: 'center 40%' }}
                />
                
                {/* Badge flottant */}
                <div className="absolute bottom-20 -left-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <Home className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Logements vérifiés</p>
                        <p className="text-lg font-bold text-gray-800">100% Sécurisé</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default HeroPremium;
