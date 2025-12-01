/**
 * Page d'Aide - Centre d'aide avec sections d'aide et tutoriels en carrousel
 */

import React from 'react';
import { useHelp } from '../hooks/useHelp';
import { 
  PlayCircleIcon, 
  SearchIcon, 
  UserCogIcon, 
  HomeIcon, 
  MessageCircleIcon,
  CreditCardIcon,
  ShieldIcon,
  WrenchIcon,
  BookOpenIcon,
  TrendingUpIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';

// Icônes pour les sections d'aide
const getSectionIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'play-circle': PlayCircleIcon,
    'search': SearchIcon,
    'user-cog': UserCogIcon,
    'home': HomeIcon,
    'message-circle': MessageCircleIcon,
    'credit-card': CreditCardIcon,
    'shield': ShieldIcon,
    'wrench': WrenchIcon
  };
  
  return iconMap[iconName] || BookOpenIcon;
};

// Composant de carte de section d'aide
interface HelpSectionCardProps {
  title: string;
  description: string;
  icon: string;
  category: string;
  onClick: () => void;
}

const HelpSectionCard: React.FC<HelpSectionCardProps> = ({
  title,
  description,
  icon,
  category,
  onClick
}) => {
  const IconComponent = getSectionIcon(icon);
  
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
              <IconComponent className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-200 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {category}
          </span>
          <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
        </div>
      </div>
    </div>
  );
};

// Composant de tutoriel pour le carrousel
interface TutorialSlideProps {
  title: string;
  description: string;
  duration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: string;
  steps: string[];
  onClick: () => void;
}

const TutorialSlide: React.FC<TutorialSlideProps> = ({
  title,
  description,
  duration,
  difficulty,
  category,
  steps,
  onClick
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'Avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200"
      onClick={onClick}
    >
      {/* Image du tutoriel */}
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-all duration-300">
            <PlayCircleIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        {/* Badge de difficulté */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>
        
        {/* Durée */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
            <ClockIcon className="w-3 h-3 mr-1" />
            {duration}
          </span>
        </div>
      </div>
      
      {/* Contenu du tutoriel */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-200 leading-tight">
            {title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {category}
          </span>
          <span className="text-xs text-gray-500">
            {steps.length} étapes
          </span>
        </div>
      </div>
    </div>
  );
};

// Composant Carrousel simple
interface SimpleCarouselProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  className?: string;
}

const SimpleCarousel: React.FC<SimpleCarouselProps> = ({ items, renderItem, className = '' }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.max(1, items.length - 2));
  };
  
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, items.length - 3) : prevIndex - 1
    );
  };

  if (items.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Conteneur des éléments */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-6"
          style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="flex-none w-80">
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Boutons de navigation */}
      {items.length > 3 && (
        <>
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            onClick={nextSlide}
            disabled={currentIndex >= Math.max(0, items.length - 3)}
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </>
      )}
      
      {/* Indicateurs */}
      {items.length > 3 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: Math.max(1, items.length - 2) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Composant de filtre de catégorie
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const allCategories = ['tous', ...categories];

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {allCategories.map((category) => (
        <button
          key={category}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          onClick={() => onCategoryChange(category)}
        >
          {category === 'tous' ? 'Toutes les catégories' : category}
        </button>
      ))}
    </div>
  );
};

const HelpPage: React.FC = () => {
  const {
    helpSections,
    filteredSections,
    selectedCategory,
    filteredTutorials,
    searchQuery,
    searchResults,
    loading,
    error,
    setSelectedCategory,
    setSelectedTutorial,
    setSelectedArticle,
    setSearchQuery,
  } = useHelp();

  // Extraire les catégories uniques des sections
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(helpSections.map(section => section.category))];
    return uniqueCategories;
  }, [helpSections]);

  // Gestion de la recherche
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Données à afficher
  const displaySections = searchQuery.trim() ? [] : filteredSections;
  const displayTutorials = searchQuery.trim() ? [] : filteredTutorials;
  const hasSearchResults = searchQuery.trim() && searchResults.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <WrenchIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de la page */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Centre d'Aide MonToit
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Tout ce que vous devez savoir pour utiliser la plateforme MonToit
            </p>
            
            {/* Barre de recherche */}
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Résultats de recherche */}
        {hasSearchResults ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Résultats de recherche ({searchResults.length})
            </h2>
            <div className="space-y-4">
              {searchResults.map((result: any) => (
                <div 
                  key={result.id || result.title}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedArticle(result)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {result.description || result.answer?.substring(0, 150) || ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : searchQuery.trim() && !hasSearchResults ? (
          <section className="mb-12">
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Aucun résultat trouvé
              </h2>
              <p className="text-gray-600 mb-6">
                Essayez avec d'autres mots-clés ou parcourez nos catégories.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Effacer la recherche
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Filtres de catégorie */}
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Sections d'aide principales */}
            <section className="mb-16">
              <div className="flex items-center mb-8">
                <BookOpenIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Sections d'Aide
                </h2>
              </div>
              
              {displaySections.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displaySections.map((section) => (
                    <HelpSectionCard
                      key={section.title}
                      title={section.title}
                      description={section.description}
                      icon={section.icon}
                      category={section.category}
                      onClick={() => console.log('Navigate to section:', section.href)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune section disponible
                  </h3>
                  <p className="text-gray-500">
                    Aucune section ne correspond à cette catégorie.
                  </p>
                </div>
              )}
            </section>

            {/* Tutoriels en carrousel */}
            <section>
              <div className="flex items-center mb-8">
                <TrendingUpIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Tutoriels Vidéo
                </h2>
              </div>
              
              {displayTutorials.length > 0 ? (
                <SimpleCarousel
                  items={displayTutorials}
                  renderItem={(tutorial) => (
                    <TutorialSlide
                      key={tutorial.id}
                      title={tutorial.title}
                      description={tutorial.description}
                      duration={tutorial.duration}
                      difficulty={tutorial.difficulty}
                      category={tutorial.category}
                      steps={tutorial.steps}
                      onClick={() => setSelectedTutorial(tutorial)}
                    />
                  )}
                />
              ) : (
                <div className="text-center py-12">
                  <PlayCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun tutoriel disponible
                  </h3>
                  <p className="text-gray-500">
                    Aucun tutoriel ne correspond à cette catégorie.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HelpPage;
