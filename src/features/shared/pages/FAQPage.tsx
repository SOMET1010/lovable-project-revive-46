/**
 * Page FAQ - Questions Fréquemment Posées avec accordion interactif et catégories
 */

import React, { useState } from 'react';
import { useFAQ } from '../hooks/useFAQ';
import FAQAccordion from '../components/FAQAccordion';
import { 
  Search as SearchIcon, 
  User as UserIcon, 
  Home as HomeIcon, 
  MessageCircle as MessageCircleIcon, 
  CreditCard as CreditCardIcon,
  Shield as ShieldIcon,
  Wrench as WrenchIcon,
  TrendingUp as TrendingUpIcon,
  Clock as ClockIcon,
  ChevronRight as ChevronRightIcon,
  HelpCircle as HelpCircleIcon,
  Filter as FilterIcon,
  BookOpen as BookOpenIcon
} from 'lucide-react';

// Icônes pour les catégories
const getCategoryIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'user': UserIcon,
    'home': HomeIcon,
    'message-circle': MessageCircleIcon,
    'credit-card': CreditCardIcon,
    'shield': ShieldIcon,
    'wrench': WrenchIcon
  };
  
  return iconMap[iconName] || HelpCircleIcon;
};

// Couleurs pour les catégories
const getCategoryColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'blue': 'from-blue-500 to-blue-600',
    'green': 'from-green-500 to-green-600',
    'purple': 'from-purple-500 to-purple-600',
    'orange': 'from-orange-500 to-orange-600',
    'red': 'from-red-500 to-red-600',
    'gray': 'from-gray-500 to-gray-600'
  };
  
  return colorMap[color] || 'from-gray-500 to-gray-600';
};

