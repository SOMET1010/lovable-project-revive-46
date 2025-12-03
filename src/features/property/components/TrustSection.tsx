import { Shield, CreditCard, Users, Award, Phone, CheckCircle } from 'lucide-react';

const trustFeatures = [
  {
    icon: Shield,
    title: 'Certification ANSUT',
    description: 'Tous nos utilisateurs sont vérifiés via le système national d\'identification pour garantir des transactions sécurisées.',
    highlight: 'Identité vérifiée',
  },
  {
    icon: CreditCard,
    title: 'Paiement Mobile Money',
    description: 'Payez en toute sécurité avec Orange Money, MTN Money ou Moov Money. Transactions cryptées et traçables.',
    highlight: '100% Sécurisé',
  },
  {
    icon: Award,
    title: 'Propriétés Vérifiées',
    description: 'Chaque annonce est validée par notre équipe. Photos authentiques, informations exactes, visites garanties.',
    highlight: 'Qualité certifiée',
  },
  {
    icon: Users,
    title: 'Support Dédié',
    description: 'Une équipe à votre écoute 7j/7 pour vous accompagner dans toutes les étapes de votre location.',
    highlight: 'Assistance 24/7',
  },
];

/**
 * TrustSection - Modern Minimalism Premium Design
 * 
 * Features:
 * - Dark neutral background (#171717)
 * - Clean feature cards with subtle borders
 * - Orange accent badges
 * - 96px section padding
 */
export default function TrustSection() {
  return (
    <section 
      className="relative overflow-hidden"
      style={{ 
        backgroundColor: 'var(--color-neutral-900)',
        paddingTop: 'var(--spacing-24)',
        paddingBottom: 'var(--spacing-24)'
      }}
    >
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--color-primary-500)'
            }}
          >
            <CheckCircle className="h-4 w-4" />
            Plateforme de confiance
          </span>
          <h2 
            className="font-bold text-white mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Pourquoi choisir Mon Toit ?
          </h2>
          <p 
            className="max-w-2xl mx-auto"
            style={{ 
              fontSize: '18px',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            La seule plateforme immobilière en Côte d'Ivoire avec une triple garantie de sécurité
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trustFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group relative transition-all duration-300"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-8)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'var(--color-primary-500)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {/* Highlight Badge */}
              <div className="absolute -top-3 right-6">
                <span 
                  className="px-3 py-1 text-white text-xs font-bold rounded-full"
                  style={{ backgroundColor: 'var(--color-primary-500)' }}
                >
                  {feature.highlight}
                </span>
              </div>
              
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div 
                  className="flex-shrink-0 w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: 'var(--color-primary-500)',
                    borderRadius: 'var(--border-radius-md)'
                  }}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                
                {/* Content */}
                <div>
                  <h3 
                    className="font-semibold text-white mb-2"
                    style={{ fontSize: '20px' }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="leading-relaxed"
                    style={{ 
                      fontSize: '15px',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Row */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="/inscription"
            className="inline-flex items-center gap-2 font-semibold text-white transition-all"
            style={{ 
              backgroundColor: 'var(--color-primary-500)',
              padding: '14px 28px',
              borderRadius: 'var(--border-radius-md)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Créer mon compte gratuit</span>
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <Phone className="h-5 w-5" />
            <span>Besoin d'aide ? Contactez-nous</span>
          </a>
        </div>
      </div>
    </section>
  );
}
