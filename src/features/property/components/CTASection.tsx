import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * CTASection - Premium Design
 * 
 * Features:
 * - Gradient background with orange
 * - Large prominent button
 * - 96px vertical padding
 * - Professional finish
 */
export default function CTASection() {
  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #FF6C2F 0%, #E05519 100%)',
        paddingTop: '96px',
        paddingBottom: '96px'
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Rejoignez plus de 1 350 utilisateurs</span>
          </div>

          {/* Title */}
          <h2 
            className="text-white font-bold mb-6"
            style={{ 
              fontSize: 'clamp(32px, 5vw, 48px)',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}
          >
            Prêt à trouver votre
            <br />
            prochain chez-vous ?
          </h2>
          
          {/* Subtitle */}
          <p 
            className="text-white/90 mb-10 max-w-xl mx-auto"
            style={{ 
              fontSize: '18px',
              lineHeight: '1.7'
            }}
          >
            Inscription gratuite. Commencez votre recherche dès maintenant et trouvez le logement idéal en quelques clics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/recherche"
              className="group inline-flex items-center justify-center gap-3 font-semibold transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: '#FFFFFF',
                color: '#FF6C2F',
                height: '60px',
                paddingLeft: '40px',
                paddingRight: '40px',
                borderRadius: '14px',
                fontSize: '18px',
                boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
              }}
            >
              <span>Commencer ma recherche</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/inscription"
              className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300"
              style={{ 
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                height: '60px',
                paddingLeft: '32px',
                paddingRight: '32px',
                borderRadius: '14px',
                fontSize: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <span>Créer un compte</span>
            </Link>
          </div>

          {/* Trust Note */}
          <p 
            className="mt-8 text-white/60 text-sm"
          >
            Pas de frais cachés • Annulation gratuite • Support disponible 24/7
          </p>
        </div>
      </div>
    </section>
  );
}
