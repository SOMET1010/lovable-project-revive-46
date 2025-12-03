import { Shield, CreditCard, UserCheck, FileCheck, Star, Lock } from 'lucide-react';

const features = [
  {
    icon: UserCheck,
    title: 'Identité vérifiée',
    description: 'Chaque utilisateur est vérifié via sa CNI ou son passeport pour garantir des échanges fiables.',
  },
  {
    icon: Shield,
    title: 'Propriétés certifiées',
    description: 'Documents fonciers vérifiés et photos authentifiées pour chaque annonce sur la plateforme.',
  },
  {
    icon: CreditCard,
    title: 'Paiement sécurisé',
    description: 'Transactions protégées via Mobile Money (Orange, MTN, Wave) ou carte bancaire.',
  },
  {
    icon: FileCheck,
    title: 'Contrats digitaux',
    description: 'Signature électronique légalement reconnue et archivage sécurisé de tous vos documents.',
  },
  {
    icon: Lock,
    title: 'Données protégées',
    description: 'Vos informations personnelles sont cryptées et ne sont jamais partagées sans votre accord.',
  },
  {
    icon: Star,
    title: 'Support premium',
    description: 'Une équipe dédiée disponible 24/7 pour vous accompagner à chaque étape de votre projet.',
  },
];

/**
 * TrustSection - Premium Design
 * 
 * Features:
 * - White background with subtle cards
 * - 96px vertical padding
 * - Orange icon accents
 * - Professional grid layout
 */
export default function TrustSection() {
  return (
    <section 
      className="relative"
      style={{ 
        backgroundColor: '#FFFFFF',
        paddingTop: '96px',
        paddingBottom: '96px'
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className="inline-block px-5 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ 
              backgroundColor: 'rgba(255, 108, 47, 0.1)',
              color: '#FF6C2F'
            }}
          >
            Sécurité & Confiance
          </span>
          <h2 
            className="font-bold mb-5"
            style={{ 
              fontSize: 'clamp(28px, 4vw, 44px)',
              color: '#171717',
              letterSpacing: '-0.02em'
            }}
          >
            Votre sécurité est notre priorité
          </h2>
          <p 
            className="max-w-2xl mx-auto"
            style={{ 
              fontSize: '18px',
              lineHeight: '1.7',
              color: '#525252'
            }}
          >
            Nous mettons en place les meilleurs standards de sécurité pour protéger vos transactions et vos données
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group transition-all duration-300"
              style={{ 
                backgroundColor: '#FAFAFA',
                borderRadius: '20px',
                padding: '40px 32px',
                border: '1px solid #E5E5E5'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(255, 108, 47, 0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#FF6C2F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#E5E5E5';
              }}
            >
              {/* Icon */}
              <div 
                className="w-14 h-14 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: 'rgba(255, 108, 47, 0.1)',
                  borderRadius: '14px'
                }}
              >
                <feature.icon className="h-7 w-7" style={{ color: '#FF6C2F' }} />
              </div>
              
              {/* Title */}
              <h3 
                className="font-semibold mb-3"
                style={{ 
                  fontSize: '20px',
                  color: '#171717'
                }}
              >
                {feature.title}
              </h3>
              
              {/* Description */}
              <p 
                style={{ 
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#525252'
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
