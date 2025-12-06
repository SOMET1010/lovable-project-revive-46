import React, { useState, useEffect } from 'react';
import { Search, Home, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ✅ MISE A JOUR : Utilisation de la nouvelle collection de 8 images premium et humaines
const HERO_SLIDES = [
  {
    id: 1,
    src: '/images/hero/hero_users_3_young_professional.jpg', // Femme sur le balcon (Lifestyle)
    alt: 'Jeune femme active profitant de la vue depuis son balcon à Abidjan',
    position: 'object-top',
    title: 'Vivez là où vous vous sentez bien',
    subtitle: 'Des quartiers prisés : Cocody, Riviera, Zone 4.'
  },
  {
    id: 2,
    src: '/images/hero/hero_users_5_agent_showing.jpg', // Agent immobilier (Confiance)
    alt: 'Agent immobilier Mon Toit faisant visiter un bien à un couple',
    position: 'object-center',
    title: 'Des experts à votre service',
    subtitle: 'Faites-vous accompagner par nos agents certifiés.'
  },
  {
    id: 3,
    src: '/images/hero/hero_users_2_family_moving.jpg', // Famille avec clés (Joie)
    alt: 'Famille ivoirienne heureuse recevant les clés de leur nouvelle maison',
    position: 'object-center',
    title: 'Trouvez le logement de vos rêves',
    subtitle: 'Villas, appartements et terrains vérifiés.'
  },
  {
    id: 4,
    src: '/images/hero/hero_villa_riviera.png', // Villa luxe (Aspirationnel)
    alt: 'Villa de luxe moderne avec piscine au coucher du soleil',
    position: 'object-center',
    title: "L'immobilier d'exception",
    subtitle: 'Découvrez nos propriétés de prestige.'
  },
  {
    id: 5,
    src: '/images/hero/hero_etudiants_colocation.png', // Colocation (Communauté)
    alt: "Groupe d'amis célébrant dans leur nouvel appartement",
    position: 'object-center',
    title: "Partagez plus qu'un logement",
    subtitle: 'Trouvez la colocation idéale.'
  },
  {
    id: 6,
    src: '/images/hero/hero_vue_plateau.png', // Vue ville nuit (Urbain)
    alt: 'Vue panoramique nocturne sur le Plateau et la lagune',
    position: 'object-center',
    title: "Au cœur de l'action",
    subtitle: "Vivez au rythme d'Abidjan."
  },
  {
    id: 7,
    src: '/images/hero/hero_couple_app.png', // Couple tablette (Facilité)
    alt: "Jeune couple utilisant l'application Mon Toit sur un canapé",
    position: 'object-center',
    title: 'Votre futur chez-vous, à portée de main',
    subtitle: 'Une recherche simple et intuitive.'
  },
  {
    id: 8,
    src: '/images/hero/hero_famille_cocody.webp', // Famille maison (Bonheur)
    alt: 'Famille marchant vers leur nouvelle maison avec jardin',
    position: 'object-center',
    title: 'Construisez votre avenir',
    subtitle: 'Des maisons familiales pour voir grand.'
  },
];

export const HeroPremium = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [propertyType, setPropertyType] = useState('');

  // Auto-play intelligent (6 secondes)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (propertyType) params.set('type', propertyType);
    navigate(`/recherche?${params.toString()}`);
  };

  return (
    <div
      className="relative w-full h-[650px] md:h-[750px] overflow-hidden flex items-center justify-center bg-gray-900 font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* --- 1. SLIDESHOW AVEC TRANSITION DOUCE --- */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className={`w-full h-full object-cover ${slide.position}`}
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Overlay sombre pour garantir la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/40 md:bg-black/30 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          </div>
        ))}
      </div>

      {/* --- 2. CONTENU TEXTE & RECHERCHE --- */}
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center mt-10">

        {/* Texte dynamique selon le slide (Animation subtile) */}
        <div className="space-y-4 max-w-4xl mx-auto mb-8 transition-all duration-700 transform">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
              {HERO_SLIDES[currentSlide]?.title}
            </h1>
            <p className="text-lg md:text-2xl text-gray-100 font-light drop-shadow-md max-w-2xl mx-auto">
              {HERO_SLIDES[currentSlide]?.subtitle}
            </p>
        </div>

        {/* Barre de Recherche (Style Glassmorphism amélioré) */}
        <form 
          onSubmit={handleSearch}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-1000"
        >
          <div className="flex flex-col md:flex-row gap-2">
            {/* Input localisation */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/90 hover:bg-white transition-colors">
              <MapPin className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Où cherchez-vous ?"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 bg-transparent"
              />
            </div>

            <div className="hidden md:block w-px bg-white/20"></div>

            {/* Select type de bien */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/90 hover:bg-white transition-colors">
              <Home className="h-5 w-5 text-gray-400" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="flex-1 outline-none text-gray-900 bg-transparent cursor-pointer"
              >
                <option value="">Type de bien</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            {/* Bouton Rechercher */}
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              <span>Rechercher</span>
            </button>
          </div>
        </form>

      </div>

      {/* --- 3. INDICATEURS (Dots) CORRIGÉS --- */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Aller à l'image ${index + 1}`}
            className={`transition-all duration-500 rounded-full shadow-lg border border-white/10 ${
              index === currentSlide
                ? 'w-10 h-2 bg-primary' // Ligne active (couleur de marque)
                : 'w-2 h-2 bg-white/60 hover:bg-white' // Points inactifs petits
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroPremium;
