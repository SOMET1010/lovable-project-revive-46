import { Search, Shield, Key, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Recherchez',
    description: 'Explorez des centaines de logements vérifiés selon vos critères : localisation, budget, type de bien.',
  },
  {
    icon: Shield,
    number: '02',
    title: 'Vérifiez',
    description: 'Consultez les avis, les documents certifiés et l\'identité vérifiée de chaque propriétaire.',
  },
  {
    icon: Key,
    number: '03',
    title: 'Emménagez',
    description: 'Signez votre contrat en ligne et payez en toute sécurité via Mobile Money ou carte bancaire.',
  },
];

/**
 * HowItWorksSection - Premium Design
 * 
 * Features:
 * - 96px vertical padding
 * - Step numbers in orange
 * - Clean cards with hover effects
 * - Arrow connectors between steps
 */
export default function HowItWorksSection() {
  return (
    <section 
      className="relative"
      style={{ 
        backgroundColor: '#FAFAFA',
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
            Comment ça marche
          </span>
          <h2 
            className="font-bold mb-5"
            style={{ 
              fontSize: 'clamp(28px, 4vw, 44px)',
              color: '#171717',
              letterSpacing: '-0.02em'
            }}
          >
            Trouvez votre logement en 3 étapes
          </h2>
          <p 
            className="max-w-2xl mx-auto"
            style={{ 
              fontSize: '18px',
              lineHeight: '1.7',
              color: '#525252'
            }}
          >
            Un processus simple, transparent et sécurisé pour vous accompagner
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector Arrow (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/3 -right-6 lg:-right-8 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-300" />
                </div>
              )}

              {/* Step Card */}
              <div
                className="group h-full text-center transition-all duration-300"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '48px 32px',
                  border: '1px solid #E5E5E5'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = '#FF6C2F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E5E5E5';
                }}
              >
                {/* Step Number */}
                <div 
                  className="inline-block font-bold mb-6"
                  style={{ 
                    fontSize: '14px',
                    color: '#FF6C2F',
                    letterSpacing: '0.1em'
                  }}
                >
                  ÉTAPE {step.number}
                </div>

                {/* Icon */}
                <div 
                  className="w-20 h-20 mx-auto mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    backgroundColor: 'rgba(255, 108, 47, 0.1)',
                    borderRadius: '20px'
                  }}
                >
                  <step.icon className="h-10 w-10" style={{ color: '#FF6C2F' }} />
                </div>
                
                {/* Title */}
                <h3 
                  className="font-bold mb-4"
                  style={{ 
                    fontSize: '24px',
                    color: '#171717'
                  }}
                >
                  {step.title}
                </h3>
                
                {/* Description */}
                <p 
                  style={{ 
                    fontSize: '16px',
                    lineHeight: '1.7',
                    color: '#525252'
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
