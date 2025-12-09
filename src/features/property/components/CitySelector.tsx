import React, { useState } from 'react';
import { MapPin, Navigation, Crosshair, Check, ChevronDown } from 'lucide-react';
import { toast } from '@/shared/hooks/useSafeToast';

// Données statiques pour les villes et communes
const CITIES = [
  'Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Assinie', 
  'Grand-Bassam', 'Korhogo', 'Man', 'Daloa', 'Gagnoa'
];

const COMMUNES_ABIDJAN = [
  'Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville',
  'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët',
  'Songon', 'Treichville', 'Yopougon'
];

interface CitySelectorProps {
  selectedCity: string;
  selectedDistrict: string;
  subNeighborhood?: string;
  latitude?: number | null;
  longitude?: number | null;
  onCitySelect: (city: string) => void;
  onDistrictSelect: (district: string) => void;
  onSubNeighborhoodChange?: (value: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  disabled?: boolean;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  selectedDistrict,
  subNeighborhood = '',
  latitude,
  longitude,
  onCitySelect,
  onDistrictSelect,
  onSubNeighborhoodChange,
  onCoordinatesChange,
  disabled = false
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const isAbidjan = selectedCity === 'Abidjan';
  const hasGPS = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;

  // Géolocalisation via le navigateur
  const handleGeolocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    toast.info("Recherche de votre position...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onCoordinatesChange?.(lat, lng);
        toast.success("Position GPS récupérée avec succès !");
        setIsLocating(false);
      },
      (error) => {
        console.error("Erreur géolocalisation:", error);
        let message = "Impossible de récupérer votre position.";
        if (error.code === 1) message = "Vous avez refusé l'accès à la géolocalisation.";
        if (error.code === 2) message = "Position non disponible.";
        if (error.code === 3) message = "Délai d'attente dépassé.";
        toast.error(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-[#EFEBE9] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F16522]/10 rounded-xl">
            <MapPin className="w-6 h-6 text-[#F16522]" />
          </div>
          <div>
            <h2 className="font-bold text-[#2C1810] text-lg">Localisation</h2>
            <p className="text-sm text-[#6B5A4E]">Où se trouve le bien ?</p>
          </div>
        </div>
        
        {hasGPS && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-semibold animate-pulse">
            <Navigation className="w-3.5 h-3.5" />
            GPS OK
          </div>
        )}
      </div>

      {/* Ville & Commune/Quartier */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Sélection de ville */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2.5 tracking-wide">
            Ville *
          </label>
          <div className="relative group">
            <select
              value={selectedCity}
              onChange={(e) => {
                onCitySelect(e.target.value);
                onDistrictSelect(''); // Reset commune quand on change de ville
              }}
              disabled={disabled}
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                font-medium text-[#2C1810] appearance-none bg-white cursor-pointer
                ${selectedCity 
                  ? 'border-green-400 bg-green-50/30' 
                  : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                }
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <option value="">Choisir une ville...</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A69B95] group-hover:text-[#F16522] transition-colors">
              <ChevronDown className="w-5 h-5" />
            </div>
            {selectedCity && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Commune (Abidjan) ou Quartier (autres villes) */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2.5 tracking-wide">
            {isAbidjan ? 'Commune *' : 'Quartier *'}
          </label>
          {isAbidjan ? (
            <div className="relative group">
              <select
                value={selectedDistrict}
                onChange={(e) => onDistrictSelect(e.target.value)}
                disabled={disabled || !selectedCity}
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                  font-medium text-[#2C1810] appearance-none bg-white cursor-pointer
                  ${selectedDistrict 
                    ? 'border-green-400 bg-green-50/30' 
                    : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                  }
                  focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <option value="">Choisir la commune...</option>
                {COMMUNES_ABIDJAN.map(commune => (
                  <option key={commune} value={commune}>{commune}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A69B95] group-hover:text-[#F16522] transition-colors">
                <ChevronDown className="w-5 h-5" />
              </div>
              {selectedDistrict && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          ) : (
            <input
              type="text"
              value={selectedDistrict}
              onChange={(e) => onDistrictSelect(e.target.value)}
              disabled={disabled || !selectedCity}
              placeholder="Ex: Centre-ville, Résidentiel..."
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
                ${selectedDistrict 
                  ? 'border-green-400 bg-green-50/30' 
                  : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                }
                focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
          )}
        </div>
      </div>

      {/* Précision / Repère */}
      <div>
        <label className="block text-xs font-bold uppercase text-[#A69B95] mb-2.5 tracking-wide">
          Précision / Repère *
        </label>
        <input
          type="text"
          value={subNeighborhood}
          onChange={(e) => onSubNeighborhoodChange?.(e.target.value)}
          disabled={disabled}
          placeholder="Ex: Angré 8ème Tranche, près du Carrefour Sorbonne..."
          className={`
            w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
            font-medium text-[#2C1810] placeholder:text-[#C5BAB3]
            ${subNeighborhood 
              ? 'border-green-400 bg-green-50/30' 
              : 'border-[#EFEBE9] hover:border-[#F16522]/50'
            }
            focus:border-[#F16522] focus:ring-4 focus:ring-[#F16522]/10 outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        <p className="text-xs text-[#A69B95] mt-2">
          Indiquez un repère connu pour faciliter la localisation (carrefour, école, commerce...)
        </p>
      </div>

      {/* Section GPS */}
      <div className="bg-gradient-to-br from-[#FAF7F4] to-[#F5F0EC] rounded-2xl p-5 border border-[#EFEBE9]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-[#F16522]" />
            <span className="font-semibold text-[#2C1810]">Coordonnées GPS</span>
            <span className="text-xs text-[#A69B95]">(recommandé)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={disabled || isLocating}
            className={`
              flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl
              font-bold text-sm transition-all duration-300 transform
              ${isLocating
                ? 'bg-[#F16522]/20 text-[#F16522] cursor-wait'
                : 'bg-[#F16522] text-white hover:bg-[#D55A1B] hover:scale-[1.02] shadow-lg shadow-[#F16522]/30'
              }
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            `}
          >
            {isLocating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#F16522] border-t-transparent rounded-full animate-spin" />
                Localisation...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Me géolocaliser
              </>
            )}
          </button>

          {hasGPS && (
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-green-700">Position enregistrée</span>
              </div>
              <div className="text-xs text-[#6B5A4E] font-mono">
                {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-[#A69B95] mt-3 text-center">
          La géolocalisation aide les visiteurs à trouver votre bien plus facilement
        </p>
      </div>

      {/* Conseil visuel */}
      <div className="bg-[#F16522]/5 border border-[#F16522]/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-[#F16522]/10 rounded-lg shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-[#F16522]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2C1810] mb-1">
              Conseil de localisation
            </h4>
            <p className="text-xs text-[#6B5A4E] leading-relaxed">
              Une adresse précise augmente vos chances de 3x d'être contacté. 
              Ajoutez des repères connus pour faciliter les visites.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitySelector;
