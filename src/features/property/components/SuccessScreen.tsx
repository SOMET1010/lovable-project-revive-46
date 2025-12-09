import React, { useEffect, useState } from 'react';
import { Check, RefreshCw, Home, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuccessScreenProps {
  propertyTitle: string;
  propertyId?: string;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ propertyTitle, propertyId }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Génération des confettis
  const confettiColors = ['#F16522', '#2C1810', '#F59E0B', '#2E4B3E', '#10B981', '#6366F1'];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Confettis animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-5%',
              backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
              width: `${Math.random() * 12 + 6}px`,
              height: `${Math.random() * 12 + 6}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animationDuration: `${2.5 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 1.5}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="relative animate-in zoom-in-95 duration-500 text-center space-y-6 max-w-lg mx-auto">
        {/* Icône de succès */}
        <div className="relative mx-auto w-28 h-28">
          <div className="absolute inset-0 bg-[#F16522]/20 rounded-full animate-ping" />
          <div className="relative w-full h-full bg-gradient-to-br from-[#F16522] to-[#D55A1B] rounded-full flex items-center justify-center shadow-2xl shadow-[#F16522]/40">
            <Check className="w-14 h-14 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#2C1810]">
            Félicitations ! 🎉
          </h2>
          <p className="text-lg text-[#6B5A4E]">
            Votre propriété est maintenant en ligne
          </p>
          <p className="text-xl font-bold text-[#F16522]">
            "{propertyTitle}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {propertyId && (
            <button
              onClick={() => navigate(`/proprietes/${propertyId}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                bg-[#2C1810] text-white font-bold text-sm
                hover:bg-black transition-all duration-200 transform hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              Voir l'annonce
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl
              bg-[#FAF7F4] text-[#2C1810] font-bold text-sm border-2 border-[#EFEBE9]
              hover:bg-[#EFEBE9] transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Tableau de bord
          </button>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 text-[#A69B95] text-sm pt-4">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Redirection dans {countdown}s...</span>
        </div>
      </div>

      {/* Animation CSS inline pour confetti */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

export default SuccessScreen;
