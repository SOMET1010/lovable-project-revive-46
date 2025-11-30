import { Search, Shield, FileSignature, Key, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Recherchez',
    description: 'Explorez notre catalogue de propriétés vérifiées. Filtrez par ville, budget et type de logement.',
    color: 'var(--terracotta-500)',
  },
  {
    icon: Shield,
    number: '02',
    title: 'Vérifiez',
    description: 'Toutes les propriétés et propriétaires sont certifiés ANSUT. Visitez en toute confiance.',
    color: 'var(--forest-500)',
  },
  {
    icon: FileSignature,
    number: '03',
    title: 'Candidatez',
    description: 'Envoyez votre dossier en ligne. Suivez l\'avancement de votre candidature en temps réel.',
    color: 'var(--gold-500)',
  },
  {
    icon: Key,
    number: '04',
    title: 'Emménagez',
    description: 'Signez votre bail électronique et payez via Mobile Money. Les clés sont à vous !',
    color: 'var(--terracotta-600)',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 opacity-5"
        style={{
          background: 'radial-gradient(circle, var(--terracotta-500) 0%, transparent 70%)',
        }}
      />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-[var(--terracotta-100)] text-[var(--terracotta-600)] text-sm font-semibold mb-4">
            Simple & Rapide
          </span>
          <h2 className="text-h1 font-display text-[var(--earth-900)] mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-body-lg text-[var(--earth-700)] max-w-2xl mx-auto">
            Trouvez et louez votre logement en 4 étapes simples, en toute sécurité
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group">
              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-[var(--sand-300)]">
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ background: steps[index + 1].color }}
                  />
                </div>
              )}
              
              {/* Card */}
              <div className="relative bg-[var(--sand-50)] rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[var(--terracotta-200)]">
                {/* Number Badge */}
                <div 
                  className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ background: step.color }}
                >
                  {step.number}
                </div>
                
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                  }}
                >
                  <step.icon 
                    className="h-8 w-8" 
                    style={{ color: step.color }}
                  />
                </div>
                
                {/* Content */}
                <h3 className="text-h3 font-semibold text-[var(--earth-900)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--earth-700)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/recherche"
            className="btn-primary inline-flex items-center gap-3 text-lg px-10 h-16"
          >
            <span>Commencer ma recherche</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
