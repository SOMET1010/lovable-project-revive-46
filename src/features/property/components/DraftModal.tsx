import React from 'react';
import { FileText, RefreshCw, Trash2 } from 'lucide-react';

interface DraftModalProps {
  isOpen: boolean;
  draftTitle?: string;
  onContinue: () => void;
  onStartFresh: () => void;
}

const DraftModal: React.FC<DraftModalProps> = ({
  isOpen,
  draftTitle,
  onContinue,
  onStartFresh
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header décoratif */}
        <div className="bg-gradient-to-br from-[#F16522] to-[#D55A1B] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Brouillon trouvé</h2>
              <p className="text-sm text-white/80">Voulez-vous reprendre ?</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-[#6B5A4E] text-sm">
            Nous avons trouvé un brouillon non terminé
            {draftTitle && (
              <span className="block mt-1 font-semibold text-[#2C1810]">
                "{draftTitle}"
              </span>
            )}
          </p>

          <div className="space-y-3">
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl
                bg-[#F16522] text-white font-bold text-sm
                hover:bg-[#D55A1B] transition-all duration-200
                shadow-lg shadow-[#F16522]/30 transform hover:scale-[1.02]"
            >
              <RefreshCw className="w-4 h-4" />
              Reprendre le brouillon
            </button>

            <button
              onClick={onStartFresh}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl
                bg-[#FAF7F4] text-[#6B5A4E] font-bold text-sm border-2 border-[#EFEBE9]
                hover:bg-[#EFEBE9] hover:text-[#2C1810] transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Recommencer à zéro
            </button>
          </div>

          <p className="text-xs text-center text-[#A69B95]">
            Vos brouillons sont sauvegardés automatiquement
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftModal;