// Composant de carte de catégorie
interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  questionCount: number;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  icon,
  questionCount,
  color,
  isSelected,
  onClick
}) => {
  const IconComponent = getCategoryIcon(icon);
  const gradientColor = getCategoryColor(color);
  
  return (
    <div 
      className={`
        group cursor-pointer transition-all duration-300
        ${isSelected ? 'scale-105' : 'hover:scale-102'}
      `}
      onClick={onClick}
    >
      <div className={`
        bg-white rounded-xl border-2 p-6 h-full transition-all duration-300
        ${isSelected 
          ? 'border-blue-500 shadow-lg ring-4 ring-blue-100' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}>
        <div className="flex items-start space-x-4">
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${gradientColor} 
            flex items-center justify-center text-white shadow-lg
          `}>
            <IconComponent className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`
              text-lg font-semibold mb-2 transition-colors duration-200
              ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'}
            `}>
              {title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
              {description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${isSelected 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-700'
                }
                transition-all duration-200
              `}>
                <BookOpenIcon className="w-4 h-4 mr-1" />
                {questionCount} question{questionCount > 1 ? 's' : ''}
              </div>
              
              <ChevronRightIcon className={`
                w-4 h-4 transition-colors duration-200
                ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}
              `} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de statistiques FAQ
interface FAQStatsProps {
  categories: { questionCount: number }[];
  selectedCategory: string;
}

const FAQStats: React.FC<FAQStatsProps> = ({ categories, selectedCategory }) => {
  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questionCount, 0);
  
  const selectedCategoryData = selectedCategory !== 'tous' 
    ? categories.find((cat: { id?: string; questionCount: number }) => (cat as { id: string }).id === selectedCategory)
    : null;
  
  const currentQuestionCount = selectedCategoryData 
    ? selectedCategoryData.questionCount 
    : totalQuestions;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <HelpCircleIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{currentQuestionCount}</div>
          <div className="text-sm text-gray-600">
            {selectedCategory === 'tous' ? 'Questions totales' : 'Questions dans cette catégorie'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUpIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
          <div className="text-sm text-gray-600">Catégories disponibles</div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <ClockIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">24h/7j</div>
          <div className="text-sm text-gray-600">Support disponible</div>
        </div>
      </div>
    </div>
  );
};

// Composant de recherche avancée
interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Rechercher dans les FAQ..." 
}) => {
  return (
    <div className="relative mb-8">
      <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
      />
      
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          ×
        </button>
      )}
    </div>
  );
};

const FAQPage: React.FC = () => {
  const {
    categories,
    filteredItems,
    openItems,
    _hasOpenItems,
    selectedCategory,
    searchQuery,
    searchResults,
    loading,
    error,
    toggleItem,
    setSelectedCategory,
    setSearchQuery,
    markHelpful,
    incrementViewCount,
    _getFAQByCategory,
    getPopularQuestions,
    getRecentQuestions
  } = useFAQ() as {
    categories: { id: string; title: string; description: string; icon: string; questionCount: number; color: string }[];
    filteredItems: { id: string; question: string; answer: string; helpful: number; notHelpful: number; tags: string[]; viewCount: number; lastUpdated: string }[];
    openItems: Set<string>;
    _hasOpenItems: boolean;
    selectedCategory: string;
    searchQuery: string;
    searchResults: { item: { id: string; question: string; answer: string; helpful: number; notHelpful: number; tags: string[]; viewCount: number; lastUpdated: string }; relevanceScore: number; matchedTerms: string[] }[];
    loading: boolean;
    error: string | null;
    toggleItem: (id: string) => void;
    setSelectedCategory: (category: string) => void;
    setSearchQuery: (query: string) => void;
    markHelpful: (id: string, isHelpful: boolean) => void;
    incrementViewCount: (id: string) => void;
    _getFAQByCategory: (category: string) => unknown[];
    getPopularQuestions: (count: number) => unknown[];
    getRecentQuestions: (count: number) => unknown[];
  };

  // Gérer l'affichage des résultats
  const displayItems = searchQuery.trim() 
    ? searchResults.map(result => result.item)
    : filteredItems;

  // Questions populaires et récentes (pour les suggestions) - prefixed with _ since not used in render
  const _popularQuestions = React.useMemo(() => getPopularQuestions(3), [getPopularQuestions]);
  const _recentQuestions = React.useMemo(() => getRecentQuestions(3), [getRecentQuestions]);

  // État de la recherche
  const [_showSuggestions, _setShowSuggestions] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-300 rounded-lg"></div>
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
              Questions Fréquemment Posées
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Trouvez rapidement les réponses à vos questions les plus courantes
            </p>
            
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <FAQStats categories={categories} selectedCategory={selectedCategory} />

        {/* Résultats de recherche */}
        {searchQuery.trim() ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Résultats de recherche ({searchResults.length})
            </h2>
            
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div 
                    key={result.item.id}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200"
                    onClick={() => toggleItem(result.item.id)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {result.item.question}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {result.item.answer.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{result.item.helpful} personnes ont trouvé cela utile</span>
                      <span>•</span>
                      <span>Pertinence: {result.relevanceScore}%</span>
                      <span>•</span>
                      <span>Correspondance: {result.matchedTerms.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez avec d'autres mots-clés ou parcourez nos catégories.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Effacer la recherche
                  </button>
                  <button
                    onClick={() => setSelectedCategory('tous')}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Parcourir toutes les catégories
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Filtres de catégories */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Catégories
                </h2>
                
                {selectedCategory !== 'tous' && (
                  <button
                    onClick={() => setSelectedCategory('tous')}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <FilterIcon className="w-4 h-4 mr-2" />
                    Voir toutes les catégories
                  </button>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Carte "Toutes les catégories" */}
                <div 
                  className={`
                    group cursor-pointer transition-all duration-300
                    ${selectedCategory === 'tous' ? 'scale-105' : 'hover:scale-102'}
                  `}
                  onClick={() => setSelectedCategory('tous')}
                >
                  <div className={`
                    bg-white rounded-xl border-2 p-6 h-full transition-all duration-300
                    ${selectedCategory === 'tous' 
                      ? 'border-blue-500 shadow-lg ring-4 ring-blue-100' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }
                  `}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white shadow-lg">
                        <HelpCircleIcon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`
                          text-lg font-semibold mb-2 transition-colors duration-200
                          ${selectedCategory === 'tous' ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'}
                        `}>
                          Toutes les catégories
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Parcourir toutes les questions disponibles
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className={`
                            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                            ${selectedCategory === 'tous' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-700'
                            }
                          `}>
                            <BookOpenIcon className="w-4 h-4 mr-1" />
                            {categories.reduce((sum, cat) => sum + cat.questionCount, 0)} questions
                          </div>
                          
                          <ChevronRightIcon className={`
                            w-4 h-4 transition-colors duration-200
                            ${selectedCategory === 'tous' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}
                          `} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cartes des catégories spécifiques */}
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    {...category}
                    isSelected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  />
                ))}
              </div>
            </section>

            {/* Questions et accordéon */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'tous' 
                    ? 'Toutes les Questions' 
                    : categories.find(cat => cat.id === selectedCategory)?.title || 'Questions'
                  }
                </h2>
                
                {displayItems.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {displayItems.length} question{displayItems.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              {displayItems.length > 0 ? (
                <FAQAccordion
                  items={displayItems}
                  openItems={openItems}
                  onToggleItem={toggleItem}
                  onMarkHelpful={markHelpful}
                  onIncrementViewCount={incrementViewCount}
                  showHelpfulness={true}
                  showStats={true}
                />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <HelpCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune question dans cette catégorie
                  </h3>
                  <p className="text-gray-600">
                    Sélectionnez une autre catégorie ou consultez toutes les questions.
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

export default FAQPage;