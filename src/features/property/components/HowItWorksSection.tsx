import { Search, Shield, FileSignature, Key, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Recherchez',
    description: 'Explorez notre catalogue de propriétés vérifiées. Filtrez par ville, budget et type de logement.',
  },
  {
    icon: Shield,
    number: '02',
    title: 'Vérifiez',
    description: 'Toutes les propriétés et propriétaires sont certifiés ANSUT. Visitez en toute confiance.',
  },
  {
    icon: FileSignature,
    number: '03',
    title: 'Candidatez',
    description: 'Envoyez votre dossier en ligne. Suivez l\'avancement de votre candidature en temps réel.',
  },
  {
    icon: Key,
    number: '04',
    title: 'Emménagez',
    description: 'Signez votre bail électronique et payez via Mobile Money. Les clés sont à vous !',
  },
];

/**
 * HowItWorksSection - Modern Minimalism Premium Design
 * 
 * Features:
 * - White background with subtle gray cards
 * - Clean 4-step grid
 * - Orange accent on step numbers
 * - 96px section padding
 */
export default function HowItWorksSection() {
  return (
    <section 
      style={{ 
        backgroundColor: 'var(--color-background-page)',
        paddingTop: 'var(--spacing-24)',
        paddingBottom: 'var(--spacing-24)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{ 
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)'
            }}
          >
            Simple & Rapide
          </span>
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: 'var(--color-neutral-900)'
            }}
          >
            Comment ça marche ?
          </h2>
          <p 
            className="max-w-2xl mx-auto"
            style={{ 
              fontSize: '18px',
              lineHeight: '1.6',
              color: 'var(--color-neutral-700)'
            }}
          >
            Trouvez et louez votre logement en 4 étapes simples, en toute sécurité
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className="relative group transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--color-background-surface)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-8)',
                boxShadow: 'var(--shadow-base)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-base)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Number Badge */}
              <div 
                className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ 
                  backgroundColor: 'var(--color-primary-500)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {step.number}
              </div>
              
              {/* Icon */}
              <div 
                className="w-14 h-14 flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ 
                  backgroundColor: 'var(--color-primary-50)',
                  borderRadius: 'var(--border-radius-md)'
                }}
              >
                <step.icon 
                  className="h-7 w-7" 
                  style={{ color: 'var(--color-primary-500)' }}
                />
              </div>
              
              {/* Content */}
              <h3 
                className="font-semibold mb-3"
                style={{ 
                  fontSize: '20px',
                  color: 'var(--color-neutral-900)'
                }}
              >
                {step.title}
              </h3>
              <p 
                className="leading-relaxed"
                style={{ 
                  fontSize: '15px',
                  color: 'var(--color-neutral-700)'
                }}
              >
                {step.description}
              </p>

              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5"
                  style={{ backgroundColor: 'var(--color-neutral-200)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/recherche"
            className="inline-flex items-center gap-3 text-white font-semibold transition-all"
            style={{ 
              backgroundColor: 'var(--color-primary-500)',
              padding: '16px 32px',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '16px'
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
            <span>Commencer ma recherche</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
