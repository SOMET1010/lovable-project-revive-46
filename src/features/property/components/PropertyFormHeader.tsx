import React from 'react';
import { ArrowLeft, Save, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PropertyFormHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  isAutoSaving: boolean;
  hasDraft: boolean;
}

const PropertyFormHeader: React.FC<PropertyFormHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
  isAutoSaving,
  hasDraft
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (currentStep > 0) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white border-b border-[#EFEBE9] sticky top-0 z-30 px-4 py-4 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Bouton retour */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#6B5A4E] hover:text-[#F16522] transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Retour</span>
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <React.Fragment key={index}>
              <div
                className={`
                  h-2.5 w-2.5 rounded-full transition-all duration-300
                  ${index <= currentStep 
                    ? 'bg-[#F16522] scale-110' 
                    : 'bg-[#EFEBE9]'
                  }
                  ${index === currentStep ? 'ring-4 ring-[#F16522]/20' : ''}
                `}
              />
              {index < totalSteps - 1 && (
                <div
                  className={`
                    h-1 w-6 sm:w-8 rounded-full transition-all duration-300
                    ${index < currentStep ? 'bg-[#F16522]' : 'bg-[#EFEBE9]'}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Indicateur de sauvegarde */}
        <div className="flex items-center gap-2 text-xs min-w-[100px] justify-end">
          {isAutoSaving ? (
            <span className="text-[#F16522] animate-pulse flex items-center gap-1.5 font-medium">
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sauvegarde...</span>
            </span>
          ) : hasDraft ? (
            <span className="text-green-600 flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Brouillon OK</span>
            </span>
          ) : (
            <span className="text-transparent select-none">.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyFormHeader;
