/**
 * Composant Accordéon pour les FAQ avec animations et accessibilité
 */

import React, { useRef } from 'react';
import { 
  ChevronDownIcon, 
  ThumbsUpIcon, 
  ThumbsDownIcon,
  ClockIcon,
  EyeIcon
} from 'lucide-react';
import { FAQItem } from '../hooks/useFAQ';

interface FAQAccordionProps {
  items: FAQItem[];
  openItems: Set<string>;
  onToggleItem: (id: string) => void;
  onMarkHelpful: (id: string, isHelpful: boolean) => void;
  onIncrementViewCount: (id: string) => void;
  showHelpfulness?: boolean;
  showStats?: boolean;
  maxHeight?: string;
  className?: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items,
  openItems,
  onToggleItem,
  onMarkHelpful,
  onIncrementViewCount,
  showHelpfulness = true,
  showStats = true,
  maxHeight = '500px',
  className = ''
}) => {
  const _contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Gérer l'animation d'ouverture/fermeture
  const handleToggle = (item: FAQItem) => {
    if (!openItems.has(item.id)) {
      // Incrémenter le compteur de vues seulement lors de la première ouverture
      onIncrementViewCount(item.id);
    }
    onToggleItem(item.id);
  };

  // Gérer l'accessibilité du clavier
  const handleKeyDown = (event: React.KeyboardEvent, item: FAQItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle(item);
    }
  };

  // Calculer le pourcentage d'utilité
  const getHelpfulnessPercentage = (helpful: number, notHelpful: number): number => {
    const total = helpful + notHelpful;
    if (total === 0) return 0;
    return Math.round((helpful / total) * 100);
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`faq-accordion ${className}`}>
      <div className="space-y-3">
        {items.map((item) => {
          const isOpen = openItems.has(item.id);
          const helpfulPercentage = getHelpfulnessPercentage(item.helpful, item.notHelpful);

          return (
            <div
              key={item.id}
              className={`
                bg-white border border-gray-200 rounded-lg shadow-sm
                transition-all duration-300 ease-in-out
                hover:shadow-md hover:border-gray-300
                ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}
              `}
            >
              {/* En-tête de la question */}
              <button
                className={`
                  w-full px-6 py-4 text-left flex justify-between items-start
                  transition-all duration-200 ease-in-out
                  hover:bg-gray-50 focus:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  rounded-lg
                  ${isOpen ? 'bg-blue-50' : ''}
                `}
                onClick={() => handleToggle(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                aria-expanded={isOpen}
                aria-controls={`faq-content-${item.id}`}
                aria-describedby={`faq-stats-${item.id}`}
              >
                <div className="flex-1 pr-4">
                  <h3 className={`
                    font-semibold text-gray-900 text-base leading-relaxed
                    transition-colors duration-200
                    ${isOpen ? 'text-blue-900' : ''}
                  `}>
                    {item.question}
                  </h3>
                  
                  {/* Tags de la question */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          bg-gray-100 text-gray-700
                          transition-colors duration-200
                          ${isOpen ? 'bg-blue-100 text-blue-700' : ''}
                        `}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Statistiques de la question */}
                  {showStats && (
                    <div 
                      id={`faq-stats-${item.id}`}
                      className={`
                        flex items-center gap-4 mt-3 text-sm text-gray-500
                        transition-colors duration-200
                        ${isOpen ? 'text-blue-600' : ''}
                      `}
                    >
                      <div className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>{item.viewCount.toLocaleString()} vues</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>Mis à jour le {formatDate(item.lastUpdated)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Icône de rotation */}
                <div className="flex-shrink-0">
                  <ChevronDownIcon 
                    className={`
                      w-5 h-5 text-gray-400 transition-all duration-300 ease-in-out
                      ${isOpen ? 'rotate-180 text-blue-600' : ''}
                    `}
                  />
                </div>
              </button>

              {/* Contenu de la réponse */}
              <div
                id={`faq-content-${item.id}`}
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isOpen ? 'max-h-none' : 'max-h-0'}
                `}
                style={{
                  maxHeight: isOpen ? maxHeight : '0'
                }}
              >
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-100 pt-4">
                    {/* Réponse formatée */}
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                      {item.answer.split('\n').map((paragraph, pIndex) => {
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          // Titre en gras
                          return (
                            <h4 key={pIndex} className="font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
                              {paragraph.slice(2, -2)}
                            </h4>
                          );
                        } else if (paragraph.startsWith('- ')) {
                          // Élément de liste
                          return (
                            <li key={pIndex} className="ml-4 mb-1">
                              {paragraph.slice(2)}
                            </li>
                          );
                        } else if (paragraph.trim() === '') {
                          // Ligne vide
                          return <br key={pIndex} />;
                        } else {
                          // Paragraphe normal
                          return (
                            <p key={pIndex} className="mb-3 last:mb-0">
                              {paragraph}
                            </p>
                          );
                        }
                      })}
                    </div>

                    {/* Section d'utilité */}
                    {showHelpfulness && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Cette réponse vous a-t-elle été utile ?
                          </span>
                          <div className="flex items-center gap-3">
                            {/* Pourcentage d'utilité */}
                            <div className="text-sm text-gray-500">
                              {helpfulPercentage}% utile
                            </div>
                            
                            {/* Boutons d'évaluation */}
                            <div className="flex items-center gap-2">
                              <button
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 text-green-700 hover:bg-green-50 hover:text-green-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkHelpful(item.id, true);
                                }}
                                title="Marquer comme utile"
                              >
                                <ThumbsUpIcon className="w-4 h-4" />
                                <span>{item.helpful}</span>
                              </button>
                              
                              <button
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 text-red-700 hover:bg-red-50 hover:text-red-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkHelpful(item.id, false);
                                }}
                                title="Marquer comme pas utile"
                              >
                                <ThumbsDownIcon className="w-4 h-4" />
                                <span>{item.notHelpful}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Barre de progression de l'utilité */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${helpfulPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun résultat */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg 
              className="mx-auto h-12 w-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune question trouvée
          </h3>
          <p className="text-gray-500">
            Essayez de modifier vos critères de recherche ou parcourez les catégories.
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQAccordion;